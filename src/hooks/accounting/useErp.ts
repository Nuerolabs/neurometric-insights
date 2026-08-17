import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// ── Interfaces ─────────────────────────────────────────────────────────────
export type InvoiceConceptType = 
  | 'IMPLEMENTATION' 
  | 'RECURRING_MONTHLY' 
  | 'CONSULTING' 
  | 'MAINTENANCE' 
  | 'OTHER';

export interface Client {
  id: string;
  name: string; // Razón Social
  document_id: string; // NIT o C.C.
  contact_person: string;
  email: string;
  phone: string;
  service_description: string;
  implementation_fee: number; // Valor de Implementación (Setup único)
  monthly_fee: number; // Valor Mensual Recurrente (ej. 600000 COP)
  billing_day: number; // Día del mes para cobro (ej. 1 a 31)
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  created_at: string;
}

export interface Invoice {
  id: string;
  client_name: string;
  client_id?: string;
  invoice_number: string;
  concept_type: InvoiceConceptType;
  description: string;
  issue_date: string;
  due_date: string;
  payment_date?: string;
  total_amount: number;
  status: 'DRAFT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  notes?: string;
  created_at?: string;
}

export interface Bill {
  id: string;
  vendor_name: string;
  vendor_id?: string;
  bill_number: string;
  category: 'INFRAESTRUCTURA' | 'SERVICIOS_CLOUD' | 'NOMINA' | 'HONORARIOS' | 'SUMINISTROS' | 'OTRO';
  issue_date: string;
  due_date: string;
  payment_date?: string;
  total_amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  notes?: string;
  created_at?: string;
}

export interface Employee {
  id: string;
  full_name: string;
  document_id: string;
  position: string;
  base_salary: number;
  hire_date: string;
  is_active: boolean;
}

// ── Initial Seed Data (Realistic Colombian Corporate Values) ───────────────
const INITIAL_CLIENTS: Client[] = [
  {
    id: "cli-001",
    name: "Inversiones y Servicios Nova S.A.S.",
    document_id: "901.452.889-1",
    contact_person: "Carlos Andrés Restrepo",
    email: "administracion@novasas.co",
    phone: "+57 312 458 9920",
    service_description: "Agente IA de Atención y CRM Automatizado",
    implementation_fee: 2500000,
    monthly_fee: 600000,
    billing_day: 5,
    status: 'ACTIVE',
    created_at: "2025-01-10"
  },
  {
    id: "cli-002",
    name: "Distribuciones Médicas del Caribe",
    document_id: "900.871.234-5",
    contact_person: "Laura Marcela Gómez",
    email: "gerencia@distrimedcaribe.com",
    phone: "+57 300 845 1122",
    service_description: "ERP NeuroLabs + Integración WhatsApp Corporativo",
    implementation_fee: 3200000,
    monthly_fee: 600000,
    billing_day: 15,
    status: 'ACTIVE',
    created_at: "2025-01-18"
  }
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: "inv-001",
    client_name: "Inversiones y Servicios Nova S.A.S.",
    client_id: "cli-001",
    invoice_number: "FAC-2025-001",
    concept_type: "IMPLEMENTATION",
    description: "Servicio de Implementación, parametrización y despliegue de Agente IA",
    issue_date: "2025-01-10",
    due_date: "2025-01-25",
    payment_date: "2025-01-15",
    total_amount: 2500000,
    status: "PAID",
    notes: "Transferencia Bancolombia verificada"
  },
  {
    id: "inv-002",
    client_name: "Inversiones y Servicios Nova S.A.S.",
    client_id: "cli-001",
    invoice_number: "FAC-2025-002",
    concept_type: "RECURRING_MONTHLY",
    description: "Mensualidad de Servicio y Mantenimiento Plataforma IA - Período Febrero 2025",
    issue_date: "2025-02-05",
    due_date: "2025-02-20",
    payment_date: "2025-02-08",
    total_amount: 600000,
    status: "PAID",
    notes: "Pago recurrente puntual"
  },
  {
    id: "inv-003",
    client_name: "Distribuciones Médicas del Caribe",
    client_id: "cli-002",
    invoice_number: "FAC-2025-003",
    concept_type: "IMPLEMENTATION",
    description: "Implementación e Integración de Sistema Financiero y ERP NeuroLabs",
    issue_date: "2025-01-18",
    due_date: "2025-02-02",
    payment_date: "2025-01-22",
    total_amount: 3200000,
    status: "PAID",
    notes: "Pago 100% anticipado"
  },
  {
    id: "inv-004",
    client_name: "Distribuciones Médicas del Caribe",
    client_id: "cli-002",
    invoice_number: "FAC-2025-004",
    concept_type: "RECURRING_MONTHLY",
    description: "Suscripción mensual y soporte continuo - Período Febrero 2025",
    issue_date: "2025-02-15",
    due_date: "2025-03-02",
    total_amount: 600000,
    status: "DRAFT",
    notes: "Factura enviada al correo del cliente"
  }
];

