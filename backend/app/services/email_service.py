import logging
from email.message import EmailMessage
import aiosmtplib
from app.core.config import settings

logger = logging.getLogger("ats.email")

async def send_otp_email(email: str, otp: str) -> dict:
    """
    Sends a 6-digit OTP verification code to the recipient's Gmail inbox.
    Uses Gmail SMTP (smtp.gmail.com:587) when configured.
    """
    subject = f"Your ATS Resume Optimizer Verification Code: {otp}"
    
    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ATS Verification Code</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 30px 15px;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table style="max-width: 500px; width: 100%; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <div style="font-size: 22px; font-weight: 800; color: #60a5fa; letter-spacing: -0.5px;">
                ATS Resume Optimizer
              </div>
              <div style="font-size: 11px; font-weight: 600; color: #10b981; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">
                90% Benchmark Engine
              </div>
            </td>
          </tr>
          <tr>
            <td style="color: #cbd5e1; font-size: 15px; line-height: 1.6; padding-bottom: 24px;">
              Hello,<br><br>
              You requested a secure login code for your ATS Resume Optimizer account. Enter this one-time passcode to verify your email and access your dashboard:
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="background: #0f172a; border: 2px dashed #3b82f6; border-radius: 12px; padding: 18px 24px; display: inline-block;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #60a5fa;">
                  {otp}
                </span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="color: #94a3b8; font-size: 13px; line-height: 1.5; padding-bottom: 24px;">
              ⏱️ This security code is valid for <strong>5 minutes</strong>. For your security, do not share this code with anyone.
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid #334155; padding-top: 20px; color: #64748b; font-size: 11px; text-align: center;">
              If you did not request this code, you can safely ignore this email.<br>
              &copy; 2026 ATS Resume Optimizer Platform. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    # Always log to server console
    logger.info("=" * 60)
    logger.info(f"📧 [EMAIL OTP DISPATCH] -> To: {email} | Code: {otp}")
    logger.info("=" * 60)

    email_sent = False
    delivery_note = ""

    # Live Gmail SMTP delivery
    if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
        try:
            msg = EmailMessage()
            msg["From"] = f"ATS Resume Optimizer <{settings.SMTP_FROM or settings.SMTP_USER}>"
            msg["To"] = email
            msg["Subject"] = subject
            msg.set_content(f"Your ATS Resume Optimizer verification code is: {otp}. Valid for 5 minutes.")
            msg.add_alternative(html_content, subtype="html")

            await aiosmtplib.send(
                msg,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD.replace(" ", ""), # Remove spaces in 16-char app passwords
                start_tls=True if settings.SMTP_PORT == 587 else False,
                use_tls=True if settings.SMTP_PORT == 465 else False,
                timeout=15
            )
            email_sent = True
            logger.info(f"✅ Successfully delivered OTP email to Gmail: {email}")
            delivery_note = f"Verification email delivered directly to {email}."
        except aiosmtplib.SMTPAuthenticationError as auth_err:
            logger.error(
                f"❌ Gmail SMTP Authentication Error: {auth_err}. "
                "Ensure you are using a 16-character Google 'App Password' (not your personal Gmail password)."
            )
            delivery_note = "Gmail authentication failed: check your 16-character App Password."
        except Exception as e:
            logger.error(f"❌ Failed to dispatch email via SMTP: {type(e).__name__} - {e}")
            delivery_note = f"SMTP error: {str(e)}"
    else:
        logger.info(
            "ℹ️ SMTP credentials not fully configured in backend/.env. "
            "To send real emails to your Gmail, configure SMTP_USER and SMTP_PASSWORD in backend/.env."
        )
        delivery_note = "SMTP credentials not configured in backend/.env."

    return {
        "success": True,
        "email_sent": email_sent,
        "dev_otp": otp if (settings.OTP_DEV_MODE or not email_sent) else None,
        "message": f"Verification code sent to {email}. Check your inbox or spam folder." if email_sent else f"Code generated for {email} ({delivery_note})"
    }
