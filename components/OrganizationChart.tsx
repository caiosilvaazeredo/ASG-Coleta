import React, { useState } from 'react';
import { HierarchyNode, HierarchyLevel, UserProfile } from '../types';
import { MOCK_HIERARCHY, MOCK_USERS } from '../constants';
import { User, Mail, ChevronDown, Building2, Layers, Briefcase, Minus, Edit3, Plus, Trash2, Save, X, Check, Users, Briefcase as BriefcaseIcon, UserCircle } from 'lucide-react';

// --- Recursive Helper Functions ---

const updateNodeInTree = (root: HierarchyNode, nodeId: string, newData: Partial<HierarchyNode>): HierarchyNode => {
    if (root.id === nodeId) {
        return { ...root, ...newData };
    }
    if (root.children) {
        return {
            ...root,
            children: root.children.map(child => updateNodeInTree(child, nodeId, newData))
        };
    }
    return root;
};

const addNodeToTree = (root: HierarchyNode, parentId: string, newNode: HierarchyNode): HierarchyNode => {
    if (root.id === parentId) {
        return {
            ...root,
            children: [...(root.children || []), newNode]
        };
    }
    if (root.children) {
        return {
            ...root,
            children: root.children.map(child => addNodeToTree(child, parentId, newNode))
        };
    }
    return root;
};

const deleteNodeFromTree = (root: HierarchyNode, nodeId: string): HierarchyNode | null => {
    if (root.id === nodeId) return null; // Should not happen for root usually, but handled upstream
    if (root.children) {
        return {
            ...root,
            children: root.children
                .map(child => deleteNodeFromTree(child, nodeId))
                .filter((child): child is HierarchyNode => child !== null)
        };
    }
    return root;
};

// --- Components ---

