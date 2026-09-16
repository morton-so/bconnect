from pydantic_settings import BaseSettings

ANTHROPIC_MODEL = "claude-sonnet-4-5-20250929"
OPENAI_MODEL = "gpt-4o-mini"


class Settings(BaseSettings):
    # Naver Search API
    naver_client_id: str
    naver_client_secret: str

    # LLM (Anthropic 우선, OpenAI 폴백)
    anthropic_api_key: str | None = None
    openai_api_key: str | None = None

    # Notion
    notion_token: str
    notion_database_id: str
    crawled_notion_db_id: str | None = None  # 검수 DB (미설정이면 검수 기능 비활성)

    # crawled_* DB 적재 (--export-db). Railway dev Postgres public URL 등
    crawled_pg_db_url: str | None = None


settings = Settings()
