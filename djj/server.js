import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import { Contact } from './src/models/Contact.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB Cluster
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'info.djempire@gmail.com',
    pass: process.env.EMAIL_PASS || 'ijxk cnjw iijb fwte'
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  try {
    // Save submission to MongoDB
    const savedContact = await Contact.create({ name, email, phone, message });

    const mailOptions = {
      from: process.env.EMAIL_USER || 'info.djempire@gmail.com',
      to: 'info.djempire@gmail.com',
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #FFD700; padding-bottom: 10px;">New Contact Form Submission</h2>
          
          <div style="margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>ID:</strong> ${savedContact._id}</p>
            <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p style="margin: 10px 0;"><strong>Message:</strong></p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px;">
              ${message}
            </div>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This message was sent from the D J EMPIRE PRODUCTION contact form.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Form saved to database and email sent successfully', data: savedContact });
  } catch (error) {
    console.error('Error handling contact submission:', error);
    res.status(500).json({ error: 'Failed to process contact submission' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

