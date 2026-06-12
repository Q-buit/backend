import type { MailSender, SendMailInput } from "./mail-sender.js";

export class ConsoleMailSender implements MailSender {
  async send(input: SendMailInput): Promise<void> {
    console.info("[mail:console]", {
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
  }
}
