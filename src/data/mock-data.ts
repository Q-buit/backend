import type { Question, QuestionFollowUpLink } from "../domain/question.js";

export const questions: Question[] = [
  {
    id: 1,
    track: "frontend",
    category: "React",
    questionType: "concept",
    recommendedFramework: "PREP",
    title: "리렌더링은 언제 발생하나요?",
    questionText: "React 컴포넌트에서 리렌더링이 언제 발생하는지 설명해 주세요.",
    conceptSummary:
      "리렌더링은 state 변경, props 변경, 부모 컴포넌트 리렌더링, context 값 변경 같은 이벤트를 계기로 발생합니다. 다만 실제 DOM 변경은 이전 결과와 새 결과의 diff 이후 필요한 범위에만 반영됩니다.",
    modelAnswer:
      "리렌더링은 state나 props가 바뀌었을 때 주로 발생합니다. React는 함수 컴포넌트를 다시 실행해서 새로운 UI 결과를 계산하고, 이전 결과와 비교한 뒤 실제 DOM에는 필요한 변경만 반영합니다. 예를 들어 부모가 다시 렌더링되면 자식도 다시 평가될 수 있으므로 memo 같은 최적화가 필요할 수 있습니다. 정리하면 리렌더링은 컴포넌트 재실행 단계이고, 실제 DOM 갱신과는 구분해서 봐야 합니다.",
    followUps: [],
    questionOrder: 1,
    isPublished: true,
  },
  {
    id: 2,
    track: "frontend",
    category: "React",
    questionType: "concept",
    recommendedFramework: "PREP",
    title: "React.memo는 언제 효과가 있나요?",
    questionText: "React.memo가 효과적인 상황과 그렇지 않은 상황을 설명해 주세요.",
    conceptSummary:
      "React.memo는 props가 동일할 때 불필요한 리렌더링을 줄이는 데 도움이 됩니다. 다만 props가 자주 바뀌거나 비교 비용이 큰 경우에는 효과가 크지 않을 수 있습니다.",
    modelAnswer:
      "React.memo는 부모가 자주 리렌더링되더라도 자식 props가 동일하게 유지되는 컴포넌트에서 효과가 있습니다. 예를 들어 리스트 아이템처럼 렌더링 비용이 있고 props 변화가 드문 경우에 적합합니다. 반대로 props가 매번 새 객체로 만들어지거나 컴포넌트 자체가 매우 가볍다면 얻는 이점이 적을 수 있습니다. 그래서 memo는 무조건 적용하기보다 실제 리렌더링 비용과 props 안정성을 같이 봐야 합니다.",
    followUps: [],
    questionOrder: 2,
    isPublished: true,
  },
  {
    id: 3,
    track: "backend",
    category: "Spring Boot",
    questionType: "experience",
    recommendedFramework: "STAR",
    title: "트랜잭션 문제를 해결한 경험이 있나요?",
    questionText: "실무나 프로젝트에서 트랜잭션 처리 문제를 발견하고 해결한 경험을 설명해 주세요.",
    conceptSummary:
      "경험형 질문이지만 설명 과정에서 트랜잭션 범위, 롤백 조건, 외부 시스템 연동 시점 같은 개념을 함께 점검해야 합니다.",
    modelAnswer:
      "결제 상태와 주문 상태가 어긋나는 문제가 있었습니다. 저는 주문 생성과 결제 승인 저장이 서로 다른 시점에 커밋되면서 불일치가 생긴다고 판단했습니다. 그래서 트랜잭션 경계를 서비스 단위로 재정리하고, 외부 호출 이후 상태 저장 순서를 바꾸고, 실패 시 보정 로직도 추가했습니다. 그 결과 재현되던 데이터 불일치 케이스를 제거했고 이후에는 정산 이슈가 발생하지 않았습니다.",
    followUps: [],
    questionOrder: 1,
    isPublished: true,
  },
  {
    id: 4,
    track: "backend",
    category: "Spring Boot",
    questionType: "concept",
    recommendedFramework: "PREP",
    title: "외부 API 호출을 트랜잭션 안에 넣으면 왜 문제가 되나요?",
    questionText: "외부 API 호출이 데이터베이스 트랜잭션 안에 있을 때 생길 수 있는 문제를 설명해 주세요.",
    conceptSummary:
      "트랜잭션 안의 외부 호출은 락 점유 시간을 늘리고, DB 트랜잭션과 외부 시스템 상태를 일관되게 관리하기 어렵게 만듭니다.",
    modelAnswer:
      "외부 API 호출을 트랜잭션 안에 넣으면 트랜잭션이 오래 유지되면서 락 점유 시간이 늘어날 수 있습니다. 또 외부 호출은 이미 실행됐는데 DB는 롤백되는 식으로 상태가 어긋날 위험도 있습니다. 예를 들어 결제 승인 요청이 성공했는데 주문 저장이 실패하면 외부 시스템과 내부 DB가 불일치하게 됩니다. 그래서 외부 부작용과 DB 커밋 시점을 분리하거나 보정 전략을 같이 설계해야 합니다.",
    followUps: [],
    questionOrder: 2,
    isPublished: true,
  },
];

export const questionFollowUpLinks: QuestionFollowUpLink[] = [
  {
    id: 1,
    questionId: 1,
    followUpQuestionId: 2,
    displayOrder: 1,
  },
  {
    id: 2,
    questionId: 3,
    followUpQuestionId: 4,
    displayOrder: 1,
  },
];
