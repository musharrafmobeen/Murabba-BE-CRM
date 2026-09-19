import { Logger } from '@nestjs/common';
import twilio from 'twilio';

export const OTP_SENDER = 'OTP_SENDER';

export interface OtpSender {
  send(phone: string, code: string): Promise<void>;
}

export class ConsoleOtpSender implements OtpSender {
  private readonly logger = new Logger('OtpSender');

  async send(phone: string, code: string): Promise<void> {
    this.logger.log(`OTP for ${phone}: ${code}`);
  }
}

export class TwilioOtpSender implements OtpSender {
  private readonly logger = new Logger('OtpSender');
  private readonly client: ReturnType<typeof twilio>;
  private readonly fallback = new ConsoleOtpSender();

  constructor(
    accountSid: string,
    authToken: string,
    private readonly from: string,
  ) {
    this.client = twilio(accountSid, authToken);
  }

  async send(phone: string, code: string): Promise<void> {
    try {
      await this.client.messages.create({
        to: phone,
        from: this.from,
        body: `Your Metr verification code is ${code}`,
      });
      this.logger.log(`SMS sent to ${phone}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Twilio SMS failed: ${message}`);
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
      await this.fallback.send(phone, code);
    }
  }
}

export function createOtpSender(config: {
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
}): OtpSender {
  const logger = new Logger('OtpSender');
  const { accountSid, authToken, fromNumber } = config;
  if (accountSid && authToken && fromNumber) {
    logger.log(`Using Twilio from ${fromNumber}`);
    return new TwilioOtpSender(accountSid, authToken, fromNumber);
  }
  logger.warn('Twilio is not configured; OTPs will be logged in the console');
  return new ConsoleOtpSender();
}
