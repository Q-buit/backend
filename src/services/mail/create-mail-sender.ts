import { ConsoleMailSender } from "./console-mail-sender.js";
import type { MailSender } from "./mail-sender.js";
import { SmtpMailSender } from "./smtp-mail-sender.js";

export function createMailSender(): MailSender {
  const provider = process.env.MAIL_PROVIDER ?? "console";

  if (provider === "smtp") {
    return new SmtpMailSender();
  }

  return new ConsoleMailSender();
}
