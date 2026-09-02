# 피그마 매핑

> 대상: 디자인 연동 작업자<br>
> 학습 목표: Figma 변경 감지 스크립트의 사용법과 동작을 이해한다<br>
> 위치: `scripts/figma-mapping`

코드의 인라인 JSDoc 주석과 실제 Figma 파일 사이의 차이를 감지하고 이슈를 생성하는 스크립트입니다.

## 명령어

```bash
pnpm figma:check        # 이슈 생성
pnpm figma:check:dry    # 이슈 미생성
```

## 패키지 구조

```text
scripts/figma-mapping/
├── index.js
├── check-mapping.js  # @figma 태그와 Figma 노드 매핑 검사
├── context.js        # Figma API + @figma 컨텍스트 로딩
└── report.js         # 이슈 생성
```

## 핵심 로직

1. 3개 앱의 `page.tsx`와 `packages/ui/src/components`의 `.tsx`에서 `@figma` JSDoc 추출
2. Figma REST API로 파일 트리 한 번에 로드. parent 관계 포함
3. 코드의 `@figma` URL 과 Figma 노드 양방향 대조
4. 검출 결과를 신규 이슈로 생성

검출 종류는 3가지입니다.

| checkName       | 조건                                              |
| --------------- | ------------------------------------------------- |
| `not-found`     | `@figma` URL의 노드를 Figma 파일에서 찾을 수 없음 |
| `not-ready`     | 노드가 Ready for dev 아님                         |
| `unmapped-node` | Ready for dev 노드에 대응하는 `@figma` 없음       |

- `@figma-todo` 마킹된 파일은 검사 제외

## 참조

- `.github/workflows/figma-mapping.yml`
