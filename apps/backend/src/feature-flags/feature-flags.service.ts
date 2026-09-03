import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Unleash, type Context } from 'unleash-client';

@Injectable()
export class FeatureFlagsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FeatureFlagsService.name);
  private client: Unleash;
  private ready = false;

  onModuleInit() {
    this.client = new Unleash({
      url: process.env.UNLEASH_URL!,
      appName: process.env.UNLEASH_APP_NAME ?? 'checaantes-backend',
      customHeaders: { Authorization: process.env.UNLEASH_API_TOKEN! },
    });

    this.client.on('ready', () => {
      this.ready = true;
      this.logger.log('Conectado ao Unleash com sucesso.');
    });

    this.client.on('error', (err: Error) => {
      this.logger.error(`Erro na conexão com o Unleash: ${err.message}`);
    });
  }

  isEnabled(flagName: string, context?: Context): boolean {
    if (!this.ready) {
      return false;
    }
    return this.client.isEnabled(flagName, context);
  }

  onModuleDestroy() {
    this.client?.destroy();
  }
}
