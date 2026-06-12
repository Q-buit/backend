import nodemailer from "nodemailer";
import type { MailSender, SendMailInput } from "./mail-sender.js";

export class SmtpMailSender implements MailSender {
  private readonly transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "localhost",
    port: Number(process.env.SMTP_PORT ?? 25),
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  });

  async send(input: SendMailInput): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM ?? "Q-ubit <no-reply@localhost>",
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
  }
}
