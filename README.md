# 📚 StudyHub — Full-Stack Study Materials Platform

A production-ready full-stack web application for hosting and managing study materials.  
Built with React + Vite, Node.js/Express, and MongoDB.

---

## 🗂️ Project Structure

```
studyhub/
├── backend/                    # Node.js + Express API
│   ├── controllers/            # Business logic
│   │   ├── authController.js   # Login, register, profile
│   │   ├── materialController.js  # Upload, view, delete files
│   │   ├── paymentController.js   # Stripe + Razorpay
│   │   ├── contactController.js   # Email via NodeMailer
│   │   ├── adminController.js     # Dashboard stats, user mgmt
│   │   └── settingsController.js  # App-wide settings
│   ├── middleware/
│   │   ├── auth.js             # JWT protect / adminOnly / memberOnly
│   │   ├── upload.js           # Multer config (local → cloud-switchable)
│   │   └── fileAccess.js       # File access control
│   ├── models/
│   │   ├── User.js             # User schema (student/admin)
│   │   ├── Material.js         # Study material metadata
│   │   ├── Payment.js          # Payment records
│   │   └── Settings.js         # App settings key/value store
│   ├── routes/                 # Express route definitions
│   ├── services/
│   │   └── seed.js             # Seeds admin + default settings
│   ├── uploads/                # Local file storage (gitignored)
│   │   ├── pdfs/
│   │   ├── images/
│   │   └── videos/
│   ├── .env.example            # Environment variable template
│   ├── package.json
│   └── server.js               # Express app entry point
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Navbar, Footer
│   │   │   ├── student/        # MaterialCard
│   │   │   └── admin/          # AdminLayout (sidebar)
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global auth state
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   ├── ContactPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── MembershipPage.jsx
│   │   │   ├── MaterialDetailPage.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminMaterials.jsx
│   │   │       ├── AdminUpload.jsx
│   │   │       ├── AdminUsers.jsx
│   │   │       └── AdminSettings.jsx
│   │   ├── services/
│   │   │   └── api.js          # Axios + all API service calls
│   │   ├── App.jsx             # Router + protected routes
│   │   ├── main.jsx
│   │   └── index.css           # Global styles + CSS variables
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## ⚡ Local Setup (Step-by-Step)

### Prerequisites
- **Node.js** v18+ → https://nodejs.org
- **MongoDB** v6+ → https://www.mongodb.com/try/download/community
- **Git** → https://git-scm.com

---

### Step 1 — Clone / Download the project

```bash
# If using git
git clone <your-repo-url>
cd studyhub
```

---

### Step 2 — Set up the Backend

```bash
cd backend

# Install dependencies
npm install

# Copy the environment template
cp .env.example .env
```

Now open `backend/.env` and fill in your values:

```env
# Required to start:
MONGODB_URI=mongodb://localhost:27017/studyhub
JWT_SECRET=your_random_64_character_string_here

# Required for email (Contact form):
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password    # See note below

# Required for payments (choose one):
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
# OR
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords → Generate

---

### Step 3 — Start MongoDB

```bash
# macOS / Linux
mongod --dbpath ~/data/db

# Windows
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath C:\data\db

# OR if installed as a service, it may already be running
```

---

### Step 4 — Start the Backend

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected
✅ Default admin created:
   Email:    admin@studyhub.com
   Password: Admin@123456
✅ Default settings initialized
🚀 StudyHub server running on http://localhost:5000
```

---

### Step 5 — Set up and Start the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open → **http://localhost:3000**

---

### Step 6 — Test Admin Login

1. Go to http://localhost:3000/login
2. Login with:
   - **Email:** `admin@studyhub.com`
   - **Password:** `Admin@123456`
3. You'll be redirected to the Admin Dashboard at `/admin`

> ⚠️ Change this password immediately! Go to Admin → Settings or update in `.env`.

---

## 🔐 Security Features

| Feature | Implementation |
|---|---|
| JWT Auth | Tokens expire in 7 days, stored in localStorage |
| Password Hashing | bcryptjs with salt rounds = 12 |
| Rate Limiting | 100 req/15min global, 10 req/15min on auth routes |
| Helmet.js | HTTP security headers |
| CORS | Restricted to FRONTEND_URL |
| File Access | JWT checked before serving members-only files |
| Role-Based Access | admin / student roles with protected routes |
| Right-click / Copy | Disabled for non-members on premium content |
| Input Validation | Required fields, email format, password length |

---

## 💳 Payment Integration

### Razorpay (Recommended for India)
1. Create account at https://razorpay.com
2. Go to Settings → API Keys → Generate Test Key
3. Add to `.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxx
   RAZORPAY_KEY_SECRET=xxxxxx
   ```
4. In Admin → Settings → set Active Gateway to "Razorpay"

### Stripe (International)
1. Create account at https://stripe.com
2. Get keys from https://dashboard.stripe.com/apikeys
3. Add to `.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_xxxxxx
   STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxx
   ```
4. In Admin → Settings → set Active Gateway to "Stripe"

---

## 🚀 Deployment Guide

### Option A: VPS (Ubuntu) — Full Control

```bash
# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install MongoDB
sudo apt-get install -y mongodb

