
import React, { useState, useEffect, useRef } from 'react';
import { GRIIndicator, ResponseOptionType, GRIResponse, UserProfile, ScoringCriteria, FrameworkType, Question, Contribution } from '../types';
import { MOCK_INDICATORS, MOCK_RESPONDENTS, MOCK_USERS } from '../constants';
import { CheckCircle2, XCircle, AlertCircle, Save, FileUp, Info, LayoutGrid, List, Mail, Send, ChevronRight, RefreshCw, Award, HelpCircle, BookOpen, Sparkles, Globe, ShieldCheck, X, Table, User, Calendar, Filter, Plus, Trash2, Users, Briefcase, AlertTriangle } from 'lucide-react';

interface DataCollectionProps {
    user: UserProfile;
    forcedFramework?: FrameworkType; // New prop to enforce separation
}

// Mock initial responses to populate the dashboard
const INITIAL_RESPONSES: Record<string, Partial<GRIResponse>> = {
    '302-1': { 
        indicatorCode: '302-1', 
        status: 'SUBMITTED', 
        option: 'ANSWER_NOW', 
        value: '12500 kWh', 
        lastUpdated: new Date().toISOString(),
        skouloudisScore: 0,
        assignedUserId: 'r1',
        deadline: '2024-12-31'
    },
    '401-1': { 
        indicatorCode: '401-1', 
        status: 'SUBMITTED', 
        option: 'ANSWER_NOW', 
        value: '45', 
        lastUpdated: new Date(Date.now() - 86400000).toISOString(),
        assignedUserId: 'r2' 
    },
    '305-1': { 
        indicatorCode: '305-1', 
        status: 'DRAFT', 
        option: 'ANSWER_NOW', 
        lastUpdated: new Date().toISOString(),
        contributors: ['r1', 'r2'],
        // MOCK MULTI-DEPARTMENT CONTRIBUTIONS
        contributions: [
            {
                userId: 'r1',
                userName: 'João Santos',
                department: 'Facilities',
                lastUpdated: '2024-11-01',
                status: 'SUBMITTED',
                answers: {
                    'q_scope1_total': '1250 tCO2e (Consumo Diesel Geradores)'
                }
            },
            {
                userId: 'r2',
                userName: 'Ana Financeiro',
                department: 'Financeiro',
                lastUpdated: '2024-11-02',
                status: 'SUBMITTED',
                answers: {
                    'q_scope1_total': '300 tCO2e (Viagens Corporativas - Reembolso)'
                }
            }
        ]
    },
};

// Merge Users and Respondents for the assignment dropdown
const AVAILABLE_ASSIGNEES = [
    ...MOCK_USERS.map(u => ({ id: u.id, name: u.name, role: u.role, type: 'USER' })),
    ...MOCK_RESPONDENTS.map(r => ({ id: r.id, name: r.name, role: r.department, type: 'RESPONDENT' }))
];

