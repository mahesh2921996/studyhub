/**
 * Contact Controller
 * ──────────────────────────────────────────────────────────────────
 * ⚠️  EMAIL SETUP ⚠️
 * 
 * Set these in .env:
 *   EMAIL_HOST=smtp.gmail.com
 *   EMAIL_PORT=587
 *   EMAIL_USER=your_email@gmail.com
 *   EMAIL_PASS=your_app_password      ← Gmail: use App Passwords
 *   EMAIL_TO=mbd2921996@gmail.com
 * 
 * For Gmail App Password:
 *   Google Account → Security → 2-Step Verification → App Passwords
 * ──────────────────────────────────────────────────────────────────
 */
const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // ⚠️ EMAIL CREDENTIALS: Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS in .env
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for port 465
    auth: {
      user: process.env.EMAIL_USER, // ⚠️ SET EMAIL_USER in .env
      pass: process.env.EMAIL_PASS  // ⚠️ SET EMAIL_PASS in .env
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// POST /api/contact
exports.sendMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Email not configured. Set EMAIL_USER and EMAIL_PASS in .env');
      // In development, just log the message
      console.log('Contact form submission:', { name, email, message });
      return res.json({ success: true, message: 'Message received! (Email not configured in development)' });
    }

    const transporter = createTransporter();

    // Email to admin
    await transporter.sendMail({
      from: `"StudyHub Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || 'mbd2921996@gmail.com', // ⚠️ Admin email destination
      replyTo: email,
      subject: `New Contact Form Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 10px;">
          <div style="background: #1d4ed8; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📚 StudyHub</h1>
            <p style="color: #bfdbfe; margin: 5px 0 0;">New Contact Form Submission</p>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e293b; margin-top: 0;">Message Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; background: #f1f5f9; font-weight: bold; border-radius: 4px; width: 30%;">Name</td>
                <td style="padding: 10px;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background: #f1f5f9; font-weight: bold; border-radius: 4px; margin-top: 8px; display: block;">Email</td>
                <td style="padding: 10px;"><a href="mailto:${email}">${email}</a></td>
              </tr>
            </table>
            <h3 style="color: #1e293b;">Message:</h3>
            <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #1d4ed8; border-radius: 4px; line-height: 1.6;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
              Received: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </p>
          </div>
        </div>
      `
    });

    // Confirmation email to sender
    await transporter.sendMail({
      from: `"StudyHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank you for contacting StudyHub!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1d4ed8; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">📚 StudyHub</h1>
          </div>
          <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e293b;">Hi ${name}! 👋</h2>
            <p style="color: #475569; line-height: 1.6;">Thank you for reaching out to StudyHub. We have received your message and will get back to you within 24-48 hours.</p>
            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #64748b; font-style: italic;">"${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"</p>
            </div>
            <p style="color: #475569;">In the meantime, explore our study materials at <a href="${process.env.FRONTEND_URL}" style="color: #1d4ed8;">StudyHub</a>.</p>
            <p style="color: #94a3b8; font-size: 12px;">Best regards,<br>The StudyHub Team</p>
          </div>
        </div>
      `
    });

    res.json({ success: true, message: 'Message sent successfully! We will get back to you soon.' });
  } catch (err) {
    console.error('Contact email error:', err);
    res.status(500).json({ success: false, message: 'Failed to send message. Please try again or email us directly.' });
  }
};
