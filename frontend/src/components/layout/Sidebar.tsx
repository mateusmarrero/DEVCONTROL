import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  ListOrdered,
  ShieldAlert,
  FileCode2,
  Rocket,
  Wrench,
  ShieldCheck,
  Bell,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Terminal,
  Server,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { user, logout, isAdmin } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Projetos', path: '/projects', icon: FolderKanban },
    { name: 'Tarefas', path: '/tasks', icon: CheckSquare },
    { name: 'Checklist Master', path: '/checklist', icon: ListOrdered, badge: '17 Fases' },
    { name: 'Radar SEO & SERP', path: '/seo-scanner', icon: Sparkles, badge: 'Google 360°' },
    { name: 'Central de Segurança', path: '/security', icon: ShieldAlert },
    { name: 'Documentação', path: '/docs', icon: FileCode2 },
    { name: 'Controle de Deploy', path: '/deploy', icon: Rocket },
    { name: 'Manutenção', path: '/maintenance', icon: Wrench },
    { name: 'Quality Gate', path: '/quality-gate', icon: ShieldCheck },
    { name: 'Notificações', path: '/notifications', icon: Bell },
    ...(isAdmin ? [{ name: 'Convites & Equipe', path: '/invites', icon: UserPlus }] : [])
  ];

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN': return { label: 'Admin Master', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      case 'MANAGER': return { label: 'Gerente', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'AUDITOR': return { label: 'Auditor 360°', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 'DEVELOPER': return { label: 'Desenvolvedor', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
      default: return { label: 'Leitor', bg: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out border-r bg-white dark:bg-[#0E131F] border-gray-200 dark:border-gray-800 flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header do Sidebar */}
      <div>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/20 shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="leading-tight truncate">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-500 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  DEVCONTROL
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-gray-400">
                  Engineering Hub
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Links de Navegação */}
        <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-170px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60'
                  }`
                }
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
                {!collapsed && (
                  <div className="flex items-center justify-between w-full truncate">
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer do Usuário */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20">
        {!collapsed ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/50">
            <div className="flex items-center space-x-3 overflow-hidden">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={user?.name || 'User'}
                className="w-9 h-9 rounded-lg object-cover border border-indigo-500/30 shrink-0"
              />
              <div className="truncate">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded border ${roleInfo.bg}`}>
                  {roleInfo.label}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sair do sistema"
              className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
              alt={user?.name || 'User'}
              className="w-9 h-9 rounded-lg object-cover border border-indigo-500/30"
              title={`${user?.name} (${roleInfo.label})`}
            />
            <button
              onClick={logout}
              title="Sair do sistema"
              className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
