import crypto from 'crypto';

export interface WebhookVerificationResult {
  isValid: boolean;
  reason?: string;
}

/**
 * Verify webhook signature or auth token from affiliate networks.
 * Supports HMAC-SHA256 signature verification, Bearer authorization, or shared secret header.
 */
export function verifyAffiliateWebhook(
  rawBody: string,
  signatureHeader: string | null,
  authHeader: string | null
): WebhookVerificationResult {
  const webhookSecret = process.env.AFFILIATE_WEBHOOK_SECRET || process.env.ADMIN_SESSION_SECRET;

  if (!webhookSecret) {
    return {
      isValid: false,
      reason: 'Webhook secret is not configured on the server.',
    };
  }

  // 1. If HMAC signature is provided
  if (signatureHeader) {
    try {
      const computedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      // Also check if signature has prefix like 'sha256='
      const cleanSignature = signatureHeader.replace(/^sha256=/, '').trim();

      const expectedBuffer = Buffer.from(computedSignature, 'hex');
      const receivedBuffer = Buffer.from(cleanSignature, 'hex');

      if (
        expectedBuffer.length === receivedBuffer.length &&
        crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
      ) {
        return { isValid: true };
      }
    } catch {
      // Ignore parsing errors and fallback to check authHeader
    }
  }

  // 2. If Bearer or Secret Auth Header is provided
  if (authHeader) {
    const cleanAuth = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (cleanAuth === webhookSecret) {
      return { isValid: true };
    }
  }

  return {
    isValid: false,
    reason: 'Invalid or missing webhook signature/authentication token.',
  };
}
