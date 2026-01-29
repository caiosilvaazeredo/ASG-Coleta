import React, { useState, useMemo } from 'react';
import { GRIIndicator, ImpactProject, GRIResponse, Institution } from '../types';
import { MOCK_INDICATORS, MOCK_PROJECTS, ODS_DATA } from '../constants';
import { 
    Table, FileSpreadsheet, FileText, Filter, Download, Search, 
    ChevronDown, LayoutGrid, List, CheckCircle2, AlertCircle, 
    Clock, PieChart, BarChart3, ArrowUpRight, X, Printer, Share2,
    Calendar, AlertTriangle, Sparkles, Globe, Target
} from 'lucide-react';

// Mocking response data locally for visualization purposes (in a real app, this would come from props/context)
const MOCK_RESPONSES_SNAPSHOT: Record<string, Partial<GRIResponse>> = {
    '302-1': { status: 'SUBMITTED', value: '12500 kWh', lastUpdated: '2024-10-15', assignedUserId: 'r1' },
    '401-1': { status: 'APPROVED', value: '45 contratações', lastUpdated: '2024-10-12', assignedUserId: 'r2' },
    '305-1': { status: 'GAP_OPEN', gapType: 'NEVER_MEASURED', lastUpdated: '2024-10-18' },
    'ETHOS-1': { status: 'DRAFT', lastUpdated: '2024-10-20', assignedUserId: 'r3' },
    '205-2': { status: 'SUBMITTED', value: '100% treinados', lastUpdated: '2024-10-10' }
};

interface ResultsCenterProps {
    institution: Institution;
}

