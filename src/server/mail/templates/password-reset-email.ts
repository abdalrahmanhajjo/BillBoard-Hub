import type { MailMessage } from '@/server/mail/mailer';

type PasswordResetEmailInput = {
  to: string;
  firstName: string;
  resetUrl: string;
  expiresInMinutes: number;
};

export function buildPasswordResetEmail({
  to,
  firstName,
  resetUrl,
  expiresInMinutes,
}: PasswordResetEmailInput): MailMessage {
  const subject = 'Reset your Boardly password';

  const text = [
    `Hi ${firstName},`,
    '',
    'We received a request to reset the password on your Boardly account.',
    'Open the link below to choose a new one:',
    '',
    resetUrl,
    '',
    `This link expires in ${expiresInMinutes} minutes and can only be used once.`,
    'If you did not request a reset you can ignore this email — your password stays unchanged.',
    '',
    '— The Boardly team',
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:32px 16px;background:#f4f6fb;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;border:1px solid #e4e4e7;overflow:hidden;">
      <tr>
        <td style="padding:28px 32px;background:linear-gradient(135deg,#1d4ed8,#0891b2);color:#ffffff;">
          <p style="margin:0;font-size:13px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.85;">Boardly</p>
          <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;font-weight:600;">Reset your password</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 32px;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Hi ${escapeHtml(firstName)},</p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3f3f46;">
            We received a request to reset the password on your Boardly account. Choose a new password using the button below.
          </p>
          <a href="${escapeHtml(resetUrl)}" style="display:inline-block;padding:12px 24px;background:#1d4ed8;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;">
            Choose a new password
          </a>
          <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#71717a;">
            This link expires in ${expiresInMinutes} minutes and can only be used once. If the button does not work, paste this address into your browser:
          </p>
          <p style="margin:8px 0 0;font-size:13px;line-height:1.6;word-break:break-all;color:#1d4ed8;">${escapeHtml(resetUrl)}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px;border-top:1px solid #e4e4e7;background:#fafafa;">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#71717a;">
            If you did not request a reset you can ignore this email — your password stays unchanged.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { to, subject, html, text };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
