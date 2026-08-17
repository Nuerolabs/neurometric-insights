import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface JournalEntryLine {
  id?: string;
  transaction_id?: string;
  account_id: string;
  debit: number;
  credit: number;
  description: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  status: 'DRAFT' | 'POSTED' | 'VOIDED';
  created_at: string;
  lines?: JournalEntryLine[];
}

const DEFAULT_ENTRIES: (JournalEntry & { totalDebit: number; totalCredit: number; entry_number?: string })[] = [
  {
    id: "tx-001",
    date: "2025-01-10",
    reference: "AS-001",
    entry_number: "AS-001",
    description: "Facturación de Implementación Cliente Nova S.A.S.",
    status: "POSTED",
    created_at: "2025-01-10",
    totalDebit: 2500000,
    totalCredit: 2500000
  },
  {
    id: "tx-002",
    date: "2025-02-05",
    reference: "AS-002",
    entry_number: "AS-002",
    description: "Recaudo Mensualidad Febrero Cliente Nova S.A.S. ($600.000 COP)",
    status: "POSTED",
    created_at: "2025-02-05",
    totalDebit: 600000,
    totalCredit: 600000
  },
  {
    id: "tx-003",
    date: "2025-02-01",
    reference: "AS-003",
    entry_number: "AS-003",
    description: "Apertura de Fondo de Caja Menor",
    status: "POSTED",
    created_at: "2025-02-01",
    totalDebit: 1000000,
    totalCredit: 1000000
  }
];

const getLocalEntries = () => {
  try {
    const raw = localStorage.getItem('neurolabs_erp_journal_entries');
    return raw ? JSON.parse(raw) : DEFAULT_ENTRIES;
  } catch {
    return DEFAULT_ENTRIES;
  }
};

const setLocalEntries = (data: any) => {
  try {
    localStorage.setItem('neurolabs_erp_journal_entries', JSON.stringify(data));
  } catch {}
};

export function useJournalEntries() {
  return useQuery({
    queryKey: ['journal-entries'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('accounting_transactions')
          .select(`
            id, date, reference, description, status, created_at,
            accounting_transaction_lines ( debit, credit )
          `)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped = data.map((entry: any) => {
            const lines = entry.accounting_transaction_lines || [];
            const totalDebit = lines.reduce((sum: number, line: any) => sum + Number(line.debit || 0), 0);
            const totalCredit = lines.reduce((sum: number, line: any) => sum + Number(line.credit || 0), 0);
            return {
              ...entry,
              entry_number: entry.reference || entry.id,
              totalDebit,
              totalCredit
            };
          });
          setLocalEntries(mapped);
          return mapped;
        }
      } catch {}

      return getLocalEntries();
    }
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entry, lines }: { entry: Omit<JournalEntry, 'id' | 'created_at' | 'status'>, lines: Omit<JournalEntryLine, 'transaction_id' | 'id'>[] }) => {
      // 1. Validar Partida Doble
      const totalDebit = lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
      const totalCredit = lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);
      
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error("El asiento está descuadrado (Principio de Partida Doble). Los débitos deben ser iguales a los créditos.");
      }

      if (totalDebit === 0 && totalCredit === 0) {
        throw new Error("El asiento no puede tener valor cero.");
      }

      const txObj = {
        ...entry,
        id: `tx-${Date.now()}`,
        status: 'POSTED' as const,
        created_at: new Date().toISOString().split('T')[0],
        entry_number: entry.reference || `AS-${Date.now().toString().slice(-4)}`,
        totalDebit,
        totalCredit
      };

      try {
        const { data: transaction, error: headerError } = await supabase
          .from('accounting_transactions')
          .insert([{ ...entry, status: 'POSTED' }])
          .select()
          .single();

        if (!headerError && transaction) {
          const linesToInsert = lines.map(line => ({
            ...line,
            transaction_id: transaction.id
          }));

          await supabase.from('accounting_transaction_lines').insert(linesToInsert);
          
          const cur = getLocalEntries();
          setLocalEntries([txObj, ...cur]);
          return transaction;
        }
      } catch {}

      const cur = getLocalEntries();
      setLocalEntries([txObj, ...cur]);
      return txObj;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    }
  });
}
