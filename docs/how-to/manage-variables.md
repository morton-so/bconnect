# 환경변수 관리

> 대상: 전체 개발자<br>
> 학습 목표: 변수의 공개/비밀 여부에 따라 적합한 저장 위치를 선정하고 환경변수를 올바르게 관리할 수 있다.

## 관리 구성

각 다음과 같은 구성으로 환경변수를 관리합니다.

| 구분    | 프로필    | 대상                    | 위치       | 공개값                           | 비밀값             | 비밀값 템플릿              |
| ------- | --------- | ----------------------- | ---------- | -------------------------------- | ------------------ | -------------------------- |
| 로컬    | 전체      | 서비스                  | `apps/*`   | `.envrc`                         | `.envrc.local`     | `.envrc.example`           |
| 로컬    | 전체      | 그 외 패키지 · 스크립트 | `root`     | `.envrc`                         | `.envrc.local`     | `.envrc.example`           |
| 테라폼  | dev, prod | 서비스, 워크플로우      | `infra`    | `variables.tf` (공개값 + 비밀값) | `terraform.tfvars` | `terraform.tfvars.example` |
| Railway | dev, prod | API 서버                | `.railway` | `.envrc`                         | `.envrc.local`     | `.envrc.example`           |

- 각 패키지는 별도로 환경변수를 관리하지 않으며, 개별 서비스에 의해 관리됩니다.
- 인프라에서 관리할 필요가 없는 서비스 내부 값은 서비스 내부에서 별도로 상수값 등으로 관리합니다.

Git에서는 공개값과 비밀값 템플릿 파일만 추적하며, 실제 비밀값은 노션 [환경변수](https://www.notion.so/morton-so/384965d2888b8092be18f7bab46d0f8d) 페이지에서 관리합니다.

### 템플릿

```bash
export VAR_NAME=your_var_name
# 발급처 : [제공자 : 문서 제목](URL)
# 의존성 : 패키지명
# 설명 : 용도

```

- 값은 더미로 작성하고, 실값은 `.envrc` 또는 노션에서 관리합니다
- 의존성 · 설명은 해당 내용이 없으면 생략합니다

## 배포 주입

| 대상           | 주입 경로                                                       | 정의 위치                 |
| -------------- | --------------------------------------------------------------- | ------------------------- |
| Vercel         | 테라폼이 프로젝트 환경변수를 등록                               | `infra/vercel/*.tf`       |
| Railway        | GitHub 시크릿을 워크플로우 env로 전달하고 IaC가 서비스 env 생성 | `.railway/railway.ts`     |
| GitHub Actions | 테라폼이 리포 시크릿을 등록                                     | `infra/github/secrets.tf` |

## 가이드

다음과 같은 절차로 환경변수를 추가합니다.
서비스에서 기대한 환경변수가 없다면, 애플리케이션 시작 시점에 오류가 발생하도록(fast-fail) 로더를 배선합니다.
기본값을 사용하지 않으며, 값이 주입되지 않으면 실패하도록 배치합니다. (fast-fail)

1. 로컬 환경변수
   - 공개값 → `.envrc`
   - 비밀값 → `.envrc.local` + `.envrc.example` + 노션
2. fast-fail 배선
3. 배포 주입 배선
   - Vercel · GitHub 시크릿 → Terraform 적용
   - Railway → `.railway/railway.ts` 배선 후 GitHub 시크릿 등록
4. 노션 업데이트

### 프론트엔드 fast-fail

| 유형         | 설정 위치     | 접근           |
| ------------ | ------------- | -------------- |
| 앱 전용 변수 | `env.ts`      | `env.VAR_NAME` |
| 공통 스키마  | `validate.ts` | `env.VAR_NAME` |

클라이언트 번들에 포함되는 `NEXT_PUBLIC_*` 변수의 경우 fast-fail을 배선하지 않고, `process.env` 객체로 직접 접근합니다.

### 백엔드 fast-fail

1. `application.yaml` 파일에 변수 추가
2. `@ConfigurationProperties` 레코드 생성
   - 일부 환경에서만 쓰는 값은 `@Profile`를 선언한다
3. 레코드 객체를 통해 변수에 접근

## 참조

- TODO write-docs 링크
- [환경변수](https://www.notion.so/morton-so/384965d2888b8092be18f7bab46d0f8d)
