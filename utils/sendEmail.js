const axios = require("axios");

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const BRAND_NAME = "Sanya Khare";

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const sendEmail = async ({ name, email, message }) => {
  try {
    // Validation
    if (!name || !email || !message) {
      throw new Error("All fields are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      throw new Error("Invalid email address");
    }

    const safeName = escapeHtml(name.trim());
    const safeEmail = escapeHtml(email.trim());
    const safeMessage = escapeHtml(message.trim()).replace(/\n/g, "<br>");
    const submittedAt = new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const headers = {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    };

    // Email to Admin
    const adminEmail = {
      sender: {
        name: BRAND_NAME,
        email: process.env.SENDER_EMAIL,
      },
      to: [
        {
          email: process.env.ADMIN_EMAIL,
          name: BRAND_NAME,
        },
      ],
      replyTo: {
        email: email,
        name: name,
      },
      subject: `New portfolio message from ${name.trim()}`,
      htmlContent: `
        <div style="margin:0;padding:32px 16px;background:#f4f7fb;font-family:Arial,sans-serif;color:#172033;">
          <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e3e8f0;border-radius:16px;overflow:hidden;">
            <div style="padding:28px 32px;background:#172033;color:#ffffff;">
              <p style="margin:0 0 8px;color:#7dd3fc;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;">Portfolio contact</p>
              <h1 style="margin:0;font-size:25px;line-height:1.25;">New message for ${BRAND_NAME}</h1>
            </div>
            <div style="padding:32px;">
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">Someone has reached out through your portfolio contact form.</p>
              <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                <tr><td style="padding:10px 0;color:#667085;font-size:13px;width:90px;">Name</td><td style="padding:10px 0;font-weight:bold;">${safeName}</td></tr>
                <tr><td style="padding:10px 0;color:#667085;font-size:13px;border-top:1px solid #edf0f5;">Email</td><td style="padding:10px 0;border-top:1px solid #edf0f5;"><a href="mailto:${safeEmail}" style="color:#0284c7;">${safeEmail}</a></td></tr>
              </table>
              <p style="margin:0 0 8px;color:#667085;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Message</p>
              <div style="padding:18px;background:#f7f9fc;border-left:4px solid #06b6d4;border-radius:4px;font-size:15px;line-height:1.7;">${safeMessage}</div>
              <p style="margin:24px 0 0;color:#98a2b3;font-size:12px;">Received on ${submittedAt}</p>
            </div>
          </div>
        </div>
      `,
    };

    // Auto Reply Email
    const userEmail = {
      sender: {
        name: BRAND_NAME,
        email: process.env.SENDER_EMAIL,
      },
      to: [
        {
          email: email,
          name: name,
        },
      ],
      subject: `Thanks for contacting ${BRAND_NAME}`,
      htmlContent: `
        <div style="margin:0;padding:32px 16px;background:#f4f7fb;font-family:Arial,sans-serif;color:#172033;">
          <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e3e8f0;border-radius:16px;overflow:hidden;">
            <div style="height:6px;background:#06b6d4;"></div>
            <div style="padding:36px 32px;">
              <p style="margin:0 0 16px;color:#0284c7;font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Message received</p>
              <h1 style="margin:0 0 20px;font-size:28px;line-height:1.25;">Hi ${safeName},</h1>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Thank you for getting in touch through my portfolio. I have received your message and will review it shortly.</p>
              <p style="margin:0 0 28px;font-size:16px;line-height:1.7;">I will get back to you as soon as possible.</p>
              <div style="padding:18px 20px;background:#f0f9ff;border-radius:10px;color:#075985;font-size:14px;line-height:1.6;">You can reply directly to this email if you need to add anything to your message.</div>
              <p style="margin:32px 0 0;font-size:16px;line-height:1.6;">Best regards,<br><strong>${BRAND_NAME}</strong></p>
            </div>
            <div style="padding:18px 32px;background:#f8fafc;border-top:1px solid #edf0f5;color:#98a2b3;font-size:12px;">This is an automatic confirmation from ${BRAND_NAME}'s portfolio.</div>
          </div>
        </div>
      `,
    };

    // Send Admin Email
    const adminResponse = await axios.post(
      BREVO_API_URL,
      adminEmail,
      { headers }
    );

    console.log("✅ Admin Email Sent:", adminResponse.data);

    // Send User Email
    const userResponse = await axios.post(
      BREVO_API_URL,
      userEmail,
      { headers }
    );

    console.log("✅ User Email Sent:", userResponse.data);

    return {
      success: true,
      admin: adminResponse.data,
      user: userResponse.data,
    };

  } catch (error) {
    console.error(
      "❌ Brevo Error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Failed to send email"
    );
  }
};

module.exports = sendEmail;
