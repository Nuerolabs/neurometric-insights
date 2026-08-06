import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// Interfaces
export interface Invoice {
  id: string;
  client_name: string;
  client_id?: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  status: 'DRAFT' | 'PAID' | 'OVERDUE';
  notes?: string;
}

export interface Bill {
  id: string;
  vendor_name: string;
  vendor_id?: string;
  bill_number: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  notes?: string;
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

// Queries
export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase.from('accounting_invoices').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Invoice[];
    }
  });
}

export function useBills() {
  return useQuery({
    queryKey: ['bills'],
    queryFn: async () => {
      const { data, error } = await supabase.from('accounting_bills').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Bill[];
    }
  });
}

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase.from('accounting_employees').select('*').order('full_name', { ascending: true });
      if (error) throw error;
      return data as Employee[];
    }
  });
}

// Mutations
export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoice: Omit<Invoice, 'id'>) => {
      const { data, error } = await supabase.from('accounting_invoices').insert([invoice]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] })
  });
}

export function useCreateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bill: Omit<Bill, 'id'>) => {
      const { data, error } = await supabase.from('accounting_bills').insert([bill]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bills'] })
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (employee: Omit<Employee, 'id'>) => {
      const { data, error } = await supabase.from('accounting_employees').insert([employee]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] })
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { data, error } = await supabase.from('accounting_invoices').update({ status }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] })
  });
}

export function useUpdateBillStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { data, error } = await supabase.from('accounting_bills').update({ status }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bills'] })
  });
}
