import httpx
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.core.i18n import t
from app.models.alert import Alert
from app.models.site import Site

async def dispatch_alert(
    site_id: Optional[str],
    severity: str,
    title_en: str,
    title_ta: str,
    message_en: str,
    message_ta: str,
    db: AsyncSession,
    title_hi: Optional[str] = None,
    message_hi: Optional[str] = None,
    channel: str = "IN_APP"
) -> Alert:
    """Store multilingual alert in database and dispatch to Telegram / Webhook"""
    alert = Alert(
        site_id=site_id,
        severity=severity,
        title_en=title_en,
        title_ta=title_ta,
        title_hi=title_hi or title_en,
        message_en=message_en,
        message_ta=message_ta,
        message_hi=message_hi or message_en,
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
                f"🇮🇳 *{alert.title_hi}*\n{alert.message_hi}\n\n"
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

async def dispatch_templated_alert(
    template_key: str,
    severity: str,
    db: AsyncSession,
    site_id: Optional[str] = None,
    channel: str = "IN_APP",
    preferred_lang: Optional[str] = None,
    **params
) -> Alert:
    """
    Build alert message from catalog templates for en, ta, and hi.
    Templates supported:
      - blocked_request
      - flagged_request
      - new_patch_proposed
      - rule_shadow
      - rule_canary
      - rule_enforce
      - rule_rollback
      - daily_summary
    """
    # If site_id given and no preferred_lang specified, check site preferred_language
    if site_id and not preferred_lang:
        res = await db.execute(select(Site).where(Site.id == site_id))
        site = res.scalars().first()
        if site and hasattr(site, "preferred_language") and site.preferred_language:
            preferred_lang = site.preferred_language
            if "site" not in params:
                params["site"] = site.name

    title_en = t(f"alerts.{template_key}_title", "en", **params)
    title_ta = t(f"alerts.{template_key}_title", "ta", **params)
    title_hi = t(f"alerts.{template_key}_title", "hi", **params)

    msg_en = t(f"alerts.{template_key}_msg", "en", **params)
    msg_ta = t(f"alerts.{template_key}_msg", "ta", **params)
    msg_hi = t(f"alerts.{template_key}_msg", "hi", **params)

    return await dispatch_alert(
        site_id=site_id,
        severity=severity,
        title_en=title_en,
        title_ta=title_ta,
        title_hi=title_hi,
        message_en=msg_en,
        message_ta=msg_ta,
        message_hi=msg_hi,
        db=db,
        channel=channel
    )
