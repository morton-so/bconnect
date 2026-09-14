# AGENTS.md

## 프로젝트 구조

프로젝트는 pnpm 모노레포 구조

- `apps/career` - 기술자용 앱
- `apps/plan` - 업체용 웹
- `apps/company` - 회사 홈페이지
- `apps/crawler` - 기술자 크롤러
- `apps/api` - API 서버 (Spring Framework)
- `packages/ui` - 공유 UI 컴포넌트 (Tailwind V4)
- `packages/api-client` - 자동 생성 API 클라이언트 (Orval)
- `packages/config` - 공유 설정
- `packages/features` - 공유 UI
- `packages/mocks` - MSW 핸들러
- `packages/devtools` - 개발 도구 (MSW, Agentation)
- `packages/push` - 푸시 알림 UI · 클라이언트
- `packages/data-jobs` - 원클릭 조회 데이터 동기화

## 가이드

- 읽기 작업은 READ 도구로, 쓰기 작업은 WRITE 도구로 처리
- 사용자가 승인한 사항과 AI가 제안한 사항을 구분
- 특정 명령어에 대한 오류가 3회 이상 발생한 경우 해당 작업을 생략·보고
- 보고서 생성시 HTML 형식 우선

## 문체

- 두괄식 · 개조식으로 간결하게 서술
- 한 문장은 한 가지 핵심만 서술
- 고유 표현은 원문 그대로 인용
- em dash · 이모지 사용 금지
- 괄호 · 주석 작성 자제

## 사실성

- 라이브러리 활용시 공식 문서를 근거로 답변
- 웹 검색시 신뢰할 만한 국문·영문 자료를 근거로 답변
- 단일 출처 : 지정된 원본만 근거로 사용. 사전지식 혼입 금지
- 창작 금지 : 원본에 없는 내용을 추측해 채우지 않음
- 파생 금지 : 2차 문서 작성시 1차 문서만 출처로 사용
- 부재 명시 : 정보가 없으면 없다고 기술
- 출처 명시 : 외부 참조시 래퍼런스, 내부 참조시 파일명/위치 명시

## 문서 목록

[Diátaxis](https://diataxis.fr) 프레임워크에 따라 문서 위치를 결정합니다

- [온보딩 문서](../docs/tutorials/ONBOARDING.md)
- [문서 작성법](../docs/how-to/write-docs.md)
- [개발 프로세스](../docs/how-to/development.md)
- [배포 프로세스](../docs/how-to/deployment.md)
- [환경변수 관리](../docs/how-to/manage-variables.md)
- [입력 폼 작성법](../docs/how-to/react-hook-form.md)
- [QA 로그인법](../docs/how-to/qa-login.md)
- [보편언어](../docs/reference/ubiquitous-language.md)
- [외부 서비스](../docs/reference/third-party.md)
- [프론트엔드 공통 처리](../docs/reference/frontend-patterns.md)
- [Lint 관리](../docs/reference/lint.md)
- [피그마 태그](../docs/reference/figma-tag.md)
- [피그마 매핑](../docs/reference/figma-mapping.md)
- [API 클라이언트](../docs/reference/package-api-client.md)
- [MSW 핸들러 패키지](../docs/reference/package-mocks.md)
- [기술자 크롤러](../docs/reference/app-crawler.md)
- [인프라](../docs/reference/infra.md)
- 기술적 의사결정 문서 : `docs/explanation/adr`

## MCP 구성

| 설정      | 이름          | 읽기 | 쓰기 | 비고                       |
| --------- | ------------- | ---- | ---- | -------------------------- |
| claude.ai | Figma         | ○    | ○    |                            |
| claude.ai | Notion        | ○    | ○    |                            |
| claude.ai | Sentry        | ○    | ○    |                            |
| claude.ai | Slack         | ○    | ○    |                            |
| claude.ai | GitHub        | ○    | ○    | 로컬 .mcp.json 우선 적용   |
| claude.ai | Vercel        | ○    | ○    | 로컬 .mcp.json 우선 적용   |
| .mcp.json | aws-mcp       | ○    | ×    | 읽기 전용, uvx 의존성 필요 |
| .mcp.json | railway       | ○    | ×    | 읽기 전용                  |
| .mcp.json | vercel        | ○    | ×    | 읽기 전용                  |
| .mcp.json | gcloud        | ○    | ×    | 읽기 전용                  |
| .mcp.json | firebase      | ○    | ×    | 읽기 전용                  |
| .mcp.json | next-devtools | ○    | ×    | 쓰기 도구 미지원           |
| .mcp.json | playwright    | ○    | ○    |                            |
| .mcp.json | agentation    | ○    | ○    |                            |

다음 세 가지 방식으로 MCP 권한을 관리합니다.

- aws-mcp : `--read-only` 플래그로 읽기 도구만 노출
- gcloud : `-c` 옵션으로 `.claude/gcloud-mcp.json` 파일의 allow 목록을 참조
- 그 외 : `.claude/settings.json` 설정
