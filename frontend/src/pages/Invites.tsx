import React, { useState, useEffect } from 'react';
import { UserPlus, Copy, Check, Shield, Mail, KeyRound, UserCheck, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { Role, User } from '../types';

export const Invites: React.FC = () => {
  const [invites, setInvites] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [role, setRole] = useState<Role>('DEVELOPER');
  const [email, setEmail] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const loadData = async () => {
    try {
      const [invRes, usersRes] = await Promise.all([
        api.get('/auth/invites'),
        api.get('/auth/users')
      ]);
      setInvites(invRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await api.post('/auth/invites', { email: email || undefined, role });
      setEmail('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao gerar convite');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-[#111827] to-[#0E131F] border border-indigo-500/20 shadow-xl">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4" />
          <span>Gestão Privada de Acesso & Segurança</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Convites & Membros Autorizados da Equipe
        </h1>
        <p className="text-sm text-gray-400 mt-1 max-w-3xl">
          Controle estrito de quem acessa o DEVCONTROL. Gere tokens de convite individuais com funções pré-definidas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Geração de Convite */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
            <UserPlus className="w-4 h-4 text-indigo-500" />
            <span>Gerar Novo Convite</span>
          </h2>

          <form onSubmit={handleCreateInvite} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">E-mail do Convidado (Opcional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="amigo@exemplo.com"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Nível de Permissão (Role) *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="DEVELOPER">Desenvolvedor (Execução e tarefas)</option>
                <option value="MANAGER">Gerente (Gestão de projetos)</option>
                <option value="AUDITOR">Auditor (Auditoria e segurança)</option>
                <option value="VIEWER">Visualizador (Somente leitura)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{generating ? 'Gerando...' : 'Gerar Código de Convite'}</span>
            </button>
          </form>
        </div>

        {/* Lista de Convites Ativos */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Convites Gerados & Histórico
          </h2>

          <div className="space-y-2.5">
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-indigo-400 text-sm">{inv.code}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {inv.role}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inv.isUsed ? 'bg-gray-500/10 text-gray-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {inv.isUsed ? 'Utilizado' : 'Disponível'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Expira em {new Date(inv.expiresAt).toLocaleDateString()} {inv.email ? `• Destinado a: ${inv.email}` : ''}
                  </p>
                </div>

                {!inv.isUsed && (
                  <button
                    onClick={() => copyToClipboard(inv.code)}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-300 font-bold text-xs flex items-center space-x-1"
                  >
                    {copiedCode === inv.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Membros Atuais */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>Membros Cadastrados no Banco MariaDB 10.11 ({users.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {users.map((u) => (
            <div key={u.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 flex items-center space-x-3 text-xs">
              <img
                src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={u.name}
                className="w-10 h-10 rounded-xl object-cover border border-gray-700"
              />
              <div className="truncate">
                <span className="font-bold text-gray-900 dark:text-white block truncate">{u.name}</span>
                <span className="text-[11px] text-gray-400 block truncate">{u.email}</span>
                <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.2 rounded border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                  {u.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
