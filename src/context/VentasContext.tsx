import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type TipoVenta =
  | 'impresion_bn'
  | 'impresion_color'
  | 'copia'
  | 'copia_cantidad'
  | 'escaneado'
  | 'encuadernado'
  | 'otro';

export interface Venta {
  id: string;
  tipo: TipoVenta;
  cantidad: number;
  precioUnitario: number;
  total: number;
  notas: string;
  fecha: string; // ISO string
}

export const PRECIOS_SUGERIDOS: Record<TipoVenta, number> = {
  impresion_bn: 700,
  impresion_color: 1300,
  copia: 400,
  copia_cantidad: 400,
  escaneado: 500,
  encuadernado: 2000,
  otro: 0,
};

export const ETIQUETAS_TIPO: Record<TipoVenta, string> = {
  impresion_bn: 'Impresión B/N',
  impresion_color: 'Impresión Color',
  copia: 'Copia',
  copia_cantidad: 'Copia por Cantidad',
  escaneado: 'Escaneado',
  encuadernado: 'Encuadernado',
  otro: 'Otro',
};

export const COLORES_TIPO: Record<TipoVenta, string> = {
  impresion_bn: '#6b7280',
  impresion_color: '#f59e0b',
  copia: '#3b82f6',
  copia_cantidad: '#8b5cf6',
  escaneado: '#10b981',
  encuadernado: '#ef4444',
  otro: '#ec4899',
};

// Credenciales de acceso
const CREDENTIALS = {
  usuario: 'admin',
  contrasena: 'impresora2024',
};

const STORAGE_KEYS = {
  ventas: 'ventas_impresora_data',
  auth: 'ventas_impresora_auth',
};

interface VentasContextType {
  // Auth
  isAuthenticated: boolean;
  login: (usuario: string, contrasena: string) => boolean;
  logout: () => void;
  // Ventas
  ventas: Venta[];
  agregarVenta: (venta: Omit<Venta, 'id' | 'fecha' | 'total'>) => void;
  eliminarVenta: (id: string) => void;
  // Computed
  totalHoy: number;
  totalSemana: number;
  totalMes: number;
  ventasHoy: Venta[];
  ventasPorTipo: Record<string, number>;
}

const VentasContext = createContext<VentasContextType | null>(null);

export function VentasProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.auth) === 'true';
  });

  const [ventas, setVentas] = useState<Venta[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ventas);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist ventas to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ventas, JSON.stringify(ventas));
  }, [ventas]);

  const login = useCallback((usuario: string, contrasena: string): boolean => {
    if (usuario === CREDENTIALS.usuario && contrasena === CREDENTIALS.contrasena) {
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEYS.auth, 'true');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEYS.auth);
  }, []);

  const agregarVenta = useCallback(
    (venta: Omit<Venta, 'id' | 'fecha' | 'total'>) => {
      const nueva: Venta = {
        ...venta,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        fecha: new Date().toISOString(),
        total: venta.cantidad * venta.precioUnitario,
      };
      setVentas((prev) => [nueva, ...prev]);
    },
    []
  );

  const eliminarVenta = useCallback((id: string) => {
    setVentas((prev) => prev.filter((v) => v.id !== id));
  }, []);

  // ---- Computed helpers ----
  const now = new Date();

  const esHoy = (fecha: string) => {
    const d = new Date(fecha);
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  const esSemana = (fecha: string) => {
    const d = new Date(fecha);
    const diff = now.getTime() - d.getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000;
  };

  const esMes = (fecha: string) => {
    const d = new Date(fecha);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  };

  const ventasHoy = ventas.filter((v) => esHoy(v.fecha));
  const totalHoy = ventasHoy.reduce((s, v) => s + v.total, 0);
  const totalSemana = ventas.filter((v) => esSemana(v.fecha)).reduce((s, v) => s + v.total, 0);
  const totalMes = ventas.filter((v) => esMes(v.fecha)).reduce((s, v) => s + v.total, 0);

  const ventasPorTipo = ventas.reduce<Record<string, number>>((acc, v) => {
    acc[v.tipo] = (acc[v.tipo] || 0) + v.total;
    return acc;
  }, {});

  return (
    <VentasContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        ventas,
        agregarVenta,
        eliminarVenta,
        totalHoy,
        totalSemana,
        totalMes,
        ventasHoy,
        ventasPorTipo,
      }}
    >
      {children}
    </VentasContext.Provider>
  );
}

export function useVentas() {
  const ctx = useContext(VentasContext);
  if (!ctx) throw new Error('useVentas must be used within VentasProvider');
  return ctx;
}