# 3. Install PM2 (process manager)
sudo npm install -g pm2

# 4. Clone project
git clone <your-repo>
cd studyhub/backend
npm install
cp .env.example .env
nano .env  # Fill in production values

# 5. Start backend with PM2
pm2 start server.js --name "studyhub-api"
pm2 startup
pm2 save

# 6. Build frontend
cd ../frontend
npm install
npm run build
# Deploy dist/ folder to Nginx or serve via Express

# 7. Set up Nginx reverse proxy
# /etc/nginx/sites-available/studyhub:
# server {
#   listen 80;
#   server_name yourdomain.com;
#   location /api { proxy_pass http://localhost:5000; }
#   location / { root /path/to/frontend/dist; try_files $uri /index.html; }
# }
```

---

### Option B: Render (Free Tier Available)

**Backend on Render:**
1. Push code to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your repo, set Root Directory to `backend`
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add Environment Variables from `.env.example`
7. Set `MONGODB_URI` to MongoDB Atlas connection string

**Frontend on Render:**
1. New → Static Site
2. Root Directory: `frontend`
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`
5. Add env var: `VITE_API_URL=https://your-backend.onrender.com/api`

---

### Option C: Vercel (Frontend) + Railway (Backend)

**Frontend → Vercel:**
```bash
cd frontend
npm install -g vercel
vercel
# Follow prompts, set VITE_API_URL to your backend URL
```

**Backend → Railway:**
1. Go to https://railway.app → New Project → Deploy from GitHub
2. Select backend folder
3. Add all environment variables
4. Railway auto-detects Node.js and runs `npm start`

---

### MongoDB Atlas (Cloud Database)
1. Go to https://cloud.mongodb.com
2. Create free cluster → Get connection string
3. Replace `MONGODB_URI` in production `.env`:
   ```env
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/studyhub
   ```

---

### Cloud File Storage (Switch from Local)

When ready to move to cloud storage, open `backend/middleware/upload.js` and replace the `diskStorage` block:

**For AWS S3:**
```bash
npm install multer-s3 @aws-sdk/client-s3
```
```js
// In upload.js, replace storage with:
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const s3 = new S3Client({ region: process.env.AWS_REGION });
const storage = multerS3({
  s3,
  bucket: process.env.AWS_S3_BUCKET,
  key: (req, file, cb) => cb(null, `uploads/${uuidv4()}${path.extname(file.originalname)}`)
});
```

**For Cloudinary:**
```bash
npm install multer-storage-cloudinary cloudinary
```

---

## 🌍 Environment Variables Reference

| Variable | Description | Required |
|---|---|---|
| `PORT` | Server port (default: 5000) | No |
| `MONGODB_URI` | MongoDB connection string | **Yes** |
| `JWT_SECRET` | Secret key for JWT (64+ chars) | **Yes** |
| `EMAIL_HOST` | SMTP host | For contact form |
| `EMAIL_USER` | SMTP username/email | For contact form |
| `EMAIL_PASS` | SMTP password/app password | For contact form |
| `EMAIL_TO` | Admin email to receive messages | For contact form |
| `RAZORPAY_KEY_ID` | Razorpay public key | For Razorpay |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key | For Razorpay |
| `STRIPE_SECRET_KEY` | Stripe secret key | For Stripe |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key | For Stripe |
| `FRONTEND_URL` | Frontend URL for CORS | Production |
| `ADMIN_EMAIL` | Default admin email | Seed only |
| `ADMIN_PASSWORD` | Default admin password | Seed only |

---

## 📝 Admin Quick-Start

After logging in as admin (`/admin`):

1. **Dashboard** — See user count, members, materials, revenue
2. **Upload** → `/admin/upload` — Upload PDF/image/video
   - Set title, category, access type (Free / Members Only)
   - Toggle download permission
3. **Materials** → `/admin/materials` — Edit, delete, toggle visibility
4. **Users** → `/admin/users` — View all students, grant/revoke membership
5. **Settings** → `/admin/settings` — Set membership fee, select payment gateway

---

## 🛠️ Tech Stack Summary

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Styling | Pure CSS with CSS Variables (no framework) |
| Backend | Node.js, Express 4 |
| Database | MongoDB with Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| File Upload | Multer (local) → switchable to S3/Cloudinary |
| Email | NodeMailer |
| Payments | Razorpay + Stripe (placeholder ready) |
| Security | Helmet, express-rate-limit, CORS |

---

## 🐛 Troubleshooting

**MongoDB won't connect:**
- Ensure MongoDB is running: `sudo systemctl start mongod`
- Check `MONGODB_URI` in `.env`

**Port already in use:**
- Kill process: `lsof -ti:5000 | xargs kill` (Linux/Mac)
- Or change `PORT` in `.env`

**File upload fails:**
- Check `uploads/` directory exists and is writable
- Max file size is 500MB

**Email not sending:**
- Use Gmail App Password (not your main password)
- Check spam/junk folder for test emails
- Verify `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`

**Payment not working:**
- Ensure API keys are set in `.env` (not just Admin Settings)
- Use test keys during development
- Check browser console for errors
