import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import { Resend } from 'resend';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transport: 'smtp' | 'resend';
  private smtpTransporter?: Transporter;
  private resend?: Resend;

  private readonly from =
    process.env.MAIL_FROM ?? 'Checa Antes <no-reply@checaantes.com.br>';
  private readonly appUrl = process.env.APP_URL ?? 'http://localhost:3000';

  onModuleInit() {
    this.transport = process.env.MAIL_TRANSPORT === 'resend' ? 'resend' : 'smtp';

    if (this.transport === 'resend') {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        this.logger.error(
          'MAIL_TRANSPORT=resend mas RESEND_API_KEY não está definida. ' +
            'Os e-mails não serão enviados até a chave ser configurada.',
        );
        return;
      }
      this.resend = new Resend(apiKey);
      this.logger.log('Transporte de e-mail: Resend.');
      return;
    }

    this.smtpTransporter = nodemailer.createTransport({
      host: process.env.MAIL_SMTP_HOST ?? 'localhost',
      port: parseInt(process.env.MAIL_SMTP_PORT ?? '1025', 10),
      secure: false,
      ignoreTLS: true,
    });
    this.logger.log(
      `Transporte de e-mail: SMTP (${process.env.MAIL_SMTP_HOST ?? 'localhost'}:${
        process.env.MAIL_SMTP_PORT ?? '1025'
      }).`,
    );
  }

  async sendConfirmationEmail(
    to: string,
    name: string,
    token: string,
  ): Promise<void> {
    const confirmUrl = `${this.appUrl}/auth/confirm?token=${encodeURIComponent(
      token,
    )}`;

    const subject = 'Confirme seu cadastro no Checa Antes';
    const text =
      `Olá, ${name}!\n\n` +
      `Para ativar sua conta no Checa Antes, confirme seu e-mail acessando o link:\n` +
      `${confirmUrl}\n\n` +
      `Se você não criou essa conta, pode ignorar este e-mail.`;
    const html = `
      <p>Olá, ${name}!</p>
      <p>Para ativar sua conta no <strong>Checa Antes</strong>, confirme seu e-mail:</p>
      <p><a href="${confirmUrl}">Confirmar meu e-mail</a></p>
      <p>Ou copie e cole este endereço no navegador:<br>${confirmUrl}</p>
      <p style="color:#888">Se você não criou essa conta, pode ignorar este e-mail.</p>
    `;

    await this.sendMail({ to, subject, html, text });
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    code: string,
  ): Promise<void> {
    const subject = 'Código para redefinir sua senha — Checa Antes';
    const text =
      `Olá, ${name}!\n\n` +
      `Use o código abaixo para redefinir sua senha no Checa Antes:\n\n` +
      `${code}\n\n` +
      `O código expira em 15 minutos. Se você não pediu a redefinição, ignore este e-mail.`;
    const html = `
      <p>Olá, ${name}!</p>
      <p>Use o código abaixo para redefinir sua senha no <strong>Checa Antes</strong>:</p>
      <p style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</p>
      <p>O código expira em 15 minutos.</p>
      <p style="color:#888">Se você não pediu a redefinição, ignore este e-mail.</p>
    `;

    await this.sendMail({ to, subject, html, text });
  }

  async sendEmailChangeConfirmation(
    to: string,
    name: string,
    token: string,
  ): Promise<void> {
    const confirmUrl = `${this.appUrl}/auth/confirm?token=${encodeURIComponent(
      token,
    )}`;

    const subject = 'Confirme seu novo e-mail — Checa Antes';
    const text =
      `Olá, ${name}!\n\n` +
      `Recebemos um pedido para trocar o e-mail da sua conta no Checa Antes para este endereço.\n` +
      `Confirme acessando o link:\n${confirmUrl}\n\n` +
      `Se você não pediu essa troca, ignore este e-mail — seu e-mail atual continua válido.`;
    const html = `
      <p>Olá, ${name}!</p>
      <p>Recebemos um pedido para trocar o e-mail da sua conta no <strong>Checa Antes</strong> para este endereço.</p>
      <p><a href="${confirmUrl}">Confirmar novo e-mail</a></p>
      <p>Ou copie e cole no navegador:<br>${confirmUrl}</p>
      <p style="color:#888">Se você não pediu essa troca, ignore este e-mail — seu e-mail atual continua válido.</p>
    `;

    await this.sendMail({ to, subject, html, text });
  }

  private async sendMail(options: SendMailOptions): Promise<void> {
    if (this.transport === 'resend') {
      if (!this.resend) {
        throw new Error(
          'Resend não está configurado (RESEND_API_KEY ausente).',
        );
      }
      const { error } = await this.resend.emails.send({
        from: this.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      if (error) {
        throw new Error(`Falha ao enviar e-mail via Resend: ${error.message}`);
      }
      return;
    }

    await this.smtpTransporter!.sendMail({
      from: this.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }
}
