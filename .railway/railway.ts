import { bucket, database, defineRailway, github, project, service, volume } from 'railway/iac'

const REGION = 'asia-southeast1-eqsg3a'
const BUCKET_REGION = 'sin'

// dev | prod 환경 강제
export default defineRailway((ctx) => {
  if (!ctx || (ctx.environment !== 'dev' && ctx.environment !== 'prod')) {
    throw new Error('Railway context must explicitly specify environment "dev" or "prod".')
  }

  return project('bconnect', {
    resources: ctx.environment === 'dev' ? devResources() : prodResources(),
  })
})

function devResources() {
  const db = database('postgres', 'postgres', {
    image: 'ghcr.io/railwayapp-templates/postgres-ssl:18',
    output: 'DATABASE_URL',
    defaultMountPath: '/var/lib/postgresql/data',
    region: REGION,
  })

  // 수동 생성 후 IaC 관리
  const dbVolume = volume('postgres-volume-v2', {
    alerts: { usage: { '80': {}, '95': {}, '100': {} } },
    allowOnlineResize: true,
    region: REGION,
    sizeMB: 50000,
  })

  // 수동 생성 후 IaC 관리
  const pitrBucket = bucket('wrapped-calzone-lVgo', { region: BUCKET_REGION })

  const api = service('api', {
    source: github('mortonCareer/bconnect', {
      branch: 'dev',
      checkSuites: true,
      rootDirectory: 'apps/api',
    }),
    build: {
      watchPatterns: ['apps/api/**'],
    },
    start:
      'java -Duser.timezone=Asia/Seoul -Dspring.profiles.active="${SPRING_PROFILES_ACTIVE}" -jar build/libs/*.jar',
    healthcheck: '/actuator/health',
    domains: ['api.dev.bconnect.to'],
    env: {
      SPRING_PROFILES_ACTIVE: 'dev',
      RAILPACK_JDK_VERSION: '21',
      JAVA_TOOL_OPTIONS: requiredEnv('JAVA_TOOL_OPTIONS_DEV'),
      DATABASE_URL:
        'jdbc:postgresql://${{postgres.PGHOST}}:${{postgres.PGPORT}}/${{postgres.PGDATABASE}}',
      DATABASE_USERNAME: db.env.PGUSER,
      DATABASE_PASSWORD: db.env.PGPASSWORD,
      JWT_SECRET: requiredEnv('JWT_SECRET_DEV'),
      JWT_COOKIE_DOMAIN: requiredEnv('JWT_COOKIE_DOMAIN_DEV'),
      AWS_ACCESS_KEY_ID: requiredEnv('AWS_ACCESS_KEY_ID_DEV'),
      AWS_SECRET_ACCESS_KEY: requiredEnv('AWS_SECRET_ACCESS_KEY_DEV'),
      AWS_REGION: requiredEnv('AWS_REGION_DEV'),
      AWS_S3_BUCKET: requiredEnv('AWS_S3_BUCKET_DEV'),
      AWS_SNS_PLATFORM_ARN: requiredEnv('AWS_SNS_PLATFORM_ARN_DEV'),
      SOLAPI_API_KEY: requiredEnv('SOLAPI_API_KEY_DEV'),
      SOLAPI_API_SECRET: requiredEnv('SOLAPI_API_SECRET_DEV'),
      SOLAPI_SENDER_NUMBER: requiredEnv('SOLAPI_SENDER_NUMBER_DEV'),
      SENTRY_ENVIRONMENT: 'dev',
      SENTRY_DSN: requiredEnv('SENTRY_DSN_DEV'),
      CLOUDFRONT_DOMAIN: requiredEnv('CLOUDFRONT_DOMAIN_DEV'),
      CLOUDFRONT_PRIVATE_KEY: requiredEnv('CLOUDFRONT_PRIVATE_KEY_DEV'),
      CLOUDFRONT_KEY_PAIR_ID: requiredEnv('CLOUDFRONT_KEY_PAIR_ID_DEV'),
      CLOUDFRONT_COOKIE_DOMAIN: requiredEnv('CLOUDFRONT_COOKIE_DOMAIN_DEV'),
      CORS_ALLOWED_ORIGIN: requiredEnv('CORS_ALLOWED_ORIGIN_DEV'),
      CORS_ALLOWED_ORIGIN_PATTERNS: requiredEnv('CORS_ALLOWED_ORIGIN_PATTERNS_DEV'),
      DATA_GO_SERVICE_KEY: requiredEnv('DATA_GO_SERVICE_KEY_DEV'),
    },
  })

  return [db, api, dbVolume, pitrBucket]
}

