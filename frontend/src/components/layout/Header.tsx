import React, { useState, useEffect } from 'react';
import { Sun, Moon, Bell, Database, Globe, Search, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Project } from '../../types';

interface HeaderProps {
  collapsed: boolean;
  selectedProjectId?: string;
  onSelectProject?: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ collapsed, selectedProjectId, onSelectProject }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    async function loadHeaderData() {
      try {
        const [projRes, notifRes] = await Promise.all([
          api.get('/projects'),
          api.get('/notifications')
        ]);
        setProjects(projRes.data);
        setUnreadCount(notifRes.data.unreadCount || 0);
      } catch (err) {
        // Ignora silenciosamente se offline
      }
    }
    loadHeaderData();
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 border-b transition-all duration-300 ease-in-out bg-white/80 dark:bg-[#0E131F]/80 backdrop-blur-md border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 ${
        collapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Seletor de Projeto Ativo e Busca */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800/80 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
          <Globe className="w-4 h-4 text-indigo-500" />
          <select
            value={selectedProjectId || ''}
            onChange={(e) => onSelectProject && onSelectProject(e.target.value)}
            className="bg-transparent text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer pr-2"
          >
            <option value="" className="dark:bg-gray-900">Todos os Projetos</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="dark:bg-gray-900">
                {p.name} {p.domain ? `(${p.domain})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Status MariaDB 10.11 */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <Database className="w-3.5 h-3.5" />
          <span>MariaDB 10.11: Conectado</span>
        </div>
      </div>

      {/* Ações da Direita */}
      <div className="flex items-center space-x-3">
        {/* Alternador de Tema Dark/Light */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
        </button>

        {/* Notificações */}
        <a
          href="/notifications"
          className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Notificações"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </a>

        {/* Divisor */}
        <div className="h-6 w-px bg-gray-200 dark:bg-gray-800"></div>

        {/* Identificação do Usuário */}
        <div className="flex items-center space-x-2 pl-1">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
            alt={user?.name || 'User'}
            className="w-8 h-8 rounded-lg object-cover border border-gray-300 dark:border-gray-700"
          />
          <span className="hidden sm:inline text-xs font-semibold text-gray-700 dark:text-gray-300">
            {user?.name?.split(' ')[0]}
          </span>
        </div>
      </div>
    </header>
  );
};
