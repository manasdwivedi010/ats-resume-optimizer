import asyncio
import sys
from app.core.config import settings
from app.services.email_service import send_otp_email

async def main():
    recipient = sys.argv[1] if len(sys.argv) > 1 else settings.SMTP_USER
    if not recipient:
        print("Usage: python test_gmail_smtp.py <recipient_gmail@example.com>")
        return

    print("==================================================")
    print("Testing Gmail SMTP Dispatch to:", recipient)
    print("Sender (SMTP_USER):", settings.SMTP_USER)
    print("SMTP Server:", settings.SMTP_HOST, ":", settings.SMTP_PORT)
    print("==================================================")

    res = await send_otp_email(recipient, "849201")
    if res.get("email_sent"):
        print("\n[SUCCESS] Test email with code 849201 was sent to:", recipient)
        print("Please check your Gmail inbox (or Spam/Promotions folder) now.")
    else:
        print("\n[FAILED] Email failed to send.")

if __name__ == "__main__":
    asyncio.run(main())
