exports.RegistrationMailTemplate = (
  fristName,
  VERIFICATION_LINK,
  otp,
  otpExpireTime
) => {
  return `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f2f2f2; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <h2 style="color: #333;">🔐 Email Verification Required</h2>

      <p style="font-size: 16px; color: #555;">
        Hi ${fristName},
      </p>

      <p style="font-size: 16px; color: #555;">
        Thank you for registering with <strong>Clicon</strong>.
        To complete your registration, please verify your email address by clicking the button below:
      </p>
      <p style="font-size: 16px; color: #555;">
      Your Otp ${otp}  and your otp will expire in ${otpExpireTime}
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${VERIFICATION_LINK}" style="background-color: #28a745; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
      </div>

      <p style="font-size: 14px; color: #777;">
        If the button above doesn't work, copy and paste this link into your browser:
        <br />
        <a href="${VERIFICATION_LINK}" style="color: #007bff;">${VERIFICATION_LINK}</a>
      </p>

      <hr style="margin: 30px 0;" />

      <p style="font-size: 14px; color: #999;">
        If you didn't register for this account, please ignore this email or contact our support team.
      </p>

      <p style="font-size: 14px; color: #999;">
        – The Clicon Team
      </p>
    </div>
  </body>
</html>`;
};

exports.resetPasswordTemplate = (
  verificationLInk,
  fristName,
  otp,
  otpExpireTime
) => {
  return `<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Verify your account</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f7;font-family:Helvetica,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;">Verify your account — OTP valid for {{otpExpireTime}} minutes.</div>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f4f7;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#ffffff;border:1px solid #eaeaea;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:18px 24px;text-align:center;background:#ffffff;font-weight:700;font-size:18px;color:#111827;">{{companyName}}</td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <h1 style="font-size:20px;margin:0 0 12px;color:#111827;">Verify your account</h1>
                <p style="margin:0 0 16px;color:#374151;line-height:1.5;">Hi ${fristName},</p>
                <p style="margin:0 0 16px;color:#6b7280;font-size:14px;line-height:1.5;">Use the One-Time Password (OTP) below to verify your account. This OTP will expire in ${otpExpireTime} minutes.</p>
                <div style="text-align:center;padding:22px 0;font-size:24px;font-weight:bold;color:#1a82e2;">${otp}</div>
                <p style="margin:0 0 16px;color:#6b7280;font-size:14px;line-height:1.5;">Alternatively, click the button below to verify your account directly.</p>
                <div style="text-align:center;padding:22px 0;">
                  <a href="${verificationLInk}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 22px;border-radius:6px;font-weight:600;border:1px solid #1a82e2;background:#1a82e2;color:#ffffff;text-decoration:none;">Verify Account</a>
                </div>
                <p style="margin:0 0 12px;color:#6b7280;font-size:14px;">If the button doesn't work, copy and paste the following URL into your browser:</p>
                <p style="word-break:break-all;font-size:13px;color:#4b5563;margin-top:0;">
                  <a href="${verificationLInk}" target="_blank" rel="noopener noreferrer" style="color:#1a82e2;">${verificationLInk}</a>
                </p>
                <hr style="border:0;border-top:1px solid #eaeaea;margin:22px 0;">
                <p style="color:#6b7280;font-size:14px;margin:0 0 12px;">If you didn't request this verification, please ignore this email.</p>
                <p style="color:#6b7280;font-size:14px;margin:0;">Need help? Contact <a href="mailto:{{supportEmail}}" style="color:#1a82e2;">{{supportEmail}}</a>.</p>
                <p style="margin-top:18px;font-size:13px;color:#9ca3af;">— Clicon Team</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 24px;background:#f9fafb;text-align:center;color:#9ca3af;font-size:12px;">
                <div>If you're having trouble, copy and paste this URL into your browser: ${verificationLInk}</div>
                <div style="margin-top:8px;">&copy; 2025 Clicon. All rights reserved.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};
