/**
 * Send Email utility: sends email using nodemailer SMTP, or falls back to console logger in development.
 */
const sendEmail = async (options) => {
  try {
    // Check if SMTP options are configured
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
      console.log('✉️ [MOCK EMAIL] SMTP not configured. Logging email details:');
      console.log(`   - To: ${options.email}`);
      console.log(`   - Subject: ${options.subject}`);
      console.log(`   - Message: ${options.message}`);
      return;
    }

    // Dynamically load nodemailer to prevent startup crashes when package isn't installed
    const { default: nodemailer } = await import('nodemailer');

    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 2525,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2. Define email options
    const mailOptions = {
      from: `ResearchConnect <noreply@researchconnect.com>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<p>${options.message}</p>`,
    };

    // 3. Send email
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Email successfully sent to: ${options.email}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${options.email}: ${error.message}`);
    // Do not crash the server on email failure in development
    if (process.env.NODE_ENV === 'development') {
      console.log('➡️ Email payload detail (logged after SMTP error):');
      console.log(options.message);
    } else {
      throw error;
    }
  }
};

export default sendEmail;
