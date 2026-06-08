# Q-ubit API Schema Plan

이 문서는 현재 서버 레포의 MVP 기준 스키마 구조와 구현 방식을 정리한 문서다.

## 1. 핵심 원칙

- 회원가입은 없다.
- 이메일 구독 기반 서비스다.
- 이메일 인증은 `인증 링크` 방식으로 간다.
- 질문 상세 페이지 URL은 직군별로 분리한다.
  - `/frontend/questions/[id]`
  - `/backend/questions/[id]`
- 질문 번호는 직군별로 1부터 시작한다.
- 질문이 모두 소진되면 다시 처음부터 순환한다.
- 단, `미수신 신규 질문 우선` 정책을 둔다.

## 2. 테이블

### 2.1 `subscribers` — 구독자

- `id`
- `email`
- `status`
- `consent_to_receive`
- `created_at`
- `updated_at`

### 2.2 `subscriber_tracks` — 구독자 직군 구독

한 구독자가 프론트/백엔드를 각각 구독할 수 있다.

- `id`
- `subscriber_id`
- `track`
- `status`
- `current_question_order`
- `last_clicked_at`
- `activated_at`
- `dormant_at`
- `unsubscribed_at`
- `created_at`
- `updated_at`

메모:
- `both`는 DB 값으로 저장하지 않는다.
- `둘 다` 선택 시 `frontend`, `backend` 두 행을 만든다.

### 2.3 `questions` — 질문

- `id`
- `track`
- `category`
- `question_type`
- `recommended_framework`
- `title`
- `question_text`
- `concept_summary`
- `model_answer`
- `follow_ups`
- `question_order`
- `is_published`
- `created_at`
- `updated_at`

메모:
- `id`는 내부 PK다.
- 사용자에게 보이는 질문 번호와 발송 순서는 `question_order`를 사용한다.
- `question_order`는 직군별로 1부터 시작한다.
- `(track, question_order)`는 unique로 묶는다.
- `display_order`는 따로 두지 않는다.

### 2.4 `deliveries` — 발송 이력

- `id`
- `subscriber_track_id`
- `question_id`
- `status`
- `sent_at`
- `clicked_at`
- `created_at`
- `updated_at`

역할:
- 어떤 구독자 직군 구독에
- 어떤 질문을
- 언제 보냈는지 기록한다.

### 2.5 `subscription_tokens` — 구독 토큰

- `id`
- `subscriber_id`
- `type`
- `token_hash`
- `expires_at`
- `used_at`
- `created_at`

용도:
- 인증 링크
- 구독 관리 링크
- 구독 취소 링크

## 3. Enum

### 3.1 Track

- `frontend`
- `backend`

### 3.2 Subscriber Status

- `pending`
- `active`
- `dormant`
- `unsubscribed`

### 3.3 Question Type

- `concept`
- `experience`

### 3.4 Recommended Framework

- `PREP`
- `STAR`

### 3.5 Delivery Status

- `queued`
- `sent`
- `failed`

### 3.6 Token Type

- `verify`
- `manage`
- `unsubscribe`

## 4. follow_ups 저장 방식

꼬리 질문은 별도 테이블로 분리하지 않는다.

이유:
- 질문의 하위 데이터다.
- 독립 검색/통계 대상이 아니다.
- MVP에서는 1~2개 수준이면 충분하다.

저장 방식은 JSON 배열이다.

예시:

```json
[
  {
    "question": "가상 DOM이 필요한 이유는?",
    "answer": "변경 범위를 효율적으로 비교하기 위해서입니다."
  },
  {
    "question": "key prop은 왜 중요한가요?",
    "answer": "리스트 요소 식별을 안정적으로 하기 위해서입니다."
  }
]
```

## 5. 질문 번호와 URL 규칙

- 프론트 질문 번호: `1, 2, 3, ...`
- 백엔드 질문 번호: `1, 2, 3, ...`

예:
- `/frontend/questions/1`
- `/backend/questions/1`

여기서 URL의 `[id]`는 내부 PK가 아니라 `question_order`처럼 동작한다.

서버 조회 기준:
- `track = frontend`
- `question_order = 1`

또는

- `track = backend`
- `question_order = 1`

## 6. 발송 순서 정책

기본 정책:
- 각 직군별 `question_order` 순서대로 발송한다.

질문이 끝난 경우:
- 다시 `1번`부터 순환한다.

단순 순환의 문제:
- 나중에 새 질문이 추가되면 이미 순환 중인 사용자가 새 질문을 늦게 보게 된다.

그래서 최종 정책은 다음과 같다.

1. 미수신 질문이 있으면 그것을 우선 발송
2. 더 이상 미수신 질문이 없으면 1번부터 순환

즉:
- `미수신 질문 우선`
- `없으면 순환`

## 7. 인증 방식

매일메일은 인증 코드 방식이었지만, Q-ubit은 인증 링크 방식으로 간다.

흐름:
1. 구독 신청
2. `pending` 상태 생성
3. 인증 메일 발송
4. 링크 클릭
5. `active` 전환

## 8. 현재 Prisma 초안과 다른 점

현재 `prisma/schema.prisma` 초안과 비교했을 때, 이후 수정이 필요한 부분:

- `Subscriber.consentToMarketing` -> `consent_to_receive` 의미로 정리 필요
- `SubscriberTrack.categories` 제거 예정
- `SubscriberTrack.currentSequence` -> `current_question_order`로 정리 필요
- `Question.slug`는 현재 필수 아님
- `Question.question` -> `question_text`
- `Question.followUps`는 `string[]`가 아니라 JSON 구조 필요
- `Question.sequenceNo` -> `question_order`
- `Question.isActive` -> `is_published`
- `Delivery.subscriberId`는 `subscriber_track_id` 기준으로 바뀌어야 함
- `Token` -> `subscription_tokens`
- `Token.used_at` 필드 추가 필요

## 9. 구현 계획

현재 프론트는 형태가 잡혀 있고, 서버는 아직 뼈대 수준이다.

다음 순서로 구현한다.

### 9.1 질문 조회 API 정리

- 질문 상세 1개 조회
- mock 데이터 구조 정리
- `title`, `question`, `conceptSummary`, `modelAnswer`, `followUps` 필드 확정

### 9.2 구독 API 실제화

- `POST /subscriptions`
- 이메일, 직군, 동의 저장
- placeholder 상태 제거
- 최소한 DB 저장까지 실제 동작하게 구현

### 9.3 DB 연결

- PostgreSQL 연결
- Prisma schema 정리
- `subscribers`, `subscriber_tracks`, `questions` 우선 생성

이 단계가 가장 중요하다.

### 9.4 관리자 질문 등록 API

- 질문 추가
- 질문 목록 조회
- 질문 수정
- 질문 공개/비공개

### 9.5 이메일 인증 토큰

- 구독 신청 후 인증 링크 발급
- verify endpoint 구현
- 회원가입이 없으므로 이 토큰이 핵심 식별 방식이다

### 9.6 구독 취소

- unsubscribe token 발급
- 구독 중지 처리

### 9.7 메일 발송 모듈 뼈대

- 실제 Postfix 연동 전이라도 인터페이스 분리
- `MailSender` 같은 추상화 구성
- 나중에 SMTP를 붙이기 쉽게 구조 분리

## 10. 구현 우선순위

### 1순위

- DB 연결
- 구독 저장
- 질문 조회 실제화

### 2순위

- 이메일 인증
- 구독 취소

### 3순위

- 관리자 질문 CRUD
- 발송 스케줄링