const ResultsCenter: React.FC<ResultsCenterProps> = ({ institution }) => {
    // Tabs now explicitly separate GRI and ETHOS
    const [activeTab, setActiveTab] = useState<'GRI' | 'ETHOS' | 'PROJECTS'>('GRI');
    const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    
    // New: Reference Date State (Defaults to Current Year)
    const [referenceDate, setReferenceDate] = useState<string>(new Date().getFullYear().toString());
    
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    
    // Export Modal State
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<'PDF' | 'EXCEL' | 'JSON'>('PDF');
    const [exportScope, setExportScope] = useState<'ALL' | 'FILTERED' | 'SELECTED'>('ALL');
    const [exportDetail, setExportDetail] = useState<'EXECUTIVE' | 'ANALYTICAL'>('ANALYTICAL');

    // --- Data Processing ---
    const processedIndicators = useMemo(() => {
        return MOCK_INDICATORS.map(ind => ({
            ...ind,
            response: MOCK_RESPONSES_SNAPSHOT[ind.code] || { status: 'PENDING' }
        })).filter(item => {
            // Framework Logic Separation
            const isEthos = item.framework === 'ETHOS';
            if (activeTab === 'GRI' && isEthos) return false;
            if (activeTab === 'ETHOS' && !isEthos) return false;

            const matchesSearch = item.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  item.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'ALL' || (item.response.status || 'PENDING') === filterStatus;
            
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, filterStatus, activeTab]);

    const processedProjects = useMemo(() => {
        return MOCK_PROJECTS.filter(proj => {
            const matchesSearch = proj.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'ALL' || proj.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, filterStatus]);

    // --- Handlers ---
    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleSelectAll = () => {
        if (selectedIds.size > 0) {
            setSelectedIds(new Set());
        } else {
            const ids = activeTab !== 'PROJECTS' 
                ? processedIndicators.map(i => i.code) 
                : processedProjects.map(p => p.id);
            setSelectedIds(new Set(ids));
        }
    };

    const handleMarkAsGap = (id: string) => {
        // Simulation of "Declarar Indisponibilidade" logic
        const reason = prompt("Justificativa para indisponibilidade do dado (Este dado é da minha área, mas não está disponível):");
        if (reason) {
            alert(`O indicador ${id} foi marcado como GAP (Indisponível). Justificativa salva: "${reason}"`);
            // In a real app, this would update the state/backend
        }
    };

    const handleExport = () => {
        alert(`Exportando Relatório ${activeTab}\nPeríodo: ${referenceDate}\nFormato: ${exportFormat}\nEscopo: ${exportScope}\nDetalhe: ${exportDetail}\n\nArquivo gerado com sucesso!`);
        setIsExportModalOpen(false);
    };

    // --- Render Helpers ---
    const getStatusBadge = (status?: string) => {
        switch(status) {
            case 'APPROVED': return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full border border-green-200 flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3"/> Aprovado</span>;
            case 'SUBMITTED': return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full border border-blue-200 flex items-center gap-1 w-fit"><Clock className="w-3 h-3"/> Em Validação</span>;
            case 'GAP_OPEN': return <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full border border-purple-200 flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3"/> Gap Declarado</span>;
            case 'DRAFT': return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-full border border-gray-200 flex items-center gap-1 w-fit"><List className="w-3 h-3"/> Em Andamento</span>;
            default: return <span className="px-2 py-1 bg-gray-50 text-gray-400 text-xs font-bold rounded-full border border-gray-200 flex items-center gap-1 w-fit"><div className="w-2 h-2 rounded-full bg-gray-300"></div> Pendente</span>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Resultados & Exportação</h2>
                    <p className="text-gray-500 text-sm mt-1">Central de consolidação de dados para relatórios de sustentabilidade.</p>
                </div>
                
                {/* Date Reference Control (Requirement: Default Year, Customizable Month) */}
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Período de Referência</label>
                        <input 
                            type="text" 
                            className="bg-transparent border-none p-0 text-sm font-bold text-gray-800 focus:ring-0 w-32 placeholder-gray-400"
                            value={referenceDate}
                            onChange={(e) => setReferenceDate(e.target.value)}
                            placeholder="Ex: 2024 ou 2024-03"
                        />
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-4 justify-between items-center sticky top-0 z-10">
                {/* 3 Distinct Tabs as requested */}
                <div className="flex items-center gap-2 w-full lg:w-auto bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('GRI')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'GRI' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Globe className="w-4 h-4" /> GRI Standards
                    </button>
                    <button 
                        onClick={() => setActiveTab('ETHOS')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'ETHOS' ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Sparkles className="w-4 h-4" /> Ethos
                    </button>
                    <button 
                        onClick={() => setActiveTab('PROJECTS')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'PROJECTS' ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Target className="w-4 h-4" /> Projetos
                    </button>
                </div>

                <div className="flex flex-1 w-full gap-2 items-center justify-end">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder={activeTab === 'PROJECTS' ? "Buscar projeto..." : "Buscar indicador..."}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="relative group">
                        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 flex items-center gap-2 text-sm">
                            <Filter className="w-4 h-4" /> <span className="hidden sm:inline">Filtros</span>
                        </button>
                        {/* Dropdown Filters */}
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 hidden group-hover:block p-3 space-y-3 z-20">
                            <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">Status</label>
                                <select 
                                    className="w-full border rounded text-sm p-1"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="ALL">Todos</option>
                                    <option value="APPROVED">Aprovados</option>
                                    <option value="SUBMITTED">Em Validação</option>
                                    <option value="PENDING">Pendentes</option>
                                    <option value="GAP_OPEN">Gaps</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="h-6 w-px bg-gray-300 mx-2"></div>

                    <button 
                        onClick={() => setIsExportModalOpen(true)}
                        className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-700 shadow-md transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
                {activeTab !== 'PROJECTS' ? (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="p-4 w-12 text-center">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-gray-300"
                                        checked={selectedIds.size === processedIndicators.length && processedIndicators.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="p-4 w-24">Código</th>
                                <th className="p-4 w-1/3">Título</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Resposta / Valor</th>
                                <th className="p-4 text-right">Ações Rápidas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {processedIndicators.map(ind => (
                                <tr key={ind.code} className="hover:bg-gray-50 group">
                                    <td className="p-4 text-center">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-gray-300"
                                            checked={selectedIds.has(ind.code)}
                                            onChange={() => toggleSelection(ind.code)}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <span className={`font-mono font-bold text-xs px-2 py-1 rounded ${
                                            activeTab === 'ETHOS' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                                        }`}>
                                            {ind.code}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900">{ind.title}</div>
                                        <div className="text-xs text-gray-500">{ind.dimension}</div>
                                    </td>
                                    <td className="p-4">{getStatusBadge(ind.response.status)}</td>
                                    <td className="p-4">
                                        {ind.response.value ? (
                                            <span className="font-medium text-gray-700">{ind.response.value}</span>
                                        ) : ind.response.status === 'GAP_OPEN' ? (
                                            <span className="text-purple-600 text-xs font-bold bg-purple-50 px-2 py-1 rounded">Indisponibilidade Declarada</span>
                                        ) : (
                                            <span className="text-gray-400 italic text-xs">Sem dados</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        {/* Requirement: Place to mark info as unavailable (GAP) */}
                                        {(ind.response.status === 'PENDING' || !ind.response.status) && (
                                            <button 
                                                onClick={() => handleMarkAsGap(ind.code)}
                                                className="text-xs text-purple-600 hover:text-purple-800 font-medium hover:bg-purple-50 px-2 py-1 rounded transition-colors flex items-center gap-1 ml-auto"
                                                title="Marcar que a informação é da minha área mas não está disponível"
                                            >
                                                <AlertTriangle className="w-3 h-3" /> Declarar Indisponível
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {processedIndicators.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-400">
                                        Nenhum indicador encontrado em {activeTab}.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    /* PROJECTS VIEW */
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="p-4 w-12 text-center">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-gray-300"
                                        checked={selectedIds.size === processedProjects.length && processedProjects.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="p-4">Projeto</th>
                                <th className="p-4">ODS Relacionados</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Investimento</th>
                                <th className="p-4 text-right">Beneficiários</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {processedProjects.map(proj => (
                                <tr key={proj.id} className="hover:bg-gray-50 group">
                                    <td className="p-4 text-center">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-gray-300"
                                            checked={selectedIds.has(proj.id)}
                                            onChange={() => toggleSelection(proj.id)}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900">{proj.title}</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wide">{proj.subtitle}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex -space-x-1">
                                            {proj.odss.map(ods => (
                                                <img 
                                                    key={ods}
                                                    src={ODS_DATA[ods].imageUrl}
                                                    alt={`ODS ${ods}`}
                                                    className="w-6 h-6 rounded-sm border border-white shadow-sm"
                                                    title={`ODS ${ods}`}
                                                />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4">{getStatusBadge(proj.status)}</td>
                                    <td className="p-4 font-mono text-gray-700">{proj.investmentAmount}</td>
                                    <td className="p-4 text-right">{proj.beneficiariesText.split(' ')[0]}</td>
                                </tr>
                            ))}
                             {processedProjects.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-400">
                                        Nenhum projeto encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* EXPORT MODAL */}
            {isExportModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Download className="w-5 h-5 text-blue-600" /> Exportar Dados
                                </h3>
                                <button onClick={() => setIsExportModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                            </div>
                            <p className="text-sm text-gray-500">
                                Exportando dados do framework <strong>{activeTab}</strong> para o período <strong>{referenceDate}</strong>.
                            </p>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Format Selection */}
                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-3">1. Formato do Arquivo</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button 
                                        onClick={() => setExportFormat('PDF')}
                                        className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${exportFormat === 'PDF' ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500' : 'border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <Printer className="w-6 h-6 mb-2" />
                                        <span className="text-xs font-bold">PDF</span>
                                    </button>
                                    <button 
                                        onClick={() => setExportFormat('EXCEL')}
                                        className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${exportFormat === 'EXCEL' ? 'border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500' : 'border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <FileSpreadsheet className="w-6 h-6 mb-2" />
                                        <span className="text-xs font-bold">Excel (XLSX)</span>
                                    </button>
                                    <button 
                                        onClick={() => setExportFormat('JSON')}
                                        className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${exportFormat === 'JSON' ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <Share2 className="w-6 h-6 mb-2" />
                                        <span className="text-xs font-bold">API / JSON</span>
                                    </button>
                                </div>
                            </div>

                            {/* Scope Selection */}
                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-3">2. Seleção de Dados</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input 
                                            type="radio" 
                                            name="scope" 
                                            checked={exportScope === 'ALL'} 
                                            onChange={() => setExportScope('ALL')}
                                            className="text-blue-600 focus:ring-blue-500" 
                                        />
                                        <div>
                                            <span className="block text-sm font-bold text-gray-800">Base Completa ({activeTab})</span>
                                            <span className="text-xs text-gray-500">Todos os dados disponíveis para este período.</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input 
                                            type="radio" 
                                            name="scope" 
                                            checked={exportScope === 'FILTERED'} 
                                            onChange={() => setExportScope('FILTERED')}
                                            className="text-blue-600 focus:ring-blue-500" 
                                        />
                                        <div>
                                            <span className="block text-sm font-bold text-gray-800">Visualização Atual (Filtros)</span>
                                            <span className="text-xs text-gray-500">Apenas o que está visível na tabela agora.</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input 
                                            type="radio" 
                                            name="scope" 
                                            checked={exportScope === 'SELECTED'} 
                                            onChange={() => setExportScope('SELECTED')}
                                            disabled={selectedIds.size === 0}
                                            className="text-blue-600 focus:ring-blue-500 disabled:opacity-50" 
                                        />
                                        <div className={selectedIds.size === 0 ? 'opacity-50' : ''}>
                                            <span className="block text-sm font-bold text-gray-800">Itens Selecionados ({selectedIds.size})</span>
                                            <span className="text-xs text-gray-500">Apenas as linhas marcadas via checkbox.</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Detail Level */}
                            <div>
                                <label className="text-sm font-bold text-gray-700 block mb-3">3. Nível de Detalhe</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2">
                                        <input 
                                            type="radio" 
                                            name="detail" 
                                            checked={exportDetail === 'EXECUTIVE'} 
                                            onChange={() => setExportDetail('EXECUTIVE')}
                                        />
                                        <span className="text-sm text-gray-700">Resumo Executivo (KPIs)</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input 
                                            type="radio" 
                                            name="detail" 
                                            checked={exportDetail === 'ANALYTICAL'} 
                                            onChange={() => setExportDetail('ANALYTICAL')}
                                        />
                                        <span className="text-sm text-gray-700">Relatório Analítico (Completo)</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                            <button onClick={() => setIsExportModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium text-sm">Cancelar</button>
                            <button onClick={handleExport} className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-bold text-sm shadow-md flex items-center gap-2">
                                <Download className="w-4 h-4" /> Baixar Arquivo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultsCenter;