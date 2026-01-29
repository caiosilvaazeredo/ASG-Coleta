import React, { useState } from 'react';
import { MOCK_PILLARS, ODS_DATA } from '../constants';
import { Pillar, GRINotebook, GRIContent, Question, ODS, QuestionType } from '../types';
import { Plus, Trash2, Edit2, ChevronRight, ChevronDown, Layers, Book, FileText, HelpCircle, Save, X } from 'lucide-react';

const ODS_LIST: ODS[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17'];

const QUESTION_TYPES: { type: QuestionType, label: string }[] = [
    { type: 'TEXT_SHORT', label: 'Texto Curto' },
    { type: 'TEXT_LONG', label: 'Texto Longo' },
    { type: 'NUMBER', label: 'Numérico' },
    { type: 'DATE', label: 'Data' },
    { type: 'FILE', label: 'Upload de Arquivo' },
    { type: 'SELECT_SINGLE', label: 'Seleção Única' },
    { type: 'SELECT_MULTI', label: 'Múltipla Escolha' },
    { type: 'TABLE', label: 'Tabela' },
];

const FrameworkManagement: React.FC = () => {
    // State simulating database
    const [pillars, setPillars] = useState<Pillar[]>(MOCK_PILLARS);
    
    // Selection State
    const [selectedPillarId, setSelectedPillarId] = useState<string | null>(null);
    const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
    const [selectedContentId, setSelectedContentId] = useState<string | null>(null);

    // Form Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'PILLAR' | 'NOTEBOOK' | 'CONTENT' | 'QUESTION' | null>(null);
    const [tempData, setTempData] = useState<any>({});
    const [isEditing, setIsEditing] = useState(false);

    // Helper accessors
    const selectedPillar = pillars.find(p => p.id === selectedPillarId);
    const selectedNotebook = selectedPillar?.notebooks.find(n => n.id === selectedNotebookId);
    const selectedContent = selectedNotebook?.contents.find(c => c.id === selectedContentId);

    // --- Actions ---

    const handleAddPillar = () => {
        setModalType('PILLAR');
        setTempData({ title: '', odss: [] });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleEditPillar = (pillar: Pillar, e: React.MouseEvent) => {
        e.stopPropagation();
        setModalType('PILLAR');
        setTempData({ ...pillar });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleAddNotebook = () => {
        if (!selectedPillar) return;
        setModalType('NOTEBOOK');
        setTempData({ title: '' });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleEditNotebook = (notebook: GRINotebook, e: React.MouseEvent) => {
        e.stopPropagation();
        setModalType('NOTEBOOK');
        setTempData({ ...notebook });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleAddContent = () => {
        if (!selectedNotebook) return;
        setModalType('CONTENT');
        setTempData({ code: '', title: '', description: '' });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleEditContent = (content: GRIContent, e: React.MouseEvent) => {
        e.stopPropagation();
        setModalType('CONTENT');
        setTempData({ ...content });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleAddQuestion = () => {
        if (!selectedContent) return;
        setModalType('QUESTION');
        setTempData({ text: '', type: 'TEXT_SHORT', required: false, description: '' });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleEditQuestion = (question: Question) => {
        setModalType('QUESTION');
        setTempData({ ...question });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (isEditing && tempData.id) {
            // --- UPDATE LOGIC ---
            if (modalType === 'PILLAR') {
                setPillars(pillars.map(p => p.id === tempData.id ? { ...p, title: tempData.title, odss: tempData.odss } : p));
            }
            else if (modalType === 'NOTEBOOK' && selectedPillar) {
                const updatedPillars = pillars.map(p => 
                    p.id === selectedPillar.id 
                    ? { 
                        ...p, 
                        notebooks: p.notebooks.map(n => n.id === tempData.id ? { ...n, title: tempData.title } : n) 
                      } 
                    : p
                );
                setPillars(updatedPillars);
            }
            else if (modalType === 'CONTENT' && selectedPillar && selectedNotebook) {
                const updatedPillars = pillars.map(p => 
                    p.id === selectedPillar.id 
                    ? {
                        ...p,
                        notebooks: p.notebooks.map(n => 
                            n.id === selectedNotebook.id 
                            ? { 
                                ...n, 
                                contents: n.contents.map(c => c.id === tempData.id ? { ...c, code: tempData.code, title: tempData.title, description: tempData.description } : c)
                              }
                            : n
                        )
                    }
                    : p
                );
                setPillars(updatedPillars);
            }
            else if (modalType === 'QUESTION' && selectedPillar && selectedNotebook && selectedContent) {
                const updatedPillars = pillars.map(p => 
                    p.id === selectedPillar.id 
                    ? {
                        ...p,
                        notebooks: p.notebooks.map(n => 
                            n.id === selectedNotebook.id 
                            ? { 
                                ...n, 
                                contents: n.contents.map(c => 
                                    c.id === selectedContent.id 
                                    ? { 
                                        ...c, 
                                        questions: c.questions.map(q => q.id === tempData.id ? { ...q, text: tempData.text, type: tempData.type, required: tempData.required, description: tempData.description } : q)
                                      }
                                    : c
                                )
                            }
                            : n
                        )
                    }
                    : p
                );
                setPillars(updatedPillars);
            }
        } else {
            // --- CREATE LOGIC ---
            if (modalType === 'PILLAR') {
                const newPillar: Pillar = {
                    id: Date.now().toString(),
                    title: tempData.title,
                    odss: tempData.odss || [],
                    notebooks: []
                };
                setPillars([...pillars, newPillar]);
            } 
            else if (modalType === 'NOTEBOOK' && selectedPillar) {
                const newNotebook: GRINotebook = {
                    id: Date.now().toString(),
                    title: tempData.title,
                    contents: []
                };
                const updatedPillars = pillars.map(p => 
                    p.id === selectedPillar.id 
                    ? { ...p, notebooks: [...p.notebooks, newNotebook] } 
                    : p
                );
                setPillars(updatedPillars);
            }
            else if (modalType === 'CONTENT' && selectedPillar && selectedNotebook) {
                const newContent: GRIContent = {
                    id: Date.now().toString(),
                    code: tempData.code,
                    title: tempData.title,
                    description: tempData.description,
                    questions: []
                };
                const updatedPillars = pillars.map(p => 
                    p.id === selectedPillar.id 
                    ? {
                        ...p,
                        notebooks: p.notebooks.map(n => 
                            n.id === selectedNotebook.id 
                            ? { ...n, contents: [...n.contents, newContent] }
                            : n
                        )
                    }
                    : p
                );
                setPillars(updatedPillars);
            }
            else if (modalType === 'QUESTION' && selectedPillar && selectedNotebook && selectedContent) {
                const newQuestion: Question = {
                    id: Date.now().toString(),
                    text: tempData.text,
                    type: tempData.type,
                    required: tempData.required || false,
                    description: tempData.description
                };
                 const updatedPillars = pillars.map(p => 
                    p.id === selectedPillar.id 
                    ? {
                        ...p,
                        notebooks: p.notebooks.map(n => 
                            n.id === selectedNotebook.id 
                            ? { 
                                ...n, 
                                contents: n.contents.map(c => 
                                    c.id === selectedContent.id 
                                    ? { ...c, questions: [...c.questions, newQuestion] }
                                    : c
                                )
                            }
                            : n
                        )
                    }
                    : p
                );
                setPillars(updatedPillars);
            }
        }

        setIsModalOpen(false);
        setTempData({});
        setIsEditing(false);
    };

    const handleDelete = (id: string, type: 'PILLAR' | 'NOTEBOOK' | 'CONTENT' | 'QUESTION') => {
        if (!confirm('Tem certeza que deseja excluir este item?')) return;

        if (type === 'PILLAR') {
            setPillars(pillars.filter(p => p.id !== id));
            if (selectedPillarId === id) setSelectedPillarId(null);
        }
        else if (type === 'NOTEBOOK' && selectedPillar) {
            setPillars(pillars.map(p => 
                p.id === selectedPillar.id 
                ? { ...p, notebooks: p.notebooks.filter(n => n.id !== id) }
                : p
            ));
            if (selectedNotebookId === id) setSelectedNotebookId(null);
        }
        else if (type === 'CONTENT' && selectedPillar && selectedNotebook) {
             setPillars(pillars.map(p => 
                p.id === selectedPillar.id 
                ? {
                    ...p,
                    notebooks: p.notebooks.map(n => 
                        n.id === selectedNotebook.id 
                        ? { ...n, contents: n.contents.filter(c => c.id !== id) }
                        : n
                    )
                }
                : p
            ));
            if (selectedContentId === id) setSelectedContentId(null);
        }
        else if (type === 'QUESTION' && selectedPillar && selectedNotebook && selectedContent) {
            setPillars(pillars.map(p => 
                p.id === selectedPillar.id 
                ? {
                    ...p,
                    notebooks: p.notebooks.map(n => 
                        n.id === selectedNotebook.id 
                        ? { 
                            ...n, 
                            contents: n.contents.map(c => 
                                c.id === selectedContent.id 
                                ? { ...c, questions: c.questions.filter(q => q.id !== id) }
                                : c
                            )
                        }
                        : n
                    )
                }
                : p
            ));
        }
    };

    // --- Render Helpers ---

    return (
        <div className="flex h-full gap-6">
            {/* Left Column: Navigation Tree */}
            <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">Estrutura do Framework</h3>
                    <button onClick={handleAddPillar} className="p-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200" title="Adicionar Pilar">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-2 overflow-y-auto flex-1 space-y-2">
                    {pillars.map(pillar => (
                        <div key={pillar.id} className="border border-gray-100 rounded-lg overflow-hidden">
                            <div 
                                className={`p-3 flex items-center justify-between cursor-pointer transition-colors group ${selectedPillarId === pillar.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}
                                onClick={() => {
                                    setSelectedPillarId(pillar.id);
                                    setSelectedNotebookId(null);
                                    setSelectedContentId(null);
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <Layers className={`w-4 h-4 ${selectedPillarId === pillar.id ? 'text-blue-600' : 'text-gray-400'}`} />
                                    <span className={`font-medium text-sm ${selectedPillarId === pillar.id ? 'text-blue-800' : 'text-gray-700'}`}>{pillar.title}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {pillar.odss.length > 0 && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded">{pillar.odss.length} ODS</span>}
                                    <button onClick={(e) => handleEditPillar(pillar, e)} className="p-1 text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Editar Pilar">
                                        <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(pillar.id, 'PILLAR'); }} className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Excluir Pilar">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                    {selectedPillarId === pillar.id ? <ChevronDown className="w-4 h-4 text-gray-400"/> : <ChevronRight className="w-4 h-4 text-gray-400"/>}
                                </div>
                            </div>
                            
                            {selectedPillarId === pillar.id && (
                                <div className="bg-gray-50/50 pl-4 pr-2 py-2 space-y-1 border-t border-gray-100">
                                    {pillar.notebooks.map(notebook => (
                                        <div 
                                            key={notebook.id}
                                            className={`p-2 rounded-md flex items-center justify-between cursor-pointer text-sm group ${selectedNotebookId === notebook.id ? 'bg-white shadow-sm ring-1 ring-gray-200' : 'hover:bg-gray-100 text-gray-600'}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedNotebookId(notebook.id);
                                                setSelectedContentId(null);
                                            }}
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                <Book className="w-3 h-3 text-purple-500" />
                                                <span>{notebook.title}</span>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => handleEditNotebook(notebook, e)} className="p-1 text-gray-400 hover:text-blue-500">
                                                    <Edit2 className="w-3 h-3" />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(notebook.id, 'NOTEBOOK'); }} className="p-1 text-gray-400 hover:text-red-500">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button 
                                        onClick={handleAddNotebook}
                                        className="w-full text-left p-2 text-xs text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" /> Adicionar Caderno
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {pillars.length === 0 && <div className="text-center p-4 text-gray-400 text-sm">Nenhum pilar cadastrado.</div>}
                </div>
            </div>

            {/* Right Column: Details & Content Management */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                {!selectedPillar ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                        <Layers className="w-16 h-16 mb-4 opacity-20" />
                        <p>Selecione um Pilar para gerenciar seus cadernos e conteúdos.</p>
                    </div>
                ) : !selectedNotebook ? (
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedPillar.title}</h2>
                        <div className="flex flex-wrap gap-4 mb-6">
                            {selectedPillar.odss.map(ods => {
                                const odsData = ODS_DATA[ods];
                                return (
                                    <div key={ods} className="flex flex-col items-center gap-2 group relative">
                                        <img 
                                            src={odsData.imageUrl} 
                                            alt={odsData.title} 
                                            className="w-16 h-16 rounded-md shadow-sm hover:scale-105 transition-transform"
                                        />
                                        <span className="text-xs font-medium text-gray-600 w-24 text-center leading-tight truncate">
                                            ODS {ods}
                                        </span>
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 bg-gray-800 text-white text-xs p-2 rounded z-10 text-center shadow-lg">
                                            {odsData.title}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <h4 className="font-bold text-blue-900 mb-2">Cadernos GRI neste Pilar</h4>
                            <p className="text-sm text-blue-700 mb-4">Selecione um caderno à esquerda para ver ou adicionar conteúdos e perguntas.</p>
                            <button onClick={handleAddNotebook} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                Criar Novo Caderno GRI
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                    {selectedPillar.title} <ChevronRight className="w-3 h-3" /> {selectedNotebook.title}
                                </div>
                                <h2 className="font-bold text-gray-800">Gerenciar Conteúdos</h2>
                            </div>
                            <button onClick={handleAddContent} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
                                <Plus className="w-4 h-4" /> Novo Conteúdo
                            </button>
                        </div>

                        {/* Content List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {selectedNotebook.contents.map(content => (
                                <div key={content.id} className={`border rounded-lg transition-all ${selectedContentId === content.id ? 'border-green-500 ring-1 ring-green-100' : 'border-gray-200'}`}>
                                    <div 
                                        className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-start cursor-pointer hover:bg-gray-100 group"
                                        onClick={() => setSelectedContentId(selectedContentId === content.id ? null : content.id)}
                                    >
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-700 text-xs shadow-sm">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                                    <span className="bg-gray-800 text-white px-1.5 py-0.5 rounded text-xs">{content.code}</span>
                                                    {content.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{content.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400">{content.questions.length} perguntas</span>
                                            
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mx-2">
                                                <button onClick={(e) => handleEditContent(content, e)} className="p-1 text-gray-400 hover:text-blue-500" title="Editar Conteúdo">
                                                    <Edit2 className="w-3 h-3" />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(content.id, 'CONTENT'); }} className="p-1 text-gray-400 hover:text-red-500" title="Excluir Conteúdo">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>

                                            {selectedContentId === content.id ? <ChevronDown className="w-4 h-4 text-gray-500"/> : <ChevronRight className="w-4 h-4 text-gray-500"/>}
                                        </div>
                                    </div>

                                    {selectedContentId === content.id && (
                                        <div className="p-4 bg-white animate-in slide-in-from-top-2">
                                            <div className="mb-4 flex justify-between items-center">
                                                <h5 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Perguntas Configuradas</h5>
                                                <button onClick={handleAddQuestion} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                                    <Plus className="w-3 h-3" /> Adicionar Pergunta
                                                </button>
                                            </div>
                                            
                                            {content.questions.length === 0 ? (
                                                <div className="text-center p-4 border border-dashed border-gray-200 rounded text-gray-400 text-sm">
                                                    Nenhuma pergunta configurada.
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {content.questions.map((q, idx) => (
                                                        <div key={q.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded border border-gray-100 group">
                                                            <div className="mt-0.5 text-gray-400 text-xs font-mono">{idx + 1}.</div>
                                                            <div className="flex-1">
                                                                <p className="text-sm text-gray-800 font-medium">{q.text}</p>
                                                                <div className="flex gap-2 mt-1">
                                                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded">{QUESTION_TYPES.find(t => t.type === q.type)?.label}</span>
                                                                    {q.required && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 rounded">Obrigatória</span>}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => handleEditQuestion(q)} className="text-gray-400 hover:text-blue-500" title="Editar Pergunta">
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => handleDelete(q.id, 'QUESTION')} className="text-gray-400 hover:text-red-500" title="Excluir Pergunta">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {selectedNotebook.contents.length === 0 && (
                                <div className="text-center py-10 text-gray-400">
                                    <Book className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                    <p>Este caderno ainda não possui conteúdos.</p>
                                    <button onClick={handleAddContent} className="mt-2 text-blue-600 hover:underline">Criar primeiro conteúdo</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal for Creating/Editing Items */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center sticky top-0 bg-gray-50 z-10">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                {isEditing && <Edit2 className="w-4 h-4" />}
                                {!isEditing && <Plus className="w-4 h-4" />}
                                {isEditing ? 'Editar' : 'Novo'} 
                                {modalType === 'PILLAR' && ' Pilar'}
                                {modalType === 'NOTEBOOK' && ' Caderno GRI'}
                                {modalType === 'CONTENT' && ' Conteúdo'}
                                {modalType === 'QUESTION' && ' Pergunta'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-500 hover:text-gray-800" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {modalType === 'PILLAR' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Título do Pilar</label>
                                        <input 
                                            type="text" 
                                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                                            placeholder="Ex: Ambiental"
                                            value={tempData.title || ''}
                                            onChange={e => setTempData({...tempData, title: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">ODS Relacionados</label>
                                        <div className="grid grid-cols-4 gap-3">
                                            {ODS_LIST.map(ods => {
                                                const odsData = ODS_DATA[ods];
                                                const isSelected = (tempData.odss || []).includes(ods);
                                                return (
                                                    <button 
                                                        key={ods}
                                                        onClick={() => {
                                                            const current = tempData.odss || [];
                                                            setTempData({
                                                                ...tempData, 
                                                                odss: current.includes(ods) 
                                                                    ? current.filter((o: string) => o !== ods) 
                                                                    : [...current, ods]
                                                            });
                                                        }}
                                                        className={`relative flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all ${
                                                            isSelected 
                                                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500 ring-offset-1' 
                                                            : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                        }`}
                                                        title={odsData.title}
                                                    >
                                                        <img 
                                                            src={odsData.imageUrl} 
                                                            alt={`ODS ${ods}`} 
                                                            className={`w-10 h-10 rounded ${!isSelected && 'opacity-80 grayscale-[0.5]'}`}
                                                        />
                                                        <span className="text-[10px] font-bold text-gray-600">ODS {ods}</span>
                                                        {isSelected && (
                                                            <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                            {modalType === 'NOTEBOOK' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Título do Caderno</label>
                                    <input 
                                        type="text" 
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                                        placeholder="Ex: GRI 300: Ambiental"
                                        value={tempData.title || ''}
                                        onChange={e => setTempData({...tempData, title: e.target.value})}
                                    />
                                </div>
                            )}
                            {modalType === 'CONTENT' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Código GRI</label>
                                        <input 
                                            type="text" 
                                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                                            placeholder="Ex: 302-1"
                                            value={tempData.code || ''}
                                            onChange={e => setTempData({...tempData, code: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Título do Conteúdo</label>
                                        <input 
                                            type="text" 
                                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                                            placeholder="Ex: Consumo de energia"
                                            value={tempData.title || ''}
                                            onChange={e => setTempData({...tempData, title: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                        <textarea 
                                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                                            rows={3}
                                            value={tempData.description || ''}
                                            onChange={e => setTempData({...tempData, description: e.target.value})}
                                        />
                                    </div>
                                </>
                            )}
                            {modalType === 'QUESTION' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Texto da Pergunta</label>
                                        <input 
                                            type="text" 
                                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                                            placeholder="Ex: Qual foi o consumo total?"
                                            value={tempData.text || ''}
                                            onChange={e => setTempData({...tempData, text: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Resposta</label>
                                        <select 
                                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={tempData.type || 'TEXT_SHORT'}
                                            onChange={e => setTempData({...tempData, type: e.target.value})}
                                        >
                                            {QUESTION_TYPES.map(t => (
                                                <option key={t.type} value={t.type}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            id="required"
                                            checked={tempData.required || false}
                                            onChange={e => setTempData({...tempData, required: e.target.checked})}
                                        />
                                        <label htmlFor="required" className="text-sm text-gray-700">Obrigatória</label>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2 sticky bottom-0 bg-gray-50 z-10">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm">Cancelar</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2">
                                <Save className="w-4 h-4" /> {isEditing ? 'Atualizar' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FrameworkManagement;