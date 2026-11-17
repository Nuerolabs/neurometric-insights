import React, { useState } from 'react';
import { ContabilidadLayout } from '@/components/contabilidad/ContabilidadLayout';
import { ThirdParty, DocumentType, TaxRegime } from '@/services/contabilidad/types';
import { calculateDianDV } from '@/services/contabilidad/validationService';
import {
  Users2,
  Plus,
  Search,
  CheckCircle2,
  Building,
  Mail,
  Phone,
  MapPin,
  FileCheck,
} from 'lucide-react';

const SEED_THIRD_PARTIES: ThirdParty[] = [
  {
    id: 'tp-1',
    document_type: 'NIT',
    document_number: '901847291',
    verification_digit: 4,
    legal_name: 'NeuroLabs Tech Solutions S.A.S.',
    commercial_name: 'NeuroLabs AI',
    party_types: ['CLIENTE', 'SOCIO'],
    tax_regime: 'RESPONSABLE_IVA',
    fiscal_responsibilities: ['O-13', 'O-15', 'O-47'],
    municipality_code: '47745', // Sitionuevo / Barranquilla
    department_code: '47',
    email_billing: 'facturacion@neurolabs.com.co',
    phone: '+57 300 000 0000',
    address: 'Barranquilla / Magdalena, Colombia',
    is_active: true,
  },
  {
    id: 'tp-2',
    document_type: 'NIT',
    document_number: '800197268',
    verification_digit: 4,
    legal_name: 'Dirección de Impuestos y Aduanas Nacionales (DIAN)',
    commercial_name: 'DIAN',
    party_types: ['ENTIDAD_OFICIAL'],
    tax_regime: 'NO_RESPONSABLE_IVA',
    fiscal_responsibilities: ['R-99-PN'],
    municipality_code: '11001',
    department_code: '11',
    email_billing: 'notificaciones@dian.gov.co',
    address: 'Bogotá D.C., Colombia',
    is_active: true,
  },
  {
    id: 'tp-3',
    document_type: 'ID_EXTRANJERO',
    document_number: 'US-98314567',
    legal_name: 'OpenAI LLC',
    commercial_name: 'OpenAI API Services',
    party_types: ['PROVEEDOR'],
    tax_regime: 'NO_RESPONSABLE_IVA',
    fiscal_responsibilities: ['R-99-PN'],
    municipality_code: '00000',
    department_code: '00',
    email_billing: 'billing@openai.com',
    address: '3180 18th St, San Francisco, CA 94110, USA',
    is_active: true,
  },
];

