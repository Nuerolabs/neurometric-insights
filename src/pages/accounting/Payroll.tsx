import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Users, Loader2 } from "lucide-react";
import { useEmployees, useCreateEmployee } from "@/hooks/accounting/useErp";
import { toast } from "sonner";

export default function Payroll() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [position, setPosition] = useState("");
  const [baseSalary, setBaseSalary] = useState("");
  const [hireDate, setHireDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: employees, isLoading, isError } = useEmployees();
  const createMutation = useCreateEmployee();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !documentId || !baseSalary || !hireDate) {
        toast.error("Por favor completa los campos obligatorios.");
        return;
    }
    try {
        await createMutation.mutateAsync({
            full_name: fullName,
            document_id: documentId,
            position,
            base_salary: parseFloat(baseSalary),
            hire_date: hireDate,
            is_active: true
        });
        toast.success("Empleado registrado exitosamente.");
        setIsDialogOpen(false);
        setFullName(""); setDocumentId(""); setPosition(""); setBaseSalary("");
    } catch (err: any) {
        toast.error("Error al registrar: " + err.message);
    }
  };

  const filteredEmployees = employees?.filter(e => 
    e.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.document_id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalNominaMensual = employees?.filter(e => e.is_active).reduce((sum, e) => sum + Number(e.base_salary), 0) || 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Nómina y RRHH</h1>
          <p className="text-sm text-slate-500">Gestión de empleados, sueldos base y liquidaciones.</p>
        </div>
        <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm" className="h-8 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-3.5 w-3.5 mr-2" />
                    Nuevo Empleado
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleCreate}>
                  <DialogHeader>
                    <DialogTitle>Registrar Empleado</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right text-xs">Nombre Comp.</Label>
                      <Input value={fullName} onChange={e=>setFullName(e.target.value)} className="col-span-3 h-8 text-sm" placeholder="Nombres y Apellidos" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right text-xs">Documento</Label>
                      <Input value={documentId} onChange={e=>setDocumentId(e.target.value)} className="col-span-3 h-8 text-sm" placeholder="CC / NIT" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right text-xs">Cargo</Label>
                      <Input value={position} onChange={e=>setPosition(e.target.value)} className="col-span-3 h-8 text-sm" placeholder="Ej: Analista" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right text-xs">Fecha Ingreso</Label>
                      <Input type="date" value={hireDate} onChange={e=>setHireDate(e.target.value)} className="col-span-3 h-8 text-sm" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right text-xs">Salario Base ($)</Label>
                      <Input type="number" step="0.01" value={baseSalary} onChange={e=>setBaseSalary(e.target.value)} className="col-span-3 h-8 text-sm" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit" size="sm" className="bg-blue-600 text-white" disabled={createMutation.isPending}>
                        {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Guardar
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card className="rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-[11px] font-bold uppercase text-slate-500">Costo de Nómina Mensual</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">${totalNominaMensual.toLocaleString('en-US', {minimumFractionDigits:2})}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-3 pt-4 px-6 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-200">Personal Activo</CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <Input type="search" placeholder="Buscar empleado..." className="h-8 w-64 pl-8 text-xs" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
             <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 text-blue-500 animate-spin" /></div>
          ) : filteredEmployees.length === 0 ? (
             <div className="flex flex-col items-center p-12 text-slate-500">
                 <Users className="h-10 w-10 mb-2 opacity-50" />
                 <p className="text-sm font-semibold">No hay empleados registrados</p>
             </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="text-xs h-9">Nombre</TableHead>
                  <TableHead className="text-xs h-9">Documento</TableHead>
                  <TableHead className="text-xs h-9">Cargo</TableHead>
                  <TableHead className="text-xs h-9">Fecha Ingreso</TableHead>
                  <TableHead className="text-right text-xs h-9">Salario Base</TableHead>
                  <TableHead className="text-center text-xs h-9">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="text-xs font-semibold">{emp.full_name}</TableCell>
                    <TableCell className="font-mono text-xs">{emp.document_id}</TableCell>
                    <TableCell className="text-xs text-slate-600">{emp.position}</TableCell>
                    <TableCell className="text-xs">{emp.hire_date}</TableCell>
                    <TableCell className="text-right text-xs font-bold">${Number(emp.base_salary).toLocaleString('en-US',{minimumFractionDigits:2})}</TableCell>
                    <TableCell className="text-center">
                        {emp.is_active ? <Badge className="bg-emerald-100 text-emerald-800 border-none">Activo</Badge> : <Badge variant="outline">Inactivo</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
