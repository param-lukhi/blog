export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  success: boolean;
  status: 'SENT' | 'FAILED' | 'NOT_CONFIGURED';
  messageId?: string;
  error?: string;
}

export interface EmailProviderStatus {
  provider: 'resend' | 'sendgrid' | 'none';
  configured: boolean;
  statusText: string;
}

export function getEmailProviderStatus(): EmailProviderStatus {
  if (process.env.RESEND_API_KEY) {
    return {
      provider: 'resend',
      configured: true,
      statusText: 'Resend configured with production API key',
    };
  }

  if (process.env.SENDGRID_API_KEY) {
    return {
      provider: 'sendgrid',
      configured: true,
      statusText: 'SendGrid configured with production API key',
    };
  }

  return {
    provider: 'none',
    configured: false,
    statusText: 'NOT CONFIGURED — Email notifications queued locally. Set RESEND_API_KEY or SENDGRID_API_KEY in environment variables.',
  };
}

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const status = getEmailProviderStatus();

  if (!status.configured) {
    console.log(`[Email Provider: NOT CONFIGURED] Would send email to ${options.to} with subject "${options.subject}"`);
    return {
      success: false,
      status: 'NOT_CONFIGURED',
      error: 'Email provider credentials are not configured in environment variables.',
    };
  }

  try {
    if (status.provider === 'resend') {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'BlogWeb904 <notifications@blogweb904.com>',
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return {
          success: false,
          status: 'FAILED',
          error: errData.message || 'Failed to send email via Resend',
        };
      }

      const data = await res.json();
      return {
        success: true,
        status: 'SENT',
        messageId: data.id,
      };
    }

    if (status.provider === 'sendgrid') {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: options.to }] }],
          from: { email: process.env.EMAIL_FROM || 'notifications@blogweb904.com', name: 'BlogWeb904' },
          subject: options.subject,
          content: [
            { type: 'text/html', value: options.html },
            ...(options.text ? [{ type: 'text/plain', value: options.text }] : []),
          ],
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        return {
          success: false,
          status: 'FAILED',
          error: errText || 'Failed to send email via SendGrid',
        };
      }

      return {
        success: true,
        status: 'SENT',
      };
    }

    return {
      success: false,
      status: 'NOT_CONFIGURED',
      error: 'Unsupported email provider',
    };
  } catch (error: any) {
    console.error('[Email Provider Error]', error);
    return {
      success: false,
      status: 'FAILED',
      error: error.message || 'Unknown network error sending email',
    };
  }
}
