import { useState } from 'react';
import { VentasLayout } from '@/components/ventas/VentasLayout';
import { useVentas } from '@/context/VentasContext';
import { PlusCircle, Trash2, Receipt } from 'lucide-react';
import { toast } from 'sonner';

function formatCOP(value: number) {
  return `$${value.toLocaleString('es-CO')}`;
}

const CATEGORIAS_GASTO = [
  'Insumos (Papel, Tinta, etc.)',
  'Mantenimiento / Reparación',
  'Servicios (Luz, Internet)',
  'Alimentación / Viáticos',
  'Otros'
];

export default function GastosVentas() {
  const { gastos, agregarGasto, eliminarGasto } = useVentas();
  
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState<number | ''>('');
  const [categoria, setCategoria] = useState(CATEGORIAS_GASTO[0]);
  const [tipoFondo, setTipoFondo] = useState<'empresa' | 'familia'>('empresa');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim() || typeof monto !== 'number' || monto <= 0) {
      toast.error('Por favor completa todos los campos correctamente.');
      return;
    }

    agregarGasto({
      descripcion: descripcion.trim(),
      monto,
      categoria,
      tipoFondo
    });

    toast.success('Gasto registrado con éxito');
    setDescripcion('');
    setMonto('');
    setCategoria(CATEGORIAS_GASTO[0]);
    setTipoFondo('empresa');
  };

  return (
    <VentasLayout>
      <div className="pt-page">
        <div className="pt-page-header">
          <div>
            <h1 className="pt-page-title">Registro de Gastos</h1>
            <p className="pt-page-desc">Registra y controla los gastos operativos del negocio</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Formulario */}
          <div className="md:col-span-1">
            <div className="pt-card">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Receipt size={20} className="text-blue-600" />
                Nuevo Gasto
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Descripción</label>
                  <input
                    type="text"
                    required
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Ej. Resma de papel carta"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Monto ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ej. 18000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Categoría</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIAS_GASTO.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-sm font-medium text-slate-700 block">Este gasto sale del dinero de:</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input 
                        type="radio" 
                        name="fondo" 
                        checked={tipoFondo === 'empresa'} 
                        onChange={() => setTipoFondo('empresa')} 
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className={tipoFondo === 'empresa' ? 'font-semibold text-slate-900' : 'text-slate-600'}>Empresa</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input 
                        type="radio" 
                        name="fondo" 
                        checked={tipoFondo === 'familia'} 
                        onChange={() => setTipoFondo('familia')}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <span className={tipoFondo === 'familia' ? 'font-semibold text-slate-900' : 'text-slate-600'}>Familia</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  <PlusCircle size={16} />
                  Registrar Gasto
                </button>
              </form>
            </div>
          </div>

          {/* Historial de Gastos */}
          <div className="md:col-span-2">
            <div className="pt-card">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Historial de Gastos</h2>
              
              {gastos.length === 0 ? (
                <div className="text-center py-12 px-4 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Receipt size={32} className="mx-auto mb-3 text-slate-400 opacity-50" />
                  <p>No se han registrado gastos aún.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-medium">Fecha</th>
                        <th className="px-4 py-3 font-medium">Descripción</th>
                        <th className="px-4 py-3 font-medium">Fondo</th>
                        <th className="px-4 py-3 font-medium">Categoría</th>
                        <th className="px-4 py-3 font-medium text-right">Monto</th>
                        <th className="px-4 py-3 font-medium text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {gastos.map((gasto) => (
                        <tr key={gasto.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 text-slate-600">
                            {new Date(gasto.fecha).toLocaleDateString('es-CO')}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {gasto.descripcion}
                          </td>
                          <td className="px-4 py-3">
                            {gasto.tipoFondo === 'empresa' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">Empresa</span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">Familia</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                              {gasto.categoria}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900 text-right">
                            {formatCOP(gasto.monto)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => {
                                if(confirm('¿Estás seguro de eliminar este gasto?')) {
                                  eliminarGasto(gasto.id);
                                  toast.success('Gasto eliminado');
                                }
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors inline-flex"
                              title="Eliminar gasto"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </VentasLayout>
  );
}
