import React, { useState } from 'react';
import { Bell, Check, X, ArrowRightLeft, Clock, AlertTriangle, Sparkles, FileCheck, CheckCircle2 } from 'lucide-react';
import { Notification, NotificationType } from '../types';
import { MOCK_NOTIFICATIONS } from '../constants';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  if (!isOpen) return null;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleAction = (notificationId: string, actionId: string) => {
    // In a real app, this would call an API
    console.log(`Action ${actionId} triggered on notification ${notificationId}`);
    handleMarkAsRead(notificationId);
    
    // Simulate removing it from "actionable" list or updating status
    if (actionId === 'dismiss' || actionId === 'reject' || actionId === 'accept') {
       // visual feedback could go here
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'DELEGATION': return <ArrowRightLeft className="w-5 h-5 text-blue-500" />;
      case 'DEADLINE': return <Clock className="w-5 h-5 text-orange-500" />;
      case 'GAP_REMINDER': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'ANOMALY': return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'APPROVAL': return <FileCheck className="w-5 h-5 text-green-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute top-16 right-4 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden flex flex-col max-h-[80vh]">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-800">Notificações</h3>
            {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
        </div>
        <div className="flex items-center gap-2">
            <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                Marcar todas como lidas
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>Nenhuma notificação</p>
            </div>
        ) : (
            <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                    <div 
                        key={notification.id} 
                        className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/30' : ''}`}
                    >
                        <div className="flex gap-3 items-start">
                            <div className="mt-1 flex-shrink-0">
                                {getIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`text-sm ${!notification.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                        {notification.title}
                                    </h4>
                                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{notification.timestamp}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                                    {notification.message}
                                </p>
                                
                                {/* Actions */}
                                {notification.actions && notification.actions.length > 0 && (
                                    <div className="flex gap-2 mt-2">
                                        {notification.actions.map(action => (
                                            <button
                                                key={action.actionId}
                                                onClick={() => handleAction(notification.id, action.actionId)}
                                                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors border ${
                                                    action.style === 'primary' ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' :
                                                    action.style === 'success' ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' :
                                                    action.style === 'danger' ? 'bg-white text-red-600 border-red-200 hover:bg-red-50' :
                                                    'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                                                }`}
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
        <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            Ver todas as notificações
        </button>
      </div>
    </div>
  );
};

export default NotificationCenter;