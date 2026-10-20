# 입력 폼 작성법

> 대상: 프론트엔드 개발자<br>
> 학습 목표: 검증 · 제출 로딩 · 에러 처리 가능한 폼을 표준 패턴으로 작성할 수 있다.

## 1. 검증 스키마

- 스키마 파일은 해당 세그먼트의 `_lib/schema.ts`에 둡니다.
- 스키마는 `@bconnect/api-client/zod`의 생성 스키마로 조합합니다.
  - 생성 스키마는 백엔드 Request DTO 어노테이션에서 만들어집니다.
  - 새 제약은 폼에 직접 작성하지 않고 백엔드 Request DTO에 추가합니다.
  - 백엔드 변경은 dev 배포 후 재생성해야 폼에 반영됩니다.
- 폼 필드명은 백엔드 요청 필드명과 같게 둡니다.
- 입력값 가공용 정규식은 `@bconnect/lib/regex`의 `Regex` 상수를 씁니다.
- 검증용 정규식은 백엔드 `Regex` 상수에서 생성 스키마로 들어오므로 프론트에 두지 않습니다.
- 전화번호는 폼 값에 숫자만 저장하고 `TextField`의 `format`으로 하이픈을 표시합니다.
- 사업자등록번호·주소 등 공통 필드는 `@bconnect/lib` 헬퍼를 씁니다.
  - `brnField`, `usernameField`, `birthField`, `addressField`, `consentField`
- 주소 필드는 생성 스키마의 `Address`를 그대로 쓰지 않고 `addressField`로 덮어씁니다.
  - 생성 `Address`는 값이 비면 zod 기본 영문 문구를 표시합니다.
  - 필수 주소는 `addressField(label)`, 선택 주소는 `addressField(label).nullish()`를 씁니다.
- 요청 본문과 폼 필드가 다르면 `.omit`·`.extend`로 조정합니다.
  - `.omit` 바로 위에 `// TODO: 업데이트 필요` 주석을 둡니다.
- 인라인 메시지는 폼 전용 규칙에만 씁니다. 첨부 파일 필수, 시작일·종료일 순서 등이 해당합니다.

```typescript
import { RegisterMemberRequest } from '@bconnect/api-client/zod'
import { consentField } from '@bconnect/lib/consent'
import { birthField } from '@bconnect/lib/signup'
import { usernameField } from '@bconnect/lib/username'
import { z } from 'zod'

// TODO: 업데이트 필요
export const memberSchema = RegisterMemberRequest.omit({ marketingConsent: true }).extend({
  name: z.string().trim().pipe(RegisterMemberRequest.shape.name),
  birth: birthField,
  username: usernameField,
  agreements: consentField,
})
```

### 검증 메시지

생성 스키마의 검증 메시지는 [zod-messages.ts](../../packages/api-client/src/zod-messages.ts)의 `MESSAGES`에서 관리합니다.

- 키 구조는 `MESSAGES[스키마명][필드명][검증기]`
- 검증기 키는 `string`, `min`, `max`, `regex`, `date`, `int`, `number`, `boolean`, `enum`
- 생성 코드의 `iso.date` 검증기는 `zodParams`가 `date` 키로 조회
- 재사용 스키마는 자기 이름이 키. `Address` 필드는 `MESSAGES.Address.zipcode.regex`
- enum 등 object가 아닌 스키마는 필드명 단계 없이 검증기를 바로 씀. 예 `MESSAGES.Trade.enum`
- 키가 없으면 `올바르지 않은 입력입니다.` 표시
- 스키마명과 필드명은 `Messages` 타입으로 검사
- 생성 코드가 `zodParams`를 런타임에 호출하므로 메시지 수정에는 재생성이 필요 없음

```typescript
const MESSAGES: Messages = {
  OneClickRequest: {
    brn: {
      min: '올바른 사업자등록번호 형식이 아닙니다',
      regex: '올바른 사업자등록번호 형식이 아닙니다',
    },
  },
}
```

## 2. useForm 설정

- 입력 필드를 한 번 벗어난 뒤 안내 문구를 보여주도록 `onTouched` 모드를 사용합니다.

```typescript
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

const form = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
  mode: 'onTouched',
  defaultValues: { phone: '', code: '' },
})
```

## 3. 입력 폼 작성

```tsx
import { formatPhoneNumber } from '@bconnect/lib/phone'
import { Regex } from '@bconnect/lib/regex'
import { Button, Form, TextField } from '@bconnect/ui'
;<Form {...form}>
  <form onSubmit={onSubmit}>
    <TextField
      control={form.control}
      name="phone"
      label="휴대전화"
      description="품앗이 서비스는 인증된 사용자만 이용하실 수 있어요."
      transform={(raw) => raw.replace(Regex.NON_DIGIT, '').slice(0, 11)} // RHF 저장 전 입력값 가공
      format={formatPhoneNumber} // 저장값은 그대로 두고 표시만 가공
      type="tel"
      placeholder="010-0000-0000"
    />
    <Button type="submit" size="full" isLoading={form.formState.isSubmitting}>
      제출
    </Button>
  </form>
</Form>
```

