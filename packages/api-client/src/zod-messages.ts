import type { ZodParamsContext } from 'orval'
import type { z } from 'zod'
import type * as Schemas from './generated/zod'

type SchemaName = {
  [K in keyof typeof Schemas]: (typeof Schemas)[K] extends z.ZodType ? K : never
}[keyof typeof Schemas]

type FieldMessages<S> =
  S extends z.ZodObject<infer Shape>
    ? { [F in keyof Shape]?: Partial<Record<string, string>> }
    : Partial<Record<string, string>>

type Messages = { [K in SchemaName]?: FieldMessages<(typeof Schemas)[K]> }

const MESSAGES: Messages = {
  Trade: { enum: '대표분야를 선택해주세요.' },
  ProfileRole: { enum: '유형을 선택해주세요.' },
  VerifyCodeRequest: {
    phone: {
      string: '유효하지 않은 전화번호입니다.',
      min: '유효하지 않은 전화번호입니다.',
      regex: '유효하지 않은 전화번호입니다.',
    },
    code: {
      string: '인증번호 6자리를 입력해주세요.',
      regex: '인증번호 6자리를 입력해주세요.',
    },
  },
  RegisterMemberRequest: {
    username: {
      min: '최소 3자 이상 입력해주세요.',
      max: '아이디는 30자 이내로 입력해주세요.',
      regex: '숫자, 영어, 밑줄, 하이픈 및 마침표만 사용할 수 있습니다.',
    },
    name: {
      string: '이름을 입력해주세요.',
      min: '이름을 입력해주세요.',
      regex: '이름을 입력해주세요.',
      max: '이름은 50자 이내로 입력해주세요.',
    },
    birth: { date: '생년월일 8자리를 입력해주세요.' },
  },
  CreateCompanyRequest: {
    name: {
      min: '업체명을 입력해주세요.',
      regex: '업체명을 입력해주세요.',
      max: '업체명은 50자 이내로 입력해주세요.',
    },
  },
  CreateProfileRequest: {
    trades: {
      min: '공종을 1개 이상 선택해주세요.',
      max: '공종은 최대 3개까지 선택 가능합니다.',
    },
    experience: { int: '경력을 입력해주세요.' },
    headline: { max: '한줄소개는 50자 이내로 입력해주세요.' },
  },
  UpdateProfileRequest: {
    trades: {
      min: '공종을 1개 이상 선택해주세요.',
      max: '공종은 최대 3개까지 선택 가능합니다.',
    },
    experience: { int: '경력을 입력해주세요.' },
    headline: { max: '한줄소개는 50자 이내로 입력해주세요.' },
  },
  UpdateProfileAboutRequest: {
    about: { max: '소개는 500자 이내로 입력해주세요.' },
  },
  CreatePostRequest: {
    content: {
      string: '상세 시공 설명을 입력해주세요.',
      min: '상세 시공 설명을 입력해주세요.',
      regex: '상세 시공 설명을 입력해주세요.',
    },
  },
  OneClickRequest: {
    brn: {
      min: '올바른 사업자등록번호 형식이 아닙니다.',
      regex: '올바른 사업자등록번호 형식이 아닙니다.',
    },
  },
  ValidateBusinessRequest: {
    ownerName: {
      string: '대표자 성명을 입력해주세요.',
      min: '대표자 성명을 입력해주세요.',
      regex: '대표자 성명을 입력해주세요.',
      max: '대표자 성명은 50자 이내로 입력해주세요.',
    },
    openedAt: { date: '개업일자를 YYYY-MM-DD 형식으로 입력해주세요.' },
  },
  CreateWorkerTaskRequest: {
    title: { min: '제목을 입력해주세요.', regex: '제목을 입력해주세요.' },
    start: { date: '시작일을 선택해주세요.' },
    end: { date: '종료일을 선택해주세요.' },
    trades: { min: '공종을 1개 이상 선택해주세요.' },
  },
  UpdateWorkerTaskRequest: {
    title: { min: '제목을 입력해주세요.', regex: '제목을 입력해주세요.' },
    start: { date: '시작일을 선택해주세요.' },
    end: { date: '종료일을 선택해주세요.' },
    trades: { min: '공종을 1개 이상 선택해주세요.' },
  },
  UpdateAssigneeTaskRequest: {
    title: { min: '제목을 입력해주세요.', regex: '제목을 입력해주세요.' },
  },
  UpdateProjectTaskRequest: {
    title: { min: '작업명을 입력해주세요.', regex: '작업명을 입력해주세요.' },
    start: { date: '시작일을 선택해주세요.' },
    end: { date: '종료일을 선택해주세요.' },
    trades: { min: '공종을 1개 이상 선택해주세요.' },
  },
  UpdateProjectRequest: {
    title: {
      min: '프로젝트명을 입력해주세요.',
      regex: '프로젝트명을 입력해주세요.',
      max: '프로젝트명은 50자 이내로 입력해주세요.',
    },
  },
}

const DEFAULT_MESSAGE = '올바르지 않은 입력입니다.'

export const zodParams = ({
  schemaName,
  fieldPath,
  validator,
}: ZodParamsContext): { error: string } => {
  const entry = MESSAGES[schemaName as SchemaName] as Record<string, unknown> | undefined
  const messages = (fieldPath.length ? entry?.[fieldPath.join('.')] : entry) as
    Partial<Record<string, string>> | undefined
  const key = validator === 'iso.date' ? 'date' : validator
  return { error: messages?.[key] ?? DEFAULT_MESSAGE }
}
