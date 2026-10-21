import nodemailer, { type Transporter, type SendMailOptions } from "nodemailer";

/**
 * NIMBLUX SMTP Email Configuration
 * Defaults to Hostinger SMTP on port 465 (SSL/TLS)
 */
const SMTP_HOST = process.env.SMTP_HOST || "smtp.hostinger.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_USER = process.env.SMTP_USER || "admin@nimblux.xyz";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || '"NIMBLUX" <admin@nimblux.xyz>';
const SMTP_SECURE = process.env.SMTP_SECURE !== undefined
  ? process.env.SMTP_SECURE === "true"
  : SMTP_PORT === 465;

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    // Pool connections to avoid handshake overhead
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });

  return cachedTransporter;
}

/**
 * Verify SMTP transport connection (without sending an email)
 */
export async function verifySmtpConnection(): Promise<{ success: boolean; message: string }> {
  try {
    if (!SMTP_PASS) {
      return {
        success: false,
        message: "SMTP_PASS is not configured in environment variables.",
      };
    }
    const transporter = getTransporter();
    await transporter.verify();
    return { success: true, message: "SMTP connection verified successfully." };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Failed to verify SMTP connection.",
    };
  }
}

export interface SendOtpOptions {
  to: string;
  otp: string;
  name?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Generate responsive, dark-mode branded HTML email matching NIMBLUX visual identity
 */
function generateOtpHtml(otp: string, name?: string): string {
  const greeting = name ? `Hi ${name},` : "Hello,";
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://nimblux.xyz").replace(/\/$/, "");

  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>Your NIMBLUX Verification Code</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; min-width: 100%; background-color: #090B0B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; max-width: 100% !important; }
      .content-cell { padding: 24px 20px !important; }
      .otp-code { font-size: 28px !important; letter-spacing: 8px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #090B0B; color: #F5F1E8;">
  <div role="article" aria-roledescription="email" aria-label="NIMBLUX Email Verification" lang="en">
    <!-- Outer Wrapper -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #090B0B;">
      <tr>
        <td align="center" style="padding: 40px 16px;">
          <!-- Centered Container -->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="container" style="max-width: 540px; margin: 0 auto;">
            
            <!-- Brand Header -->
            <tr>
              <td align="center" style="padding-bottom: 28px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <div style="display: inline-block; padding: 6px 14px; border-radius: 8px; background-color: #111615; border: 1px solid rgba(255, 255, 255, 0.08);">
                        <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 800; letter-spacing: 3px; color: #F5F1E8; text-transform: uppercase;">
                          NIMBLUX
                        </span>
                        <span style="display: inline-block; width: 6px; height: 6px; background-color: #D8B77A; border-radius: 50%; margin-left: 6px; vertical-align: middle;"></span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top: 8px;">
                      <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; letter-spacing: 1.5px; color: #7E807B; text-transform: uppercase;">
                        Opportunities • Hackathons • Credentials
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Main Card -->
            <tr>
              <td>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #111615; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45); overflow: hidden;">
                  
                  <!-- Gold Accent Top Border -->
                  <tr>
                    <td height="3" style="background: linear-gradient(90deg, #D8B77A 0%, #E7D5B2 50%, #B8934A 100%); line-height: 3px; font-size: 3px;">&nbsp;</td>
                  </tr>

                  <!-- Content Cell -->
                  <tr>
                    <td class="content-cell" style="padding: 36px 36px 32px 36px;">
                      
                      <!-- Title & Badge -->
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td>
                            <div style="display: inline-block; padding: 4px 10px; border-radius: 6px; background-color: rgba(216, 183, 122, 0.12); border: 1px solid rgba(216, 183, 122, 0.25); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; font-size: 11px; font-weight: 600; color: #D8B77A; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px;">
                              Email Verification
                            </div>
                            <h1 style="margin: 0 0 12px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 700; color: #F5F1E8; letter-spacing: -0.3px; line-height: 1.3;">
                              Confirm your email address
                            </h1>
                            <p style="margin: 0 0 24px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #A9AAA5;">
                              ${greeting} thank you for creating your account on NIMBLUX. Use the 6-digit verification code below to verify your email and activate your account.
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- OTP Code Card -->
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 8px 0 24px 0;">
                        <tr>
                          <td align="center" style="background-color: #090B0B; border: 1px solid rgba(216, 183, 122, 0.35); border-radius: 12px; padding: 22px 16px;">
                            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; font-size: 11px; font-weight: 600; color: #7E807B; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">
                              One-Time Verification Code
                            </div>
                            <div class="otp-code" style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 34px; font-weight: 700; color: #D8B77A; letter-spacing: 10px; padding: 4px 0; user-select: all;">
                              ${otp}
                            </div>
                            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #8FA58E; margin-top: 8px; font-weight: 500;">
                              Valid for 10 minutes
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- Expiry & Instructions -->
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid rgba(255, 255, 255, 0.06); padding-top: 20px; margin-top: 8px;">
                        <tr>
                          <td>
                            <p style="margin: 0 0 12px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; line-height: 1.5; color: #A9AAA5;">
                              Enter this code on the NIMBLUX verification screen to complete your registration.
                            </p>
                            <!-- Security Warning -->
                            <div style="background-color: rgba(220, 38, 38, 0.08); border: 1px solid rgba(220, 38, 38, 0.2); border-radius: 8px; padding: 12px 14px; margin-top: 14px;">
                              <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; line-height: 1.5; color: #FCA5A5;">
                                <strong style="color: #F87171;">Security Notice:</strong> Never share this verification code with anyone. NIMBLUX staff will never ask for your code. If you did not request this email, please ignore it or contact us immediately.
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>

                  <!-- Card Footer -->
                  <tr>
                    <td style="background-color: #0E1110; border-top: 1px solid rgba(255, 255, 255, 0.06); padding: 16px 36px; text-align: center;">
                      <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #7E807B;">
                        Sent securely from <a href="mailto:admin@nimblux.xyz" style="color: #D8B77A; text-decoration: none;">admin@nimblux.xyz</a>
                      </span>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>

            <!-- Outer Footer -->
            <tr>
              <td align="center" style="padding-top: 24px; text-align: center;">
                <p style="margin: 0 0 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #7E807B;">
                  © ${new Date().getFullYear()} NIMBLUX Platform. All rights reserved.
                </p>
                <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #525350;">
                  <a href="${appUrl}" style="color: #7E807B; text-decoration: underline;">nimblux.xyz</a> • Verified Student & Builder Network
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

/**
 * Generate clean plain-text alternative for email clients without HTML support
 */
function generateOtpPlainText(otp: string, name?: string): string {
  const greeting = name ? `Hi ${name},` : "Hello,";
  return `NIMBLUX - Email Verification
==================================================

${greeting}

Thank you for creating an account with NIMBLUX.

Your 6-digit verification code is:

    ${otp}

This code will expire in 10 minutes.

--------------------------------------------------
SECURITY NOTICE:
Never share this verification code with anyone.
NIMBLUX staff and administrators will never ask for your code.
If you did not request this code, you can safely ignore this email.
--------------------------------------------------

Sent securely by NIMBLUX Platform (admin@nimblux.xyz)
https://nimblux.xyz
`;
}

/**
 * Sends a 6-digit OTP verification code via Hostinger SMTP
 * Never logs the OTP code or SMTP credentials.
 */
export async function sendOtpEmail(options: SendOtpOptions): Promise<SendEmailResult> {
  const { to, otp, name } = options;

  if (!to) {
    return { success: false, error: "Recipient email address is required." };
  }

  if (!otp || otp.length !== 6) {
    return { success: false, error: "Valid 6-digit OTP is required." };
  }

  // Check if SMTP is configured
  if (!SMTP_PASS && process.env.NODE_ENV === "production") {
    return {
      success: false,
      error: "SMTP email service is not configured (missing SMTP_PASS). Please configure environment variables.",
    };
  }

  try {
    const transporter = getTransporter();

    const mailOptions: SendMailOptions = {
      from: SMTP_FROM,
      to,
      subject: `Your NIMBLUX Verification Code: ${otp}`,
      text: generateOtpPlainText(otp, name),
      html: generateOtpHtml(otp, name),
      headers: {
        "X-Entity-Ref-ID": `nimblux-otp-${Date.now()}`,
        "X-Priority": "1", // High priority for instant delivery
      },
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    // Return friendly error message (NEVER include credentials or tokens)
    const rawError = err.message || "";
    let friendlyError = "Failed to send verification email. Please verify your email address or try again shortly.";

    if (rawError.includes("ECONNREFUSED") || rawError.includes("ETIMEDOUT")) {
      friendlyError = "Unable to connect to email server. Please try again in a moment.";
    } else if (rawError.includes("Invalid login") || rawError.includes("auth")) {
      friendlyError = "Email service authentication failed. Please contact support.";
    } else if (rawError.includes("recipient") || rawError.includes("mailbox")) {
      friendlyError = "Recipient email address was rejected by the mail server.";
    }

    return {
      success: false,
      error: friendlyError,
    };
  }
}
