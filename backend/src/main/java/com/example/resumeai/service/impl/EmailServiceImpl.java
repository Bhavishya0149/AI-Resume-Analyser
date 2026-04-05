package com.example.resumeai.service.impl;

import com.example.resumeai.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendOtpEmail(String toEmail, String otp) {
        String html = """
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:40px 0;">
                    <table width="480" cellpadding="0" cellspacing="0"
                           style="background:#ffffff;border-radius:8px;
                                  box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;">
                      <tr>
                        <td style="background:#4f46e5;padding:28px 40px;">
                          <h1 style="margin:0;color:#ffffff;font-size:22px;">
                            ✉️ Verify Your Email
                          </h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:36px 40px;">
                          <p style="margin:0 0 16px;color:#374151;font-size:15px;">
                            Use the code below to verify your email address.
                            It expires in <strong>10 minutes</strong>.
                          </p>
                          <div style="text-align:center;margin:24px 0;">
                            <span style="display:inline-block;background:#f0effe;
                                         color:#4f46e5;font-size:36px;font-weight:700;
                                         letter-spacing:12px;padding:16px 32px;
                                         border-radius:8px;border:2px dashed #c7d2fe;">
                              %s
                            </span>
                          </div>
                          <p style="margin:0;color:#6b7280;font-size:13px;">
                            If you did not create an account, please ignore this email.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background:#f9fafb;padding:16px 40px;
                                   border-top:1px solid #e5e7eb;">
                          <p style="margin:0;color:#9ca3af;font-size:12px;">
                            © 2025 AI Resume Analyser. All rights reserved.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(otp);

        sendHtmlEmail(toEmail, "Your Verification Code", html);
    }

    @Override
    public void sendPasswordResetEmail(String to, String resetLink) {
        String html = """
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:40px 0;">
                    <table width="480" cellpadding="0" cellspacing="0"
                           style="background:#ffffff;border-radius:8px;
                                  box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;">
                      <tr>
                        <td style="background:#dc2626;padding:28px 40px;">
                          <h1 style="margin:0;color:#ffffff;font-size:22px;">
                            🔐 Password Reset Request
                          </h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:36px 40px;">
                          <p style="margin:0 0 20px;color:#374151;font-size:15px;">
                            We received a request to reset your password.
                            Click the button below — this link expires in
                            <strong>15 minutes</strong>.
                          </p>
                          <div style="text-align:center;margin:28px 0;">
                            <a href="%s"
                               style="display:inline-block;background:#dc2626;color:#ffffff;
                                      text-decoration:none;font-size:15px;font-weight:600;
                                      padding:14px 36px;border-radius:6px;">
                              Reset My Password
                            </a>
                          </div>
                          <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
                            Or copy and paste this link into your browser:
                          </p>
                          <p style="margin:0;word-break:break-all;color:#4f46e5;font-size:12px;">
                            %s
                          </p>
                          <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;" />
                          <p style="margin:0;color:#9ca3af;font-size:12px;">
                            If you did not request a password reset, you can safely ignore this email.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background:#f9fafb;padding:16px 40px;
                                   border-top:1px solid #e5e7eb;">
                          <p style="margin:0;color:#9ca3af;font-size:12px;">
                            © 2025 AI Resume Analyser. All rights reserved.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(resetLink, resetLink);

        sendHtmlEmail(to, "Reset Your Password", html);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);  // true = HTML
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email to " + to, e);
        }
    }
}