require('dotenv').config(); // Ensure this is at the top to load .env variables
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// Enable CORS for all routes
app.use(cors());

app.use(express.json()); // Parse JSON bodies

app.post('/api/send', async (req, res) => {
  console.log('Environment variables:', process.env.EMAIL_USER, process.env.EMAIL_PASS); // Log to verify

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Create a transporter object using SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Set up email data
  const mailOptions = {
    from: process.env.EMAIL_USER, // Use your own email address here
    to: process.env.EMAIL_USER, // Send to your own email address
    subject: `New message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`, // Include user's email in the message
    replyTo: email // Set the reply-to field to the user's email address
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error); // Log error to the console
    res.status(500).json({ message: 'Failed to send message', error: error.toString() });
  }
});

// Handle invalid routes
app.use((req, res) => {
  res.status(405).json({ message: 'Method not allowed' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