const HierarchyNodeCard: React.FC<{ 
    node: HierarchyNode; 
    hasChildren: boolean; 
    expanded: boolean; 
    isEditingMode: boolean;
    onToggle: () => void;
    onAdd: () => void;
    onEdit: () => void;
    onDelete: () => void;
}> = ({ node, hasChildren, expanded, isEditingMode, onToggle, onAdd, onEdit, onDelete }) => {
    
    // DIFFERENT RENDER FOR PERSON NODES
    if (node.type === 'PERSON') {
        return (
            <div className="flex flex-col items-center z-10 relative group my-2">
                 <div 
                    className={`
                        relative w-56 rounded-full shadow-sm border transition-all duration-200 bg-white flex items-center p-2 pr-4 gap-3
                        ${isEditingMode ? 'ring-2 ring-offset-1 ring-transparent hover:ring-green-400 border-green-200' : 'border-gray-200'}
                    `}
                >
                     {/* Actions Overlay (Edit Mode) */}
                    {isEditingMode && (
                        <div className="absolute -right-10 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={onEdit} className="p-1.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 shadow-sm" title="Editar">
                                <Edit3 className="w-3 h-3" />
                            </button>
                            <button onClick={onDelete} className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 shadow-sm" title="Excluir">
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                    
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold border border-blue-100 shadow-inner">
                        {node.avatarUrl ? <img src={node.avatarUrl} alt="" className="w-full h-full rounded-full" /> : <User className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-800 truncate">{node.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{node.role || 'Colaborador'}</p>
                    </div>
                </div>
                {/* Person nodes typically don't have children in this view, but if they did... */}
            </div>
        );
    }

    // SECTOR NODES RENDER
    const getLevelStyles = (level: HierarchyLevel) => {
        switch (level) {
            case 'PRESIDENCY':
                return { border: 'border-slate-800', bg: 'bg-slate-800', text: 'text-white', icon: <Building2 className="w-5 h-5" />, label: 'Presidência' };
            case 'EXECUTIVE_DIRECTION':
                return { border: 'border-blue-600', bg: 'bg-blue-600', text: 'text-white', icon: <Layers className="w-5 h-5" />, label: 'Direção Executiva' };
            case 'MANAGEMENT':
                return { border: 'border-orange-500', bg: 'bg-white', text: 'text-gray-800', accent: 'text-orange-500', icon: <Briefcase className="w-5 h-5 text-orange-500" />, label: 'Gerência' };
            case 'OPERATIONAL_SECTOR':
                return { border: 'border-gray-300', bg: 'bg-gray-50', text: 'text-gray-600', accent: 'text-gray-500', icon: <Minus className="w-5 h-5 text-gray-400" />, label: 'Setor' };
            default:
                return { border: 'border-gray-200', bg: 'bg-white', text: 'text-gray-800', icon: null, label: '' };
        }
    };

    const styles = getLevelStyles(node.level);
    const isDark = ['PRESIDENCY', 'EXECUTIVE_DIRECTION'].includes(node.level);

    return (
        <div className="flex flex-col items-center z-10 relative group">
            <div 
                className={`
                    relative w-64 rounded-xl shadow-md border-t-4 transition-all duration-200
                    ${styles.border} ${styles.bg} 
                    ${isEditingMode ? 'ring-2 ring-offset-2 ring-transparent hover:ring-blue-400' : ''}
                `}
            >
                {/* Actions Overlay (Edit Mode) */}
                {isEditingMode && (
                    <div className="absolute -right-12 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={onEdit} className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 shadow-sm" title="Editar">
                            <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={onAdd} className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 shadow-sm" title="Adicionar Filho">
                            <Plus className="w-4 h-4" />
                        </button>
                        {node.level !== 'PRESIDENCY' && (
                            <button onClick={onDelete} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 shadow-sm" title="Excluir">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}

                <div className="p-4 cursor-pointer" onClick={onToggle}>
                    {/* Badge Level */}
                    <div className={`
                        absolute -top-3 left-1/2 transform -translate-x-1/2 
                        text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm
                        ${isDark ? 'bg-white text-slate-800' : 'bg-slate-100 text-slate-500 border border-slate-200'}
                    `}>
                        {styles.label}
                    </div>

                    <div className="mt-2 flex flex-col items-center text-center">
                        <div className={`mb-2 ${isDark ? 'text-white' : styles.accent}`}>
                            {styles.icon}
                        </div>
                        <h4 className={`font-bold text-sm leading-tight mb-1 ${styles.text}`}>
                            {node.name}
                        </h4>
                        
                        {/* Responsible Person Info */}
                        <div className={`mt-3 pt-3 w-full border-t ${isDark ? 'border-white/20' : 'border-gray-100'}`}>
                            <div className={`flex items-center justify-center gap-2 text-xs ${isDark ? 'text-blue-100' : 'text-gray-500'}`}>
                                <User className="w-3 h-3" />
                                <span>{node.responsibleName || 'Não atribuído'}</span>
                            </div>
                            <div className={`flex items-center justify-center gap-2 text-[10px] mt-1 ${isDark ? 'text-blue-200' : 'text-gray-400'}`}>
                                <Mail className="w-3 h-3" />
                                <span className="truncate max-w-[180px]">{node.responsibleEmail || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {hasChildren && (
                    <button 
                        onClick={onToggle}
                        className={`
                            absolute -bottom-3 left-1/2 transform -translate-x-1/2
                            w-6 h-6 rounded-full flex items-center justify-center shadow-sm border
                            transition-transform duration-300 z-20
                            ${expanded ? 'rotate-180 bg-slate-100 border-slate-200 text-slate-500' : 'bg-white border-gray-200 text-gray-500 hover:text-blue-500'}
                        `}
                    >
                        <ChevronDown className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

const TreeNode: React.FC<{ 
    node: HierarchyNode; 
    isEditingMode: boolean;
    onAdd: (parentId: string) => void;
    onEdit: (node: HierarchyNode) => void;
    onDelete: (nodeId: string) => void;
}> = ({ node, isEditingMode, onAdd, onEdit, onDelete }) => {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="flex flex-col items-center">
            <HierarchyNodeCard 
                node={node} 
                hasChildren={!!hasChildren} 
                expanded={expanded} 
                isEditingMode={isEditingMode}
                onToggle={() => setExpanded(!expanded)} 
                onAdd={() => onAdd(node.id)}
                onEdit={() => onEdit(node)}
                onDelete={() => onDelete(node.id)}
            />
            
            {hasChildren && expanded && (
                <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300 origin-top">
                    {/* Vertical Line from Parent */}
                    <div className="w-px h-8 bg-gray-300"></div>
                    
                    {/* Horizontal Connector Line */}
                    <div className="relative flex justify-center gap-8 pt-4 border-t border-gray-300">
                         <style dangerouslySetInnerHTML={{__html: `
                            .tree-branch::before {
                                content: '';
                                position: absolute;
                                top: -17px;
                                left: 50%;
                                width: 1px;
                                height: 17px;
                                background-color: #d1d5db;
                            }
                         `}} />

                        {node.children!.map((child, index) => (
                            <div key={child.id} className="tree-branch relative px-4">
                                {node.children!.length > 1 && (
                                    <div className={`
                                        absolute top-[-17px] h-px bg-gray-300
                                        ${index === 0 ? 'left-1/2 right-0' : ''}
                                        ${index === node.children!.length - 1 ? 'left-0 right-1/2' : ''}
                                        ${index > 0 && index < node.children!.length - 1 ? 'left-0 right-0' : ''}
                                    `}></div>
                                )}
                                <TreeNode 
                                    node={child} 
                                    isEditingMode={isEditingMode}
                                    onAdd={onAdd}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const OrganizationChart: React.FC = () => {
    const [hierarchy, setHierarchy] = useState<HierarchyNode>(MOCK_HIERARCHY);
    const [isEditingMode, setIsEditingMode] = useState(false);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD');
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<HierarchyNode>>({});
    
    // Handlers
    const handleAdd = (parentId: string) => {
        setModalMode('ADD');
        setSelectedParentId(parentId);
        setFormData({
            type: 'SECTOR', // Default
            name: '',
            level: 'OPERATIONAL_SECTOR',
            responsibleName: '',
            responsibleEmail: '',
        });
        setIsModalOpen(true);
    };

    const handleEdit = (node: HierarchyNode) => {
        setModalMode('EDIT');
        setFormData({ ...node });
        setIsModalOpen(true);
    };

    const handleDelete = (nodeId: string) => {
        if (confirm('Tem certeza que deseja excluir este item e todos os seus descendentes?')) {
            const newTree = deleteNodeFromTree(hierarchy, nodeId);
            if (newTree) setHierarchy(newTree);
        }
    };

    const handleSave = () => {
        if (modalMode === 'ADD' && selectedParentId) {
            const newNode: HierarchyNode = {
                id: Date.now().toString(),
                type: formData.type || 'SECTOR',
                name: formData.name || 'Novo Item',
                level: formData.type === 'PERSON' ? 'STAFF' : (formData.level as HierarchyLevel),
                role: formData.role,
                responsibleName: formData.responsibleName || 'A definir',
                responsibleEmail: formData.responsibleEmail || '',
                avatarUrl: formData.avatarUrl,
                children: []
            };
            setHierarchy(addNodeToTree(hierarchy, selectedParentId, newNode));
        } else if (modalMode === 'EDIT' && formData.id) {
            setHierarchy(updateNodeInTree(hierarchy, formData.id, formData));
        }
        setIsModalOpen(false);
    };

    const handleUserSelect = (userId: string) => {
        const user = MOCK_USERS.find(u => u.id === userId);
        if (user) {
            if (formData.type === 'PERSON') {
                 setFormData(prev => ({
                    ...prev,
                    name: user.name,
                    role: user.role.replace('_', ' '), // simple formatter
                    responsibleEmail: user.email,
                    avatarUrl: `https://ui-avatars.com/api/?name=${user.name}&background=random`
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    responsibleName: user.name,
                    responsibleEmail: user.email,
                }));
            }
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Estrutura Organizacional</h2>
                    <p className="text-gray-500">Organograma hierárquico do Sistema Fecomércio RJ</p>
                </div>
                <div className="flex items-center gap-4">
                     <div className="hidden md:flex gap-2 text-xs mr-4">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-800 rounded-full"></div> Presidência</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-600 rounded-full"></div> Direção</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-500 rounded-full"></div> Gerência</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-white border border-green-300 rounded-full"></div> Colaborador</div>
                    </div>
                    
                    <button 
                        onClick={() => setIsEditingMode(!isEditingMode)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all
                            ${isEditingMode 
                                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                        `}
                    >
                        {isEditingMode ? <Check className="w-4 h-4"/> : <Edit3 className="w-4 h-4"/>}
                        {isEditingMode ? 'Concluir Edição' : 'Editar Estrutura'}
                    </button>
                </div>
            </div>

            <div className={`
                flex-1 bg-slate-50 border border-gray-200 rounded-xl shadow-inner p-8 overflow-auto flex justify-center items-start min-h-[600px]
                ${isEditingMode ? 'bg-slate-100/50' : ''}
            `}>
                <div className="scale-90 transform-origin-top pt-4">
                    <TreeNode 
                        node={hierarchy} 
                        isEditingMode={isEditingMode}
                        onAdd={handleAdd}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
            </div>

            {/* Edit/Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <h3 className="font-bold text-gray-800">
                                {modalMode === 'ADD' ? 'Adicionar Novo Item' : 'Editar Item'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            {/* Type Selector (Only for Add) */}
                            {modalMode === 'ADD' && (
                                <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
                                    <button 
                                        onClick={() => setFormData({...formData, type: 'SECTOR'})}
                                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                                            formData.type === 'SECTOR' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        <BriefcaseIcon className="w-4 h-4 inline mr-1 mb-0.5" /> Sub-Setor
                                    </button>
                                    <button 
                                        onClick={() => setFormData({...formData, type: 'PERSON'})}
                                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                                            formData.type === 'PERSON' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        <UserCircle className="w-4 h-4 inline mr-1 mb-0.5" /> Colaborador
                                    </button>
                                </div>
                            )}

                            {/* User Linking */}
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <label className="block text-xs font-bold text-blue-800 mb-1 flex items-center gap-1">
                                    <Users className="w-3 h-3" /> 
                                    {formData.type === 'PERSON' ? 'Vincular Usuário (Preencher Dados)' : 'Selecionar Responsável'}
                                </label>
                                <select 
                                    className="w-full text-sm border-blue-200 rounded p-1.5 focus:ring-1 focus:ring-blue-500"
                                    onChange={(e) => handleUserSelect(e.target.value)}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Selecione um usuário...</option>
                                    {MOCK_USERS.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                    ))}
                                </select>
                            </div>

                            <hr className="border-gray-100" />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {formData.type === 'PERSON' ? 'Nome do Colaborador' : 'Nome do Setor'}
                                </label>
                                <input 
                                    type="text" 
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name || ''}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    placeholder={formData.type === 'PERSON' ? 'Ex: João Silva' : 'Ex: Gerência de Compras'}
                                />
                            </div>

                            {formData.type === 'SECTOR' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nível Hierárquico</label>
                                        <select 
                                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.level || 'OPERATIONAL_SECTOR'}
                                            onChange={e => setFormData({...formData, level: e.target.value as HierarchyLevel})}
                                        >
                                            <option value="PRESIDENCY">Presidência</option>
                                            <option value="EXECUTIVE_DIRECTION">Direção Executiva</option>
                                            <option value="MANAGEMENT">Gerência</option>
                                            <option value="OPERATIONAL_SECTOR">Setor Operacional</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Responsável</label>
                                            <input 
                                                type="text" 
                                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={formData.responsibleName || ''}
                                                onChange={e => setFormData({...formData, responsibleName: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input 
                                                type="email" 
                                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={formData.responsibleEmail || ''}
                                                onChange={e => setFormData({...formData, responsibleEmail: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {formData.type === 'PERSON' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cargo / Função</label>
                                        <input 
                                            type="text" 
                                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.role || ''}
                                            onChange={e => setFormData({...formData, role: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input 
                                            type="email" 
                                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.responsibleEmail || ''}
                                            onChange={e => setFormData({...formData, responsibleEmail: e.target.value})}
                                        />
                                    </div>
                                </div>
                            )}

                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2 rounded-b-xl">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm">Cancelar</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2">
                                <Save className="w-4 h-4" /> Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizationChart;