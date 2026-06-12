import type { Track } from "../../domain/question.js";
import type { MailSender } from "./mail-sender.js";

type SendVerifyMailInput = {
  email: string;
  tracks: Track[];
  verifyUrl: string;
};

type SendActivationMailInput = {
  email: string;
  tracks: Track[];
  manageUrl: string;
};

const trackLabels: Record<Track, string> = {
  frontend: "프론트엔드",
  backend: "백엔드",
};

export class SubscriptionMailService {
  constructor(private readonly mailSender: MailSender) {}

  async sendVerifyMail(input: SendVerifyMailInput): Promise<void> {
    const trackText = input.tracks.map((track) => trackLabels[track]).join(", ");
    const subject = "[Q-ubit] 구독 인증 링크를 확인해 주세요";
    const text = [
      "Q-ubit 구독 신청을 완료하려면 아래 링크를 눌러주세요.",
      "",
      `선택한 직군: ${trackText}`,
      `인증 링크: ${input.verifyUrl}`,
      "",
      "이 링크는 24시간 동안 유효합니다.",
    ].join("\n");
    const html = [
      "<p>Q-ubit 구독 신청을 완료하려면 아래 링크를 눌러주세요.</p>",
      `<p><strong>선택한 직군:</strong> ${trackText}</p>`,
      `<p><a href="${input.verifyUrl}">구독 인증하기</a></p>`,
      "<p>이 링크는 24시간 동안 유효합니다.</p>",
    ].join("");

    await this.mailSender.send({
      to: input.email,
      subject,
      text,
      html,
    });
  }

  async sendActivationMail(input: SendActivationMailInput): Promise<void> {
    const trackText = input.tracks.map((track) => trackLabels[track]).join(", ");
    const subject = "[Q-ubit] 구독이 시작되었습니다";
    const text = [
      "Q-ubit 구독 인증이 완료되었습니다.",
      "",
      `구독 직군: ${trackText}`,
      "구독 관리 페이지에서 현재 상태를 확인하거나 구독을 취소할 수 있습니다.",
      `구독 관리 링크: ${input.manageUrl}`,
    ].join("\n");
    const html = [
      "<p>Q-ubit 구독 인증이 완료되었습니다.</p>",
      `<p><strong>구독 직군:</strong> ${trackText}</p>`,
      "<p>구독 관리 페이지에서 현재 상태를 확인하거나 구독을 취소할 수 있습니다.</p>",
      `<p><a href="${input.manageUrl}">구독 관리하기</a></p>`,
    ].join("");

    await this.mailSender.send({
      to: input.email,
      subject,
      text,
      html,
    });
  }
}
