import React, { useState } from 'react';
import {
  FolderArchive,
  FileText,
  FileCheck2,
  Users,
  Building2,
  Download,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DocumentRecord {
  id: string;
  code: string;
  title: string;
  category: 'RRHH_CERTIFICADOS' | 'RRHH_CONTRATOS' | 'ACTAS_SOCIOS' | 'LEGAL_CAMARA_RUT' | 'SEGURIDAD_SOCIAL';
  holderName: string; // Nombre de empleado, socio o entidad
  documentId?: string;
  issueDate: string;
  expirationDate?: string;
  status: 'VIGENTE' | 'POR_RENOVAR' | 'VENCIDO' | 'CUSTODIADO';
  fileSize: string;
}

const SEED_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'doc-1',
    code: 'ACT-2026-001',
    title: 'Acta de Asamblea General Extraordinaria de Socios N° 004',
    category: 'ACTAS_SOCIOS',
    holderName: 'Junta de Socios NeuroLabs Tech Solutions',
    issueDate: '2026-01-15',
    status: 'CUSTODIADO',
    fileSize: '1.4 MB (PDF Firmado)',
  },
  {
    id: 'doc-2',
    code: 'RUT-2026-DIAN',
    title: 'Registro Único Tributario (RUT) Actualizado 2026 - NIT 901847291-4',
    category: 'LEGAL_CAMARA_RUT',
    holderName: 'NeuroLabs Tech Solutions S.A.S.',
    issueDate: '2026-01-10',
    status: 'VIGENTE',
    fileSize: '820 KB (PDF)',
  },
  {
    id: 'doc-3',
    code: 'CAM-2026-BQL',
    title: 'Certificado de Existencia y Representación Legal (Cámara de Comercio)',
    category: 'LEGAL_CAMARA_RUT',
    holderName: 'Cámara de Comercio de Barranquilla',
    issueDate: '2026-11-01',
    expirationDate: '2026-12-01',
    status: 'POR_RENOVAR',
    fileSize: '650 KB (PDF Certificado)',
  },
  {
    id: 'doc-4',
    code: 'CL-2026-012',
    title: 'Certificado Laboral - Ing. Software & Arquitectura de IA',
    category: 'RRHH_CERTIFICADOS',
    holderName: 'Jesus David Cantillo Parejo',
    documentId: '1080022532',
    issueDate: '2026-11-16',
    status: 'VIGENTE',
    fileSize: '420 KB (PDF Generado)',
  },
  {
    id: 'doc-5',
    code: 'CON-2025-003',
    title: 'Contrato Individual de Trabajo a Término Indefinido',
    category: 'RRHH_CONTRATOS',
    holderName: 'Maria Angelica Dominguez',
    documentId: '1082938472',
    issueDate: '2025-02-01',
    status: 'VIGENTE',
    fileSize: '2.1 MB (PDF Firmado)',
  },
  {
    id: 'doc-6',
    code: 'PIL-2026-10',
    title: 'Planilla Integrada de Liquidación de Aportes (PILA) - Seguridad Social Octubre',
    category: 'SEGURIDAD_SOCIAL',
    holderName: 'Aportes en Línea / EPS Sura / Colfondos / ARL Positiva',
    issueDate: '2026-11-05',
    status: 'VIGENTE',
    fileSize: '950 KB (Soporte Bancario)',
  },
];

