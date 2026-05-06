"""
Email utility sử dụng aiosmtplib + MailHog.
"""
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib

from app.core.settings import settings

logger = logging.getLogger(__name__)


async def send_email(
    to: str,
    subject: str,
    html_body: str,
    text_body: str | None = None,
) -> None:
    """Gửi email bất đồng bộ qua SMTP (MailHog)."""
    message = MIMEMultipart("alternative")
    message["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
    message["To"] = to
    message["Subject"] = subject

    if text_body:
        message.attach(MIMEText(text_body, "plain", "utf-8"))
    message.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            use_tls=settings.SMTP_USE_TLS,
            username=settings.SMTP_USERNAME or None,
            password=settings.SMTP_PASSWORD or None,
        )
        logger.info("Email sent to %s | subject: %s", to, subject)
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", to, exc)


async def send_account_credentials(
    to_email: str,
    full_name: str,
    student_code: str,
    role: str,
    password: str,
) -> None:
    """Gửi thông tin tài khoản mới cho người dùng."""
    role_label = {
        "student": "Sinh viên",
        "staff": "Nhân viên",
        "admin": "Quản trị viên",
    }.get(role, role)

    subject = f"[KTX Tây Bắc] Thông tin tài khoản của bạn"

    html_body = f"""
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 24px;">
  <div style="max-width: 520px; margin: auto; background: #fff; border-radius: 10px;
              padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

    <h2 style="color: #16a34a; margin-bottom: 4px;">Ký túc xá – Đại học Tây Bắc</h2>
    <p style="color: #64748b; margin-top: 0; font-size: 14px;">Hệ thống quản lý nội trú</p>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">

    <p>Xin chào <strong>{full_name}</strong>,</p>
    <p>Tài khoản <strong>{role_label}</strong> của bạn đã được tạo trong hệ thống quản lý ký túc xá.</p>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;
                padding: 20px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; font-size: 15px;">
        <span style="color: #64748b;">📧 Email:</span>
        <strong style="color: #0f172a;">&nbsp;{to_email}</strong>
      </p>
      <p style="margin: 0 0 8px 0; font-size: 15px;">
        <span style="color: #64748b;">🆔 Mã số:</span>
        <strong style="color: #0f172a;">&nbsp;{student_code}</strong>
      </p>
      <p style="margin: 0; font-size: 15px;">
        <span style="color: #64748b;">🔑 Mật khẩu:</span>
        <strong style="color: #16a34a;">&nbsp;{password}</strong>
      </p>
    </div>

    <p style="color: #dc2626; font-size: 13px;">
      ⚠️ Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu để bảo mật tài khoản.
    </p>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
      Email này được gửi tự động, vui lòng không trả lời.
    </p>
  </div>
</body>
</html>
"""

    text_body = (
        f"Xin chào {full_name},\n\n"
        f"Tài khoản {role_label} của bạn đã được tạo.\n\n"
        f"Email:     {to_email}\n"
        f"Mã số:     {student_code}\n"
        f"Mật khẩu: {password}\n\n"
        f"Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu.\n\n"
        f"Trân trọng,\nBan quản lý KTX"
    )

    await send_email(to_email, subject, html_body, text_body)
