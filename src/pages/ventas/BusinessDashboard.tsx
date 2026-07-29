import React from 'react';
import { useVentas, VentasProvider, Venta, Gasto } from '../../context/VentasContext';
import { VentasLayout } from '../../components/ventas/VentasLayout';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Briefcase, Building, Wallet, Settings } from 'lucide-react';
import ProyeccionResma from '../../components/ventas/ProyeccionResma';

export default function BusinessDashboard() {
  const { 
    ventas, 
    gastos, 
    porcentajeEmpresa, setPorcentajeEmpresa,
    porcentajeInsumos, setPorcentajeInsumos,
    porcentajeAdmin, setPorcentajeAdmin,
    diezmoHabilitado, setDiezmoHabilitado
  } = useVentas();

  // Filtrar ingresos
  const ventasImpresora = ventas.filter(v => 
    ['impresion_bn', 'impresion_color', 'copia', 'copia_cantidad', 'escaneado'].includes(v.tipo) && v.estadoPago === 'pagado'
  );
  
  const ventasPersonales = ventas.filter(v => 
    ['encuadernado', 'trabajo_especial', 'otro'].includes(v.tipo) && v.estadoPago === 'pagado'
  );

  const totalImpresora = ventasImpresora.reduce((sum, v) => sum + v.total, 0);
  const totalPersonal = ventasPersonales.reduce((sum, v) => sum + v.total, 0);

  // Filtrar gastos
  const gastosImpresora = gastos.filter(g => g.tipoFondo === 'empresa');
  const gastosPersonales = gastos.filter(g => g.tipoFondo === 'familia');
  
  const totalGastosImpresora = gastosImpresora.reduce((sum, g) => sum + g.monto, 0);
  const totalGastosPersonales = gastosPersonales.reduce((sum, g) => sum + g.monto, 0);

  // Cálculos de Impresora
  const diezmoImpresora = diezmoHabilitado ? totalImpresora * 0.10 : 0;
  const baseImpresora = totalImpresora - diezmoImpresora;
  
  const fondoInsumos = baseImpresora * (porcentajeInsumos / 100);
  const gananciaSocios = baseImpresora * (porcentajeEmpresa / 100);
  const gananciaAdmin = baseImpresora * (porcentajeAdmin / 100);

  // Cálculos Personales
  const diezmoPersonal = diezmoHabilitado ? totalPersonal * 0.10 : 0;
  const basePersonal = totalPersonal - diezmoPersonal;
  const utilidadNetaPersonal = basePersonal - totalGastosPersonales + gananciaAdmin;

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#6366f1'];

  const chartDataImpresora = [
    { name: 'Diezmo (10%)', value: diezmoImpresora, color: '#f59e0b' },
    { name: 'Fondo Insumos', value: fondoInsumos, color: '#6366f1' },
    { name: 'Empresa (Socios)', value: gananciaSocios, color: '#2563eb' },
    { name: 'Ganancia Admin', value: gananciaAdmin, color: '#10b981' }
  ].filter(d => d.value > 0);

  return (
    <VentasLayout>
      <div className="pt-content">
        <div className="pt-header">
          <div>
            <h2>Business & Finanzas</h2>
              <p>Desglose contable: Negocio Impresora vs Finanzas Personales</p>
            </div>
          </div>

          {/* Configuración de Porcentajes */}
          <div className="pt-card" style={{ marginBottom: '20px' }}>
            <div className="pt-card-header">
              <Settings className="pt-card-icon" />
              <h3>Configuración de Distribución (Impresora)</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '15px' }}>
              <div className="pt-form-group">
                <label>Fondo Insumos (%)</label>
                <input type="number" className="pt-input" value={porcentajeInsumos} onChange={(e) => setPorcentajeInsumos(Number(e.target.value))} />
              </div>
              <div className="pt-form-group">
                <label>Socios Empresa (%)</label>
                <input type="number" className="pt-input" value={porcentajeEmpresa} onChange={(e) => setPorcentajeEmpresa(Number(e.target.value))} />
              </div>
              <div className="pt-form-group">
                <label>Administrador (%)</label>
                <input type="number" className="pt-input" value={porcentajeAdmin} onChange={(e) => setPorcentajeAdmin(Number(e.target.value))} />
              </div>
              <div className="pt-form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" checked={diezmoHabilitado} onChange={(e) => setDiezmoHabilitado(e.target.checked)} style={{ width: '20px', height: '20px' }} />
                <label style={{ margin: 0 }}>Extraer 10% Diezmo automáticamente</label>
              </div>
            </div>
            {porcentajeInsumos + porcentajeEmpresa + porcentajeAdmin !== 100 && (
              <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '10px' }}>
                Advertencia: Los porcentajes deben sumar 100%. (Suma actual: {porcentajeInsumos + porcentajeEmpresa + porcentajeAdmin}%)
              </p>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Columna Izquierda: Impresora */}
            <div className="pt-card" style={{ borderTop: '4px solid #2563eb' }}>
              <div className="pt-card-header">
                <Building className="pt-card-icon" style={{ color: '#2563eb' }} />
                <h3>Negocio Impresora (Socios)</h3>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '1.1rem', color: '#475569' }}>Ingreso Bruto:</span>
                <strong style={{ fontSize: '1.5rem', color: '#0f172a' }}>{formatMoney(totalImpresora)}</strong>
              </div>

              {chartDataImpresora.length > 0 && (
                <div style={{ height: '200px', marginBottom: '20px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartDataImpresora} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                        {chartDataImpresora.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatMoney(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {diezmoHabilitado && (
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#fef3c7', borderRadius: '6px' }}>
                    <span style={{ color: '#d97706', fontWeight: 'bold' }}>Diezmo (10%)</span>
                    <span style={{ color: '#d97706', fontWeight: 'bold' }}>{formatMoney(diezmoImpresora)}</span>
                  </li>
                )}
                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f1f5f9', borderRadius: '6px' }}>
                  <span>Fondo Insumos ({porcentajeInsumos}%)</span>
                  <strong>{formatMoney(fondoInsumos)}</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f1f5f9', borderRadius: '6px' }}>
                  <span>Ganancia Empresa ({porcentajeEmpresa}%)</span>
                  <strong>{formatMoney(gananciaSocios)}</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#ecfdf5', borderRadius: '6px' }}>
                  <span style={{ color: '#059669', fontWeight: 'bold' }}>Tu Ganancia Admin ({porcentajeAdmin}%)</span>
                  <strong style={{ color: '#059669' }}>+{formatMoney(gananciaAdmin)}</strong>
                </li>
              </ul>
              
              <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#ef4444' }}>Gastos reportados en Insumos:</span>
                  <strong style={{ color: '#ef4444' }}>-{formatMoney(totalGastosImpresora)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <span style={{ color: '#475569' }}>Balance Fondo Insumos:</span>
                  <strong style={{ color: fondoInsumos - totalGastosImpresora >= 0 ? '#10b981' : '#ef4444' }}>
                    {formatMoney(fondoInsumos - totalGastosImpresora)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Personal */}
            <div className="pt-card" style={{ borderTop: '4px solid #10b981' }}>
              <div className="pt-card-header">
                <Briefcase className="pt-card-icon" style={{ color: '#10b981' }} />
                <h3>Finanzas Personales</h3>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '1.1rem', color: '#475569' }}>Ingreso Bruto (Trabajos/Otros):</span>
                <strong style={{ fontSize: '1.5rem', color: '#0f172a' }}>{formatMoney(totalPersonal)}</strong>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {diezmoHabilitado && (
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#fef3c7', borderRadius: '6px' }}>
                    <span style={{ color: '#d97706', fontWeight: 'bold' }}>Diezmo Personal (10%)</span>
                    <span style={{ color: '#d97706', fontWeight: 'bold' }}>{formatMoney(diezmoPersonal)}</span>
                  </li>
                )}
                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#ecfdf5', borderRadius: '6px' }}>
                  <span style={{ color: '#059669', fontWeight: 'bold' }}>Sueldo Admin Impresora</span>
                  <strong style={{ color: '#059669' }}>+{formatMoney(gananciaAdmin)}</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#fef2f2', borderRadius: '6px' }}>
                  <span style={{ color: '#ef4444' }}>Gastos Familiares/Personales</span>
                  <strong style={{ color: '#ef4444' }}>-{formatMoney(totalGastosPersonales)}</strong>
                </li>
              </ul>

              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b', marginBottom: '5px' }}>Utilidad Neta Libre (Para ti)</p>
                <p style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 'bold', color: utilidadNetaPersonal >= 0 ? '#10b981' : '#ef4444' }}>
                  {formatMoney(utilidadNetaPersonal)}
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <ProyeccionResma />
          </div>

        </div>
    </VentasLayout>
  );
}
