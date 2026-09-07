import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


def _smtp_config() -> dict:
    """Return SMTP settings from env, or {} when not configured."""
    host = os.getenv("SMTP_HOST")
    if not host:
        return {}

    return {
        "host": host,
        "port": int(os.getenv("SMTP_PORT", "587")),
        "user": os.getenv("SMTP_USER", ""),
        "password": os.getenv("SMTP_PASS", ""),
        "from_email": os.getenv("SMTP_FROM", os.getenv("SMTP_USER", "noreply@civiclens.ai")),
    }


def smtp_configured() -> bool:
    return bool(_smtp_config())


def send_password_reset_email(to_email: str, reset_url: str) -> bool:
    """Send a password-reset email via SMTP.

    Returns True if the email was sent, False if SMTP is not configured
    (the caller can fall back to a dev-only link).
    """
    config = _smtp_config()

    if not config:
        return False

    subject = "Reset your CivicLens AI password"
    body = f"""Hello,

We received a request to reset your CivicLens AI password.

Click the link below to choose a new password (valid for 1 hour):

{reset_url}

If you did not request this, you can safely ignore this email.

— The CivicLens AI team
"""

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = config["from_email"]
    msg["To"] = to_email
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(config["host"], config["port"], timeout=15) as server:
            server.starttls()
            if config["user"]:
                server.login(config["user"], config["password"])
            server.sendmail(config["from_email"], [to_email], msg.as_string())
        return True
    except Exception as exc:  # noqa: BLE001
        print("❌ Failed to send password-reset email:", exc)
        return False