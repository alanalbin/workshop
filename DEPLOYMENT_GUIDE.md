# FROM PROBLEM TO POSSIBILITY Workshop Platform — Complete Deployment & Guide

Welcome to the **FROM PROBLEM TO POSSIBILITY** platform codebase! This application is a production-oriented, full-stack event registration and participant management system built for **KMCT College of Engineering for Emerging Technologies and Management, Kasaragod**, conducted under the **Institution’s Innovation Council (IIC) Quarter 1 Activities**.

---

## 1. Quick Start (Running Locally)

You can run and test the complete platform locally immediately. Zero cloud setup is required on day one thanks to the built-in local persistence engine.

### Prerequisites Check
Verify your Node.js and npm versions in PowerShell:
```powershell
node -v
npm -v
```
*(Requires Node.js v18+ or v20+; v24 is tested and verified).*

### Start the Application
In your terminal, navigate to the project directory:
```powershell
npm run dev
```
Open your browser and navigate to:
- **Public Workshop Website:** [http://localhost:3000](http://localhost:3000)
- **Participant Registration:** [http://localhost:3000/register](http://localhost:3000/register)
- **Payment & Pass Checkout:** [http://localhost:3000/payment](http://localhost:3000/payment)
- **Coordinator Admin Dashboard:** [http://localhost:3000/admin](http://localhost:3000/admin)
  *(Default development passcode: `kmct2026`)*

---

## 2. Platform Architecture & Features

### A. Workshop Curriculum & 3D Interactive Experience
- Workshop Title: **Workshop on Problem Solving and Ideation (From Problem to Possibility)**
- Framework: Institution's Innovation Council (IIC) Quarter 1 Activities
- Host: KMCT College of Engineering for Emerging Technologies and Management, Kasaragod
- Date: Wednesday, 11th November 2026 (09:30 AM – 04:00 PM) | Seminar Hall
- Resource Person: **Mr. Muhammed Shayiz K P** (Senior Software Engineer, Doodleblue Innovations, Chennai; Co-founder, Shine Technologies, Kannur)
- Coordinator: **Mr. Abdul Mujeeb MS** (IIC Coordinator)
- Capacity: Capped strictly at **70 seats**
- Registration Fee: **₹100** per participant

### B. Participant Registration & Indian Mobile Validation
- Server-side and client-side Zod validation with 10-digit Indian phone normalization.
- Institution auto-filled with KMCT College of Engineering Kasaragod.
- Prevents duplicate email registrations while allowing pending applicants to resume payment.

### C. Razorpay Gateway & Direct UPI Verification Queue
- Authoritative server-side fee calculation in integer paise (`₹100` = `10000 paise`).
- HMAC-SHA256 cryptographic signature verification.
- Direct UPI transfer option with 12-digit UTR submission.
- Manual UPI Queue in the admin dashboard allows coordinators to verify payments and issue confirmed passes.

### D. Official Digital Workshop Pass
- Printable pass with participant name, course, registration number (`P2P-KMCT-XXXX`), confirmed status badge, and official IIC accreditation notes.
- Automatic PDF print format with dynamic QR code.

### E. Coordinator Admin Dashboard
- Real-time KPIs: Total registrations, verified paid seats, pending count, manual review queue, and 70 seats capacity limit.
- One-click CSV Export formatted for IIC administration reporting.

---

## 3. Step-by-Step Firebase Production Setup

When you are ready to deploy to Google Cloud & Firebase:

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project**, name it `kmct-iic-workshop` (or your preferred name), and choose whether to enable Google Analytics.
3. Click **Create Project**.

### Step 2: Register the Web App
1. On the Project Overview page, click the **Web icon (`</>`)** to add an app.
2. Register app nickname: `kmct-iic-web`.
3. Copy the `firebaseConfig` object values into your `.env.local` file:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=kmct-iic.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=kmct-iic
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=kmct-iic.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789...
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789...
   ```

### Step 3: Create Cloud Firestore
1. In the Firebase console left menu, click **Firestore Database** -> **Create database**.
2. Select **Production mode** and choose your nearest region (e.g., `asia-south1` for Mumbai).
3. The included [firestore.rules](file:///c:/Users/User/Downloads/illuminate/firestore.rules) and [firestore.indexes.json](file:///c:/Users/User/Downloads/illuminate/firestore.indexes.json) will automatically enforce security:
   - Events are publicly readable but editable only by authorized coordinators.
   - Registrations cannot be publicly listed; participants can only read their own pass.
   - Payment status cannot be tampered with from the browser.

### Step 4: Generate Firebase Admin SDK Private Key
1. Go to **Project Settings** (gear icon) -> **Service Accounts**.
2. Click **Generate new private key** and download the JSON file.
3. Add the values to your `.env.local`:
   ```env
   FIREBASE_PROJECT_ID=kmct-iic
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@kmct-iic.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

### Step 5: Configure Razorpay (Optional for Live Mode)
1. Sign up or log into [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Under **Settings -> API Keys**, generate a Test Key ID and Secret.
3. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   RAZORPAY_WEBHOOK_SECRET=...
   ```
4. Configure Webhooks:
   - Webhook URL: `https://your-domain.web.app/api/payment/webhook`
   - Active Events: `payment.captured`, `order.paid`

---

## 4. Running Automated Tests

To run the complete test suite at any time:
```powershell
npm test
```
Validates:
- Participant phone normalization & Zod schema rules.
- Cryptographic HMAC-SHA256 payment signature verification and tamper rejection.
- Event configuration defaults, fee calculation (₹100 / 10000 paise), and 70 seats capacity safeguards.

---

## 5. Contact & Support

- **IIC Coordinator:** Mr. Abdul Mujeeb MS — `+91 8848563266` | `abdulmujeeb@kmct.edu.in`
- **Resource Person:** Mr. Muhammed Shayiz K P (Senior Software Engineer, Doodleblue Innovations & Co-founder, Shine Technologies)
- **Host Institution:** KMCT College of Engineering for Emerging Technologies and Management, Kasaragod, Kerala
- **Official Website:** [kmct.org](https://www.kmct.org)
