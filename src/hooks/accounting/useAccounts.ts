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

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounting_accounts')
        .select('*')
        .order('code', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }
      return data as Account[];
    }
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newAccount: Omit<Account, 'id'>) => {
      const { data, error } = await supabase
        .from('accounting_accounts')
        .insert([newAccount])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    }
  });
}
