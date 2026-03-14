type ResetPasswordTemplatePayload = {
  resetUrl: string;
  appName: string;
};

export const buildResetPasswordTemplate = ({
  resetUrl,
  appName,
}: ResetPasswordTemplatePayload) => {
  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Redefinir senha</title>
      <style>
        body {
          margin: 0;
          padding: 24px;
          background: #f5f5fb;
          font-family: Arial, Helvetica, sans-serif;
          color: #2a2a2a;
        }
        .preheader {
          display: none;
          visibility: hidden;
          opacity: 0;
          color: transparent;
          height: 0;
          width: 0;
          overflow: hidden;
        }
        .container {
          max-width: 560px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(88, 48, 146, 0.08);
        }
        .header {
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          color: #ffffff;
          padding: 32px 24px 26px;
          text-align: center;
        }
        .badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.28);
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          margin-bottom: 12px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .header p {
          margin: 8px 0 0;
          font-size: 14px;
          opacity: 0.95;
        }
        .content {
          padding: 28px 24px;
          line-height: 1.6;
        }
        .title {
          margin: 0 0 8px;
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          text-align: center;
        }
        .description {
          margin: 0;
          color: #4b5563;
          text-align: center;
        }
        .button-wrap {
          text-align: center;
          margin: 24px 0;
        }
        .button {
          display: inline-block;
          background: #6d28d9;
          color: #ffffff !important;
          text-decoration: none;
          padding: 13px 24px;
          border-radius: 12px;
          font-weight: 700;
        }
        .notice {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
          text-align: center;
        }
        .link {
          color: #6d28d9;
          word-break: break-all;
          font-size: 13px;
          background: #f9fafb;
          border: 1px solid #edeef2;
          padding: 10px 12px;
          border-radius: 10px;
        }
        .divider {
          margin: 22px 0;
          border: 0;
          border-top: 1px solid #ececf3;
        }
        .footer {
          padding: 0 24px 26px;
          color: #6b7280;
          font-size: 13px;
          text-align: center;
        }
        @media (max-width: 480px) {
          body {
            padding: 12px;
          }
          .content,
          .header {
            padding: 20px 16px;
          }
          .button {
            display: block;
          }
        }
      </style>
    </head>
    <body>
      <div class="preheader">Recebemos seu pedido de redefinição de senha no ${appName}.</div>
      <div class="container">
        <div class="header">
          <span class="badge">Segurança da conta</span>
          <h1>${appName}</h1>
          <p>Redefinição de senha</p>
        </div>
        <div class="content">
          <h2 class="title">Vamos redefinir sua senha</h2>
          <p class="description">Recebemos sua solicitação. Use o botão abaixo para continuar com segurança.</p>
          <div class="button-wrap">
            <a class="button" href="${resetUrl}" target="_blank" rel="noopener noreferrer">Redefinir minha senha</a>
          </div>
          <p class="notice">Esse link expira em <strong>60 minutos</strong> e só pode ser usado uma vez.</p>
          <hr class="divider" />
          <p class="notice">Se o botão não funcionar, copie e cole este link no navegador:</p>
          <p class="link">${resetUrl}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${appName}. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
  </html>
  `;
};
