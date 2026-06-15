# 🚀 Xeno AI-Native CRM [LIVE LINK : https://6a2e8889bb22ea000891f74e--crmnativeai1.netlify.app/login]

An AI-powered Customer Relationship Management (CRM) platform built to help businesses manage customers, create intelligent marketing campaigns, segment audiences, and monitor campaign performance through a modern dashboard.

---

## ✨ Features

### 📊 Dashboard
- Total Campaigns
- Messages Sent
- Messages Delivered
- Delivery Rate
- Sales Drop Analysis
- Live Campaign Activity

### 👥 Customer Management
- Add, Edit, Delete Customers
- Bulk Customer Import via CSV
- Customer Search & Filtering
- Customer Demographics Support

### 🎯 Audience Segmentation
- Create dynamic customer segments
- Rule-based filtering
- Reusable segment definitions

### 📢 Campaign Management
- Create targeted campaigns
- Select customer segments
- AI-generated personalized messages
- Campaign history and analytics

### 🤖 AI Integration
- Generate personalized marketing messages
- Improve campaign content using AI
- Smart suggestions for engagement

### 🔔 Webhook & Channel Service
- Real-time delivery updates
- Webhook support for status tracking
- Channel service for message processing

### 🔐 Authentication
- JWT Authentication
- Google OAuth Login
- Protected Routes
- Secure Session Management

---

# 🛠️ Tech Stack

## Frontend
- React.js
- Vite
- Tailwind CSS
- React Router
- Axios

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Passport.js
- JWT Authentication

## AI
- OpenAI / Gemini API

---

# 📂 Project Structure

```
Xeno-Assignment/
│
├── backend/
│   ├── channel-service/
│   ├── config/
│   │   ├── db.js
│   │   └── passport.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── campaignController.js
│   │   └── customerController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │
│   ├── routes/
│   │   ├── aiRoutes.js
│   │   ├── authRoutes.js
│   │   ├── campaignRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── segmentRoutes.js
│   │   └── webhookRoutes.js
│   │
│   ├── scripts/
│   ├── server.js
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/xeno-assignment.git
cd xeno-assignment
```

## 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

## 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```


---

# 🐳 Docker Support

### Build Backend

```bash
docker build -t xeno-backend ./backend
docker run -p 5000:5000 xeno-backend
```

### Build Frontend

```bash
docker build -t xeno-frontend ./frontend
docker run -p 5173:5173 xeno-frontend
```

---

# 📈 Workflow

1. User logs in using JWT or Google OAuth.
2. Customers are added manually or imported via CSV.
3. Customer segments are created using filtering rules.
4. Marketing campaigns are configured.
5. AI generates personalized campaign messages.
6. Messages are sent through the channel service.
7. Delivery updates are received through webhooks.
8. Dashboard reflects live campaign performance and analytics.

---

# 📊 Dashboard Metrics

- Total Customers
- Total Campaigns
- Messages Sent
- Messages Delivered
- Delivery Rate
- Sales Drop
- Active Campaigns
- Live Status Updates

---

# 🔒 Security

- JWT Authentication
- Google OAuth
- Password Hashing
- Protected APIs
- Environment Variable Management
- Middleware Authorization

---

# 🤖 AI Features

- AI-powered message generation
- Personalized marketing content
- Smart customer engagement suggestions
- Campaign optimization assistance

---

# 📡 API Modules

### Authentication
- Register
- Login
- Google OAuth

### Customers
- Create Customer
- Update Customer
- Delete Customer
- Import CSV
- Get Customers

### Segments
- Create Segment
- Update Segment
- Delete Segment
- Fetch Segments

### Campaigns
- Create Campaign
- Update Campaign
- Fetch Campaigns
- Campaign Analytics

### AI
- Generate Personalized Messages

### Webhooks
- Delivery Status Updates
- Event Notifications

---

# 📸 Screenshots

Include screenshots for:

- Login Page
- Dashboard
- Customer Management
- Audience Segmentation
- Campaign Creation
- AI Message Generator
- Analytics View

---

# 🚀 Future Enhancements

- WhatsApp Business API Integration
- SMS Campaign Support
- Email Campaign Support
- Predictive Customer Analytics
- AI-based Customer Segmentation
- Campaign Scheduling
- A/B Testing
- Multi-user Role Management

---

# 👨‍💻 Author

**Purvi Pal**

Built as an AI-native CRM solution to simplify customer management, automate marketing campaigns, and provide intelligent analytics through modern web technologies and AI.
