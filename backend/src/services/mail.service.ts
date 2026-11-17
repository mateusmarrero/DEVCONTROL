import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface SendInviteEmailParams {
  to: string;
  code: string;
  role: string;
  invitedByName?: string;
}

export async function sendInviteEmail({ to, code, role, invitedByName }: SendInviteEmailParams) {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"DEVCONTROL 1.0" <${user || 'seguranca@devcontrol.io'}>`;

  const activationUrl = `https://devcontrol-system.vercel.app/login?code=${code}&email=${encodeURIComponent(to)}`;

  const roleLabels: Record<string, string> = {
    ADMIN: 'Administrador Master',
    MANAGER: 'Gerente de Projetos',
    DEVELOPER: 'Desenvolvedor',
    AUDITOR: 'Auditor 360°',
    VIEWER: 'Visualizador'
  };

  const roleName = roleLabels[role] || role;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070A12; color: #E5E7EB; margin: 0; padding: 20px; }
    .container { max-width: 580px; margin: 0 auto; background-color: #0E131F; border: 1px solid #1F2937; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #4338CA 0%, #6366F1 50%, #7C3AED 100%); padding: 32px 24px; text-align: center; }
    .title { color: #FFFFFF; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
    .subtitle { color: #E0E7FF; font-size: 13px; margin-top: 6px; font-weight: 500; }
    .body { padding: 32px 28px; }
    .greeting { font-size: 16px; color: #F3F4F6; margin-bottom: 16px; }
    .role-badge { display: inline-block; padding: 4px 12px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 9999px; color: #818CF8; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 20px; }
    .code-box { background-color: #070A12; border: 2px dashed #4F46E5; border-radius: 14px; padding: 18px; text-align: center; margin: 24px 0; }
    .code-label { font-size: 11px; color: #9CA3AF; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; margin-bottom: 6px; }
    .code-value { font-family: 'Courier New', Courier, monospace; font-size: 26px; font-weight: 900; color: #6366F1; letter-spacing: 2px; }
    .btn { display: block; width: 100%; box-sizing: border-box; text-align: center; background: linear-gradient(to right, #4F46E5, #6366F1); color: #FFFFFF !important; text-decoration: none; padding: 14px 20px; border-radius: 12px; font-weight: 700; font-size: 15px; margin: 24px 0; }
    .steps { background-color: rgba(255,255,255,0.02); border-radius: 12px; padding: 16px; margin-top: 20px; font-size: 12px; color: #9CA3AF; line-height: 1.6; }
    .footer { border-top: 1px solid #1F2937; padding: 20px; text-align: center; font-size: 11px; color: #6B7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">DEVCONTROL 1.0</h1>
      <p class="subtitle">Plataforma Privada de Gestão de Projetos & Sites</p>
    </div>
    <div class="body">
      <p class="greeting">Olá,</p>
      <p style="font-size: 14px; color: #9CA3AF; line-height: 1.5;">
        Você foi convidado por <strong>${invitedByName || 'Administrador Master'}</strong> para colaborar no gerenciamento oficial dos projetos:
      </p>
      <div>
        <span class="role-badge">Perfil: ${roleName}</span>
      </div>

      <div class="code-box">
        <div class="code-label">Seu Código de Ativação</div>
        <div class="code-value">${code}</div>
      </div>

      <a href="${activationUrl}" class="btn" target="_blank">Ativar Meu Acesso no DEVCONTROL</a>

      <div class="steps">
        <strong>Instruções de Ativação:</strong><br>
        1. Clique no botão acima para abrir a tela de ativação direta.<br>
        2. O seu código e e-mail serão preenchidos automaticamente.<br>
        3. Digite seu nome e crie sua senha de acesso.<br>
        4. O convite é único, intransferível e expira em 7 dias.
      </div>
    </div>
    <div class="footer">
      DEVCONTROL 1.0 • MariaDB 10.11 • Fastify JWT • OWASP Top 10 Protected<br>
      Este e-mail é gerado automaticamente pelo sistema de gestão de projetos.
    </div>
  </div>
</body>
</html>
  `;

  // Se SMTP estiver configurado no .env, dispara e-mail real
  if (host && user && pass) {
    try {
      const cleanPass = pass.replace(/\s+/g, '');
      const isGmail = host.includes('gmail') || user.includes('@gmail.com');

      const transporter = isGmail
        ? nodemailer.createTransport({
            service: 'gmail',
            auth: { user: user.trim(), pass: cleanPass }
          })
        : nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user: user.trim(), pass: cleanPass }
          });

      const info = await transporter.sendMail({
        from,
        to,
        subject: `Convite de Acesso Privado — DEVCONTROL 1.0`,
        html: htmlContent
      });

      console.log(`[EMAIL DISPARADO COM SUCESSO] Convite enviado para ${to} (MessageId: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error('[ERRO SMTP]', err.message);
      return { success: false, error: err.message };
    }
  } else {
    // Modo Simulação/Registro em Console quando SMTP ainda não foi preenchido no .env
    console.log(`\n========================================================================`);
    console.log(`[EMAIL DISPARADO EM MODO DESENVOLVIMENTO / LOG]`);
    console.log(`Destinatário: ${to}`);
    console.log(`Código: ${code}`);
    console.log(`Link de Ativação Direta: ${activationUrl}`);
    console.log(`========================================================================\n`);

    return {
      success: true,
      simulated: true,
      activationUrl,
      note: 'Configurar SMTP_HOST, SMTP_USER, SMTP_PASS no arquivo .env para envio via provedor real.'
    };
  }
}
