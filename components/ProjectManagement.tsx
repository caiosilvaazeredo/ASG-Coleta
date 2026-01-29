import React, { useState } from 'react';
import { MOCK_PROJECTS, ODS_DATA, MOCK_USERS } from '../constants';
import { ImpactProject, UserProfile } from '../types';
import { Users, MapPin, PiggyBank, BarChart3, Target, FileText, Ticket, Plus, ArrowLeft, Printer, Edit, CheckCircle2, AlertTriangle, Send, X, ShieldCheck, UserPlus, Save } from 'lucide-react';

interface ProjectManagementProps {
    user: UserProfile;
}

const ProjectManagement: React.FC<ProjectManagementProps> = ({ user }) => {
    const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL' | 'EDIT'>('LIST');
    const [projects, setProjects] = useState<ImpactProject[]>(MOCK_PROJECTS);
    const [selectedProject, setSelectedProject] = useState<ImpactProject | null>(null);
    const [editForm, setEditForm] = useState<Partial<ImpactProject>>({});

    // --- Handlers ---
    const handleSelectProject = (project: ImpactProject) => {
        setSelectedProject(project);
        setViewMode('DETAIL');
    };

    const handleNewProject = () => {
        const newProj: ImpactProject = {
            id: Date.now().toString(),
            title: 'NOVO PROJETO',
            subtitle: 'INSTITUIÇÃO',
            institutionId: 'SENAC',
            status: 'DRAFT',
            odss: [],
            pillars: [],
            mainGoal: '',
            description: '',
            context: '',
            challenges: '',
            responsibleName: user.name,
            responsibleEmail: user.email,
            responsibleAvatar: `https://ui-avatars.com/api/?name=${user.name}&background=random`,
            beneficiariesText: '0 beneficiários',
            locationText: '',
            accessType: 'Acesso gratuito',
            investmentAmount: 'R$ 0,00',
            fundingSource: '',
            metrics: []
        };
        setSelectedProject(newProj);
        setEditForm(newProj);
        setViewMode('EDIT');
    };

    const handleEditProject = () => {
        if (!selectedProject) return;
        setEditForm({ ...selectedProject });
        setViewMode('EDIT');
    };

    const handleSaveDraft = () => {
        if (!editForm.id) return;
        
        // If it's a new project not in list, add it
        if (!projects.find(p => p.id === editForm.id)) {
            setProjects([...projects, editForm as ImpactProject]);
        } else {
            // Update existing
            setProjects(projects.map(p => p.id === editForm.id ? { ...p, ...editForm } as ImpactProject : p));
        }
        
        setSelectedProject(editForm as ImpactProject);
        setViewMode('DETAIL');
    };

    // --- Workflow Handlers ---
    const handleSubmitForApproval = () => {
        if (!selectedProject) return;
        const updated = { ...selectedProject, status: 'SUBMITTED' as const };
        updateProjectStatus(updated);
        alert('Projeto enviado para aprovação do superior!');
    };

    const handleApprove = () => {
        if (!selectedProject) return;
        const updated = { ...selectedProject, status: 'APPROVED' as const, feedback: undefined };
        updateProjectStatus(updated);
        alert('Projeto aprovado e publicado!');
    };

    const handleRequestChanges = () => {
        if (!selectedProject) return;
        const feedback = prompt("Informe os ajustes necessários:");
        if (feedback) {
            const updated = { ...selectedProject, status: 'CHANGES_REQUESTED' as const, feedback };
            updateProjectStatus(updated);
        }
    };

    const handleDelegate = () => {
        const email = prompt("Digite o email do novo responsável:");
        if (email && selectedProject) {
            // In a real app, look up user details
            const updated = { ...selectedProject, responsibleEmail: email, responsibleName: 'Novo Responsável' };
            updateProjectStatus(updated);
            alert(`Projeto delegado para ${email}`);
        }
    };

    const updateProjectStatus = (updated: ImpactProject) => {
        setProjects(projects.map(p => p.id === updated.id ? updated : p));
        setSelectedProject(updated);
    };

    // --- Helpers ---
    const getStatusColor = (status: ImpactProject['status']) => {
        switch(status) {
            case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
            case 'SUBMITTED': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'DRAFT': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'CHANGES_REQUESTED': return 'bg-red-100 text-red-800 border-red-200';
        }
    };

    const getStatusLabel = (status: ImpactProject['status']) => {
        switch(status) {
            case 'APPROVED': return 'Aprovado & Publicado';
            case 'SUBMITTED': return 'Aguardando Validação';
            case 'DRAFT': return 'Rascunho';
            case 'CHANGES_REQUESTED': return 'Ajustes Solicitados';
        }
    };

    // --- RENDERERS ---

    const renderEditForm = () => (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 max-w-4xl mx-auto animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Edit className="w-5 h-5 text-blue-600" /> Editando Projeto
                </h2>
                <div className="flex gap-2">
                    <button onClick={() => setViewMode('DETAIL')} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
                    <button onClick={handleSaveDraft} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-bold flex items-center gap-2">
                        <Save className="w-4 h-4" /> Salvar Rascunho
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Título do Projeto</label>
                    <input 
                        className="w-full border p-2 rounded-lg" 
                        value={editForm.title} 
                        onChange={e => setEditForm({...editForm, title: e.target.value})}
                    />
                </div>
                
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Objetivo Principal</label>
                    <textarea 
                        className="w-full border p-2 rounded-lg" 
                        rows={3}
                        value={editForm.mainGoal} 
                        onChange={e => setEditForm({...editForm, mainGoal: e.target.value})}
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Descrição Detalhada</label>
                    <textarea 
                        className="w-full border p-2 rounded-lg" 
                        rows={5}
                        value={editForm.description} 
                        onChange={e => setEditForm({...editForm, description: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Público Impactado (Texto)</label>
                    <input 
                        className="w-full border p-2 rounded-lg" 
                        value={editForm.beneficiariesText} 
                        onChange={e => setEditForm({...editForm, beneficiariesText: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Investimento Total</label>
                    <input 
                        className="w-full border p-2 rounded-lg" 
                        value={editForm.investmentAmount} 
                        onChange={e => setEditForm({...editForm, investmentAmount: e.target.value})}
                    />
                </div>
                 
                {/* Simplified Metrics Editor */}
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Métricas (Uma por linha)</label>
                    <textarea 
                        className="w-full border p-2 rounded-lg" 
                        rows={3}
                        value={editForm.metrics?.join('\n')} 
                        onChange={e => setEditForm({...editForm, metrics: e.target.value.split('\n')})}
                    />
                </div>
            </div>
        </div>
    );

    const renderProjectCard = (project: ImpactProject) => {
        const isManager = user.role === 'ASG_MANAGER' || user.role === 'PRESIDENT';
        const canEdit = project.status === 'DRAFT' || project.status === 'CHANGES_REQUESTED' || (isManager && project.status !== 'APPROVED');

        return (
            <div className="space-y-6">
                {/* Workflow Toolbar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap justify-between items-center gap-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold border flex items-center gap-2 ${getStatusColor(project.status)}`}>
                            {project.status === 'APPROVED' && <CheckCircle2 className="w-4 h-4" />}
                            {project.status === 'CHANGES_REQUESTED' && <AlertTriangle className="w-4 h-4" />}
                            {getStatusLabel(project.status)}
                        </span>
                        {project.feedback && (
                            <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                                <strong>Feedback:</strong> {project.feedback}
                            </span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {canEdit && (
                            <button onClick={handleEditProject} className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                                <Edit className="w-4 h-4" /> Editar
                            </button>
                        )}
                        
                        {(project.status === 'DRAFT' || project.status === 'CHANGES_REQUESTED') && (
                            <>
                                <button onClick={handleDelegate} className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                                    <UserPlus className="w-4 h-4" /> Delegar
                                </button>
                                <button onClick={handleSubmitForApproval} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition-colors">
                                    <Send className="w-4 h-4" /> Enviar para Aprovação
                                </button>
                            </>
                        )}

                        {project.status === 'SUBMITTED' && isManager && (
                            <>
                                <button onClick={handleRequestChanges} className="flex items-center gap-2 bg-white border border-red-200 text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg font-bold shadow-sm transition-colors">
                                    <X className="w-4 h-4" /> Solicitar Ajustes
                                </button>
                                <button onClick={handleApprove} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition-colors">
                                    <ShieldCheck className="w-4 h-4" /> Aprovar Projeto
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Actual Card Content */}
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-6xl mx-auto border border-gray-200 print:shadow-none print:border-none">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6 border-b-2 border-cyan-400 pb-6">
                        <div className="flex items-start gap-4">
                            {project.odss.map(ods => (
                                <div key={ods} className="flex flex-col w-24">
                                    <div className="h-24 w-24 relative mb-1">
                                        <img 
                                            src={ODS_DATA[ods].imageUrl} 
                                            alt={`ODS ${ods}`} 
                                            className="w-full h-full object-contain rounded-md shadow-sm"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex-1 text-center md:text-left pt-2">
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight uppercase mb-1">{project.title}</h1>
                            <h2 className="text-xl font-bold text-slate-600 uppercase tracking-widest">{project.subtitle}</h2>
                            
                            <div className="mt-6">
                                <h3 className="text-sm font-bold text-slate-700 uppercase mb-2">Pilares ASG</h3>
                                {project.pillars.map(pillar => (
                                    <div key={pillar} className="text-slate-600 font-medium text-lg leading-tight uppercase">
                                        {pillar}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col items-end">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 w-72">
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                                    <img src={project.responsibleAvatar} alt={project.responsibleName} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Responsável pelas informações:</p>
                                    <p className="text-sm text-blue-600 underline font-medium cursor-pointer">{project.responsibleEmail}</p>
                                </div>
                            </div>
                            <div className="mt-4 border-2 border-slate-800 rounded-lg p-2 text-center w-32">
                                <div className="flex justify-center mb-1 gap-1">
                                    <div className="w-3 h-4 border border-slate-800 rounded-sm"></div>
                                    <div className="w-3 h-4 border border-slate-800 rounded-sm"></div>
                                    <div className="w-3 h-4 border border-slate-800 rounded-sm"></div>
                                    <div className="w-3 h-4 border border-slate-800 rounded-sm"></div>
                                </div>
                                <p className="text-[10px] font-bold uppercase leading-none">Plano de Monitoramento</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Left Column: Description */}
                        <div className="flex-1 space-y-6 text-slate-700 text-justify leading-relaxed">
                            <div className="flex gap-4">
                                <Target className="w-8 h-8 text-red-700 flex-shrink-0 mt-1" />
                                <p>{project.mainGoal}</p>
                            </div>

                            <div className="flex gap-4">
                                <FileText className="w-8 h-8 text-blue-700 flex-shrink-0 mt-1" />
                                <div className="space-y-4">
                                    <p>{project.description}</p>
                                    <p>{project.context}</p>
                                    <p>{project.challenges}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Stats Card */}
                        <div className="lg:w-[450px] flex-shrink-0">
                            <div className="border-4 border-cyan-300 rounded-[40px] p-8 h-full bg-white relative">
                                <div className="space-y-8">
                                    {/* Beneficiaries */}
                                    <div className="flex gap-4">
                                        <div className="flex text-slate-600 gap-0.5 mt-1">
                                            <Users className="w-5 h-5 fill-current" />
                                            <Users className="w-5 h-5 fill-current" />
                                            <Users className="w-5 h-5 fill-current" />
                                            <Users className="w-5 h-5 fill-current" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-slate-700 text-sm leading-relaxed">
                                                <span className="font-bold text-lg text-slate-900">{project.beneficiariesText.split(' ')[0]} </span>
                                                {project.beneficiariesText.substring(project.beneficiariesText.indexOf(' '))}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="flex gap-4 items-center">
                                        <MapPin className="w-6 h-6 text-red-600 fill-current" />
                                        <p className="text-slate-700 text-sm">{project.locationText}</p>
                                    </div>

                                    {/* Access */}
                                    <div className="flex gap-4 items-center">
                                        <Ticket className="w-6 h-6 text-slate-500" />
                                        <p className="text-slate-700 text-sm">{project.accessType}</p>
                                    </div>

                                    {/* Cost / Investment */}
                                    <div className="flex gap-4">
                                        <PiggyBank className="w-8 h-8 text-pink-300 fill-pink-100" />
                                        <div className="flex-1">
                                            <p className="text-slate-700 font-bold text-lg">{project.investmentAmount}</p>
                                            <p className="text-slate-600 text-sm">{project.fundingSource}</p>
                                        </div>
                                    </div>

                                    {/* Metrics */}
                                    <div className="flex gap-4">
                                        <BarChart3 className="w-8 h-8 text-blue-400 fill-blue-100 mt-1" />
                                        <div className="flex-1 space-y-2">
                                            {project.metrics.map((metric, idx) => (
                                                <p key={idx} className="text-slate-700 text-sm leading-snug">
                                                    {metric}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Projetos de Impacto</h2>
                    <p className="text-gray-500">Monitoramento e evidência de projetos sociais e ambientais.</p>
                </div>
                {viewMode === 'LIST' ? (
                    <button 
                        onClick={handleNewProject}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Novo Projeto
                    </button>
                ) : (
                    <div className="flex gap-2">
                         <button 
                            onClick={() => window.print()}
                            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            <Printer className="w-4 h-4" /> Imprimir
                        </button>
                        <button 
                            onClick={() => setViewMode('LIST')}
                            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Voltar
                        </button>
                    </div>
                )}
            </div>

            {viewMode === 'LIST' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                    {projects.map(project => (
                        <div 
                            key={project.id} 
                            onClick={() => handleSelectProject(project)}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all hover:border-blue-300 group relative"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex -space-x-2">
                                    {project.odss.map(ods => (
                                        <img 
                                            key={ods}
                                            src={ODS_DATA[ods].imageUrl} 
                                            alt={`ODS ${ods}`} 
                                            className="w-8 h-8 rounded border-2 border-white shadow-sm"
                                        />
                                    ))}
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${getStatusColor(project.status)}`}>
                                    {getStatusLabel(project.status)}
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-blue-600 transition-colors truncate">{project.title}</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-4 truncate">{project.subtitle}</p>
                            
                            <p className="text-sm text-gray-600 line-clamp-3 mb-4 h-16">
                                {project.mainGoal || 'Sem descrição definida.'}
                            </p>

                            <div className="pt-4 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> Niterói
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3" /> {project.beneficiariesText?.split(' ')[0] || '0'} Beneficiários
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Placeholder for new project */}
                    <button 
                        onClick={handleNewProject}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-blue-300 transition-all min-h-[200px]"
                    >
                        <Plus className="w-10 h-10 mb-2 opacity-50" />
                        <span className="font-medium">Cadastrar Novo Projeto</span>
                    </button>
                </div>
            )}
            
            {viewMode === 'DETAIL' && selectedProject && renderProjectCard(selectedProject)}
            {viewMode === 'EDIT' && renderEditForm()}
        </div>
    );
};

export default ProjectManagement;
