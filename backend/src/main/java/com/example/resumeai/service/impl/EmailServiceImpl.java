package com.example.resumeai.service.impl;

import com.example.resumeai.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final RestTemplate restTemplate;

    @Value("${resend.api.key}")
    private String resendApiKey;

    @Value("${resend.from.email}")
    private String fromEmail;

    private static final String RESEND_API_URL = "https://api.resend.com/emails";

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

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(resendApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = Map.of(
                "from", fromEmail,
                "to", List.of(to),
                "subject", subject,
                "html", htmlBody
        );

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    RESEND_API_URL,
                    request,
                    String.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException(
                        "Failed to send email. Resend API returned: "
                                + response.getStatusCode()
                                + " - "
                                + response.getBody()
                );
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to send email to " + to, e);
        }
    }
}