interface ReplyTemplateParams {
    recipientName: string
    replyBody: string
    originalMessage: string
    originalDate: string
}

export function buildReplyEmailHtml({
    recipientName,
    replyBody,
    originalMessage,
    originalDate,
}: ReplyTemplateParams): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Re: Your Inquiry</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#18181b;padding:24px 32px;">
              <h1 style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Lumina</h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:32px 32px 0;">
              <p style="margin:0 0 4px;font-size:14px;color:#71717a;">Hello,</p>
              <h2 style="margin:0;font-size:22px;font-weight:700;color:#18181b;">${escapeHtml(recipientName)}</h2>
            </td>
          </tr>

          <!-- Reply body -->
          <tr>
            <td style="padding:24px 32px;">
              <div style="font-size:15px;line-height:1.7;color:#27272a;">
                ${replyBody}
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <hr style="border:none;border-top:1px solid #e4e4e7;margin:0;">
            </td>
          </tr>

          <!-- Original message -->
          <tr>
            <td style="padding:24px 32px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#a1a1aa;">Your Original Message &mdash; ${escapeHtml(originalDate)}</p>
              <div style="padding:16px;background-color:#fafafa;border-radius:8px;border-left:3px solid #e4e4e7;">
                <p style="margin:0;font-size:13px;line-height:1.6;color:#52525b;white-space:pre-wrap;">${escapeHtml(originalMessage)}</p>
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:8px 32px 32px;">
              <p style="margin:0;font-size:14px;line-height:1.6;color:#52525b;">
                If you have any further questions, simply reply to this email and we'll get back to you promptly.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#fafafa;padding:24px 32px;border-top:1px solid #e4e4e7;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#18181b;">Lumina</p>
              <p style="margin:0;font-size:12px;color:#a1a1aa;">This email was sent in response to your inquiry. Please do not forward this email as it may contain information specific to your request.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}