각 필드에 대한 공통 처리(형식, 에러, 접근성 등)을 처리하는 `Form`, `TextField` 컴포넌트를 제공합니다. `<FormField>`를 직접 사용하지 않습니다.

별도의 `*Field` 컴포넌트가 제공되지 않는 형식의 입력폼은 shadcn raw primitive로 렌더합니다.

## 4. API 에러 처리

API 실패는 `useServerError` 훅으로 처리합니다.

1. 기본 매퍼는 `passthroughError(field?, messages?)`입니다.
2. 문구는 `serverErrorMessage`가 에러 코드 기준으로 고릅니다.
   - 1순위 : 호출부 `messages` 맵
   - 2순위 : 공통 맵 `SERVER_ERROR_MESSAGES`
   - 3순위 : 백엔드 `error.message`
3. `field`를 생략하면 폼 전체 에러로 표시합니다.
4. 사용자가 입력을 바꾸면 에러가 자동으로 사라집니다.

```tsx
import { useServerError, passthroughError } from '@bconnect/ui'

const server = useServerError(form.control, passthroughError<LoginFormData>('code'))
```

화면별 문구가 필요하면 두 번째 인자에 `{ [에러 코드]: 문구 }` 맵을 넘깁니다.

폼 밖의 mutation 실패는 `serverErrorMessage`로 같은 순서를 적용합니다.

```tsx
import { serverErrorMessage, toast } from '@bconnect/ui'

onError: (error) => toast({ description: serverErrorMessage(error), variant: 'error' })
```

문구 맵으로 표현하지 못하는 분기는 콜백을 작성합니다. `ApiError`가 아닌 에러를 다루는 경우가 해당합니다.

```tsx
import { useServerError, passthroughError } from '@bconnect/ui'

const server = useServerError(form.control, (err) =>
  err instanceof UploadError ? { message: err.message } : passthroughError<WorkFormValues>()(err)
)
```

`TextField`에 연결하고 폼 전체 에러는 별도로 렌더합니다.

```tsx
<TextField ... serverError={server.fieldError('code')} />

{server.formError && (
  <p className="text-center text-r-14 text-destructive">{server.formError}</p>
)}
```

`fieldError`는 스키마 검증과 API 예외처리를 함께 처리하며, 스키마 검증을 우선합니다.

## 5. 제출 처리

`form.handleSubmit`으로 핸들러를 만들고 try-catch 문에서 `server.capture`를 호출합니다.

```tsx
const onSubmit = form.handleSubmit(async (data) => {
  try {
    await sendOtp.mutateAsync({ data })
    router.push('/next')
  } catch (err) {
    server.capture(err, data)
  }
})
```

제출 로딩은 RHF `isSubmitting`과 TanStack Query `isPending`을 OR로 묶습니다.

```tsx
<Button isLoading={form.formState.isSubmitting || sendOtp.isPending}>제출</Button>
```

## 입력값에 따른 동작

렌더링 중 입력값에 따른 동작을 구한하기 위해 `useWatch` 를 사용합니다 (예: 버튼 활성화 판정).
React 컴포넌트 최적화를 위해 `form.watch()` 사용을 금지합니다.

```tsx
import { useWatch } from 'react-hook-form'

const phone = useWatch({ control: form.control, name: 'phone' })
```

## 멀티 스텝 폼

여러 화면에 걸쳐 폼을 입력해야 하는 경우 (예: 본인인증, 회원가입 등) 단일 `useForm`에 모든 필드를 두고, `step`만 별도 state로 관리합니다.

```tsx
const [step, setStep] = useState<'phone' | 'otp'>('phone')

// 각 단계별 별도 게이팅
const goNext = async () => {
  if (!(await form.trigger('phone'))) return
  await sendOtp.mutateAsync(/* ... */)
  setStep('otp')
}
```

`formState.isValid` 대신 `trigger(field)` 또는 커스텀 로직을 통해 게이팅합니다.

## 폼 작성 대상이 아님

검증·제출이 없는 검색창·필터 같은 입력은 폼이 아닙니다.

- `useForm` 대신 `useState`, `nuqs`를 사용합니다.
- `TextField` 대신 `Input`을 사용합니다.

```tsx
import { Input } from '@bconnect/ui'
import { useQueryState } from 'nuqs'

const [keyword, setKeyword] = useQueryState('q')
<Input value={keyword ?? ''} onChange={(e) => setKeyword(e.target.value)} />
```

## 참조

- [ADR-0013: 프론트엔드 폼 처리 표준](../explanation/adr/0013-form-handling-standard.md)
