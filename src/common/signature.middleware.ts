import {
  Injectable,
  NestMiddleware,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import { computeHmacHex } from './utils';

@Injectable()
export class SignatureMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SignatureMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const signature = req.header('x-razorpay-signature'); // incoming signature header
    const secret = process.env.SHARED_SECRET || 'test_secret'; // shared secret

    this.logger.debug(`Incoming request: ${req.method} ${req.originalUrl}`);

    // Raw body was attached in main.ts via bodyParser "verify"
    const rawBody = (req as any).rawBody;
    if (!rawBody) {
      this.logger.warn('Missing raw request body (cannot verify signature)');
      throw new ForbiddenException('Missing raw request body');
    }

    // Compute expected HMAC using the shared secret
    const expected = computeHmacHex(secret, rawBody);
    this.logger.verbose(`Computed HMAC for request: ${expected}`);

    let valid = false;
    try {
      // Constant-time comparison of computed vs received signature
      valid = signature
        ? crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
        : false;
    } catch (err) {
      this.logger.error(
        `Error during signature validation: ${err.message}`,
      );
      valid = false;
    }

    // If signature is invalid or missing → reject
    if (!valid) {
      this.logger.warn(
        `Signature mismatch. Received: ${signature ?? 'none'}, Expected: ${expected}`,
      );
      throw new ForbiddenException('Invalid or missing signature');
    }

    this.logger.log('Signature validation passed');
    next(); // continue to controller
  }
}
