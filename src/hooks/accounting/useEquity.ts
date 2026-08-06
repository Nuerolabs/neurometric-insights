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

export function useEquityData() {
  return useQuery({
    queryKey: ['equity'],
    queryFn: async () => {
      // 1. Get all shareholders
      const { data: shareholders, error: shError } = await supabase
        .from('accounting_shareholders')
        .select('*')
        .order('is_founder', { ascending: false })
        .order('shares_owned', { ascending: false });

      if (shError) throw shError;

      // 2. Get all contributions
      const { data: contributions, error: cbError } = await supabase
        .from('accounting_capital_contributions')
        .select('*');

      if (cbError) throw cbError;

      // 3. Process and calculate paid/pending capital
      const processedShareholders = shareholders.map(sh => {
        const shContributions = contributions.filter(c => c.shareholder_id === sh.id);
        const paidValue = shContributions.reduce((sum, c) => sum + Number(c.amount), 0);
        const pendingValue = Math.max(0, Number(sh.subscribed_value) - paidValue);
        
        return {
            ...sh,
            paidValue,
            pendingValue,
            contributions: shContributions
        };
      });

      const totalSubscribed = shareholders.reduce((sum, sh) => sum + Number(sh.subscribed_value), 0);
      const totalPaid = processedShareholders.reduce((sum, sh) => sum + sh.paidValue, 0);
      const totalPending = Math.max(0, totalSubscribed - totalPaid);

      return {
          shareholders: processedShareholders,
          summary: {
              totalSubscribed,
              totalPaid,
              totalPending,
              authorizedCapital: 500000000 // Fijo según Acta 002 (o podría ir en tabla config)
          }
      };
    }
  });
}

export function useCreateContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contribution: Omit<CapitalContribution, 'id' | 'status'>) => {
      const { data, error } = await supabase
        .from('accounting_capital_contributions')
        .insert([{ ...contribution, status: 'APPROVED' }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equity'] });
    }
  });
}
