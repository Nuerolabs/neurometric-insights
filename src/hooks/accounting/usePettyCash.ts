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

const INITIAL_VOUCHERS: PettyCashVoucher[] = [
  {
    id: "vch-001",
    voucher_number: "CH-001",
    date: "2025-02-01",
    beneficiary: "Caja Principal",
    description: "Apertura y Asignación de Fondo Fijo de Caja Menor",
    amount: 1000000,
    category: "INGRESO DE FONDOS",
    status: "APPROVED",
    created_at: "2025-02-01"
  },
  {
    id: "vch-002",
    voucher_number: "CH-002",
    date: "2025-02-06",
    beneficiary: "Papelería & Suministros El Triunfo",
    description: "Compra de carpetas, papelería y consumibles de oficina",
    amount: 85000,
    category: "PAPELERIA",
    status: "APPROVED",
    created_at: "2025-02-06"
  },
  {
    id: "vch-003",
    voucher_number: "CH-003",
    date: "2025-02-12",
    beneficiary: "Cafetería y Alimentos S.A.S.",
    description: "Insumos de cafetería y atención de reuniones corporativas",
    amount: 65000,
    category: "CAFETERIA",
    status: "APPROVED",
    created_at: "2025-02-12"
  }
];

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
    mutationFn: async (newVoucher: Omit<PettyCashVoucher, 'id' | 'created_at' | 'status'>) => {
      const vchObj: PettyCashVoucher = {
        ...newVoucher,
        id: `vch-${Date.now()}`,
        status: 'PENDING',
        created_at: new Date().toISOString().split('T')[0]
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
