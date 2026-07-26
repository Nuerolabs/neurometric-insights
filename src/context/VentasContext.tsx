import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type TipoVenta =
  | 'impresion_bn'
  | 'impresion_color'
  | 'copia'
  | 'copia_cantidad'
  | 'escaneado'
  | 'encuadernado'
  | 'otro';

export type EstadoPago = 'pagado' | 'pendiente';

export interface Venta {
  id: string;
  tipo: TipoVenta;
  cantidad: number;
  precioUnitario: number;
  total: number;
  notas: string;
  fecha: string; // ISO string
  estadoPago: EstadoPago;
  cliente: string; // nombre del cliente (opcional)
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
  impresion_bn: '#475569',
  impresion_color: '#d97706',
  copia: '#2563eb',
  copia_cantidad: '#7c3aed',
  escaneado: '#059669',
  encuadernado: '#dc2626',
  otro: '#db2777',
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

/** Migra ventas antiguas que no tienen estadoPago ni cliente */
function migrarVentas(raw: unknown[]): Venta[] {
  return raw.map((v: any) => ({
    estadoPago: 'pagado' as EstadoPago,
    cliente: '',
    ...v,
  }));
}

interface VentasContextType {
  // Auth
  isAuthenticated: boolean;
  login: (usuario: string, contrasena: string) => boolean;
  logout: () => void;
  // Ventas
  ventas: Venta[];
  agregarVenta: (venta: Omit<Venta, 'id' | 'fecha' | 'total'>) => void;
  eliminarVenta: (id: string) => void;
  marcarPagado: (id: string) => void;
  // Computed
  totalHoy: number;
  totalSemana: number;
  totalMes: number;
  totalPendiente: number;
  ventasHoy: Venta[];
  ventasPorTipo: Record<string, number>;
  ventasPendientes: Venta[];
}

const VentasContext = createContext<VentasContextType | null>(null);

export function VentasProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.auth) === 'true';
  });

  const [ventas, setVentas] = useState<Venta[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ventas);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return migrarVentas(Array.isArray(parsed) ? parsed : []);
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

  const marcarPagado = useCallback((id: string) => {
    setVentas((prev) =>
      prev.map((v) => (v.id === id ? { ...v, estadoPago: 'pagado' } : v))
    );
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
  const totalHoy = ventasHoy
    .filter((v) => v.estadoPago === 'pagado')
    .reduce((s, v) => s + v.total, 0);
  const totalSemana = ventas
    .filter((v) => esSemana(v.fecha) && v.estadoPago === 'pagado')
    .reduce((s, v) => s + v.total, 0);
  const totalMes = ventas
    .filter((v) => esMes(v.fecha) && v.estadoPago === 'pagado')
    .reduce((s, v) => s + v.total, 0);

  const ventasPendientes = ventas.filter((v) => v.estadoPago === 'pendiente');
  const totalPendiente = ventasPendientes.reduce((s, v) => s + v.total, 0);

  const ventasPorTipo = ventas
    .filter((v) => v.estadoPago === 'pagado')
    .reduce<Record<string, number>>((acc, v) => {
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
        marcarPagado,
        totalHoy,
        totalSemana,
        totalMes,
        totalPendiente,
        ventasHoy,
        ventasPorTipo,
        ventasPendientes,
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