export default function TercerosPage() {
  const [thirdParties, setThirdParties] = useState<ThirdParty[]>(SEED_THIRD_PARTIES);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [docType, setDocType] = useState<DocumentType>('NIT');
  const [docNumber, setDocNumber] = useState('');
  const [legalName, setLegalName] = useState('');
  const [commercialName, setCommercialName] = useState('');
  const [taxRegime, setTaxRegime] = useState<TaxRegime>('RESPONSABLE_IVA');
  const [municipalityCode, setMunicipalityCode] = useState('08001'); // Barranquilla
  const [departmentCode, setDepartmentCode] = useState('08');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Live DV calculation
  const computedDV = docType === 'NIT' ? calculateDianDV(docNumber) : null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber || !legalName || !email) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    const newTp: ThirdParty = {
      id: `tp-${Date.now()}`,
      document_type: docType,
      document_number: docNumber.trim(),
      verification_digit: computedDV !== null ? computedDV : undefined,
      legal_name: legalName.trim(),
      commercial_name: commercialName.trim() || undefined,
      party_types: ['PROVEEDOR'],
      tax_regime: taxRegime,
      fiscal_responsibilities: ['O-13', 'R-99-PN'],
      municipality_code: municipalityCode,
      department_code: departmentCode,
      email_billing: email.trim(),
      address: address.trim(),
      is_active: true,
    };

    setThirdParties([newTp, ...thirdParties]);
    setShowModal(false);
    setDocNumber('');
    setLegalName('');
    setEmail('');
    setAddress('');
  };

  const filtered = thirdParties.filter(
    (tp) =>
      tp.legal_name.toLowerCase().includes(search.toLowerCase()) ||
      tp.document_number.includes(search)
  );

  return (
    <ContabilidadLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <Users2 className="w-6 h-6 text-slate-900" />
              Directorio Centralizado de Terceros
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Clientes, proveedores, socios y entidades oficiales con cálculo automático del Dígito de Verificación (DV).
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-950 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Tercero DIAN
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por razón social, nombre o número de documento / NIT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950"
          />
        </div>

        {/* Third Parties List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Documento / NIT</th>
                  <th className="py-3 px-4">Razón Social & Nombre Comercial</th>
                  <th className="py-3 px-4">Régimen & Responsabilidades</th>
                  <th className="py-3 px-4">Ubicación DANE</th>
                  <th className="py-3 px-4">Contacto Facturación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((tp) => (
                  <tr key={tp.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900">
                        {tp.document_type} {tp.document_number}
                        {tp.verification_digit !== undefined && (
                          <span className="text-slate-950 font-bold"> - {tp.verification_digit}</span>
                        )}
                      </span>
                      <p className="text-[10px] text-slate-400 uppercase mt-0.5">{tp.party_types.join(', ')}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{tp.legal_name}</p>
                      {tp.commercial_name && (
                        <p className="text-[11px] text-slate-500">{tp.commercial_name}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        {tp.tax_regime.replace(/_/g, ' ')}
                      </span>
                      <p className="text-[10px] font-mono text-slate-400 mt-1">
                        {tp.fiscal_responsibilities.join(' · ')}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <p className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        DANE: {tp.municipality_code}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">{tp.address}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <p className="flex items-center gap-1 font-mono text-[11px]">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {tp.email_billing}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Creación de Tercero */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-900" />
                  Registrar Tercero con Validación DIAN
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Tipo Doc.</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value as DocumentType)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="NIT">NIT</option>
                      <option value="CC">Cédula (CC)</option>
                      <option value="CE">Cédula Ext. (CE)</option>
                      <option value="ID_EXTRANJERO">ID Extranjero (USD)</option>
                      <option value="PASAPORTE">Pasaporte</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-slate-600 font-semibold mb-1">
                      Número {docType === 'NIT' && '(Sin puntos ni guiones)'}
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        required
                        placeholder="Ej: 901847291"
                        value={docNumber}
                        onChange={(e) => setDocNumber(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg font-mono"
                      />
                      {docType === 'NIT' && (
                        <div className="px-3 py-2 bg-slate-100 text-slate-950 font-mono font-bold rounded-lg border border-slate-300 flex items-center gap-1">
                          <span className="text-[10px] text-slate-400">DV:</span>
                          <span>{computedDV !== null ? computedDV : '—'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Razón Social Oficial</label>
                  <input
                    type="text"
                    required
                    placeholder="Razón Social registrada en RUT DIAN"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Régimen Tributario</label>
                    <select
                      value={taxRegime}
                      onChange={(e) => setTaxRegime(e.target.value as TaxRegime)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="RESPONSABLE_IVA">Responsable de IVA</option>
                      <option value="NO_RESPONSABLE_IVA">No Responsable de IVA</option>
                      <option value="REGIMEN_SIMPLE">Régimen Simple (RST)</option>
                      <option value="GRAN_CONTRIBUYENTE">Gran Contribuyente</option>
                      <option value="AUTORRETENEDOR">Autorretenedor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Código DANE Municipio</label>
                    <input
                      type="text"
                      placeholder="Ej: 08001 (Barranquilla)"
                      value={municipalityCode}
                      onChange={(e) => setMunicipalityCode(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Correo Facturación Electrónica</label>
                  <input
                    type="email"
                    required
                    placeholder="facturacion@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Dirección Fiscal</label>
                  <input
                    type="text"
                    required
                    placeholder="Dirección registrada en el RUT"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                  >
                    Guardar Tercero DIAN
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ContabilidadLayout>
  );
}
