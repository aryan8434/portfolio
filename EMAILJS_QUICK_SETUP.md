# EmailJS Quick Setup for bovcare@gmail.com

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account (200 emails/month free)
3. Verify your email address

## Step 2: Add Gmail Service

1. In EmailJS dashboard, go to **"Email Services"**
2. Click **"Add New Service"**
3. Select **"Gmail"**
4. Click **"Connect Account"** and sign in with your Gmail account (bovcare@gmail.com)
5. After connecting, note your **Service ID** (e.g., `service_gmail123`)

## Step 3: Create Email Template

1. Go to **"Email Templates"** in EmailJS dashboard
2. Click **"Create New Template"**
3. Use these settings:

   **Template Name:** Contact Form Notification
   
   **To Email:** `bovcare@gmail.com`
   
   **From Name:** `{{from_name}}`
   
   **From Email:** `{{from_email}}`
   
   **Subject:** `New Contact Form Submission from {{from_name}}`
   
   **Content:**
   ```
   You have received a new message from your contact form.
   
   Name: {{from_name}}
   Email: {{from_email}}
   
   Message:
   {{message}}
   
   ---
   Reply to: {{from_email}}
   ```

4. Click **"Save"**
5. Note your **Template ID** (e.g., `template_xyz789`)

## Step 4: Get Your Public Key

1. Go to **"Account"** → **"General"** in EmailJS dashboard
2. Find **"Public Key"** (starts with `user_`)
3. Copy this key

## Step 5: Create .env File

Create a `.env` file in your project root with:

```env
# EmailJS Configuration
VITE_EMAILJS_PUBLIC_KEY=your-public-key-here
VITE_EMAILJS_SERVICE_ID=your-service-id-here
VITE_EMAILJS_TEMPLATE_ID=your-template-id-here

# Your Email (where you want to receive notifications)
VITE_YOUR_EMAIL=bovcare@gmail.com
```

**Replace:**
- `your-public-key-here` with your EmailJS Public Key
- `your-service-id-here` with your Service ID
- `your-template-id-here` with your Template ID

## Step 6: Restart Dev Server

```bash
npm run dev
```

## Step 7: Test

1. Fill out the contact form on your website
2. Submit it
3. Check your inbox at **bovcare@gmail.com** - you should receive the email!

## Troubleshooting

### Email not sending?
- Check browser console for errors
- Verify all environment variables are set correctly
- Make sure you restarted the dev server after creating `.env`
- Check EmailJS dashboard → "Logs" to see if emails are being sent

### "EmailJS configuration is missing" error?
- Make sure your `.env` file is in the project root
- Verify all variables start with `VITE_`
- Restart your dev server

### Gmail service not working?
- Make sure you connected your Gmail account in EmailJS
- Check that Gmail service is active in EmailJS dashboard
- Try reconnecting the Gmail service

## Notes

- Firebase is optional - the form will work with just EmailJS
- You'll receive emails at bovcare@gmail.com whenever someone submits the form
- Free tier: 200 emails/month
- All form submissions will be sent to your email automatically