const INITIAL_BILLS: Bill[] = [
  {
    id: "bill-001",
    vendor_name: "Amazon Web Services (AWS)",
    bill_number: "AWS-988412",
    category: "SERVICIOS_CLOUD",
    issue_date: "2025-02-01",
    due_date: "2025-02-15",
    payment_date: "2025-02-10",
    total_amount: 340000,
    status: "PAID",
    notes: "Servidores Cloud y Base de Datos"
  },
  {
    id: "bill-002",
    vendor_name: "OpenAI API Platform",
    bill_number: "OAI-44781",
    category: "INFRAESTRUCTURA",
    issue_date: "2025-02-01",
    due_date: "2025-02-14",
    payment_date: "2025-02-05",
    total_amount: 480000,
    status: "PAID",
    notes: "Consumo de modelos y embeddings"
  },
  {
    id: "bill-003",
    vendor_name: "Vercel Enterprise & Hosting",
    bill_number: "VRC-7819",
    category: "SERVICIOS_CLOUD",
    issue_date: "2025-02-10",
    due_date: "2025-02-25",
    total_amount: 120000,
    status: "PENDING",
    notes: "Hosting frontend y SSL corporativo"
  }
];

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "emp-001",
    full_name: "Jafet Rodríguez",
    document_id: "1.045.789.231",
    position: "Lead Software & AI Engineer",
    base_salary: 3500000,
    hire_date: "2024-06-01",
    is_active: true
  },
  {
    id: "emp-002",
    full_name: "María Angélica Domínguez",
    document_id: "1.129.445.890",
    position: "Gerencia Financiera & Operaciones",
    base_salary: 3000000,
    hire_date: "2024-06-01",
    is_active: true
  }
];

// Helper local storage functions
const getLocal = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(`neurolabs_erp_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const setLocal = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(`neurolabs_erp_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error("Storage error:", e);
  }
};

// ── Hooks: Clientes ────────────────────────────────────────────────────────
export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('accounting_clients').select('*').order('name', { ascending: true });
        if (!error && data && data.length > 0) {
          setLocal('clients', data);
          return data as Client[];
        }
      } catch (e) {
        // Fallback local
      }
      return getLocal<Client[]>('clients', INITIAL_CLIENTS);
    }
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newClient: Omit<Client, 'id' | 'created_at'>) => {
      const clientObj: Client = {
        ...newClient,
        id: `cli-${Date.now()}`,
        created_at: new Date().toISOString().split('T')[0]
      };

      try {
        const { data, error } = await supabase.from('accounting_clients').insert([clientObj]).select().single();
        if (!error && data) {
          const current = getLocal<Client[]>('clients', INITIAL_CLIENTS);
          setLocal('clients', [data, ...current]);
          return data;
        }
      } catch (e) {
        // Continue local
      }

      const current = getLocal<Client[]>('clients', INITIAL_CLIENTS);
      const updated = [clientObj, ...current];
      setLocal('clients', updated);
      return clientObj;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] })
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await supabase.from('accounting_clients').delete().eq('id', id);
      } catch {}
      const current = getLocal<Client[]>('clients', INITIAL_CLIENTS);
      const updated = current.filter(c => c.id !== id);
      setLocal('clients', updated);
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] })
  });
}

