import httpx
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.alert import Alert

async def dispatch_alert(
    site_id: Optional[str],
    severity: str,
    title_en: str,
    title_ta: str,
    message_en: str,
    message_ta: str,
    db: AsyncSession,
    channel: str = "IN_APP"
) -> Alert:
    """Store alert in database and optionally dispatch to Telegram / Webhook"""
    alert = Alert(
        site_id=site_id,
        severity=severity,
        title_en=title_en,
        title_ta=title_ta,
        message_en=message_en,
        message_ta=message_ta,
        channel=channel,
        is_read=False
    )
    db.add(alert)
    await db.commit()

    # Telegram bot dispatch if configured
    if settings.TELEGRAM_BOT_TOKEN and settings.TELEGRAM_CHAT_ID:
        try:
            tg_text = (
                f"🛡️ *PatchShield Security Alert*\n\n"
                f"🇬🇧 *{title_en}*\n{message_en}\n\n"
                f"🇮🇳 *{title_ta}*\n{message_ta}\n\n"
                f"⚡ *Severity:* {severity}"
            )
            async with httpx.AsyncClient(timeout=4.0) as client:
                await client.post(
                    f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage",
                    json={
                        "chat_id": settings.TELEGRAM_CHAT_ID,
                        "text": tg_text,
                        "parse_mode": "Markdown"
                    }
                )
        except Exception:
            pass

    return alert
