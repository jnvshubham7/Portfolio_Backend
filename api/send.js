require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const axios = require('axios');

const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  'https://shubhambhokta.vercel.app',
  'http://localhost:3000',
  'https://shubham-bhokta.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Allow request
    } else {
      callback(new Error('Not allowed by CORS')); // Reject request
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
}));

// Ensure preflight requests are handled
app.options('*', cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to log request origins for debugging
app.use((req, res, next) => {
  console.log('Request Origin:', req.headers.origin);
  console.log('Allowed Origins:', allowedOrigins);
  next();
});

// Email sending endpoint
app.post('/api/send', async (req, res) => {
  console.log('Environment variables:', process.env.EMAIL_USER, process.env.EMAIL_PASS); // Debug environment variables

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Configure email transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Set up email data
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `New message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    replyTo: email
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send message', error: error.toString() });
  }
});

// PDF fetching endpoint
app.get('/api/get-pdf', async (req, res) => {
  const pdfLink = 'https://drive.google.com/uc?export=download&id=15YgPtd-l1cPdDdJwSKaBHBWj4V-T_wTL';

  try {
    const response = await axios.get(pdfLink, { responseType: 'arraybuffer' }); // Fetch PDF from Google Drive

    // Set headers for PDF download
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="document.pdf"'
    });

    // Send the PDF data
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching PDF:', error);
    res.status(500).json({ message: 'Failed to fetch PDF', error: error.toString() });
  }
});

// Catch-all handler for invalid routes
app.use((req, res) => {
  res.status(405).json({ message: 'Method not allowed' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