function prodResources() {
  const db = database('postgres', 'postgres', {
    image: 'ghcr.io/railwayapp-templates/postgres-ssl:18',
    output: 'DATABASE_URL',
    defaultMountPath: '/var/lib/postgresql/data',
    region: REGION,
  })

  // 수동 생성 후 IaC 관리
  const dbVolume = volume('postgres-volume-v2', {
    alerts: { usage: { '80': {}, '95': {}, '100': {} } },
    allowOnlineResize: true,
    region: REGION,
    sizeMB: 50000,
  })

  // 수동 생성 후 IaC 관리
  const pitrBucket = bucket('efficient-cage-W1sw', { region: BUCKET_REGION })

  const api = service('api', {
    source: github('mortonCareer/bconnect', {
      branch: 'main',
      checkSuites: true,
      rootDirectory: 'apps/api',
    }),
    build: {
      watchPatterns: ['apps/api/**'],
    },
    start:
      'java -Duser.timezone=Asia/Seoul -Dspring.profiles.active="${SPRING_PROFILES_ACTIVE}" -jar build/libs/*.jar',
    healthcheck: '/actuator/health',
    domains: ['api.bconnect.to'],
    env: {
      SPRING_PROFILES_ACTIVE: 'prod',
      RAILPACK_JDK_VERSION: '21',
      JAVA_TOOL_OPTIONS: requiredEnv('JAVA_TOOL_OPTIONS_PROD'),
      DATABASE_URL:
        'jdbc:postgresql://${{postgres.PGHOST}}:${{postgres.PGPORT}}/${{postgres.PGDATABASE}}',
      DATABASE_USERNAME: db.env.PGUSER,
      DATABASE_PASSWORD: db.env.PGPASSWORD,
      JWT_SECRET: requiredEnv('JWT_SECRET_PROD'),
      JWT_COOKIE_DOMAIN: requiredEnv('JWT_COOKIE_DOMAIN_PROD'),
      AWS_ACCESS_KEY_ID: requiredEnv('AWS_ACCESS_KEY_ID_PROD'),
      AWS_SECRET_ACCESS_KEY: requiredEnv('AWS_SECRET_ACCESS_KEY_PROD'),
      AWS_REGION: requiredEnv('AWS_REGION_PROD'),
      AWS_S3_BUCKET: requiredEnv('AWS_S3_BUCKET_PROD'),
      AWS_SNS_PLATFORM_ARN: requiredEnv('AWS_SNS_PLATFORM_ARN_PROD'),
      SOLAPI_API_KEY: requiredEnv('SOLAPI_API_KEY_PROD'),
      SOLAPI_API_SECRET: requiredEnv('SOLAPI_API_SECRET_PROD'),
      SOLAPI_SENDER_NUMBER: requiredEnv('SOLAPI_SENDER_NUMBER_PROD'),
      SENTRY_ENVIRONMENT: 'prod',
      SENTRY_DSN: requiredEnv('SENTRY_DSN_PROD'),
      CLOUDFRONT_DOMAIN: requiredEnv('CLOUDFRONT_DOMAIN_PROD'),
      CLOUDFRONT_PRIVATE_KEY: requiredEnv('CLOUDFRONT_PRIVATE_KEY_PROD'),
      CLOUDFRONT_KEY_PAIR_ID: requiredEnv('CLOUDFRONT_KEY_PAIR_ID_PROD'),
      CLOUDFRONT_COOKIE_DOMAIN: requiredEnv('CLOUDFRONT_COOKIE_DOMAIN_PROD'),
      CORS_ALLOWED_ORIGIN: requiredEnv('CORS_ALLOWED_ORIGIN_PROD'),
      CORS_ALLOWED_ORIGIN_PATTERNS: requiredEnv('CORS_ALLOWED_ORIGIN_PATTERNS_PROD'),
      DATA_GO_SERVICE_KEY: requiredEnv('DATA_GO_SERVICE_KEY_PROD'),
    },
  })

  return [db, api, dbVolume, pitrBucket]
}

function requiredEnv(key: string): string {
  const value = process.env[key]

  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing required Railway input: ${key}`)
  }

  return value
}
