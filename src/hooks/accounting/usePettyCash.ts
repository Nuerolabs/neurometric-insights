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

const INITIAL_VOUCHERS: PettyCashVoucher[] = [];

const getLocalVouchers = (): PettyCashVoucher[] => {
  try {
    const raw = localStorage.getItem('neurolabs_erp_petty_cash');
    return raw ? JSON.parse(raw) : INITIAL_VOUCHERS;
  } catch {
    return INITIAL_VOUCHERS;
  }
};

const setLocalVouchers = (data: PettyCashVoucher[]) => {
  try {
    localStorage.setItem('neurolabs_erp_petty_cash', JSON.stringify(data));
  } catch {}
};

export function usePettyCashVouchers() {
  return useQuery({
    queryKey: ['petty-cash'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('accounting_petty_cash')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setLocalVouchers(data);
          return data as PettyCashVoucher[];
        }
      } catch {}
      return getLocalVouchers();
    }
  });
}

export function useCreatePettyCashVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newVoucher: Omit<PettyCashVoucher, 'id' | 'created_at'> & { status?: PettyCashVoucher['status'] }) => {
      const isFunding = newVoucher.category === 'INGRESO DE FONDOS';
      const vchObj: PettyCashVoucher = {
        ...newVoucher,
        id: `vch-${Date.now()}`,
        status: newVoucher.status || (isFunding ? 'APPROVED' : 'APPROVED'),
        created_at: newVoucher.date || new Date().toISOString().split('T')[0]
      };

      try {
        const { data, error } = await supabase
          .from('accounting_petty_cash')
          .insert([vchObj])
          .select()
          .single();

        if (!error && data) {
          const cur = getLocalVouchers();
          setLocalVouchers([data, ...cur]);
          return data;
        }
      } catch {}

      const cur = getLocalVouchers();
      setLocalVouchers([vchObj, ...cur]);
      return vchObj;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petty-cash'] });
      queryClient.invalidateQueries({ queryKey: ['equity'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  });
}

export function useUpdateVoucherStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: PettyCashVoucher['status'] }) => {
      try {
        await supabase
          .from('accounting_petty_cash')
          .update({ status })
          .eq('id', id);
      } catch {}

      const cur = getLocalVouchers();
      const updated = cur.map(v => v.id === id ? { ...v, status } : v);
      setLocalVouchers(updated);
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petty-cash'] });
    }
  });
}
