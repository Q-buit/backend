import type { Question } from "../domain/question.js";

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
    followUps: [
      {
        question: "React.memo는 어떤 경우에 효과가 있나요?",
        answer: "부모 리렌더링이 잦고 props가 자주 같게 유지되는 컴포넌트에서 효과가 있습니다.",
      },
      {
        question: "state를 잘게 나누면 어떤 장단점이 있나요?",
        answer: "업데이트 범위를 줄이기 쉽지만 상태 조합이 많아지면 관리 복잡도가 올라갈 수 있습니다.",
      },
    ],
    questionOrder: 1,
    isPublished: true,
  },
  {
    id: 2,
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
    followUps: [
      {
        question: "외부 API 호출이 트랜잭션 안에 있으면 어떤 문제가 생기나요?",
        answer: "트랜잭션 점유 시간이 길어지고 롤백 불가능한 외부 부작용과 DB 상태가 엇갈릴 수 있습니다.",
      },
      {
        question: "보정 트랜잭션과 재시도 정책은 어떻게 나눴나요?",
        answer: "즉시 재시도가 가능한 실패와 운영 보정이 필요한 실패를 분리해서 처리해야 합니다.",
      },
    ],
    questionOrder: 1,
    isPublished: true,
  },
];
