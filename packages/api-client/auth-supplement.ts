import type { PathItemObject, SchemaObject } from 'openapi3-ts/oas31'

/**
 * Spring Security 필터 기반 인증 엔드포인트 보완
 */
export const authSupplementPaths: Record<string, PathItemObject> = {
  '/api/v1/auth/otp/verify': {
    post: {
      operationId: 'verifyOtp',
      tags: ['Auth'],
      summary: '인증코드 검증',
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/VerifyCodeRequest' } },
        },
      },
      responses: {
        '200': {
          description: 'OK',
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  { $ref: '#/components/schemas/VerifyOtpLoginResponse' },
                  { $ref: '#/components/schemas/VerifyOtpSignupResponse' },
                ],
                discriminator: { propertyName: 'registered' },
              },
            },
          },
        },
      },
    },
  },
  '/api/v1/auth/refresh': {
    post: {
      operationId: 'refreshToken',
      tags: ['Auth'],
      summary: '토큰 갱신',
      responses: {
        '200': {
          description: 'OK',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RefreshTokenResponse' } },
          },
        },
      },
    },
  },
}

export const authSupplementSchemas: Record<string, SchemaObject> = {
  VerifyCodeRequest: {
    type: 'object',
    required: ['phone', 'code'],
    properties: {
      phone: { type: 'string', pattern: '\\d{10,11}' },
      code: { type: 'string', pattern: '\\d{6}' },
    },
  },
  VerifyOtpLoginResponse: {
    type: 'object',
    required: ['registered', 'accessToken'],
    properties: {
      registered: { type: 'boolean', const: true },
      accessToken: { type: 'string' },
    },
  },
  VerifyOtpSignupResponse: {
    type: 'object',
    required: ['registered', 'signupToken'],
    properties: {
      registered: { type: 'boolean', const: false },
      signupToken: { type: 'string' },
    },
  },
  RefreshTokenResponse: {
    type: 'object',
    required: ['accessToken'],
    properties: {
      accessToken: { type: 'string' },
    },
  },
}
