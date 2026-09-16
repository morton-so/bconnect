# 온보딩 문서

> 대상: 신입 개발자<br>
> 학습 목표: 첫 PR을 머지해서 워크플로우를 1회 수행하기

## Phase 1. 협업 도구

[외부 서비스](../reference/third-party.md) 문서를 참조해 다음 절차 수행

1. 조직 · 워크스페이스 권한 부여
2. CLI · MCP 설치 및 인증

```bash
pnpm i -g vercel
vercel login

npm i -g @railway/cli
railway login

npm i -g firebase-tools
firebase login

npm i -g @sentry/cli
sentry-cli login

# 수동 설치 후 인증
aws login
gcloud auth login
gh auth login
```

## Phase 2. 개발 환경 세팅

- [Node.js : Download](https://nodejs.org/en/download)
- [pnpm : Installation](https://pnpm.io/installation)
- [Adoptium : Temurin Releases](https://adoptium.net/temurin/releases)
- [direnv : Installation](https://direnv.net/docs/installation.html)
- [Visual Studio Code : Download](https://code.visualstudio.com/download)
- [extensions.json](../../.vscode/extensions.json)
- [Claude Code : 설정](https://code.claude.com/docs/ko/setup)

다음 파일로 버전 확인

- [pnpm-workspace.yaml](../../pnpm-workspace.yaml)
- [package.json](../../package.json)

## Phase 3. 서버 가동

### Step 1. 리포지토리 클론

```bash
git clone git@github.com:morton-so/bconnect.git
cd bconnect
```

### Step 2. 환경변수 주입

1. `.envrc.local` 파일 설정. [환경변수](https://www.notion.so/morton-so/384965d2888b8092be18f7bab46d0f8d) 문서 참고
2. direnv hook 설정 · 디렉터리 활성화. [direnv :: hook](https://direnv.net/docs/hook.html) 문서 참고

```bash
echo 'eval "$(direnv hook bash)"' >> ~/.bashrc # bash shell 기준
direnv allow
```

### Step 3. 의존성 설치 · 서버 가동

```bash
cd apps/api && ./gradlew bootRun  # BE

pnpm install --frozen-lockfile

pnpm dev:career # 기술자 FE
pnpm dev:plan   # 업체 FE
```

## Phase 4. 워크플로우 실습

[개발법](../how-to/development.md) 문서 참고

추가로 내부 문서 모두 확인해주시고 궁금한 점 있으면 편하게 질문 주세요.
환영합니다.
