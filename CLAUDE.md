# Chat UI Development Specification

## 프로젝트 개요

React, TypeScript, TailwindCSS를 기반으로 한 모바일 최적화 채팅 UI 애플리케이션을 개발합니다. iOS와 Android 환경에서 네이티브 앱과 같은 사용자 경험을 제공하며, 메시지가 위에서부터 아래로 쌓이는 표준 채팅 인터페이스를 구현합니다.

## 핵심 요구사항

### 1. 기술 스택

- **Framework**: React 18+
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS 3.x
- **Build Tool**: Vite
- **State Management**: Zustand 또는 Context API
- **Utils**: clsx, tailwind-merge
- **Virtual Scrolling**: react-window 또는 react-virtualized

### 2. 참고 라이브러리 분석

프로덕션 레벨의 채팅 UI 구현을 위해 다음 라이브러리들의 아키텍처와 기능을 참고합니다:

#### 주요 오픈소스 라이브러리

- **@chatscope/chat-ui-kit-react**: 가장 널리 사용되는 React 채팅 UI 킷
  - MainContainer, ChatContainer, MessageList 구조 참고
  - Sticky scrollbar 처리 방식
  - ContentEditable 구현 패턴
- **assistant-ui**: AI 채팅에 특화된 컴포넌트 라이브러리
  - Radix-style primitive 접근법
  - 스트리밍 메시지 처리
  - 마크다운 및 코드 하이라이팅
- **react-chat-elements**: 경량 채팅 컴포넌트
  - 메시지 상태 관리 (sent/delivered/read)
  - 타이핑 인디케이터 구현

#### 엔터프라이즈 솔루션 참고사항

- **CometChat/Syncfusion**: 실시간 동기화, 읽음 확인, 온라인 상태
- **Stream Chat React**: 무한 스크롤, 메시지 그룹핑, 스레드 관리

### 3. 프로젝트 구조

```
src/
├── components/
│   ├── chat/
│   │   ├── ChatContainer.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageItem.tsx
│   │   ├── MessageInput.tsx
│   │   ├── PullToRefresh.tsx
│   │   ├── FloatingTimeIndicator.tsx
│   │   └── TypingIndicator.tsx
│   ├── toolbar/
│   │   ├── BottomToolbar.tsx
│   │   └── ToolbarMenu.tsx
│   └── common/
│       └── [재사용 가능한 공통 컴포넌트]
├── hooks/
│   ├── useViewport.ts
│   ├── useKeyboard.ts
│   ├── usePullToRefresh.ts
│   └── useInfiniteScroll.ts
├── utils/
│   └── [유틸리티 함수들]
└── types/
    └── [타입 정의]
```

## 상세 기능 명세

### 4. 메시지 표시 및 스크롤 관리

#### 4.1 메시지 쌓임 방향

- 대화는 **위에서 아래로** 시간 순서대로 표시
- 새 메시지 도착 시 자동으로 최하단 스크롤
- 사용자가 스크롤 중일 때는 자동 스크롤 일시 중지
- "새 메시지" 플로팅 버튼으로 최하단 이동 옵션

#### 4.2 Pull to Refresh 구현

- **기능**: 리스트 최상단에서 아래로 당기면 이전 대화 로드
- **시각적 피드백**:
  - 당기는 정도에 따른 로딩 인디케이터 표시
  - 임계값 도달 시 햅틱 피드백 (모바일)
  - 로딩 중 스피너 애니메이션
- **데이터 처리**:
  - 이전 메시지 배치(batch) 단위로 로드
  - 로드 완료 후 스크롤 위치 유지
  - 중복 요청 방지 (debounce/throttle)

#### 4.3 Floating Time Indicator

- **위치**: 채팅 상단에 고정 플로팅
- **표시 내용**:
  - Pull to refresh 시 현재 시간 업데이트
  - "마지막 업데이트: HH:MM" 형식
- **스타일링**:
  - 반투명 배경 (backdrop-blur 효과)
  - 부드러운 슬라이드 다운 애니메이션

### 5. 키보드 처리 (iOS/Android 대응)

#### 5.1 키보드 감지 전략

- Visual Viewport API를 우선 사용
- Fallback으로 window resize 이벤트 활용
- iOS와 Android의 키보드 동작 차이 처리

