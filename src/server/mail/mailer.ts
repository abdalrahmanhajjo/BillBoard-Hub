export type MailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DEFAULT_FROM = 'Boardly <onboarding@resend.dev>';

/**
 * Outbound email port.
 *
 * Set `RESEND_API_KEY` and `MAIL_FROM` to deliver for real — the REST call needs
 * no extra dependency. Without a key the message is written to the server log so
 * local password-reset flows stay testable, and swapping in SMTP or another
 * provider means editing this file only.
 */
export const mailer = {
  /** False when nothing is wired up and `send` can only log. */
  isConfigured(): boolean {
    return Boolean(process.env.RESEND_API_KEY);
  },

  /**
   * Whether a caller may hand a would-be email link back to the browser.
   *
   * True only for local development with no provider configured, where the link
   * would otherwise be trapped in the server log. Doing this reveals that an
   * address has an account, so it must stay impossible in production and
   * whenever real delivery is available.
   */
  allowsLinkPreview(): boolean {
    return process.env.NODE_ENV !== 'production' && !this.isConfigured();
  },

  async send(message: MailMessage): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      logUndeliveredMessage(message);
      return;
    }

    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM ?? DEFAULT_FROM,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email delivery failed with status ${response.status}.`);
    }
  },
};

function logUndeliveredMessage(message: MailMessage): void {
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      `[mailer] RESEND_API_KEY is not set — "${message.subject}" for ${message.to} was not delivered.`,
    );
    return;
  }

  console.warn(
    [
      '',
      '─── [mailer] no RESEND_API_KEY, printing message instead ───',
      `To:      ${message.to}`,
      `Subject: ${message.subject}`,
      '',
      message.text,
      '────────────────────────────────────────────────────────────',
      '',
    ].join('\n'),
  );
}
