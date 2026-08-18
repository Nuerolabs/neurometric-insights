import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Shareholder {
  id: string;
  name: string;
  document_id: string;
  shares_owned: number;
  subscribed_value: number;
  share_class: string;
  contribution_type: string;
  is_founder: boolean;
}

export interface CapitalContribution {
  id: string;
  shareholder_id: string;
  amount: number;
  payment_date: string;
  reference: string;
  receipt_url?: string;
  status: string;
}

const DEFAULT_SHAREHOLDERS: Shareholder[] = [];
const DEFAULT_CONTRIBUTIONS: CapitalContribution[] = [];

const getLocalAuthorizedCapital = (): number => {
  try {
    const raw = localStorage.getItem('neurolabs_erp_authorized_capital');
    return raw ? parseFloat(raw) : 100000000;
  } catch {
    return 100000000;
  }
};

const setLocalAuthorizedCapital = (val: number) => {
  try {
    localStorage.setItem('neurolabs_erp_authorized_capital', val.toString());
  } catch {}
};

const getLocalShareholders = (): Shareholder[] => {
  try {
    const raw = localStorage.getItem('neurolabs_erp_equity_shareholders');
    return raw ? JSON.parse(raw) : DEFAULT_SHAREHOLDERS;
  } catch {
    return DEFAULT_SHAREHOLDERS;
  }
};

const setLocalShareholders = (data: Shareholder[]) => {
  try {
    localStorage.setItem('neurolabs_erp_equity_shareholders', JSON.stringify(data));
  } catch {}
};

const getLocalContributions = (): CapitalContribution[] => {
  try {
    const raw = localStorage.getItem('neurolabs_erp_equity_contributions');
    return raw ? JSON.parse(raw) : DEFAULT_CONTRIBUTIONS;
  } catch {
    return DEFAULT_CONTRIBUTIONS;
  }
};

const setLocalContributions = (data: CapitalContribution[]) => {
  try {
    localStorage.setItem('neurolabs_erp_equity_contributions', JSON.stringify(data));
  } catch {}
};

export function useEquityData() {
  return useQuery({
    queryKey: ['equity'],
    queryFn: async () => {
      let shareholders: Shareholder[] = getLocalShareholders();
      let contributions: CapitalContribution[] = getLocalContributions();
      let authorizedCapital = getLocalAuthorizedCapital();

      try {
        const { data: shData, error: shError } = await supabase
          .from('accounting_shareholders')
          .select('*')
          .order('is_founder', { ascending: false })
          .order('shares_owned', { ascending: false });

        if (!shError && shData && shData.length > 0) {
          shareholders = shData;
          setLocalShareholders(shData);
        }

        const { data: cbData, error: cbError } = await supabase
          .from('accounting_capital_contributions')
          .select('*');

        if (!cbError && cbData && cbData.length > 0) {
          contributions = cbData;
          setLocalContributions(cbData);
        }
      } catch {}

      // Process and calculate paid/pending capital
      const processedShareholders = shareholders.map(sh => {
        const shContributions = contributions.filter(c => c.shareholder_id === sh.id);
        const paidValue = shContributions.reduce((sum, c) => sum + Number(c.amount || 0), 0);
        const pendingValue = Math.max(0, Number(sh.subscribed_value) - paidValue);
        
        return {
            ...sh,
            paidValue,
            pendingValue,
            contributions: shContributions
        };
      });

      const totalSubscribed = shareholders.reduce((sum, sh) => sum + Number(sh.subscribed_value || 0), 0);
      const totalPaid = processedShareholders.reduce((sum, sh) => sum + sh.paidValue, 0);
      const totalPending = Math.max(0, totalSubscribed - totalPaid);

      return {
          shareholders: processedShareholders,
          summary: {
              totalSubscribed,
              totalPaid,
              totalPending,
              authorizedCapital
          }
      };
    }
  });
}

export function useUpdateAuthorizedCapital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newAmount: number) => {
      setLocalAuthorizedCapital(newAmount);
      return newAmount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equity'] });
    }
  });
}

export function useCreateShareholder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shareholder: Omit<Shareholder, 'id'>) => {
      const obj: Shareholder = {
        ...shareholder,
        id: `sh-${Date.now()}`
      };

      try {
        const { data, error } = await supabase
          .from('accounting_shareholders')
          .insert([obj])
          .select()
          .single();

        if (!error && data) {
          const cur = getLocalShareholders();
          setLocalShareholders([data, ...cur]);
          return data;
        }
      } catch {}

      const cur = getLocalShareholders();
      const updated = [obj, ...cur];
      setLocalShareholders(updated);
      return obj;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equity'] });
    }
  });
}

export function useUpdateShareholder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shareholder: Shareholder) => {
      try {
        await supabase
          .from('accounting_shareholders')
          .update(shareholder)
          .eq('id', shareholder.id);
      } catch {}

      const cur = getLocalShareholders();
      const updated = cur.map(s => s.id === shareholder.id ? shareholder : s);
      setLocalShareholders(updated);
      return shareholder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equity'] });
    }
  });
}

export function useDeleteShareholder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await supabase
          .from('accounting_shareholders')
          .delete()
          .eq('id', id);
      } catch {}

      const cur = getLocalShareholders();
      const updated = cur.filter(s => s.id !== id);
      setLocalShareholders(updated);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equity'] });
    }
  });
}

export function useCreateContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contribution: Omit<CapitalContribution, 'id' | 'status'>) => {
      const obj: CapitalContribution = { 
        ...contribution, 
        id: `cnt-${Date.now()}`, 
        status: 'APPROVED' 
      };

      try {
        const { data, error } = await supabase
          .from('accounting_capital_contributions')
          .insert([obj])
          .select()
          .single();

        if (!error && data) {
          const cur = getLocalContributions();
          setLocalContributions([data, ...cur]);
          return data;
        }
      } catch {}

      const cur = getLocalContributions();
      const updated = [obj, ...cur];
      setLocalContributions(updated);
      return obj;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equity'] });
      queryClient.invalidateQueries({ queryKey: ['petty-cash'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  });
}
