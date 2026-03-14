type ConfirmAccountTemplatePayload = {
  code: string;
  appName: string;
};

export const buildConfirmAccountTemplate = ({
  code,
  appName,
}: ConfirmAccountTemplatePayload) => {
  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Confirme sua conta</title>
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
        .code {
          margin: 20px 0 14px;
          font-size: 30px;
          letter-spacing: 10px;
          text-align: center;
          font-weight: 700;
          color: #6d28d9;
          background: #f4ebff;
          border: 1px solid #e9d5ff;
          border-radius: 12px;
          padding: 16px;
        }
        .notice {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
          text-align: center;
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
          .code {
            font-size: 26px;
            letter-spacing: 8px;
          }
        }
      </style>
    </head>
    <body>
      <div class="preheader">Seu código de confirmação do ${appName} chegou.</div>
      <div class="container">
        <div class="header">
          <span class="badge">Segurança da conta</span>
          <h1>${appName}</h1>
          <p>Confirmação de conta</p>
        </div>
        <div class="content">
          <h2 class="title">Confirme seu email</h2>
          <p class="description">Use o código abaixo para liberar seu acesso ao login.</p>
          <div class="code">${code}</div>
          <p class="notice">Esse código expira em <strong>15 minutos</strong>.</p>
          <hr class="divider" />
          <p class="notice">Se você não solicitou isso, pode ignorar este email com segurança.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${appName}. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
  </html>
  `;
};
