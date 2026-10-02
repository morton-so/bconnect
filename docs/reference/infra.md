# 인프라 관리 구조

> 대상: 인프라 개발자<br>
> 학습 목표: 테라폼 인프라를 공급자에 따라 관리할 수 있다 <br>
> 위치: `infra/`

## 관리 서비스

### AWS

| 서비스     | prod                 | dev                      | 공용                               |
| ---------- | -------------------- | ------------------------ | ---------------------------------- |
| iam        |                      |                          | IAM 그룹 · 사용자                  |
| s3         | `bconnect-storage`   | `bconnect-storage-dev`   | 테라폼 버전 관리                   |
| cloudfront | `static.bconnect.to` | `static.dev.bconnect.to` |                                    |
| acm        | static 인증서        | static.dev 인증서        |                                    |
| lambda     | 버킷 트리거          | 버킷 트리거              | `instagram-parser`, `image-resize` |
| sns        |                      |                          | `bconnect-fcm`                     |

### Railway

### Vercel

| 서비스  | prod                 | dev                      |
| ------- | -------------------- | ------------------------ |
| career  | `career.bconnect.to` | `career.dev.bconnect.to` |
| plan    | `plan.bconnect.to`   | `plan.dev.bconnect.to`   |
| company | `bconnect.to`        | `dev.bconnect.to`        |

### Google

| 서비스   | 내용                         |
| -------- | ---------------------------- |
| iam      | sdk 계정에 FCM 권한 바인딩   |
| gcp      | `bconnect` 프로젝트          |
| firebase | GCP 프로젝트에 Firebase 연결 |
| fcm      | `career`, `plan` 앱 등록     |

### GitHub

| 서비스  | 내용                     |
| ------- | ------------------------ |
| secrets | 워크플로우 변수 · 비밀값 |

## 프로바이더 인증 (최초 1회)

| 프로바이더  | 인증 방식                  | 인증 방법                        |
| ----------- | -------------------------- | -------------------------------- |
| aws         | 자격증명 자동 탐색 체인    | `aws login`                      |
| vercel      | `vercel_token` 테라폼 변수 | `terraform.tfvars` 주입          |
| google-beta | ADC                        | `gcloud auth login --update-adc` |
| github      | `GITHUB_TOKEN` 환경변수    | `.envrc.local` 주입              |

AWS · GCP 프로바이더는 CLI로 인증 가능하다.

```bash
# AWS
aws login

# GCP (ADC 인증)
gcloud auth application-default login # 인증
gcloud auth application-default set-quota-project bconnect-f0bee # 프로젝트 설정
```

### AWS process 프로필

`hashicorp/aws` 프로바이더는 `aws login` 세션을 읽지 못하므로 `credential_process` 프로필을 거쳐 자격증명을 받는다.

```ini
# ~/.aws/config
[profile process]
credential_process = aws configure export-credentials --profile default --format process
region = ap-northeast-2
```

`infra/.envrc`는 `AWS_PROFILE=process`를 지정한다.

참고 : [Sharing Login credentials as process credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sign-in.html#cli-configure-sign-in-cached-credentials)
