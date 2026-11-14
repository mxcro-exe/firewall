from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False}
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    async with engine.begin() as conn:
        # Import all models to ensure they register with Base.metadata
        from app.models import (
            user, site, cve, inventory, rule, proof, traffic, 
            module_config, agent_log, alert, audit
        )
        await conn.run_sync(Base.metadata.create_all)

        # Safe schema migration for new columns
        from sqlalchemy import text
        migration_statements = [
            "ALTER TABLE users ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'en'",
            "ALTER TABLE sites ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'en'",
            "ALTER TABLE alerts ADD COLUMN title_hi VARCHAR(255)",
            "ALTER TABLE alerts ADD COLUMN message_hi TEXT"
        ]
        for stmt in migration_statements:
            try:
                await conn.execute(text(stmt))
            except Exception:
                pass  # Column already exists