export default function GestionDocumentalPage() {
  const [activeTab, setActiveTab] = useState<'REPOSITORIO' | 'GENERADOR_LABORAL' | 'VENCIMIENTOS' | 'NUEVA_ACTA'>('REPOSITORIO');
  const [documents, setDocuments] = useState<DocumentRecord[]>(SEED_DOCUMENTS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('TODOS');

  // Estado del Generador de Certificado Laboral
  const [certEmployee, setCertEmployee] = useState('Jesús David Cantillo Parejo');
  const [certDocType, setCertDocType] = useState('Cédula de Ciudadanía');
  const [certDocNumber, setCertDocNumber] = useState('1.080.022.532');
  const [certDocExpedition, setCertDocExpedition] = useState('Sitionuevo (Magdalena)');
  const [certPosition, setCertPosition] = useState('Director General & Lead AI Architect');
  const [certContractType, setCertContractType] = useState('Término Indefinido');
  const [certStartDate, setCertStartDate] = useState('01 de Febrero de 2024');
  const [certSalary, setCertSalary] = useState('4.500.000');
  const [certAddressee, setCertAddressee] = useState('A QUIEN PUEDA INTERESAR');

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleSaveCertificate = () => {
    const newDoc: DocumentRecord = {
      id: `doc-${Date.now()}`,
      code: `CL-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: `Certificado Laboral - ${certPosition}`,
      category: 'RRHH_CERTIFICADOS',
      holderName: certEmployee,
      documentId: certDocNumber,
      issueDate: new Date().toISOString().split('T')[0],
      status: 'VIGENTE',
      fileSize: 'PDF Generado',
    };
    setDocuments([newDoc, ...documents]);
    alert('¡Certificado registrado en el archivo documental!');
    setActiveTab('REPOSITORIO');
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.holderName.toLowerCase().includes(search.toLowerCase()) ||
      doc.code.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === 'TODOS' || doc.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col">
      {/* Standalone Header Bar */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm shadow-blue-500/20">
            <FolderArchive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm tracking-tight text-slate-900">NeuroLabs SGD</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Sistema de Gestión Documental
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Área Administrativa, Legal & Talento Humano (RRHH)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/contabilidad"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ir a</span> ERP Contable
          </Link>
          <Link
            to="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-2 py-1.5"
          >
            Inicio
          </Link>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <FolderArchive className="w-6 h-6 text-blue-600" />
            Gestión Documental, Trámites & RRHH
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Custodia institucional de actas de asamblea, contratos, certificados laborales y archivo corporativo de NeuroLabs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('GENERADOR_LABORAL')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generar Certificado Laboral
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('REPOSITORIO')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'REPOSITORIO'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Archivo Central ({documents.length})
        </button>
        <button
          onClick={() => setActiveTab('GENERADOR_LABORAL')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'GENERADOR_LABORAL'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          Generador de Certificados RRHH
        </button>
        <button
          onClick={() => setActiveTab('VENCIMIENTOS')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'VENCIMIENTOS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Control de Vigencias & Renovaciones
        </button>
      </div>

      {/* ── TAB 1: REPOSITORIO CENTRAL ── */}
      {activeTab === 'REPOSITORIO' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar por código (ej. ACT-2026), título o titular..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-700"
            >
              <option value="TODOS">Todas las Áreas</option>
              <option value="ACTAS_SOCIOS">Actas de Socios & Asamblea</option>
              <option value="RRHH_CERTIFICADOS">Certificados Laborales (RRHH)</option>
              <option value="RRHH_CONTRATOS">Contratos Laborales</option>
              <option value="LEGAL_CAMARA_RUT">RUT & Cámara de Comercio</option>
              <option value="SEGURIDAD_SOCIAL">Seguridad Social & PILA</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Código / Radicado</th>
                    <th className="py-3 px-4">Título del Documento</th>
                    <th className="py-3 px-4">Titular / Dependencia</th>
                    <th className="py-3 px-4">Expedición</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {doc.code}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">{doc.fileSize}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{doc.title}</p>
                        <span className="inline-block text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5 font-medium">
                          {doc.category.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800">{doc.holderName}</p>
                        {doc.documentId && (
                          <p className="text-[10px] text-slate-400 font-mono">CC: {doc.documentId}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {doc.issueDate}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            doc.status === 'VIGENTE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : doc.status === 'POR_RENOVAR'
                              ? 'bg-amber-100 text-amber-800'
                              : doc.status === 'CUSTODIADO'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {doc.status === 'POR_RENOVAR' && <AlertTriangle className="w-3 h-3" />}
                          {doc.status === 'VIGENTE' && <CheckCircle2 className="w-3 h-3" />}
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => alert(`Descargando documento ${doc.code}...`)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Descargar o Ver Documento"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: GENERADOR DE CERTIFICADOS LABORALES RRHH ── */}
      {activeTab === 'GENERADOR_LABORAL' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Side */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              Parámetros del Certificado Laboral
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nombre Completo del Colaborador</label>
                <input
                  type="text"
                  value={certEmployee}
                  onChange={(e) => setCertEmployee(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Tipo Documento</label>
                  <select
                    value={certDocType}
                    onChange={(e) => setCertDocType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Cédula de Ciudadanía">Cédula (C.C.)</option>
                    <option value="Cédula de Extranjería">Cédula Ext. (C.E.)</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Número de Documento</label>
                  <input
                    type="text"
                    value={certDocNumber}
                    onChange={(e) => setCertDocNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Lugar de Expedición</label>
                  <input
                    type="text"
                    value={certDocExpedition}
                    onChange={(e) => setCertDocExpedition(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Fecha de Ingreso</label>
                  <input
                    type="text"
                    value={certStartDate}
                    onChange={(e) => setCertStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Cargo Desempeñado</label>
                <input
                  type="text"
                  value={certPosition}
                  onChange={(e) => setCertPosition(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Tipo de Contrato</label>
                  <select
                    value={certContractType}
                    onChange={(e) => setCertContractType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Término Indefinido">Término Indefinido</option>
                    <option value="Término Fijo">Término Fijo</option>
                    <option value="Prestación de Servicios">Prestación de Servicios</option>
                    <option value="Obra o Labor">Obra o Labor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Salario Básico (COP)</label>
                  <input
                    type="text"
                    value={certSalary}
                    onChange={(e) => setCertSalary(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Destinatario de la Carta</label>
                <input
                  type="text"
                  value={certAddressee}
                  onChange={(e) => setCertAddressee(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg uppercase"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handlePrintCertificate}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir / PDF
                </button>
                <button
                  type="button"
                  onClick={handleSaveCertificate}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Guardar en Archivo
                </button>
              </div>
            </div>
          </div>

          {/* Document Preview (A4 Paper Styling) */}
          <div className="lg:col-span-7 bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-md text-slate-900 font-serif space-y-6 leading-relaxed relative print:m-0 print:border-none print:shadow-none">
            {/* Watermark / Header */}
            <div className="flex items-center justify-between border-b-2 border-blue-600 pb-4">
              <div>
                <h3 className="font-sans text-lg font-extrabold tracking-tight text-blue-900 uppercase">
                  NeuroLabs Tech Solutions S.A.S.
                </h3>
                <p className="font-sans text-xs text-slate-600">NIT: 901.847.291 - 4 | Barranquilla - Colombia</p>
                <p className="font-sans text-[11px] text-slate-500">Gestión de Talento Humano & Área Administrativa</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-sans font-black text-xl">
                NL
              </div>
            </div>

            <div className="text-center pt-4">
              <h4 className="font-sans text-sm font-bold uppercase tracking-widest text-slate-800">
                El Departamento de Gestión Humana
              </h4>
              <p className="font-sans text-xs font-semibold uppercase text-slate-500 mt-0.5">
                Certifica:
              </p>
            </div>

            <div className="text-justify text-xs md:text-sm text-slate-800 space-y-4 pt-2">
              <p>
                Que el (la) señor(a) <strong className="font-sans font-bold text-slate-900 uppercase">{certEmployee}</strong>, 
                identificado(a) con {certDocType} número <strong className="font-mono font-bold text-slate-900">{certDocNumber}</strong> expedida en {certDocExpedition}, 
                labora para nuestra compañía desde el día <strong className="font-sans font-bold">{certStartDate}</strong>, mediante un contrato de trabajo a <strong className="font-sans font-bold">{certContractType}</strong>, 
                desempeñando a la fecha el cargo de <strong className="font-sans font-bold uppercase">{certPosition}</strong>.
              </p>

              <p>
                Para el cumplimiento de sus funciones, devenga una asignación básica mensual de:
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center font-sans font-bold text-slate-900 text-sm">
                ${certSalary} PESOS MONEDA CORRIENTE (COP)
              </div>

              <p className="pt-2">
                La presente constancia se expide a solicitud del interesado con destino a <strong className="font-sans font-bold">{certAddressee}</strong>, a los {new Date().getDate()} días del mes de Noviembre del año 2026.
              </p>
            </div>

            {/* Signature Area */}
            <div className="pt-12 border-t border-slate-100 flex items-end justify-between">
              <div>
                <div className="w-48 border-b-2 border-slate-800 pb-1 mb-2">
                  <p className="font-sans font-bold text-xs uppercase tracking-tight text-blue-900">
                    Jesús D. Cantillo Parejo
                  </p>
                </div>
                <p className="font-sans text-xs font-bold text-slate-900">JESÚS DAVID CANTILLO PAREJO</p>
                <p className="font-sans text-[11px] text-slate-600">Representante Legal & CEO</p>
                <p className="font-sans text-[10px] text-slate-400">NeuroLabs Tech Solutions S.A.S.</p>
                <p className="font-sans text-[10px] text-slate-400">contacto@neurolabs.com.co</p>
              </div>

              {/* QR Code Verification badge */}
              <div className="text-right font-sans">
                <div className="w-16 h-16 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-[9px] text-slate-400 p-1 text-center ml-auto">
                  Sello Digital Seguro
                </div>
                <p className="text-[9px] font-mono text-slate-400 mt-1">Validador: NL-RH-2026</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: CONTROL DE VENCIMIENTOS Y VIGENCIAS ── */}
      {activeTab === 'VENCIMIENTOS' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-900">
              <span className="font-bold">Semáforo de Vigencias Legales y Trámites</span>
              <p className="mt-0.5 text-amber-700">
                Monitorea documentos con fecha de caducidad jurídica o comercial (ej. Certificados de Cámara de Comercio con más de 30 días, vigencia de pólizas o renovaciones contractuales).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Cámara de Comercio (Existencia Legal)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  Caduca en 14 días
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Fecha de expedición: 01/11/2026. Los bancos y entidades DIAN exigen certificado no mayor a 30 días de expedición.
              </p>
              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono">CAM-2026-BQL</span>
                <button
                  onClick={() => alert('Generando enlace a Cámara de Comercio...')}
                  className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                >
                  Tramitar Renovación &rarr;
                </button>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">RUT DIAN (Registro Único Tributario)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Vigencia Indefinida
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Estado: Actualizado con responsabilidades O-13, O-15 y actividades de desarrollo de software e IA.
              </p>
              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono">RUT-2026-DIAN</span>
                <span className="text-emerald-600 font-semibold">✓ Verificado DIAN</span>
              </div>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
