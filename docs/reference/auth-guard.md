# 인증 상태에 따른 페이지 접근 권한

> 대상: 프론트엔드 개발자<br>
> 학습 목표: plan, career 사용자 권한에 따른 페이지별 가드 동작을 확인한다<br>
> 위치: `apps/plan`, `apps/career`

## 판정 기준

| 조건          | 판정 소스                               |
| ------------- | --------------------------------------- |
| 로그인        | `readAuthHint()` 표시 쿠키              |
| 권한          | `GET /api/v1/members/me` 응답의 `roles` |
| 회원가입 토큰 | 가입 저장소 `formData.signupToken`      |

- 로그인 상태에서 권한 조회가 끝나기 전에는 가입 · 로그인 화면을 그리지 않는다
- 권한 조회가 401로 실패하면 비로그인 기준으로 이동한다
- 권한 조회가 그 외 사유로 실패하면 권한 없음 기준으로 이동한다

## plan

### 흐름

1. OTP 인증 : `/login`
2. 회원가입 : `/signup/member`. 가입 요청 후 로그인
3. 업체 생성 : `/signup/corp`. 생성 시 PLAN 권한 부여

### 가드

| 경로             | 비로그인 & signup 없음 | 비로그인 & signup 있음 | 로그인 & PLAN 없음 | 로그인 & PLAN 있음 |
| ---------------- | ---------------------- | ---------------------- | ------------------ | ------------------ |
| `/login`         | 체류                   | 체류                   | → `/signup/corp`   | → `/`              |
| `/signup/member` | → `/login`             | 체류                   | → `/signup/corp`   | → `/`              |
| `/signup/corp`   | → `/login`             | → `/login`             | 체류               | → `/`              |
| `/`              | 체류                   | 체류                   | → `/signup/corp`   | 체류               |
| `/` 하위         | → `/login`             | → `/login`             | → `/signup/corp`   | 체류               |

- 비로그인 상태로 패널 접근시 `/login`으로 이동

### 담당 파일

- [public-routes.ts](../../apps/plan/src/lib/public-routes.ts)
- [proxy.ts](../../apps/plan/src/proxy.ts)
- [login/layout.tsx](../../apps/plan/src/app/login/layout.tsx)
- [signup/layout.tsx](../../apps/plan/src/app/signup/layout.tsx)
- [SignupGuard.tsx](../../apps/plan/src/components/SignupGuard.tsx)
- [(main)/layout.tsx](<../../apps/plan/src/app/(main)/layout.tsx>)
- [AccessGuard.tsx](../../packages/features/src/AccessGuard.tsx)

## career

### 흐름

1. OTP 인증 : `/login`
2. 회원가입 : `/signup/member`. 가입 요청 후 로그인
3. 프로필 생성 : `/signup/profile`. 생성 시 CAREER 권한 부여

### 가드

| 경로               | 비로그인 & signup 없음 | 비로그인 & signup 있음 | 로그인 & CAREER 없음 | 로그인 & CAREER 있음 |
| ------------------ | ---------------------- | ---------------------- | -------------------- | -------------------- |
| `/login`           | 체류                   | 체류                   | → `/signup/profile`  | → `/`                |
| `/signup/member`   | → `/login`             | 체류                   | → `/signup/profile`  | → `/`                |
| `/signup/profile`  | → `/login`             | → `/login`             | 체류                 | → `/`                |
| `/signup/complete` | 체류                   | 체류                   | → `/signup/profile`  | 체류                 |
| `/`, 공개 경로     | 체류                   | 체류                   | → `/signup/profile`  | 체류                 |
| 그 외 `/` 하위     | → `/login`             | → `/login`             | → `/signup/profile`  | 체류                 |

### 담당 파일

- [public-routes.ts](../../apps/career/src/lib/public-routes.ts)
- [proxy.ts](../../apps/career/src/proxy.ts)
- [login/layout.tsx](../../apps/career/src/app/login/layout.tsx)
- [signup/layout.tsx](../../apps/career/src/app/signup/layout.tsx)
- [SignupGuard.tsx](../../apps/career/src/components/SignupGuard.tsx)
- [(main)/layout.tsx](<../../apps/career/src/app/(main)/layout.tsx>)
- [instagram/layout.tsx](../../apps/career/src/app/instagram/layout.tsx)
- [AccessGuard.tsx](../../packages/features/src/AccessGuard.tsx)
