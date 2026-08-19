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

const INITIAL_CLIENTS: Client[] = [];
const INITIAL_INVOICES: Invoice[] = [];
const INITIAL_BILLS: Bill[] = [];
const INITIAL_EMPLOYEES: Employee[] = [];

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
      let createdRow: Client | null = null;

      try {
        const { data, error } = await supabase.from('accounting_clients').insert([{
          name: newClient.name,
          document_id: newClient.document_id,
          contact_person: newClient.contact_person,
          email: newClient.email,
          phone: newClient.phone,
          service_description: newClient.service_description,
          implementation_fee: newClient.implementation_fee,
          monthly_fee: newClient.monthly_fee,
          billing_day: newClient.billing_day,
          status: newClient.status
        }]).select().single();

        if (error) {
          console.error("Error creating client in Supabase:", error);
        } else if (data) {
          createdRow = data as Client;
        }
      } catch (e) {
        console.error("Exception creating client in Supabase:", e);
      }

      if (!createdRow) {
        createdRow = {
          ...newClient,
          id: `cli-${Date.now()}`,
          created_at: new Date().toISOString().split('T')[0]
        };
      }

      const current = getLocal<Client[]>('clients', INITIAL_CLIENTS);
      setLocal('clients', [createdRow, ...current.filter(c => c.id !== createdRow!.id)]);
      return createdRow;
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
      } catch (e) {}
      return getLocal<Invoice[]>('invoices', INITIAL_INVOICES);
    }
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoice: Omit<Invoice, 'id'>) => {
      let createdRow: Invoice | null = null;

      try {
        const { data, error } = await supabase.from('accounting_invoices').insert([{
          client_name: invoice.client_name,
          client_id: invoice.client_id,
          invoice_number: invoice.invoice_number,
          concept_type: invoice.concept_type,
          description: invoice.description,
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          payment_date: invoice.payment_date,
          total_amount: invoice.total_amount,
          status: invoice.status,
          notes: invoice.notes
        }]).select().single();

        if (error) {
          console.error("Error creating invoice in Supabase:", error);
        } else if (data) {
          createdRow = data as Invoice;
        }
      } catch (e) {
        console.error("Exception creating invoice in Supabase:", e);
      }

      if (!createdRow) {
        createdRow = {
          ...invoice,
          id: `inv-${Date.now()}`
        };
      }

      const current = getLocal<Invoice[]>('invoices', INITIAL_INVOICES);
      setLocal('invoices', [createdRow, ...current.filter(i => i.id !== createdRow!.id)]);
      return createdRow;
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
      let createdRow: Bill | null = null;

      try {
        const { data, error } = await supabase.from('accounting_bills').insert([{
          vendor_name: bill.vendor_name,
          vendor_id: bill.vendor_id,
          bill_number: bill.bill_number,
          category: bill.category,
          issue_date: bill.issue_date,
          due_date: bill.due_date,
          payment_date: bill.payment_date,
          total_amount: bill.total_amount,
          status: bill.status,
          notes: bill.notes
        }]).select().single();

        if (error) {
          console.error("Error creating bill in Supabase:", error);
        } else if (data) {
          createdRow = data as Bill;
        }
      } catch (err) {
        console.error("Exception creating bill in Supabase:", err);
      }

      if (!createdRow) {
        createdRow = {
          ...bill,
          id: `bill-${Date.now()}`
        };
      }

      const current = getLocal<Bill[]>('bills', INITIAL_BILLS);
      setLocal('bills', [createdRow, ...current.filter(b => b.id !== createdRow!.id)]);
      return createdRow;
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
      let createdRow: Employee | null = null;

      try {
        const { data, error } = await supabase.from('accounting_employees').insert([{
          full_name: employee.full_name,
          document_id: employee.document_id,
          position: employee.position,
          base_salary: employee.base_salary,
          hire_date: employee.hire_date,
          is_active: employee.is_active
        }]).select().single();

        if (error) {
          console.error("Error creating employee in Supabase:", error);
        } else if (data) {
          createdRow = data as Employee;
        }
      } catch (err) {
        console.error("Exception creating employee in Supabase:", err);
      }

      if (!createdRow) {
        createdRow = {
          ...employee,
          id: `emp-${Date.now()}`
        };
      }

      const current = getLocal<Employee[]>('employees', INITIAL_EMPLOYEES);
      setLocal('employees', [...current.filter(e => e.id !== createdRow!.id), createdRow]);
      return createdRow;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] })
  });
}
