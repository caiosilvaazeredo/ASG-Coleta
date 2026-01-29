import React, { useState } from 'react';
import { Institution, GRIIndicator } from '../types';
import { MOCK_INDICATORS, MOCK_GAPS, MOCK_KPIS } from '../constants';
import { FileText, Download, Printer, BookOpen, FileCheck, Languages, AlertTriangle, CheckCircle2, Loader2, FileType, ChevronRight } from 'lucide-react';

interface ReportGeneratorProps {
  institution: Institution;
}

type ReportType = 'COMPLETE' | 'EXECUTIVE' | 'PROGRESS' | 'INDEX';
type Language = 'PT' | 'EN' | 'ES';

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ institution }) => {
  const [reportType, setReportType] = useState<ReportType>('COMPLETE');
  const [language, setLanguage] = useState<Language>('PT');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [progress, setProgress] = useState(0);

  const kpis = MOCK_KPIS[institution.id] || [];
  const griIndex = kpis.find(k => k.label.includes('Índice'))?.value || '0%';

  const handleGenerate = () => {
    setIsGenerating(true);
    setShowPreview(false);
    setProgress(0);

    // Simulate generation process
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setShowPreview(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getReportTitle = () => {
    switch(reportType) {
      case 'COMPLETE': return 'Relatório de Sustentabilidade GRI - Completo';
      case 'EXECUTIVE': return 'Relatório Executivo de Sustentabilidade';
      case 'PROGRESS': return 'Relatório de Progresso (Trimestral)';
      case 'INDEX': return 'Índice Remissivo GRI (Content Index)';
    }
  };

  const ReportPreview = () => (
    <div className="bg-white shadow-2xl mx-auto w-full max-w-4xl min-h-[1000px] p-12 text-gray-800 font-serif animate-in slide-in-from-bottom-4 duration-500">
      {/* CAPA */}
      <div className={`border-b-4 ${institution.id === 'SENAC' ? 'border-orange-500' : 'border-blue-600'} pb-8 mb-12`}>
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{institution.name}</h1>
                <h2 className="text-2xl text-gray-600">{getReportTitle()}</h2>
                <p className="text-sm text-gray-400 mt-2">Período de Referência: 2024</p>
            </div>
            <div className={`w-16 h-16 ${institution.color} rounded-lg flex items-center justify-center text-white font-bold text-2xl`}>
                {institution.logoInitial}
            </div>
        </div>
        <div className="mt-8 flex gap-4 text-sm text-gray-500 font-sans">
            <span className="flex items-center gap-1"><Languages className="w-4 h-4"/> {language === 'PT' ? 'Português (Brasil)' : language}</span>
            <span className="flex items-center gap-1"><FileCheck className="w-4 h-4"/> GRI Standards 2021</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Índice GRI: {griIndex}</span>
        </div>
      </div>

      {/* SUMÁRIO (Simulado) */}
      <div className="mb-12 font-sans">
        <h3 className="text-xl font-bold border-b border-gray-200 pb-2 mb-4">Sumário</h3>
        <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex justify-between"><span>1. Mensagem da Presidência</span> <span className="text-gray-400">................................ 3</span></li>
            <li className="flex justify-between"><span>2. Perfil Organizacional</span> <span className="text-gray-400">................................ 7</span></li>
            <li className="flex justify-between"><span>3. Governança e Integridade</span> <span className="text-gray-400">................................ 15</span></li>
            <li className="flex justify-between font-bold text-gray-800"><span>4. Desempenho ASG (Dados Consolidados)</span> <span className="text-gray-400">................................ 23</span></li>
            <li className="flex justify-between text-red-600"><span>5. Limitações e GAPs de Dados</span> <span className="text-gray-400">................................ 130</span></li>
            <li className="flex justify-between"><span>6. Índice Remissivo GRI</span> <span className="text-gray-400">................................ 140</span></li>
        </ul>
      </div>

      {/* CONTEÚDO DINÂMICO DOS INDICADORES */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 font-sans">4. Desempenho ASG</h3>
        
        {['Environmental', 'Social', 'Governance', 'Economic'].map(dim => {
            const indicators = MOCK_INDICATORS.filter(i => i.dimension === dim);
            if (indicators.length === 0) return null;

            return (
                <div key={dim} className="mb-8">
                    <h4 className={`text-lg font-bold uppercase tracking-wider mb-4 border-l-4 pl-3 ${
                        dim === 'Environmental' ? 'border-green-500 text-green-700' :
                        dim === 'Social' ? 'border-blue-500 text-blue-700' :
                        dim === 'Governance' ? 'border-gray-500 text-gray-700' : 'border-yellow-500 text-yellow-700'
                    }`}>
                        Dimensão {dim === 'Environmental' ? 'Ambiental' : dim === 'Social' ? 'Social' : dim === 'Governance' ? 'Governança' : 'Econômica'}
                    </h4>
                    <div className="space-y-4">
                        {indicators.map(ind => (
                            <div key={ind.code} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div className="flex justify-between items-start">
                                    <span className="font-bold text-gray-800">{ind.code}</span>
                                    <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded">Score: 3/4</span>
                                </div>
                                <p className="text-sm font-bold text-gray-700 mt-1">{ind.title}</p>
                                <p className="text-xs text-gray-500 mt-2 text-justify">
                                    {/* Mocking the content text based on description */}
                                    A instituição reporta que {ind.description.toLowerCase()} Os dados foram coletados e auditados internamente, demonstrando um compromisso contínuo com a transparência...
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )
        })}
      </div>

      {/* SEÇÃO DE GAPS (RF009 Transparency) */}
      <div className="mb-12 bg-red-50 p-6 rounded-xl border border-red-100 page-break-inside-avoid">
        <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5"/>
            5. Limitações e GAPs de Dados
        </h3>
        <p className="text-sm text-red-700 mb-4">
            Em conformidade com os princípios de transparência GRI, listamos abaixo os indicadores materiais cujos dados não puderam ser coletados neste ciclo, juntamente com os planos de ação para resolução.
        </p>
        
        <table className="w-full text-sm text-left">
            <thead className="bg-red-100 text-red-900">
                <tr>
                    <th className="p-2 rounded-tl-lg">Código</th>
                    <th className="p-2">Indicador</th>
                    <th className="p-2">Motivo</th>
                    <th className="p-2 rounded-tr-lg">Prazo Resolução</th>
                </tr>
            </thead>
            <tbody>
                {MOCK_GAPS.slice(0, 3).map(gap => (
                    <tr key={gap.id} className="border-b border-red-100">
                        <td className="p-2 font-bold">{gap.indicatorCode}</td>
                        <td className="p-2">{gap.title}</td>
                        <td className="p-2 text-gray-600">Dados não consolidados</td>
                        <td className="p-2 font-medium">{gap.daysToDeadline > 0 ? `Em ${gap.daysToDeadline} dias` : 'Atrasado'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* RODAPÉ */}
      <div className="border-t border-gray-200 pt-8 text-center text-xs text-gray-400 mt-auto">
        <p>Gerado automaticamente pelo Sistema ASG Fecomércio RJ em {new Date().toLocaleDateString()}</p>
        <p>Este documento contém informações confidenciais até sua aprovação final.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Geração de Relatórios GRI</h2>
           <p className="text-gray-500">Exporte os dados de sustentabilidade em formatos padronizados (RF009)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Configuration */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-gray-500" />
                    Configuração do Relatório
                </h3>

                {/* Report Type Selector */}
                <div className="space-y-3 mb-6">
                    <label className="text-sm font-medium text-gray-700">Tipo de Relatório</label>
                    <div className="grid grid-cols-1 gap-2">
                        {[
                            { id: 'COMPLETE', label: 'Relatório Completo GRI', icon: BookOpen, desc: '100-200 pgs, todas as dimensões.' },
                            { id: 'EXECUTIVE', label: 'Resumo Executivo', icon: FileText, desc: '20-30 pgs, KPIs principais.' },
                            { id: 'PROGRESS', label: 'Relatório de Progresso', icon: CheckCircle2, desc: 'Status trimestral de metas.' },
                            { id: 'INDEX', label: 'Índice Remissivo', icon: ListIcon, desc: 'Tabela de conteúdo GRI.' },
                        ].map((type) => {
                            const Icon = type.icon;
                            const isSelected = reportType === type.id;
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => setReportType(type.id as ReportType)}
                                    className={`text-left p-3 rounded-lg border transition-all flex items-start gap-3 ${
                                        isSelected 
                                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className={`mt-1 p-1.5 rounded-md ${isSelected ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className={`font-bold text-sm ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>{type.label}</div>
                                        <div className="text-xs text-gray-500">{type.desc}</div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Language Selector */}
                <div className="mb-6">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Idioma</label>
                    <div className="flex gap-2">
                        {['PT', 'EN', 'ES'].map(lang => (
                            <button
                                key={lang}
                                onClick={() => setLanguage(lang as Language)}
                                className={`flex-1 py-2 text-sm font-medium rounded-md border ${
                                    language === lang 
                                    ? 'bg-gray-800 text-white border-gray-800' 
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow-md flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5" />}
                    {isGenerating ? 'Processando Dados...' : 'Gerar Relatório'}
                </button>
            </div>

            {/* Export Options (Mock) */}
            {showPreview && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-gray-800 mb-4">Exportar Arquivo</h3>
                    <div className="space-y-2">
                        <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 group">
                            <span className="flex items-center gap-2"><FileType className="w-4 h-4 text-red-500"/> PDF (Alta Resolução)</span>
                            <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        </button>
                        <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 group">
                            <span className="flex items-center gap-2"><FileType className="w-4 h-4 text-blue-500"/> Word (Editável)</span>
                            <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        </button>
                        <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 group">
                            <span className="flex items-center gap-2"><FileType className="w-4 h-4 text-orange-500"/> HTML (Interativo)</span>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Right Column: Preview Area */}
        <div className="lg:col-span-2 bg-gray-100 rounded-xl border border-gray-200 p-8 overflow-y-auto max-h-[calc(100vh-150px)] custom-scrollbar flex flex-col items-center justify-start relative">
            {isGenerating && (
                <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center backdrop-blur-sm rounded-xl">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <h3 className="text-xl font-bold text-gray-800">Compilando Indicadores GRI...</h3>
                    <div className="w-64 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
                        <div 
                            className="h-full bg-blue-600 transition-all duration-200"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Integrando {MOCK_INDICATORS.length} respostas e {MOCK_GAPS.length} gaps...</p>
                </div>
            )}

            {!showPreview && !isGenerating ? (
                <div className="text-center text-gray-400 my-auto">
                    <BookOpen className="w-20 h-20 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium text-gray-500">Visualização do Relatório</h3>
                    <p>Configure e clique em "Gerar Relatório" para visualizar a prévia do documento.</p>
                </div>
            ) : (
                <ReportPreview />
            )}
        </div>
      </div>
    </div>
  );
};

// Helper Icons
const SettingsIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);

const ListIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
);

export default ReportGenerator;