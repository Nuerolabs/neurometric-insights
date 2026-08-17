import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'ACTIVO' | 'PASIVO' | 'PATRIMONIO' | 'INGRESOS' | 'GASTOS' | 'COSTOS';
  parent_id: string | null;
  description: string;
  is_active: boolean;
}

const DEFAULT_ACCOUNTS: Account[] = [
  // 1. ACTIVOS
  { id: "acc-1105", code: "1105", name: "Caja General y Menor", type: "ACTIVO", parent_id: null, description: "Efectivo disponible para gastos menores y operaciones inmediatas", is_active: true },
  { id: "acc-1110", code: "1110", name: "Bancos y Cuentas de Ahorro", type: "ACTIVO", parent_id: null, description: "Cuentas bancarias empresariales (Bancolombia / Nequi)", is_active: true },
  { id: "acc-1305", code: "1305", name: "Clientes Nacionales (CxC)", type: "ACTIVO", parent_id: null, description: "Cuentas por cobrar de contratos y servicios prestados", is_active: true },
  { id: "acc-1528", code: "1528", name: "Equipo de Computación y Comunicación", type: "ACTIVO", parent_id: null, description: "Servidores, estaciones de trabajo y hardware", is_active: true },
  
  // 2. PASIVOS
  { id: "acc-2205", code: "2205", name: "Proveedores Nacionales (CxP)", type: "PASIVO", parent_id: null, description: "Obligaciones pendientes con proveedores y servicios", is_active: true },
  { id: "acc-2335", code: "2335", name: "Costos y Gastos por Pagar", type: "PASIVO", parent_id: null, description: "Servicios cloud, licencias OpenAI y hosting", is_active: true },
  { id: "acc-2505", code: "2505", name: "Salarios por Pagar (Nómina)", type: "PASIVO", parent_id: null, description: "Obligaciones laborales pendientes", is_active: true },
  
  // 3. PATRIMONIO
  { id: "acc-3115", code: "3115", name: "Capital Social Suscrito y Pagado", type: "PATRIMONIO", parent_id: null, description: "Aportes constitutivos de los socios fundadores", is_active: true },
  { id: "acc-3605", code: "3605", name: "Utilidad del Ejercicio", type: "PATRIMONIO", parent_id: null, description: "Superávit neto acumulado del período", is_active: true },
  
  // 4. INGRESOS
  { id: "acc-4135", code: "4135", name: "Ingresos por Servicios de Software e IA", type: "INGRESOS", parent_id: null, description: "Ingresos operacionales de la actividad económica", is_active: true },
  { id: "acc-413510", code: "413510", name: "Ingresos Recurrentes (Suscripciones / Mensualidades)", type: "INGRESOS", parent_id: "acc-4135", description: "Cobro de mensualidades de $600.000 COP por servicio continuo", is_active: true },
  { id: "acc-413520", code: "413520", name: "Ingresos por Implementación y Setup", type: "INGRESOS", parent_id: "acc-4135", description: "Valor cobrado por configuración inicial y despliegue", is_active: true },
  
  // 5. GASTOS
  { id: "acc-5105", code: "5105", name: "Gastos de Personal (Nómina y Honorarios)", type: "GASTOS", parent_id: null, description: "Remuneración a colaboradores y desarrolladores", is_active: true },
  { id: "acc-5135", code: "5135", name: "Servicios Cloud e Infraestructura", type: "GASTOS", parent_id: null, description: "AWS, OpenAI, Vercel, bases de datos y dominios", is_active: true },
  { id: "acc-5195", code: "5195", name: "Diversos y Caja Menor", type: "GASTOS", parent_id: null, description: "Papelería, cafetería, gastos de representación menores", is_active: true }
];

const getLocalAccounts = (): Account[] => {
  try {
    const raw = localStorage.getItem('neurolabs_erp_accounts');
    return raw ? JSON.parse(raw) : DEFAULT_ACCOUNTS;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
};

const setLocalAccounts = (data: Account[]) => {
  try {
    localStorage.setItem('neurolabs_erp_accounts', JSON.stringify(data));
  } catch {}
};

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('accounting_accounts')
          .select('*')
          .order('code', { ascending: true });

        if (!error && data && data.length > 0) {
          setLocalAccounts(data);
          return data as Account[];
        }
      } catch {}
      return getLocalAccounts();
    }
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newAccount: Omit<Account, 'id'>) => {
      const accObj: Account = {
        ...newAccount,
        id: `acc-${Date.now()}`
      };

      try {
        const { data, error } = await supabase
          .from('accounting_accounts')
          .insert([accObj])
          .select()
          .single();

        if (!error && data) {
          const cur = getLocalAccounts();
          setLocalAccounts([...cur, data]);
          return data;
        }
      } catch {}

      const cur = getLocalAccounts();
      setLocalAccounts([...cur, accObj]);
      return accObj;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    }
  });
}
