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

export function useJournalEntries() {
  return useQuery({
    queryKey: ['journal-entries'],
    queryFn: async () => {
      // Usamos inner join para traer las cabeceras y sus totales (suma de débitos/créditos)
      const { data, error } = await supabase
        .from('accounting_transactions')
        .select(`
          id, date, reference, description, status, created_at,
          accounting_transaction_lines ( debit, credit )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      // Calculamos los totales para cada asiento basado en sus líneas
      return data.map(entry => {
        const totalDebit = entry.accounting_transaction_lines.reduce((sum: number, line: any) => sum + Number(line.debit), 0);
        const totalCredit = entry.accounting_transaction_lines.reduce((sum: number, line: any) => sum + Number(line.credit), 0);
        return {
          ...entry,
          totalDebit,
          totalCredit
        };
      });
    }
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entry, lines }: { entry: Omit<JournalEntry, 'id' | 'created_at' | 'status'>, lines: Omit<JournalEntryLine, 'transaction_id' | 'id'>[] }) => {
      // 1. Validar Partida Doble
      const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
      const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);
      
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error("El asiento está descuadrado (Principio de Partida Doble). Los débitos deben ser iguales a los créditos.");
      }

      if (totalDebit === 0 && totalCredit === 0) {
        throw new Error("El asiento no puede tener valor cero.");
      }

      // 2. Insertar Cabecera (Transacción)
      const { data: transaction, error: headerError } = await supabase
        .from('accounting_transactions')
        .insert([{ ...entry, status: 'POSTED' }])
        .select()
        .single();

      if (headerError) throw new Error(headerError.message);

      // 3. Insertar Líneas vinculadas a la cabecera
      const linesToInsert = lines.map(line => ({
        ...line,
        transaction_id: transaction.id
      }));

      const { error: linesError } = await supabase
        .from('accounting_transaction_lines')
        .insert(linesToInsert);

      if (linesError) {
        // En un caso real usaríamos RPC (Stored Procedures) para transacciones atómicas,
        // pero por ahora borramos la cabecera si fallan las líneas (compensación).
        await supabase.from('accounting_transactions').delete().eq('id', transaction.id);
        throw new Error(linesError.message);
      }

      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    }
  });
}
