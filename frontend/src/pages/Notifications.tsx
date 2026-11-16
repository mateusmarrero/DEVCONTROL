import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Clock, AlertTriangle, ShieldAlert, Info } from 'lucide-react';
import { api } from '../services/api';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'VULNERABILITY_CRITICAL': return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'DEADLINE': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'DELAY': return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      default: return <Info className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-[#111827] to-[#0E131F] border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" />
            <span>Central de Avisos & Alertas em Tempo Real</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Notificações Operacionais
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Prazos próximos, tarefas atrasadas, auditorias pendentes e vulnerabilidades críticas.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center space-x-1.5 shrink-0"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Marcar Todas como Lidas</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {notifications.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 p-6">
            <Bell className="w-10 h-10 text-gray-500 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Nenhuma notificação no momento</h3>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && handleMarkRead(n.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                n.isRead
                  ? 'bg-white dark:bg-[#0E131F] border-gray-200 dark:border-gray-800/80 opacity-70'
                  : 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500/30 shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0">
                  {getIcon(n.type)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">{n.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-gray-400 block font-mono">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
                {!n.isRead && (
                  <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mt-1"></span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