// ── Hooks: Facturas e Ingresos (Invoices / CxC) ────────────────────────────
export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('accounting_invoices').select('*').order('issue_date', { ascending: false });
        if (!error && data && data.length > 0) {
          setLocal('invoices', data);
          return data as Invoice[];
        }
      } catch (e) {
        // Fallback local
      }
      return getLocal<Invoice[]>('invoices', INITIAL_INVOICES);
    }
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoice: Omit<Invoice, 'id'>) => {
      const invObj: Invoice = {
        ...invoice,
        id: `inv-${Date.now()}`
      };

      try {
        const { data, error } = await supabase.from('accounting_invoices').insert([invObj]).select().single();
        if (!error && data) {
          const current = getLocal<Invoice[]>('invoices', INITIAL_INVOICES);
          setLocal('invoices', [data, ...current]);
          return data;
        }
      } catch (e) {
        // Continue local
      }

      const current = getLocal<Invoice[]>('invoices', INITIAL_INVOICES);
      const updated = [invObj, ...current];
      setLocal('invoices', updated);
      return invObj;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['equity'] });
    }
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'DRAFT' | 'PAID' | 'OVERDUE' | 'CANCELLED' }) => {
      const now = new Date().toISOString().split('T')[0];
      try {
        await supabase.from('accounting_invoices').update({ 
          status, 
          payment_date: status === 'PAID' ? now : undefined 
        }).eq('id', id);
      } catch {}

      const current = getLocal<Invoice[]>('invoices', INITIAL_INVOICES);
      const updated = current.map(inv => inv.id === id ? { 
        ...inv, 
        status, 
        payment_date: status === 'PAID' ? (inv.payment_date || now) : undefined 
      } : inv);
      setLocal('invoices', updated);
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['equity'] });
    }
  });
}

// ── Hooks: Cuentas por Pagar (Bills / CxP) ─────────────────────────────────
export function useBills() {
  return useQuery({
    queryKey: ['bills'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('accounting_bills').select('*').order('issue_date', { ascending: false });
        if (!error && data && data.length > 0) {
          setLocal('bills', data);
          return data as Bill[];
        }
      } catch {}
      return getLocal<Bill[]>('bills', INITIAL_BILLS);
    }
  });
}

export function useCreateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bill: Omit<Bill, 'id'>) => {
      const billObj: Bill = {
        ...bill,
        id: `bill-${Date.now()}`
      };

      try {
        const { data, error } = await supabase.from('accounting_bills').insert([billObj]).select().single();
        if (!error && data) {
          const current = getLocal<Bill[]>('bills', INITIAL_BILLS);
          setLocal('bills', [data, ...current]);
          return data;
        }
      } catch {}

      const current = getLocal<Bill[]>('bills', INITIAL_BILLS);
      const updated = [billObj, ...current];
      setLocal('bills', updated);
      return billObj;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bills'] })
  });
}

export function useUpdateBillStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'PENDING' | 'PAID' | 'OVERDUE' }) => {
      const now = new Date().toISOString().split('T')[0];
      try {
        await supabase.from('accounting_bills').update({ 
          status, 
          payment_date: status === 'PAID' ? now : undefined 
        }).eq('id', id);
      } catch {}

      const current = getLocal<Bill[]>('bills', INITIAL_BILLS);
      const updated = current.map(b => b.id === id ? { 
        ...b, 
        status, 
        payment_date: status === 'PAID' ? (b.payment_date || now) : undefined 
      } : b);
      setLocal('bills', updated);
      return { id, status };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bills'] })
  });
}

// ── Hooks: Empleados y Nómina ──────────────────────────────────────────────
export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('accounting_employees').select('*').order('full_name', { ascending: true });
        if (!error && data && data.length > 0) {
          setLocal('employees', data);
          return data as Employee[];
        }
      } catch {}
      return getLocal<Employee[]>('employees', INITIAL_EMPLOYEES);
    }
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (employee: Omit<Employee, 'id'>) => {
      const empObj: Employee = {
        ...employee,
        id: `emp-${Date.now()}`
      };

      try {
        const { data, error } = await supabase.from('accounting_employees').insert([empObj]).select().single();
        if (!error && data) {
          const current = getLocal<Employee[]>('employees', INITIAL_EMPLOYEES);
          setLocal('employees', [...current, data]);
          return data;
        }
      } catch {}

      const current = getLocal<Employee[]>('employees', INITIAL_EMPLOYEES);
      const updated = [...current, empObj];
      setLocal('employees', updated);
      return empObj;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] })
  });
}
