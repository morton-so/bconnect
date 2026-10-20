# Morton

건설 · 인테리어 업체를 위한 기술자 매칭 플랫폼 품앗이

## 프로젝트 구조

프로젝트는 pnpm 모노레포 구조를 가집니다.

- `apps/career` - 기술자 서비스
- `apps/plan` - 업체 서비스
- `apps/company` - 회사 홈페이지
- `apps/api` - API 서버
- `packages/ui` - 공유 UI 컴포넌트
- `packages/api-client` - 자동 생성 API 클라이언트 (Orval)
- `packages/config` - 공유 설정
- `packages/lib` - 공유 유틸
- `packages/features` - 공유 UI
- `packages/mocks` - MSW 핸들러 · Provider
- `packages/batch` - 원클릭 조회 데이터 동기화

## 시작하기

자주 사용하는 스크립트는 `package.json` 파일에 등록합니다.

```bash
direnv allow          # 환경 변수 로드
pnpm install          # 의존성 설치

cd apps/api && ./gradlew bootRun   # API 서버

pnpm dev:career       # 기술자 서비스
pnpm dev:plan         # 업체 서비스
pnpm dev:company      # 회사 홈페이지
```

상세 절차는 [온보딩](docs/tutorials/ONBOARDING.md) 문서 참고

## 컨벤션

- 커밋 메시지 : [Conventional Commits](https://www.conventionalcommits.org)
- 브랜치 관리 전략 : [Git-flow](https://nvie.com/posts/a-successful-git-branching-model)
