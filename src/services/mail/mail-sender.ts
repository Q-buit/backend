export type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export interface MailSender {
  send(input: SendMailInput): Promise<void>;
}
