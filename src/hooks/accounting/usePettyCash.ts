import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface PettyCashVoucher {
  id: string;
  date: string;
  voucher_number: string;
  beneficiary: string;
  description: string;
  amount: number;
  category: string;
  status: 'PENDING' | 'APPROVED' | 'REIMBURSED' | 'REJECTED';
  created_at: string;
  receipt_url?: string;
}

export function usePettyCashVouchers() {
  return useQuery({
    queryKey: ['petty-cash'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounting_petty_cash')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }
      return data as PettyCashVoucher[];
    }
  });
}

export function useCreatePettyCashVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newVoucher: Omit<PettyCashVoucher, 'id' | 'created_at' | 'status'>) => {
      const { data, error } = await supabase
        .from('accounting_petty_cash')
        .insert([{ ...newVoucher, status: 'PENDING' }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petty-cash'] });
    }
  });
}

export function useUpdateVoucherStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: PettyCashVoucher['status'] }) => {
      const { data, error } = await supabase
        .from('accounting_petty_cash')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petty-cash'] });
    }
  });
}
