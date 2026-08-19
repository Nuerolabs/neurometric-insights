import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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
          .order('subscribed_value', { ascending: false });

        if (shError) {
          console.error("Error fetching shareholders:", shError);
        } else if (shData && shData.length > 0) {
          shareholders = shData as Shareholder[];
          setLocalShareholders(shData as Shareholder[]);
        }

        const { data: cbData, error: cbError } = await supabase
          .from('accounting_capital_contributions')
          .select('*');

        if (cbError) {
          console.error("Error fetching contributions:", cbError);
        } else if (cbData && cbData.length > 0) {
          contributions = cbData as CapitalContribution[];
          setLocalContributions(cbData as CapitalContribution[]);
        }
      } catch (err) {
        console.error("Exception fetching equity data:", err);
      }

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
      const generatedId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `sh-${Date.now()}`;
      let createdRow: Shareholder | null = null;

      try {
        const { data, error } = await supabase
          .from('accounting_shareholders')
          .insert([{
            id: generatedId,
            name: shareholder.name,
            document_id: shareholder.document_id,
            shares_owned: shareholder.shares_owned,
            subscribed_value: shareholder.subscribed_value,
            share_class: shareholder.share_class || 'Ordinarias Clase A',
            contribution_type: shareholder.contribution_type || 'Capital & Tecnología'
          }])
          .select()
          .single();

        if (error) {
          console.error("Error creating shareholder in Supabase:", error);
          toast.error("Error Supabase: " + error.message);
          throw new Error(error.message);
        } else if (data) {
          createdRow = data as Shareholder;
        }
      } catch (err: any) {
        console.error("Exception creating shareholder in Supabase:", err);
        throw err;
      }

      if (!createdRow) {
        createdRow = {
          ...shareholder,
          id: generatedId
        };
      }

      const cur = getLocalShareholders();
      setLocalShareholders([createdRow, ...cur.filter(s => s.id !== createdRow!.id)]);
      return createdRow;
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
        const { error } = await supabase
          .from('accounting_shareholders')
          .update({
            name: shareholder.name,
            document_id: shareholder.document_id,
            shares_owned: shareholder.shares_owned,
            subscribed_value: shareholder.subscribed_value,
            share_class: shareholder.share_class,
            contribution_type: shareholder.contribution_type
          })
          .eq('id', shareholder.id);

        if (error) {
          console.error("Error updating shareholder in Supabase:", error);
          toast.error("Error Supabase: " + error.message);
        }
      } catch (err: any) {
        console.error("Error updating shareholder in Supabase:", err);
      }

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
        const { error } = await supabase
          .from('accounting_shareholders')
          .delete()
          .eq('id', id);

        if (error) {
          console.error("Error deleting shareholder in Supabase:", error);
          toast.error("Error Supabase: " + error.message);
        }
      } catch (err: any) {
        console.error("Error deleting shareholder in Supabase:", err);
      }

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
      const generatedId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `cnt-${Date.now()}`;
      let createdRow: CapitalContribution | null = null;

      try {
        const { data, error } = await supabase
          .from('accounting_capital_contributions')
          .insert([{
            id: generatedId,
            shareholder_id: contribution.shareholder_id,
            amount: contribution.amount,
            payment_date: contribution.payment_date,
            reference: contribution.reference,
            receipt_url: contribution.receipt_url || '',
            status: 'APPROVED'
          }])
          .select()
          .single();

        if (error) {
          console.error("Error creating contribution in Supabase:", error);
          toast.error("Error Supabase Aporte: " + error.message);
        } else if (data) {
          createdRow = data as CapitalContribution;
        }
      } catch (err: any) {
        console.error("Exception creating contribution in Supabase:", err);
      }

      if (!createdRow) {
        createdRow = {
          ...contribution,
          id: generatedId,
          status: 'APPROVED'
        };
      }

      const cur = getLocalContributions();
      setLocalContributions([createdRow, ...cur.filter(c => c.id !== createdRow!.id)]);
      return createdRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equity'] });
      queryClient.invalidateQueries({ queryKey: ['petty-cash'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  });
}
