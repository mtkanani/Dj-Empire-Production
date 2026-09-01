import crypto from 'crypto';
import { env } from '../../../config/env.js';

/**
 * Cryptographic HMAC-SHA256 Signed QR Payload Utility
 */
export class QrCryptoUtil {
  static getSecret() {
    return env.JWT_ACCESS_SECRET || 'secret-key-12345';
  }

  /**
   * Encrypt & Sign Ticket QR Payload
   */
  static createSignedQrToken(payload) {
    const nonce = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();

    const dataToSign = {
      ...payload,
      nonce,
      timestamp,
    };

    const signature = crypto
      .createHmac('sha256', this.getSecret())
      .update(JSON.stringify(dataToSign))
      .digest('hex');

    const fullPayload = {
      ...dataToSign,
      signature,
    };

    return {
      token: Buffer.from(JSON.stringify(fullPayload)).toString('base64'),
      signature,
      raw: fullPayload,
    };
  }

  /**
   * Verify & Decrypt Ticket QR Token
   */
  static verifyQrToken(tokenString) {
    try {
      const decodedJson = Buffer.from(tokenString, 'base64').toString('utf8');
      const payload = JSON.parse(decodedJson);

      if (!payload?.signature) {
        return { valid: false, reason: 'QR token is missing a digital signature' };
      }

      const { signature, ...dataToSign } = payload;

      const expectedSignature = crypto
        .createHmac('sha256', this.getSecret())
        .update(JSON.stringify(dataToSign))
        .digest('hex');

      if (signature !== expectedSignature) {
        return { valid: false, reason: 'Invalid or modified QR token signature' };
      }

      return {
        valid: true,
        payload: dataToSign,
        rawToken: tokenString,
      };
    } catch (error) {
      return { valid: false, reason: 'Invalid or malformed QR token format' };
    }
  }
}