#### 5.2 플랫폼별 최적화

- **iOS 특화**:
  - Safe area 처리 (노치, 다이나믹 아일랜드)
  - 키보드 툴바 영역 계산
  - 스크롤 시 키보드 유지 옵션
- **Android 특화**:
  - Soft input mode 대응
  - 키보드 높이 변화 애니메이션
  - 백 버튼으로 키보드 닫기 처리

### 6. Viewport 동적 관리

#### 6.1 실시간 Viewport 계산

- 키보드 상태에 따른 가용 높이 계산
- CSS 커스텀 속성으로 동적 값 관리
- ResizeObserver로 레이아웃 변화 감지

#### 6.2 레이아웃 안정성

- 키보드 열림/닫힘 시 부드러운 전환
- 콘텐츠 점프 방지
- 스크롤 위치 보존

### 7. 바텀시트 툴바 메뉴

#### 7.1 위치 관리

- 기본: viewport 하단 고정
- 키보드 활성화: 키보드 바로 위 위치
- 전환 시 부드러운 애니메이션 (transform3d 활용)

#### 7.2 기능 버튼

- 참고 링크 메뉴
- 더보기 메뉴 (확장 가능)

#### 7.3 Mock 데이터

- react-query를 사용한 Mock 데이터 제공
- 메시지 전송, 편집, 삭제 등의 Mock API 구현
- 이전 메시지 로드 및 Pull to Refresh 테스트용 Mock 데이터

### 8. 재사용 가능한 컴포넌트 설계

#### 8.1 컴포넌트 원칙

- Single Responsibility Principle
- Props drilling 최소화
- Compound Component 패턴 활용
- Render props / Custom hooks 제공

#### 8.2 스타일링 전략

- Tailwind 유틸리티 클래스 기반
- CSS 모듈 fallback
- 테마 커스터마이징 지원
- 다크모드 대응

### 9. 성능 최적화

#### 9.1 렌더링 최적화

- Virtual scrolling으로 대량 메시지 처리
- React.memo와 useMemo 적절히 활용
- 이미지 lazy loading
- 메시지 청크 단위 렌더링

#### 9.2 네트워크 최적화

- 메시지 페이지네이션
- 이미지 썸네일 우선 로드
- WebSocket 재연결 로직
- 오프라인 큐잉

### 11. 접근성 및 UX

#### 11.1 접근성

- ARIA 레이블 및 역할
- 키보드 네비게이션
- 스크린 리더 지원
- 고대비 모드

#### 11.2 사용자 경험

- 햅틱 피드백 (모바일)
- 스켈레톤 로딩
- 에러 상태 처리
- 빈 상태 안내

### 12. storybook 및 문서화

- Storybook을 사용한 컴포넌트 문서화
- 각 컴포넌트의 사용 예시 및 API 문서화
- Chromatic을 통한 시각적 회귀 테스트
- 개발 가이드 및 API 문서 작성

### 13. 테스트 전략

- Unit Testing: Vitest + React Testing Library
- Integration Testing: 컴포넌트 간 상호작용
- E2E Testing: Playwright (모바일 뷰포트 포함)
- Visual Regression: Storybook + Chromatic

### 14. 개발 단계별 구현 순서

#### Phase 1: 기본 구조

- ChatContainer, MessageList 구현
- 기본 메시지 표시
- 스크롤 관리

#### Phase 2: Pull to Refresh

- 이전 메시지 로드
- Floating time indicator
- 로딩 상태 관리

#### Phase 3: 키보드 및 Viewport

- 플랫폼별 키보드 처리
- Viewport 동적 계산
- 레이아웃 안정화

#### Phase 4: 바텀 툴바

- 툴바 위치 관리
- 키보드 연동
- 기능 버튼 구현

#### Phase 5: 고급 기능

- Virtual scrolling
- 실시간 동기화
- 성능 최적화

#### Phase 6: 마무리

- 테스트 작성
- 문서화
- 배포 준비

## 환경 설정 및 배포

### 필수 메타 태그

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<meta name="apple-mobile-web-app-capable" content="yes" />
```

### 모니터링

- 성능 메트릭 수집
- 에러 트래킹
- 사용자 행동 분석

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

      
      IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.