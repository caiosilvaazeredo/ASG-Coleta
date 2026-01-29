import React, { useState } from 'react';
import { MOCK_GAPS } from '../constants';
import { AlertTriangle, Calendar, CheckSquare, Clock, Mail, Play, AlertOctagon, Bell, ShieldAlert, ArrowUpRight } from 'lucide-react';

interface SimulationLog {
    id: string;
    gapCode: string;
    type: 'REMINDER' | 'URGENT' | 'CRITICAL' | 'ESCALATION';
    recipients: string[];
    message: string;
    timestamp: string;
}

const GapManagement: React.FC = () => {
  const [simulationLogs, setSimulationLogs] = useState<SimulationLog[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // RF008.2 - Rule Engine
  const runReminderSystem = () => {
    setIsSimulating(true);
    setSimulationLogs([]);
    
    // Simulate system processing time
    setTimeout(() => {
        const newLogs: SimulationLog[] = [];

        MOCK_GAPS.forEach(gap => {
            const days = gap.daysToDeadline;
            let logEntry: SimulationLog | null = null;

            // Rule 1: 7 days before deadline
            if (days === 7) {
                logEntry = {
                    id: Math.random().toString(),
                    gapCode: gap.indicatorCode,
                    type: 'REMINDER',
                    recipients: [`Responsável (${gap.responsible})`],
                    message: `Faltam 7 dias para resolver ${gap.indicatorCode}`,
                    timestamp: new Date().toLocaleTimeString()
                };
            }
            // Rule 2: On deadline (0 days)
            else if (days === 0) {
                logEntry = {
                    id: Math.random().toString(),
                    gapCode: gap.indicatorCode,
                    type: 'URGENT',
                    recipients: [`Responsável (${gap.responsible})`, 'Gestor ASG'],
                    message: `Prazo para resolver ${gap.indicatorCode} venceu hoje`,
                    timestamp: new Date().toLocaleTimeString()
                };
            }
            // Rule 3: 7 days AFTER deadline (-7 days)
            else if (days === -7) {
                logEntry = {
                    id: Math.random().toString(),
                    gapCode: gap.indicatorCode,
                    type: 'CRITICAL',
                    recipients: [`Responsável (${gap.responsible})`, 'Gestor ASG', 'Diretor Executivo'],
                    message: `⚠️ ATRASO: ${gap.indicatorCode} está 7 dias atrasado`,
                    timestamp: new Date().toLocaleTimeString()
                };
            }
            // Rule 4: 30 days AFTER deadline (<= -30 days)
            else if (days <= -30) {
                logEntry = {
                    id: Math.random().toString(),
                    gapCode: gap.indicatorCode,
                    type: 'ESCALATION',
                    recipients: ['Presidência', 'Diretoria Executiva'],
                    message: `Gap crítico não resolvido há 30 dias`,
                    timestamp: new Date().toLocaleTimeString()
                };
            }

            if (logEntry) newLogs.push(logEntry);
        });

        setSimulationLogs(newLogs);
        setIsSimulating(false);
    }, 1000);
  };

  const getLogStyle = (type: SimulationLog['type']) => {
      switch(type) {
          case 'REMINDER': return { icon: <Bell className="w-4 h-4" />, color: 'text-blue-600 bg-blue-50 border-blue-200', label: 'Lembrete Padrão' };
          case 'URGENT': return { icon: <Clock className="w-4 h-4" />, color: 'text-orange-600 bg-orange-50 border-orange-200', label: 'Vencimento' };
          case 'CRITICAL': return { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-600 bg-red-50 border-red-200', label: 'Atraso Crítico' };
          case 'ESCALATION': return { icon: <ShieldAlert className="w-4 h-4" />, color: 'text-purple-600 bg-purple-50 border-purple-200', label: 'Escalação Presidência' };
      }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Gestão de GAPs</h2>
                <p className="text-gray-500">Monitoramento e planos de ação para dados faltantes</p>
            </div>
            <div className="flex gap-2">
                <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-bold text-center">
                    <span className="block text-xl">23</span>
                    <span className="text-xs uppercase">Críticos</span>
                </div>
                 <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-bold text-center">
                    <span className="block text-xl">15</span>
                    <span className="text-xs uppercase">Em curso</span>
                </div>
            </div>
       </div>

       {/* RF008.2 Automated Reminders System Panel */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
           <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
               <div>
                   <h3 className="font-bold text-gray-800 flex items-center gap-2">
                       <Mail className="w-5 h-5 text-blue-600" />
                       Sistema de Lembretes Automáticos (RF008.2)
                   </h3>
                   <p className="text-sm text-gray-500 mt-1">Executa a rotina de verificação de prazos e envia notificações conforme regras de escalação.</p>
               </div>
               <button 
                   onClick={runReminderSystem}
                   disabled={isSimulating}
                   className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-all disabled:opacity-50"
               >
                   {isSimulating ? <Clock className="w-4 h-4 animate-spin"/> : <Play className="w-4 h-4 fill-current"/>}
                   {isSimulating ? 'Processando...' : 'Executar Rotina Agora'}
               </button>
           </div>
           
           {simulationLogs.length > 0 && (
               <div className="p-6 bg-slate-50/50">
                   <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Log de Execução da Rotina</h4>
                   <div className="space-y-3">
                       {simulationLogs.map(log => {
                           const style = getLogStyle(log.type);
                           return (
                               <div key={log.id} className={`p-4 rounded-lg border flex items-start gap-4 ${style.color} animate-in slide-in-from-left-2`}>
                                   <div className="mt-1 p-2 bg-white/60 rounded-full">
                                       {style.icon}
                                   </div>
                                   <div className="flex-1">
                                       <div className="flex justify-between items-center mb-1">
                                           <span className="font-bold text-sm">{style.label}</span>
                                           <span className="text-xs opacity-75 font-mono">{log.timestamp}</span>
                                       </div>
                                       <p className="font-medium text-lg mb-1">{log.message}</p>
                                       <div className="flex items-center gap-2 text-xs mt-2">
                                           <ArrowUpRight className="w-3 h-3" />
                                           <span className="font-semibold">Destinatários:</span>
                                           <div className="flex gap-1">
                                               {log.recipients.map(r => (
                                                   <span key={r} className="bg-white/60 px-2 py-0.5 rounded border border-black/5">
                                                       {r}
                                                   </span>
                                               ))}
                                           </div>
                                       </div>
                                   </div>
                               </div>
                           );
                       })}
                   </div>
               </div>
           )}
           {simulationLogs.length === 0 && !isSimulating && (
               <div className="p-8 text-center text-gray-400 border-t border-gray-100">
                   <p>Nenhuma rotina executada recentemente. Clique no botão acima para simular a verificação diária.</p>
               </div>
           )}
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-700">GAPs Ativos</h3>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indicador</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento / Resp.</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criticidade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Prazo</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {MOCK_GAPS.map((gap) => {
                        let statusColor = 'text-gray-500';
                        let statusIcon = <Clock className="w-4 h-4" />;
                        
                        if (gap.daysToDeadline === 0) { statusColor = 'text-orange-600 font-bold'; statusIcon = <AlertOctagon className="w-4 h-4"/>; }
                        else if (gap.daysToDeadline < 0) { statusColor = 'text-red-600 font-bold'; statusIcon = <AlertTriangle className="w-4 h-4"/>; }
                        else if (gap.daysToDeadline <= 7) { statusColor = 'text-blue-600 font-bold'; }

                        return (
                            <tr key={gap.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900">{gap.indicatorCode}</span>
                                        <span className="text-xs text-gray-500">{gap.title}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">{gap.department}</span>
                                        <span className="text-xs text-gray-500">{gap.responsible}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        gap.criticality === 'HIGH' ? 'bg-red-100 text-red-800' :
                                        gap.criticality === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                        {gap.criticality === 'HIGH' ? 'Alta' : gap.criticality === 'MEDIUM' ? 'Média' : 'Baixa'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm flex items-center gap-2">
                                    <span className={statusColor}>
                                        {gap.daysToDeadline === 0 ? 'Vence Hoje' : 
                                         gap.daysToDeadline < 0 ? `${Math.abs(gap.daysToDeadline)} dias de atraso` : 
                                         `${gap.daysToDeadline} dias restantes`}
                                    </span>
                                    {statusIcon}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-blue-600 hover:text-blue-900 flex items-center justify-end gap-1 w-full hover:underline">
                                        <CheckSquare className="w-4 h-4" /> Resolver
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
       </div>
    </div>
  );
};

export default GapManagement;