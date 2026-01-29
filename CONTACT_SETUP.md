# Contact Form Setup Guide

This guide will help you set up your contact form to save submissions to a database and receive notifications via email and WhatsApp.

## Prerequisites

- A Firebase account (free tier available)
- An EmailJS account (free tier available)
- (Optional) WhatsApp Business API or email gateway for WhatsApp notifications

## Step 1: Set Up Firebase (Database)

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard
   - Enable Google Analytics (optional)

2. **Enable Firestore Database**
   - In your Firebase project, go to "Build" → "Firestore Database"
   - Click "Create database"
   - Start in **test mode** (for development)
   - Choose your preferred location

3. **Get Firebase Configuration**
   - Go to Project Settings (gear icon) → General tab
   - Scroll down to "Your apps" section
   - Click the web icon (`</>`) to add a web app
   - Copy the `firebaseConfig` values

4. **Set Up Security Rules (Important!)**
   - Go to Firestore Database → Rules tab
   - Update the rules to allow writes (for production, add authentication):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /contacts/{document=**} {
         allow write: if true; // For development only
         allow read: if false; // Only you can read via Firebase Console
       }
     }
   }
   ```

## Step 2: Set Up EmailJS (Email Notifications)

1. **Create an EmailJS Account**
   - Go to [EmailJS](https://www.emailjs.com/)
   - Sign up for a free account (200 emails/month free)

2. **Add an Email Service**
   - Go to "Email Services" in the dashboard
   - Click "Add New Service"
   - Choose your email provider (Gmail, Outlook, etc.)
   - Follow the setup instructions
   - Note your **Service ID**

3. **Create an Email Template**
   - Go to "Email Templates"
   - Click "Create New Template"
   - Use this template structure:
     ```
     From: {{from_name}} <{{from_email}}>
     To: Your Email
     Subject: New Contact Form Submission from {{from_name}}
     
     Name: {{from_name}}
     Email: {{from_email}}
     
     Message:
     {{message}}
     ```
   - Save and note your **Template ID**

4. **Get Your Public Key**
   - Go to "Account" → "General"
   - Copy your **Public Key**

## Step 3: Configure Environment Variables

1. **Create `.env` file**
   - Copy `.env.example` to `.env` in your project root
   - Fill in all the values from Firebase and EmailJS

2. **Example `.env` file:**
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyC...
   VITE_FIREBASE_AUTH_DOMAIN=myproject.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=myproject-12345
   VITE_FIREBASE_STORAGE_BUCKET=myproject-12345.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   
   VITE_EMAILJS_PUBLIC_KEY=user_abc123xyz
   VITE_EMAILJS_SERVICE_ID=service_gmail
   VITE_EMAILJS_TEMPLATE_ID=template_xyz789
   
   VITE_YOUR_EMAIL=your-email@example.com
   ```

3. **Restart your dev server** after creating `.env`

## Step 4: Set Up WhatsApp Notifications (Optional)

### Option A: Using Email-to-WhatsApp Gateway

Some WhatsApp Business providers allow sending messages via email:
- Format: `your-number@whatsapp.gateway.com`
- Add this to your `.env` as `VITE_WHATSAPP_EMAIL`
- Set `VITE_ENABLE_WHATSAPP=true`

### Option B: Using Twilio API (Recommended for Production)

1. **Create a Twilio Account**
   - Sign up at [Twilio](https://www.twilio.com/)
   - Get your Account SID and Auth Token

2. **Set Up WhatsApp Sandbox** (for testing)
   - Go to Twilio Console → Messaging → Try it out → Send a WhatsApp message
   - Follow instructions to join the sandbox

3. **Create a Backend API Endpoint**
   - You'll need a serverless function (Vercel, Netlify, etc.)
   - The function should call Twilio API securely (don't expose API keys in frontend)

### Option C: Using WhatsApp Business API Directly

- Requires WhatsApp Business API approval
- More complex setup, but most reliable

## Step 5: Test Your Setup

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Submit a test message** through your contact form

3. **Check:**
   - Firebase Console → Firestore Database → `contacts` collection (should see your test submission)
   - Your email inbox (should receive notification)
   - (If configured) Your WhatsApp (should receive message)

## Troubleshooting

### Firebase Errors
- **Error: "Missing or insufficient permissions"**
  - Check your Firestore security rules
  - Make sure you're allowing writes in test mode

- **Error: "Firebase: Error (auth/configuration-not-found)"**
  - Verify all environment variables are set correctly
  - Make sure variable names start with `VITE_`

### EmailJS Errors
- **Error: "Failed to send email"**
  - Verify your Service ID and Template ID are correct
  - Check that your email service is properly connected
  - Check EmailJS dashboard for error logs

- **Error: "Invalid public key"**
  - Verify your Public Key in EmailJS account settings
  - Make sure it's the Public Key, not Private Key

### General Issues
- **Environment variables not loading**
  - Restart your dev server after creating `.env`
  - Make sure variables start with `VITE_` prefix
  - Check that `.env` is in the project root

## Production Deployment

1. **Update Firestore Security Rules** for production:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /contacts/{document=**} {
         allow write: if request.auth != null; // Require authentication
         allow read: if false; // Only accessible via Firebase Console
       }
     }
   }
   ```

2. **Set Environment Variables** in your hosting platform:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables
   - Add all `VITE_*` variables

3. **Test in production** before going live

## Viewing Submissions

You can view all contact form submissions in:
- **Firebase Console** → Firestore Database → `contacts` collection
- Each document contains: name, email, message, timestamp, and read status

## Security Notes

- Never commit `.env` file to git (already in `.gitignore`)
- Use environment variables for all sensitive data
- For production, implement rate limiting and spam protection
- Consider adding CAPTCHA to prevent spam

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Firebase Console for database errors
3. Check EmailJS dashboard for email delivery status
4. Verify all environment variables are set correctly