const DataCollection: React.FC<DataCollectionProps> = ({ user, forcedFramework }) => {
  const [viewMode, setViewMode] = useState<'DASHBOARD' | 'FORM' | 'SPREADSHEET'>('DASHBOARD');
  const [selectedIndicator, setSelectedIndicator] = useState<GRIIndicator | null>(null);
  
  // Framework State - Default is GRI, or forced via prop
  const [activeFramework, setActiveFramework] = useState<FrameworkType>(forcedFramework || 'GRI');
  
  // Update active framework if prop changes
  useEffect(() => {
    if (forcedFramework) {
        setActiveFramework(forcedFramework);
    }
  }, [forcedFramework]);

  // Form State
  const [responseOption, setResponseOption] = useState<ResponseOptionType | null>(null);
  const [formData, setFormData] = useState<Partial<GRIResponse>>({});
  const [scoringCriteria, setScoringCriteria] = useState<ScoringCriteria>({
      hasNumericData: false,
      hasTemporalComparison: false,
      hasExternalVerification: false,
      hasHistoricSeries: false
  });
  
  // Local state for rejection confirmation checkbox
  const [isRejectionConfirmed, setIsRejectionConfirmed] = useState(false);

  // Persistence State
  const [allResponses, setAllResponses] = useState<Record<string, Partial<GRIResponse>>>(INITIAL_RESPONSES);
  
  // Auto-save State
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Filtered Stats Logic (Separation) ---
  const filteredIndicators = MOCK_INDICATORS.filter(ind => (ind.framework || 'GRI') === activeFramework);
  const totalIndicators = filteredIndicators.length;
  
  const completedIndicators = filteredIndicators.filter(ind => {
      const resp = allResponses[ind.code];
      return resp && (resp.status === 'SUBMITTED' || resp.status === 'APPROVED');
  }).length;
  
  const progressPercentage = totalIndicators > 0 ? Math.round((completedIndicators / totalIndicators) * 100) : 0;

  // Theme colors based on framework
  const themeColor = activeFramework === 'GRI' ? 'blue' : 'purple';
  const themeBgLight = activeFramework === 'GRI' ? 'bg-blue-50' : 'bg-purple-50';
  const themeText = activeFramework === 'GRI' ? 'text-blue-700' : 'text-purple-700';
  const themeBorder = activeFramework === 'GRI' ? 'border-blue-200' : 'border-purple-200';
  const themeButton = activeFramework === 'GRI' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700';

  // --- Auto-Save Logic (RF004.6) ---
  useEffect(() => {
    if (viewMode === 'FORM' && isDirty) {
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        
        autoSaveTimerRef.current = setTimeout(() => {
            handleAutoSave();
        }, 30000); // 30 seconds
    }
    return () => {
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [formData, isDirty, viewMode, scoringCriteria]);

  // RF007 - Skouloudis Scoring Algorithm
  useEffect(() => {
      if (viewMode === 'FORM') {
          if (responseOption === 'NO_DATA') {
               const score = (formData.actionPlan && formData.actionPlan.length > 10) ? 1 : 0;
               if (score !== formData.skouloudisScore) {
                   setFormData(prev => ({ ...prev, skouloudisScore: score }));
                   setIsDirty(true);
               }
          }
      }
  }, [responseOption, formData.actionPlan, viewMode]);

  // Reset selection when framework changes
  useEffect(() => {
    setSelectedIndicator(null);
    if(viewMode === 'FORM') setViewMode('DASHBOARD');
  }, [activeFramework]);

  const handleAutoSave = () => {
      setIsAutoSaving(true);
      setTimeout(() => {
          if (selectedIndicator) {
              setAllResponses(prev => ({
                  ...prev,
                  [selectedIndicator.code]: {
                      ...prev[selectedIndicator.code],
                      ...formData,
                      scoringCriteria,
                      lastUpdated: new Date().toISOString(),
                      status: prev[selectedIndicator.code]?.status === 'SUBMITTED' ? 'SUBMITTED' : 'DRAFT'
                  }
              }));
          }
          setLastSaved(new Date());
          setIsDirty(false);
          setIsAutoSaving(false);
      }, 800);
  };

  // --- Handlers ---

  const handleSelectIndicator = (indicator: GRIIndicator) => {
      setSelectedIndicator(indicator);
      
      const existing = allResponses[indicator.code];
      if (existing) {
          setResponseOption(existing.option || null);
          setFormData(existing);
          // Set local checkbox state if rejection reason exists
          setIsRejectionConfirmed(!!existing.rejectionReason);
          
          if (existing.scoringCriteria) {
              setScoringCriteria(existing.scoringCriteria);
          } else {
               setScoringCriteria({
                  hasNumericData: false,
                  hasTemporalComparison: false,
                  hasExternalVerification: false,
                  hasHistoricSeries: false
              });
          }
      } else {
          setResponseOption(null);
          setIsRejectionConfirmed(false);
          // Initialize with standard 2025 period
          setFormData({ 
              indicatorCode: indicator.code, 
              answers: {}, 
              contributors: [],
              periodStart: '2025-01-01',
              periodEnd: '2025-12-31'
          });
           setScoringCriteria({
                hasNumericData: false,
                hasTemporalComparison: false,
                hasExternalVerification: false,
                hasHistoricSeries: false
            });
      }
      
      setViewMode('FORM');
      setIsDirty(false);
      setLastSaved(null);
  };

  const handleOptionChange = (option: ResponseOptionType) => {
    setResponseOption(option);
    setFormData(prev => ({ ...prev, option }));
    setIsDirty(true);
  };

  const handleInputChange = (field: keyof GRIResponse, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      setIsDirty(true);
  };
  
  // New handler for individual question answers
  const handleAnswerChange = (questionId: string, value: any) => {
      setFormData(prev => ({
          ...prev,
          answers: {
              ...prev.answers,
              [questionId]: value
          }
      }));
      setIsDirty(true);
  };

  const handleAddContributor = () => {
      const email = prompt("Digite o email ou nome da área para convidar:");
      if (email) {
          // Simulation: Just adding string to array
          const currentContributors = formData.contributors || [];
          if (!currentContributors.includes(email)) {
             setFormData(prev => ({
                 ...prev,
                 contributors: [...currentContributors, email]
             }));
             setIsDirty(true);
             alert(`Convite de colaboração enviado para ${email}`);
          }
      }
  };
  
  const handleScoreSelect = (score: number) => {
      setFormData(prev => ({ ...prev, skouloudisScore: score }));
      setIsDirty(true);
  };

  const handleManualSave = () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      handleAutoSave();
      if (selectedIndicator && (!allResponses[selectedIndicator.code]?.status || allResponses[selectedIndicator.code]?.status === 'DRAFT')) {
           setAllResponses(prev => ({
              ...prev,
              [selectedIndicator.code!]: {
                  ...prev[selectedIndicator.code!],
                  status: 'SUBMITTED'
              }
           }));
      }
      setViewMode('DASHBOARD');
  };

  const handleNotifyResponsible = (indicatorCode: string) => {
      alert(`Notificação enviada por email para o responsável do indicador ${indicatorCode}`);
  };

  const handleSendReminders = () => {
      alert(`Lembretes de pendência enviados para 5 responsáveis.`);
  };

  // --- Spreadsheet Handlers ---
  const handleSpreadsheetChange = (indicatorCode: string, field: keyof GRIResponse, value: any) => {
      setAllResponses(prev => ({
          ...prev,
          [indicatorCode]: {
              ...prev[indicatorCode],
              indicatorCode,
              [field]: value,
              lastUpdated: new Date().toISOString(),
              // If assigning user and no status, set to DRAFT
              status: (field === 'assignedUserId' && !prev[indicatorCode]?.status) ? 'DRAFT' : prev[indicatorCode]?.status || 'DRAFT'
          }
      }));
  };

  // --- Validation Logic ---
  const handleApprove = () => {
      if (!selectedIndicator) return;
      setAllResponses(prev => ({
          ...prev,
          [selectedIndicator.code]: { ...prev[selectedIndicator.code], status: 'APPROVED' }
      }));
      setFormData(prev => ({ ...prev, status: 'APPROVED' }));
      alert('Indicador aprovado com sucesso!');
  };

  const handleRequestChanges = () => {
    if (!selectedIndicator) return;
    const feedback = prompt("Informe o motivo da devolução:");
    if (feedback) {
        setAllResponses(prev => ({
            ...prev,
            [selectedIndicator.code]: { ...prev[selectedIndicator.code], status: 'CHANGES_REQUESTED', feedback }
        }));
        setFormData(prev => ({ ...prev, status: 'CHANGES_REQUESTED', feedback }));
    }
  };

  // --- Render Helpers ---

  const getStatusColor = (status?: string) => {
      switch(status) {
          case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
          case 'SUBMITTED': return 'bg-blue-100 text-blue-800 border-blue-200';
          case 'DRAFT': return 'bg-gray-100 text-gray-800 border-gray-200';
          case 'GAP_OPEN': return 'bg-purple-100 text-purple-800 border-purple-200';
          case 'CHANGES_REQUESTED': return 'bg-red-100 text-red-800 border-red-200';
          default: return 'bg-gray-50 text-gray-500 border-gray-200';
      }
  };

  const getStatusLabel = (status?: string) => {
      switch(status) {
          case 'APPROVED': return 'Aprovado';
          case 'SUBMITTED': return 'Aguardando Aprovação';
          case 'DRAFT': return 'Em Preenchimento';
          case 'GAP_OPEN': return 'Gap Declarado';
          case 'CHANGES_REQUESTED': return 'Ajustes Solicitados';
          default: return 'Pendente';
      }
  };

  // --- RENDER SCORING PANEL (RF007 - Manager Only) ---
  const renderScoringPanel = () => {
      const isManager = user.role === 'ASG_MANAGER' || user.role === 'PRESIDENT';
      const score = formData.skouloudisScore || 0;

      if (!isManager) return null;
      if (responseOption !== 'ANSWER_NOW' && responseOption !== 'NO_DATA') return null;

      const getScoreLabel = (s: number) => {
          if (s === 4) return "Completa e sistemática";
          if (s === 3) return "Cobertura extensiva";
          if (s === 2) return "Cobertura mais detalhada";
          if (s === 1) return "Breve ou genérico";
          return "Não mencionado";
      };

      const getScoreColor = (s: number) => {
          if (s === 4) return "bg-green-500";
          if (s === 3) return "bg-blue-500";
          if (s === 2) return "bg-yellow-500";
          if (s === 1) return "bg-orange-500";
          return "bg-gray-400";
      };
      
      const SCORING_DEFINITIONS = [
        { score: 0, title: "0 pontos (Não mencionado)", desc: "Atribuído quando o tópico específico sequer é citado no relatório avaliado." },
        { score: 1, title: "1 ponto (Breve ou genérico)", desc: "Destinado a tópicos que recebem apenas declarações superficiais ou muito genéricas, sem detalhes específicos." },
        { score: 2, title: "2 pontos (Cobertura mais detalhada)", desc: "Quando a empresa fornece informações que vão além do básico, descrevendo políticas ou ações com maior detalhamento." },
        { score: 3, title: "3 pontos (Cobertura extensiva)", desc: "Atribuído quando o relatório apresenta um conteúdo profundo e detalhado sobre o critério em questão." },
        { score: 4, title: "4 pontos (Completa e sistemática)", desc: "A pontuação máxima é dada quando a cobertura é plena, organizada de forma sistemática e, crucialmente, permite a comparabilidade dos dados fornecidos com outros períodos ou empresas." },
      ];

      return (
          <div className="mt-8 bg-slate-800 text-white rounded-xl overflow-hidden shadow-lg animate-in slide-in-from-bottom-4">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900">
                  <h4 className="font-bold flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      Avaliação de Qualidade (Skouloudis)
                  </h4>
                  <span className="text-xs uppercase tracking-wider text-slate-400">Uso Exclusivo Gestor ASG</span>
              </div>
              <div className="p-6 flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-700 rounded-lg min-w-[200px] text-center sticky top-0 h-fit">
                      <div className={`text-5xl font-bold mb-2 ${score >= 3 ? 'text-green-400' : 'text-white'}`}>
                          {score}/4
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase mb-2 ${getScoreColor(score)}`}>
                          {getScoreLabel(score)}
                      </div>
                  </div>
                  <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                        <p className="text-sm text-slate-300">Selecione o nível de qualidade da resposta:</p>
                      </div>
                      {responseOption === 'ANSWER_NOW' ? (
                          <div className="space-y-2">
                              {SCORING_DEFINITIONS.map((def) => (
                                  <div 
                                      key={def.score}
                                      onClick={() => handleScoreSelect(def.score)}
                                      className={`p-3 rounded-lg cursor-pointer transition-all border ${
                                          score === def.score 
                                          ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500' 
                                          : 'bg-slate-700/50 hover:bg-slate-700 border-slate-600'
                                      }`}
                                  >
                                      <div className="flex items-start gap-3">
                                          <div className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center ${
                                              score === def.score ? 'border-blue-400 bg-blue-400' : 'border-slate-500'
                                          }`}>
                                              {score === def.score && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                          </div>
                                          <div>
                                              <span className={`font-bold text-sm block ${score === def.score ? 'text-blue-200' : 'text-slate-200'}`}>
                                                  {def.title}
                                              </span>
                                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{def.desc}</p>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="bg-slate-700/50 p-4 rounded border border-slate-600">
                              <p className="text-sm">
                                  <strong>Gap Identificado:</strong> O score é calculado automaticamente como 1 se houver plano de ação, ou 0 caso contrário.
                              </p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  };

  // --- PARAMETERIZED QUESTION RENDERER ---
  const renderQuestionInput = (question: Question) => {
      const answerValue = formData.answers?.[question.id];

      // --- TABLE INPUT COMPONENT ---
      const renderTableInput = () => {
          const columns = question.columns || ['Coluna 1', 'Coluna 2'];
          const rows: any[] = Array.isArray(answerValue) ? answerValue : [{ id: 1 }];

          const updateRow = (rowIndex: number, colIndex: number, val: string) => {
              const newRows = [...rows];
              if (!newRows[rowIndex]) newRows[rowIndex] = {};
              newRows[rowIndex][columns[colIndex]] = val;
              handleAnswerChange(question.id, newRows);
          };

          const addRow = () => {
              handleAnswerChange(question.id, [...rows, { id: Date.now() }]);
          };

          const removeRow = (index: number) => {
              const newRows = [...rows];
              newRows.splice(index, 1);
              handleAnswerChange(question.id, newRows);
          };

          return (
              <div className="mt-2 border rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-700 font-bold border-b">
                            <tr>
                                {columns.map((col, idx) => (
                                    <th key={idx} className="p-3 border-r last:border-r-0 min-w-[150px]">{col}</th>
                                ))}
                                <th className="p-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, rIdx) => (
                                <tr key={rIdx} className="border-b last:border-b-0 hover:bg-gray-50">
                                    {columns.map((col, cIdx) => (
                                        <td key={cIdx} className="p-2 border-r last:border-r-0">
                                            <input 
                                                type="text" 
                                                className="w-full bg-transparent outline-none p-1 focus:bg-blue-50 rounded"
                                                placeholder="..."
                                                value={row[col] || ''}
                                                onChange={(e) => updateRow(rIdx, cIdx, e.target.value)}
                                            />
                                        </td>
                                    ))}
                                    <td className="p-2 text-center">
                                        <button onClick={() => removeRow(rIdx)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
                  <button onClick={addRow} className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold border-t flex items-center justify-center gap-1 transition-colors">
                      <Plus className="w-3 h-3" /> Adicionar Linha
                  </button>
              </div>
          );
      };

      const renderInputByType = () => {
          switch (question.type) {
            case 'TEXT_SHORT':
                return (
                    <input 
                        type="text" 
                        className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" 
                        value={answerValue || ''} 
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    />
                );
            case 'TEXT_LONG':
                return (
                    <textarea 
                        rows={4} 
                        className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" 
                        value={answerValue || ''} 
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    />
                );
            case 'NUMBER':
                return (
                    <input 
                        type="number" 
                        className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 font-mono" 
                        value={answerValue || ''} 
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    />
                );
            case 'DATE':
                return (
                    <input 
                        type="date" 
                        className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" 
                        value={answerValue || ''} 
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    />
                );
            case 'SELECT_SINGLE':
                return (
                    <select 
                        className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-white"
                        value={answerValue || ''} 
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    >
                        <option value="">Selecione...</option>
                        {question.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                );
            case 'TABLE':
                return renderTableInput();
            case 'FILE':
                return (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
                        <FileUp className="w-8 h-8 mb-2" />
                        <span className="text-sm">Clique para upload de evidência</span>
                    </div>
                );
            default:
                return <input type="text" className="w-full border p-2 rounded" />;
          }
      };

      // Find contributions relevant to this specific question, if any
      // Assuming a simple logic: if a contribution has a key matching the question ID
      const questionContributions = formData.contributions?.filter(c => c.answers && c.answers[question.id]);

      return (
          <div className="space-y-4">
              <div>
                  <p className="text-xs font-bold text-blue-600 mb-1">Resposta Consolidada (Oficial):</p>
                  {renderInputByType()}
              </div>
              
              {/* Multi-Department Contributions Visualization */}
              {questionContributions && questionContributions.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mt-2 animate-in fade-in slide-in-from-top-1">
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Users className="w-3 h-3" /> Contribuições das Áreas
                      </h5>
                      <div className="space-y-2">
                          {questionContributions.map((contribution, idx) => (
                              <div key={idx} className="bg-white border border-gray-200 rounded p-2 flex items-start gap-3 shadow-sm">
                                   <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200" title={contribution.userName}>
                                       {contribution.userName.substring(0,2).toUpperCase()}
                                   </div>
                                   <div className="flex-1 min-w-0">
                                       <div className="flex justify-between items-start mb-1">
                                           <div>
                                               <span className="font-bold text-xs text-slate-800 block">{contribution.userName}</span>
                                               <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                   <Briefcase className="w-3 h-3" /> {contribution.department}
                                               </span>
                                           </div>
                                           <span className="text-[10px] text-slate-400">{new Date(contribution.lastUpdated).toLocaleDateString()}</span>
                                       </div>
                                       <div className="text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 italic">
                                            "{contribution.answers[question.id]}"
                                       </div>
                                   </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      );
  };

  // --- FORM CONTENT RENDERER ---
  const renderFormContent = () => {
    // Check if current dates are Standard 2025
    const isStandardPeriod = formData.periodStart === '2025-01-01' && formData.periodEnd === '2025-12-31';

    const handleStandardPeriod = () => {
        setFormData(prev => ({
            ...prev,
            periodStart: '2025-01-01',
            periodEnd: '2025-12-31',
            periodJustification: '' // Clear justification
        }));
        setIsDirty(true);
    };

    const handleCustomPeriod = () => {
        // If switching to custom, maybe clear dates or keep current ones, but standard logic implies user will edit
        if (isStandardPeriod) {
            setFormData(prev => ({
                ...prev,
                periodStart: '',
                periodEnd: ''
            }));
        }
        // Force re-render to update UI state, effectively done by setFormData
        setIsDirty(true);
    };

    switch (responseOption) {
      case 'ANSWER_NOW':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className={`${themeBgLight} p-4 rounded-lg border ${themeBorder} text-sm ${themeText}`}>
                <h6 className="font-bold flex items-center gap-2"><Info className="w-4 h-4" /> Dica de Preenchimento ({activeFramework})</h6>
                <p className="mt-1">Garanta que os dados inseridos estejam alinhados com o protocolo técnico do {activeFramework === 'GRI' ? 'GRI Standards' : 'Instituto Ethos'}.</p>
            </div>
            
            {/* Contributors Section */}
            <div className="border border-blue-100 bg-blue-50/50 rounded-lg p-4 mb-4">
                 <div className="flex justify-between items-center mb-2">
                     <h6 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                         <Users className="w-4 h-4" /> Áreas Contribuintes
                     </h6>
                     <button onClick={handleAddContributor} className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
                         <Plus className="w-3 h-3" /> Adicionar Área
                     </button>
                 </div>
                 <div className="flex flex-wrap gap-2">
                     {formData.contributors && formData.contributors.length > 0 ? (
                         formData.contributors.map(c => (
                             <span key={c} className="bg-white text-blue-700 px-2 py-1 rounded text-xs border border-blue-200 shadow-sm flex items-center gap-1">
                                 {c}
                             </span>
                         ))
                     ) : (
                         <span className="text-xs text-gray-400 italic">Nenhuma área convidada ainda.</span>
                     )}
                 </div>
            </div>

            {/* PERIOD CONFIRMATION SECTION (NEW) */}
            <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 mb-6 relative">
                <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-slate-600" />
                    <h5 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Período de Referência dos Dados</h5>
                </div>
                
                <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-100 rounded transition-colors">
                        <input 
                            type="radio" 
                            name="periodType" 
                            checked={isStandardPeriod} 
                            onChange={handleStandardPeriod}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            Ano Completo 2025 (01/01/2025 a 31/12/2025)
                        </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-100 rounded transition-colors">
                        <input 
                            type="radio" 
                            name="periodType" 
                            checked={!isStandardPeriod} 
                            onChange={handleCustomPeriod}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            Informar período diferente / parcial (Requer justificativa)
                        </span>
                    </label>
                </div>

                {!isStandardPeriod && (
                    <div className="mt-4 pl-4 ml-2 border-l-2 border-orange-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Data Início</label>
                                <input 
                                    type="date" 
                                    className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm" 
                                    value={formData.periodStart || ''} 
                                    onChange={(e) => handleInputChange('periodStart', e.target.value)} 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Data Fim</label>
                                <input 
                                    type="date" 
                                    className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm" 
                                    value={formData.periodEnd || ''} 
                                    onChange={(e) => handleInputChange('periodEnd', e.target.value)} 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-orange-600 mb-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Justificativa Obrigatória
                            </label>
                            <textarea 
                                className="w-full border-orange-200 rounded-md shadow-sm p-2 text-sm focus:ring-orange-500 focus:border-orange-500" 
                                rows={2}
                                placeholder="Por que os dados não cobrem o ano completo de 2025? (Ex: Sistema implantado em Março...)"
                                value={formData.periodJustification || ''}
                                onChange={(e) => handleInputChange('periodJustification', e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* DYNAMIC QUESTIONS RENDERING */}
            {selectedIndicator?.questions && selectedIndicator.questions.length > 0 ? (
                <div className="space-y-6">
                    {selectedIndicator.questions.map((q, idx) => (
                        <div key={q.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="block text-sm font-bold text-gray-800 mb-1 flex items-center gap-2">
                                <span className="bg-gray-200 text-gray-600 px-1.5 rounded text-xs">{idx + 1}</span> 
                                {q.text} 
                                {q.required && <span className="text-red-500">*</span>}
                            </label>
                            {q.description && <p className="text-xs text-gray-500 mb-2">{q.description}</p>}
                            <div className="mt-2">
                                {renderQuestionInput(q)}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Fallback for indicators without defined questions (Legacy Mode)
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Reportado (Texto ou Número)</label>
                    <textarea rows={4} className="w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="Descreva os dados ou insira os valores..." value={formData.value || ''} onChange={(e) => handleInputChange('value', e.target.value)} />
                    
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Evidências (Upload)</label>
                         <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
                            <FileUp className="w-8 h-8 mb-2" />
                            <span className="text-sm">Clique para upload de PDF, Excel ou Imagem</span>
                        </div>
                    </div>
                </div>
            )}
          </div>
        );
      case 'DELEGATE':
        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-yellow-800">
                    <p className="text-sm">Você está delegando este indicador. O destinatário receberá um email de notificação.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Para qual área?</label>
                    <select className="w-full border-gray-300 rounded-md shadow-sm p-2 border" value={formData.delegatedTo || ''} onChange={(e) => handleInputChange('delegatedTo', e.target.value)}>
                        <option value="">Selecione...</option>
                        {['Recursos Humanos', 'Financeiro', 'Operações', 'TI', 'Jurídico'].map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                    <textarea className="w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="Instruções..." value={formData.delegationReason || ''} onChange={(e) => handleInputChange('delegationReason', e.target.value)} />
                </div>
            </div>
        );
      case 'NOT_MY_AREA':
        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                 <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-red-800 flex gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-sm">Sinalização de Direcionamento Incorreto</h4>
                        <p className="text-sm mt-1">
                            Ao confirmar que este indicador não pertence à sua área, ele será devolvido para a gestão ASG. 
                            <strong> O redirecionamento não é automático.</strong>
                        </p>
                    </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-white space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input 
                            type="checkbox" 
                            className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                            checked={isRejectionConfirmed}
                            onChange={(e) => setIsRejectionConfirmed(e.target.checked)}
                        />
                        <span className="text-sm text-gray-700 font-medium">
                            Confirmo que as informações deste indicador não são de responsabilidade da minha área/departamento.
                        </span>
                    </label>

                    {isRejectionConfirmed && (
                        <div className="animate-in fade-in slide-in-from-top-2 space-y-4 pt-2 border-t border-gray-100">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Justificativa (Obrigatório)</label>
                                <textarea 
                                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-red-500 focus:border-red-500" 
                                    placeholder="Descreva o motivo pelo qual este indicador não se aplica à sua área..." 
                                    value={formData.rejectionReason || ''} 
                                    onChange={(e) => handleInputChange('rejectionReason', e.target.value)} 
                                />
                            </div>

                            <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sugestão de Redirecionamento (Opcional)</label>
                                <p className="text-xs text-gray-500 mb-2">Indique a área ou e-mail da pessoa correta, se souber.</p>
                                <input 
                                    type="text"
                                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-red-500 focus:border-red-500"
                                    placeholder="Ex: Gerência de TI ou nome@email.com"
                                    value={formData.suggestedArea || ''}
                                    onChange={(e) => handleInputChange('suggestedArea', e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
      case 'NO_DATA':
        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                 <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-purple-800">
                    <h6 className="font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Registro de GAP (Inovação)</h6>
                    <p className="text-sm mt-1">Identificar um gap gera um plano de ação e não penaliza a avaliação.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                    <select className="w-full border-gray-300 rounded-md shadow-sm p-2 border" value={formData.gapType || ''} onChange={(e) => handleInputChange('gapType', e.target.value)}>
                        <option value="">Selecione...</option>
                        <option value="NEVER_MEASURED">Nunca foi medido</option>
                        <option value="DISPERSED_DATA">Dados dispersos</option>
                        <option value="SYSTEM_LIMITATION">Limitação de sistema</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plano de Ação</label>
                    <textarea className="w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="Ações para resolver..." value={formData.actionPlan || ''} onChange={(e) => handleInputChange('actionPlan', e.target.value)} />
                </div>
            </div>
        );
      default:
        return <div className="text-center text-gray-400 py-10">Selecione uma opção acima para começar</div>;
    }
  };

  // --- SPREADSHEET VIEW RENDERER ---
  const renderSpreadsheetView = () => {
      return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300">
              <div className={`p-4 border-b border-gray-200 flex justify-between items-center ${themeBgLight}`}>
                  <div>
                      <h3 className={`font-bold ${themeText} flex items-center gap-2`}>
                          <Table className="w-5 h-5" /> Planilha de Gestão - {activeFramework}
                      </h3>
                      <p className="text-xs text-gray-500">Atribua responsáveis e prazos diretamente na tabela.</p>
                  </div>
                  <div className="flex gap-2">
                        <button className="flex items-center gap-1 bg-white border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50">
                            <Filter className="w-3 h-3" /> Filtrar
                        </button>
                        <button onClick={() => alert('Alterações salvas no banco de dados.')} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700">
                            <Save className="w-3 h-3" /> Salvar Tudo
                        </button>
                  </div>
              </div>
              
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
                          <tr>
                              <th className="p-3 w-20">Código</th>
                              <th className="p-3 w-64">Indicador / Questão</th>
                              <th className="p-3 w-32">Dimensão</th>
                              <th className="p-3 w-48">Responsável (Atribuição)</th>
                              <th className="p-3 w-32">Status</th>
                              <th className="p-3 w-32">Prazo</th>
                              <th className="p-3 text-center">Ações</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {filteredIndicators.map(ind => {
                              const response = allResponses[ind.code] || {};
                              return (
                                  <tr key={ind.code} className="hover:bg-gray-50">
                                      <td className="p-3 font-mono font-bold text-gray-700">{ind.code}</td>
                                      <td className="p-3">
                                          <div className="truncate max-w-xs font-medium text-gray-800" title={ind.title}>{ind.title}</div>
                                      </td>
                                      <td className="p-3">
                                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600 border border-gray-200">{ind.dimension}</span>
                                      </td>
                                      <td className="p-3">
                                          <div className="relative">
                                              <select 
                                                  className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-1 pl-2 pr-8 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                                                  value={response.assignedUserId || ''}
                                                  onChange={(e) => handleSpreadsheetChange(ind.code, 'assignedUserId', e.target.value)}
                                              >
                                                  <option value="">-- Selecione --</option>
                                                  {AVAILABLE_ASSIGNEES.map(assignee => (
                                                      <option key={assignee.id} value={assignee.id}>{assignee.name}</option>
                                                  ))}
                                              </select>
                                              <User className="w-3 h-3 text-gray-400 absolute right-2 top-1.5 pointer-events-none" />
                                          </div>
                                      </td>
                                      <td className="p-3">
                                          <select
                                              className={`text-xs font-bold rounded px-2 py-1 border-none focus:ring-0 cursor-pointer ${getStatusColor(response.status)}`}
                                              value={response.status || 'PENDING'}
                                              onChange={(e) => handleSpreadsheetChange(ind.code, 'status', e.target.value)}
                                          >
                                              <option value="PENDING">Pendente</option>
                                              <option value="DRAFT">Em Andamento</option>
                                              <option value="SUBMITTED">Aguardando Aprovação</option>
                                              <option value="APPROVED">Aprovado</option>
                                              <option value="GAP_OPEN">GAP Declarado</option>
                                          </select>
                                      </td>
                                      <td className="p-3">
                                          <input 
                                              type="date" 
                                              className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-600 focus:ring-1 focus:ring-blue-500"
                                              value={response.deadline || ''}
                                              onChange={(e) => handleSpreadsheetChange(ind.code, 'deadline', e.target.value)}
                                          />
                                      </td>
                                      <td className="p-3 text-center">
                                          <button 
                                              onClick={() => handleSelectIndicator(ind)}
                                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                              title="Abrir Formulário"
                                          >
                                              <List className="w-4 h-4" />
                                          </button>
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
                  {filteredIndicators.length === 0 && (
                      <div className="p-8 text-center text-gray-400">
                          <p>Nenhum indicador encontrado para este framework.</p>
                      </div>
                  )}
              </div>
          </div>
      );
  };

  // --- MAIN RENDER ---
  return (
    <div className="space-y-6">
        {/* FRAMEWORK SELECTION HEADER - Show only if NOT forced via props */}
        {!forcedFramework && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Selecione o Framework</h2>
                        <p className="text-xs text-gray-500">Alterne entre os padrões para visualizar indicadores específicos.</p>
                    </div>
                    
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveFramework('GRI')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-md font-bold text-sm transition-all ${
                                activeFramework === 'GRI' 
                                ? 'bg-white text-blue-700 shadow-md ring-1 ring-black/5' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Globe className="w-4 h-4" /> GRI Standards
                        </button>
                        <button
                            onClick={() => setActiveFramework('ETHOS')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-md font-bold text-sm transition-all ${
                                activeFramework === 'ETHOS' 
                                ? 'bg-white text-purple-700 shadow-md ring-1 ring-black/5' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Sparkles className="w-4 h-4" /> Indicadores Ethos
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* CONTROLS HEADER */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setViewMode('DASHBOARD')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        viewMode === 'DASHBOARD' 
                        ? `${themeBgLight} ${themeText} font-bold` 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <LayoutGrid className="w-4 h-4" />
                    Visão Geral
                </button>
                <button 
                    onClick={() => {
                        if(!selectedIndicator) handleSelectIndicator(filteredIndicators[0] || MOCK_INDICATORS[0]);
                        else setViewMode('FORM');
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        viewMode === 'FORM' 
                        ? `${themeBgLight} ${themeText} font-bold` 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <List className="w-4 h-4" />
                    Formulário
                </button>
                {/* NEW SPREADSHEET MODE BUTTON */}
                <button 
                    onClick={() => setViewMode('SPREADSHEET')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        viewMode === 'SPREADSHEET' 
                        ? `${themeBgLight} ${themeText} font-bold` 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <Table className="w-4 h-4" />
                    Planilha de Gestão
                </button>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <span className="text-xs text-gray-500 block uppercase tracking-wide">Progresso {activeFramework}</span>
                    <span className={`text-lg font-bold ${themeText}`}>{progressPercentage}% Concluído</span>
                </div>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ${activeFramework === 'GRI' ? 'bg-blue-600' : 'bg-purple-600'}`} 
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>
        </div>

        {/* CONTENT AREA */}
        {viewMode === 'DASHBOARD' && (
            /* --- DASHBOARD VIEW (Filtered by Framework) --- */
            <div className={`bg-white rounded-xl shadow-sm border ${themeBorder} overflow-hidden animate-in fade-in duration-300`}>
                <div className={`p-6 border-b border-gray-200 flex justify-between items-center ${themeBgLight}`}>
                    <div>
                        <h2 className={`text-xl font-bold ${themeText}`}>Status da Coleta: {activeFramework}</h2>
                        <p className="text-sm text-gray-600 opacity-80">
                            {filteredIndicators.length} indicadores mapeados para este framework.
                        </p>
                    </div>
                    <button 
                        onClick={handleSendReminders}
                        className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm"
                    >
                        <Mail className="w-4 h-4" />
                        Enviar Lembretes
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Dimensão</th>
                                <th className="p-4">Indicador</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Score Qualidade</th>
                                <th className="p-4">Última Atualização</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredIndicators.map(ind => {
                                const response = allResponses[ind.code];
                                const status = response?.status || 'PENDING';
                                const score = response?.skouloudisScore;
                                
                                return (
                                    <tr key={ind.code} className="hover:bg-gray-50 group">
                                        <td className="p-4 text-gray-600 font-medium">{ind.dimension}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800">{ind.code}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-xs">{ind.title}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(status)}`}>
                                                {getStatusLabel(status)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {typeof score === 'number' ? (
                                                <div className="flex items-center gap-1">
                                                    <span className={`font-bold ${score >= 3 ? 'text-green-600' : score >= 2 ? 'text-yellow-600' : 'text-gray-400'}`}>
                                                        {score}/4
                                                    </span>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="p-4 text-gray-500">
                                            {response?.lastUpdated ? new Date(response.lastUpdated).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {status === 'PENDING' && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleNotifyResponsible(ind.code); }}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                                                        title="Notificar Responsável"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleSelectIndicator(ind)}
                                                    className={`flex items-center gap-1 font-medium text-xs px-3 py-1.5 rounded-lg border border-transparent transition-all ${
                                                        activeFramework === 'GRI' 
                                                        ? 'text-blue-600 hover:bg-blue-50 hover:border-blue-200' 
                                                        : 'text-purple-600 hover:bg-purple-50 hover:border-purple-200'
                                                    }`}
                                                >
                                                    {status === 'PENDING' ? 'Preencher' : 'Editar / Validar'}
                                                    <ChevronRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {viewMode === 'SPREADSHEET' && renderSpreadsheetView()}

        {viewMode === 'FORM' && (
            /* --- FORM VIEW --- */
            <div className="flex flex-col lg:flex-row gap-6 animate-in slide-in-from-right-4 duration-300">
                {/* Indicator List Sidebar */}
                <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-250px)]">
                    <div className={`p-4 border-b border-gray-200 ${themeBgLight}`}>
                        <h3 className={`font-bold ${themeText}`}>Indicadores {activeFramework}</h3>
                        <p className="text-xs text-gray-500 mt-1">Selecione para preencher</p>
                    </div>
                    
                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {filteredIndicators.length === 0 ? (
                            <div className="p-4 text-center text-gray-400 text-sm">
                                Nenhum indicador encontrado.
                            </div>
                        ) : (
                            filteredIndicators.map(ind => {
                                const status = allResponses[ind.code]?.status || 'PENDING';
                                return (
                                    <button 
                                        key={ind.code}
                                        onClick={() => handleSelectIndicator(ind)}
                                        className={`w-full text-left p-3 rounded-lg text-sm border transition-all ${
                                            selectedIndicator?.code === ind.code 
                                            ? `${themeBgLight} ${themeBorder} ring-1 ${activeFramework === 'GRI' ? 'ring-blue-300' : 'ring-purple-300'} shadow-sm` 
                                            : 'bg-white border-transparent hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`font-bold ${selectedIndicator?.code === ind.code ? themeText : 'text-gray-800'}`}>
                                                {ind.code}
                                            </span>
                                            {status !== 'PENDING' && (
                                                <CheckCircle2 className={`w-3 h-3 ${status === 'SUBMITTED' ? 'text-green-500' : 'text-gray-400'}`} />
                                            )}
                                        </div>
                                        <p className="text-gray-600 line-clamp-1 text-xs">{ind.title}</p>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Main Form Area */}
                <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-250px)]">
                    {selectedIndicator ? (
                        <>
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-bold text-gray-900">{selectedIndicator.code}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                            selectedIndicator.framework === 'ETHOS' 
                                            ? 'bg-purple-100 text-purple-700 border-purple-200' 
                                            : 'bg-blue-100 text-blue-700 border-blue-200'
                                        }`}>
                                            {selectedIndicator.framework || 'GRI'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(formData.status)}`}>
                                            {getStatusLabel(formData.status)}
                                        </span>
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full uppercase font-bold tracking-wide">
                                            Materialidade: {selectedIndicator.materialityScore}/5
                                        </span>
                                    </div>
                                </div>
                                <h2 className="text-xl font-medium text-gray-800 mb-4">{selectedIndicator.title}</h2>
                                <p className="text-gray-600 text-sm bg-gray-50 p-4 rounded-lg italic border border-gray-100">
                                    {selectedIndicator.description}
                                </p>

                                {formData.feedback && (
                                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                                        <strong>⚠️ Atenção - Ajustes Solicitados:</strong>
                                        <p className="mt-1">{formData.feedback}</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Como deseja responder?</h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    <button 
                                        onClick={() => handleOptionChange('ANSWER_NOW')}
                                        className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                                            responseOption === 'ANSWER_NOW' ? 'border-green-500 bg-green-50 shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-green-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className={`w-6 h-6 ${responseOption === 'ANSWER_NOW' ? 'text-green-600' : 'text-gray-400'}`} />
                                            <div>
                                                <span className="block font-bold text-gray-800">Responder Agora</span>
                                            </div>
                                        </div>
                                    </button>

                                    <button 
                                        onClick={() => handleOptionChange('DELEGATE')}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                                            responseOption === 'DELEGATE' ? 'border-yellow-500 bg-yellow-50 shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-yellow-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Send className={`w-6 h-6 ${responseOption === 'DELEGATE' ? 'text-yellow-600' : 'text-gray-400'}`} />
                                            <div>
                                                <span className="block font-bold text-gray-800">Delegar</span>
                                            </div>
                                        </div>
                                    </button>

                                    <button 
                                        onClick={() => handleOptionChange('NOT_MY_AREA')}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                                            responseOption === 'NOT_MY_AREA' ? 'border-red-500 bg-red-50 shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-red-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <XCircle className={`w-6 h-6 ${responseOption === 'NOT_MY_AREA' ? 'text-red-600' : 'text-gray-400'}`} />
                                            <div>
                                                <span className="block font-bold text-gray-800">Não é minha área</span>
                                            </div>
                                        </div>
                                    </button>

                                    <button 
                                        onClick={() => handleOptionChange('NO_DATA')}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                                            responseOption === 'NO_DATA' ? 'border-purple-500 bg-purple-50 shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-purple-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className={`w-6 h-6 ${responseOption === 'NO_DATA' ? 'text-purple-600' : 'text-gray-400'}`} />
                                            <div>
                                                <span className="block font-bold text-gray-800">Sem Dados (Gap)</span>
                                            </div>
                                        </div>
                                    </button>
                                </div>

                                <div className="border-t border-gray-100 pt-6">
                                    {renderFormContent()}
                                </div>

                                {renderScoringPanel()}

                                {/* Superior Approval Block */}
                                {(formData.status === 'SUBMITTED' && user.permissions.canApprove) && (
                                    <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl animate-in slide-in-from-bottom-2">
                                        <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-4">
                                            <ShieldCheck className="w-5 h-5"/> Área de Validação do Superior
                                        </h4>
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={handleApprove}
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow-md flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <CheckCircle2 className="w-4 h-4" /> Aprovar Indicador
                                            </button>
                                            <button 
                                                onClick={handleRequestChanges}
                                                className="flex-1 bg-white border border-red-300 text-red-700 hover:bg-red-50 py-3 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <X className="w-4 h-4" /> Solicitar Ajustes
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-between items-center">
                                 <div className="text-xs text-gray-400 font-medium flex items-center gap-2">
                                    {isAutoSaving ? (
                                        <span className="flex items-center gap-1 text-blue-500"><RefreshCw className="w-3 h-3 animate-spin"/> Salvando...</span>
                                    ) : lastSaved ? (
                                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Salvo automaticamente</span>
                                    ) : (
                                        <span>Alterações não salvas</span>
                                    )}
                                 </div>
                                 <button 
                                    onClick={handleManualSave}
                                    disabled={!responseOption || isAutoSaving || formData.status === 'APPROVED'}
                                    className={`${themeButton} text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm`}
                                 >
                                    <Save className="w-4 h-4" />
                                    {formData.status === 'APPROVED' ? 'Validado' : 'Salvar Resposta'}
                                 </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <List className="w-16 h-16 mb-4 opacity-20" />
                            <p>Selecione um indicador à esquerda para começar.</p>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

export default DataCollection;
