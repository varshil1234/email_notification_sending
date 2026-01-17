require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
app.use(express.json());
app.use(cors());
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
app.post('/send-notification', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Emsail id field is empty" });
    }

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Notification Alert",
            text: "This is a notification from your API.",
            html: "<b>Hello!</b><p>This is a notification from your API.</p>"
        });    
        await db.collection('sent_emails').add({
            email: email,
            sentAt: new Date(),
            status: 'success'
        });    
        console.log(`Email sent to ${email} and is sved sucesfuly`);
        res.status(200).json({ message: "Success" });
            } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to send" });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));