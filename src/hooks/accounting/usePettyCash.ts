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
      const generatedId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `vch-${Date.now()}`;
      let createdRow: PettyCashVoucher | null = null;

      try {
        const { data, error } = await supabase
          .from('accounting_petty_cash')
          .insert([{
            id: generatedId,
            voucher_number: newVoucher.voucher_number,
            beneficiary: newVoucher.beneficiary,
            description: newVoucher.description,
            amount: newVoucher.amount,
            category: newVoucher.category,
            status: newVoucher.status || (isFunding ? 'APPROVED' : 'APPROVED'),
            date: newVoucher.date || new Date().toISOString().split('T')[0],
            receipt_url: newVoucher.receipt_url
          }])
          .select()
          .single();

        if (error) {
          console.error("Error creating petty cash in Supabase:", error);
        } else if (data) {
          createdRow = data as PettyCashVoucher;
        }
      } catch (err) {
        console.error("Exception creating petty cash in Supabase:", err);
      }

      if (!createdRow) {
        createdRow = {
          ...newVoucher,
          id: generatedId,
          status: newVoucher.status || (isFunding ? 'APPROVED' : 'APPROVED'),
          created_at: newVoucher.date || new Date().toISOString().split('T')[0]
        };
      }

      const cur = getLocalVouchers();
      setLocalVouchers([createdRow, ...cur.filter(v => v.id !== createdRow!.id)]);
      return createdRow;
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
