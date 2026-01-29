import React, { useState, useEffect, useRef } from 'react';
import { MOCK_RESPONDENTS, DEPARTMENTS } from '../constants';
import { Respondent } from '../types';
import { Users, UserPlus, Search, Filter, MoreHorizontal, CheckCircle2, Clock, Send, Eye, Edit, Power, RefreshCw, MessageSquare, Ban, X, Save, Briefcase, Mail } from 'lucide-react';

const RespondentManagement: React.FC = () => {
    const [respondents, setRespondents] = useState<Respondent[]>(MOCK_RESPONDENTS);
    const [filterDepartment, setFilterDepartment] = useState<string>('ALL');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Dropdown State
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Modal State
    const [activeModal, setActiveModal] = useState<'DETAILS' | 'MESSAGE' | 'EDIT' | null>(null);
    const [selectedRespondent, setSelectedRespondent] = useState<Respondent | null>(null);
    
    // Form States
    const [editForm, setEditForm] = useState<Partial<Respondent>>({});
    const [messageText, setMessageText] = useState('');

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredRespondents = respondents.filter(r => {
        const matchesDept = filterDepartment === 'ALL' || r.department === filterDepartment;
        const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
        const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesDept && matchesStatus && matchesSearch;
    });

    const getStatusStyle = (status: Respondent['status']) => {
        switch(status) {
            case 'ACTIVE': return 'bg-green-100 text-green-700 border-green-200';
            case 'PENDING': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'INACTIVE': return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    // --- Actions Logic ---

    const handleSendReminder = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        alert(`Lembrete enviado para o respondente ${id}`);
    };

    const handleInvite = () => {
        const name = prompt("Nome do novo usuário:");
        const email = prompt("Email do novo usuário:");
        if (name && email) {
            const newRespondent: Respondent = {
                id: Math.random().toString(),
                name,
                email,
                role: 'Novo Usuário',
                department: 'Não definido',
                status: 'PENDING',
                lastAccess: 'Nunca',
                indicatorsAssigned: 0,
                indicatorsCompleted: 0,
                avatarInitials: name.substring(0,2).toUpperCase()
            };
            setRespondents([...respondents, newRespondent]);
            alert(`Convite enviado para ${email}.`);
        }
    };

    const toggleStatus = (id: string) => {
        setRespondents(prev => prev.map(r => {
            if (r.id === id) {
                const newStatus = r.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
                return { ...r, status: newStatus };
            }
            return r;
        }));
        setActiveDropdownId(null);
    };

    const handleMenuAction = (action: 'DETAILS' | 'MESSAGE' | 'EDIT' | 'RESEND_INVITE', respondent: Respondent) => {
        setActiveDropdownId(null);
        setSelectedRespondent(respondent);

        if (action === 'RESEND_INVITE') {
            alert(`Convite reenviado com sucesso para ${respondent.email}`);
            return;
        }

        if (action === 'EDIT') {
            setEditForm(respondent);
        }
        
        if (action === 'MESSAGE') {
            setMessageText('');
        }

        setActiveModal(action);
    };

    const saveEdit = () => {
        if (!selectedRespondent || !editForm) return;
        setRespondents(prev => prev.map(r => r.id === selectedRespondent.id ? { ...r, ...editForm } : r));
        setActiveModal(null);
        setSelectedRespondent(null);
    };

    const sendMessage = () => {
        if (!messageText) return;
        alert(`Mensagem enviada para ${selectedRespondent?.email}: "${messageText}"`);
        setActiveModal(null);
        setSelectedRespondent(null);
    };

    const closeModal = () => {
        setActiveModal(null);
        setSelectedRespondent(null);
    };

    // --- Modal Renders ---

    const renderDetailsModal = () => (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-blue-500" /> Detalhes do Respondente
                    </h3>
                    <button onClick={closeModal}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
                </div>
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                            {selectedRespondent?.avatarInitials}
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-900">{selectedRespondent?.name}</h4>
                            <p className="text-gray-500">{selectedRespondent?.email}</p>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold border ${getStatusStyle(selectedRespondent?.status || 'INACTIVE')}`}>
                                {selectedRespondent?.status}
                            </span>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <span className="text-xs text-gray-500 block mb-1">Departamento</span>
                                <span className="font-medium text-gray-800 flex items-center gap-1"><Briefcase className="w-3 h-3"/> {selectedRespondent?.department}</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <span className="text-xs text-gray-500 block mb-1">Função</span>
                                <span className="font-medium text-gray-800">{selectedRespondent?.role}</span>
                            </div>
                        </div>

                        <div>
                            <h5 className="font-bold text-sm text-gray-700 mb-2">Resumo de Atividades</h5>
                            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-1">
                                <div 
                                    className="h-full bg-blue-500 transition-all" 
                                    style={{ width: `${selectedRespondent && (selectedRespondent.indicatorsCompleted / selectedRespondent.indicatorsAssigned * 100)}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{selectedRespondent?.indicatorsCompleted} Concluídos</span>
                                <span>Total: {selectedRespondent?.indicatorsAssigned}</span>
                            </div>
                        </div>

                        {/* Mock List of Indicators */}
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-3 py-2 text-xs font-bold text-gray-500 border-b">INDICADORES ATRIBUÍDOS (Exemplo)</div>
                            <ul className="text-sm divide-y">
                                <li className="px-3 py-2 flex justify-between">
                                    <span>GRI 302-1: Energia</span>
                                    <span className="text-green-600 font-medium">Concluído</span>
                                </li>
                                <li className="px-3 py-2 flex justify-between">
                                    <span>GRI 305-1: Emissões</span>
                                    <span className="text-orange-500 font-medium">Pendente</span>
                                </li>
                                <li className="px-3 py-2 flex justify-between">
                                    <span>GRI 401-1: Emprego</span>
                                    <span className="text-green-600 font-medium">Concluído</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end">
                    <button onClick={closeModal} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-100">Fechar</button>
                </div>
            </div>
        </div>
    );

    const renderEditModal = () => (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Edit className="w-4 h-4 text-gray-500" /> Editar Dados
                    </h3>
                    <button onClick={closeModal}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                        <input 
                            type="text" 
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={editForm.name || ''}
                            onChange={e => setEditForm({...editForm, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Corporativo</label>
                        <input 
                            type="email" 
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={editForm.email || ''}
                            onChange={e => setEditForm({...editForm, email: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                            <select 
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                value={editForm.department || ''}
                                onChange={e => setEditForm({...editForm, department: e.target.value})}
                            >
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Função / Cargo</label>
                            <input 
                                type="text" 
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={editForm.role || ''}
                                onChange={e => setEditForm({...editForm, role: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
                    <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm">Cancelar</button>
                    <button onClick={saveEdit} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2">
                        <Save className="w-4 h-4" /> Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );

    const renderMessageModal = () => (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-500" /> Nova Mensagem
                    </h3>
                    <button onClick={closeModal}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                            {selectedRespondent?.avatarInitials}
                        </div>
                        <div>
                            <span className="text-xs text-blue-600 font-bold block">Para:</span>
                            <span className="text-sm font-medium text-blue-900">{selectedRespondent?.name}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                        <textarea 
                            rows={4}
                            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            placeholder="Escreva sua mensagem aqui..."
                            value={messageText}
                            onChange={e => setMessageText(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
                    <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm">Cancelar</button>
                    <button onClick={sendMessage} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2">
                        <Send className="w-4 h-4" /> Enviar
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 min-h-[500px]" onClick={() => setActiveDropdownId(null)}>
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Gestão de Respondentes</h2>
                    <p className="text-gray-500">Administre o acesso e o progresso dos colaboradores responsáveis pela coleta.</p>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); handleInvite(); }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                    <UserPlus className="w-4 h-4" />
                    Convidar Novo Usuário
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Respondentes</p>
                        <h3 className="text-2xl font-bold text-gray-900">{respondents.length}</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                        <Users className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Tarefas Concluídas</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {respondents.reduce((acc, curr) => acc + curr.indicatorsCompleted, 0)}
                            <span className="text-sm text-gray-400 font-normal ml-1">
                                / {respondents.reduce((acc, curr) => acc + curr.indicatorsAssigned, 0)}
                            </span>
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Convites Pendentes</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {respondents.filter(r => r.status === 'PENDING').length}
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
                {/* Filters */}
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-4 items-center justify-between" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-4 flex-1">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Buscar por nome ou email..." 
                                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select 
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={filterDepartment}
                            onChange={e => setFilterDepartment(e.target.value)}
                        >
                            <option value="ALL">Todos os Departamentos</option>
                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select 
                             className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                             value={filterStatus}
                             onChange={e => setFilterStatus(e.target.value)}
                        >
                            <option value="ALL">Todos os Status</option>
                            <option value="ACTIVE">Ativo</option>
                            <option value="PENDING">Pendente</option>
                            <option value="INACTIVE">Inativo</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Filter className="w-4 h-4" />
                        <span>{filteredRespondents.length} resultados</span>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-visible pb-12">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Respondente</th>
                                <th className="px-6 py-4">Departamento / Função</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Progresso de Atribuições</th>
                                <th className="px-6 py-4">Último Acesso</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredRespondents.map(respondent => {
                                const progress = respondent.indicatorsAssigned > 0 
                                    ? Math.round((respondent.indicatorsCompleted / respondent.indicatorsAssigned) * 100) 
                                    : 0;
                                const isActive = respondent.status === 'ACTIVE';

                                return (
                                    <tr key={respondent.id} className="hover:bg-gray-50 group transition-colors relative">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                                                    {respondent.avatarInitials}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{respondent.name}</div>
                                                    <div className="text-xs text-gray-500">{respondent.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-800">{respondent.department}</div>
                                            <div className="text-xs text-gray-500">{respondent.role}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusStyle(respondent.status)}`}>
                                                {respondent.status === 'ACTIVE' ? 'Ativo' : respondent.status === 'PENDING' ? 'Pendente' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 w-48">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-medium text-gray-700">{progress}%</span>
                                                <span className="text-xs text-gray-400">{respondent.indicatorsCompleted}/{respondent.indicatorsAssigned}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        progress === 100 ? 'bg-green-500' : 
                                                        progress > 50 ? 'bg-blue-500' : 'bg-orange-500'
                                                    }`} 
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {respondent.lastAccess}
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={(e) => handleSendReminder(respondent.id, e)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Enviar Lembrete"
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>
                                                
                                                <div className="relative">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveDropdownId(activeDropdownId === respondent.id ? null : respondent.id);
                                                        }}
                                                        className={`p-2 rounded-lg transition-colors ${activeDropdownId === respondent.id ? 'bg-gray-200 text-gray-800' : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'}`}
                                                        title="Mais Opções"
                                                    >
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>
                                                    
                                                    {/* Dropdown Menu */}
                                                    {activeDropdownId === respondent.id && (
                                                        <div 
                                                            ref={dropdownRef}
                                                            className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right text-left"
                                                            onClick={e => e.stopPropagation()}
                                                        >
                                                            <div className="py-1">
                                                                <button 
                                                                    onClick={() => handleMenuAction('DETAILS', respondent)}
                                                                    className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                                >
                                                                    <Eye className="w-4 h-4 text-blue-500" /> Ver Atribuições
                                                                </button>
                                                                
                                                                <button 
                                                                    onClick={() => handleMenuAction('MESSAGE', respondent)}
                                                                    className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                                >
                                                                    <MessageSquare className="w-4 h-4 text-gray-500" /> Enviar Mensagem
                                                                </button>
                                                                
                                                                {respondent.status === 'PENDING' && (
                                                                    <button 
                                                                        onClick={() => handleMenuAction('RESEND_INVITE', respondent)}
                                                                        className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                                    >
                                                                        <RefreshCw className="w-4 h-4 text-orange-500" /> Reenviar Convite
                                                                    </button>
                                                                )}

                                                                <button 
                                                                    onClick={() => handleMenuAction('EDIT', respondent)}
                                                                    className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                                >
                                                                    <Edit className="w-4 h-4 text-gray-500" /> Editar Dados
                                                                </button>

                                                                <div className="h-px bg-gray-100 my-1"></div>
                                                                
                                                                <button 
                                                                    onClick={() => toggleStatus(respondent.id)}
                                                                    className={`w-full px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors ${isActive ? 'text-red-600' : 'text-green-600'}`}
                                                                >
                                                                    {isActive ? <Ban className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                                                    {isActive ? 'Desativar Acesso' : 'Reativar Acesso'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredRespondents.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Nenhum respondente encontrado com os filtros atuais.</p>
                    </div>
                )}
            </div>

            {/* Modals */}
            {activeModal === 'DETAILS' && renderDetailsModal()}
            {activeModal === 'EDIT' && renderEditModal()}
            {activeModal === 'MESSAGE' && renderMessageModal()}
        </div>
    );
};

export default RespondentManagement;