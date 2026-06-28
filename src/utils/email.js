import nodemailer from "nodemailer";

/**
 * Sends an email using Nodemailer and SMTP configuration.
 * If SMTP is not configured, it will log the email details to the console for development.
 *
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @returns {Promise<boolean>} Resolves to true if sent, false otherwise
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // Development Fallback: Log to console if SMTP is not configured
  if (!host || !user || !pass) {
    console.warn("⚠️ SMTP environment variables are missing!");
    console.log("================ DEVELOPMENT EMAIL LOG ================");
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text:    ${text}`);
    console.log("======================================================");
    return true; // Return true to allow development/signup flow to proceed without error
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465, // true for port 465, false for other ports (like 587)
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || "Elfin Commerce"}" <${user}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully! MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send email via SMTP:", error);
    // In production, we might want to propagate the error, but in staging/dev we log it
    throw new Error(
      "Failed to send verification email. Please check your SMTP configuration.",
    );
  }
};
