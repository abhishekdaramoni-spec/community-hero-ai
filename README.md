<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/15ff084c-1c35-47a9-ac4f-483b9718c504

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
# 🦸 Community Hero AI
### AI-Powered Hyperlocal Problem Solver

> Empowering communities with AI-driven civic issue reporting, intelligent categorization, and transparent resolution.

---

## 📖 Overview

Community Hero AI is an AI-powered civic engagement platform that enables citizens to report local infrastructure issues, while helping administrators and volunteers manage, assign, and resolve them efficiently.

Using **Google AI Studio (Gemini)**, the platform automatically analyzes reports, classifies issues, estimates severity, and assists in faster decision-making.

This project was developed as a hackathon solution to improve transparency and collaboration between citizens and local authorities.

---

# ✨ Key Features

### 👤 Citizen Portal

- Secure user authentication
- Report civic issues
- Upload issue images
- AI-assisted issue categorization
- Track submitted reports
- Community-specific issue visibility

---

### 🤖 AI-Powered Analysis

Powered by **Google AI Studio (Gemini)**

The AI can:

- Categorize reported issues
- Generate concise summaries
- Determine issue priority
- Recommend appropriate actions
- Improve reporting accuracy

---

### 🗺 Interactive Community Map

- View reported issues on a map
- Real-time issue visualization
- Community-based filtering
- Status tracking

---

### 👷 Volunteer Dashboard

- View assigned issues only
- Update issue status
- Mark issues as resolved
- Track assigned work

---

### 👨‍💼 Administrator Dashboard

- Monitor all reported issues
- Assign volunteers
- View analytics
- Manage communities
- Track overall progress

---

### 📊 Analytics

- Total Reports
- Pending Issues
- Resolved Issues
- Community Statistics
- Volunteer Performance
- Issue Distribution

---

# 🛠 Technology Stack

## Frontend

- React
- TypeScript
- Vite
- CSS

## Backend

- Node.js
- TypeScript

## AI

- Google AI Studio
- Gemini API

## Deployment

- Google Cloud Run

---

# 📂 Project Structure

```
community-hero-ai/
│
├── assets/
├── data/
├── src/
│   ├── components/
│   ├── data/
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
│
├── server.ts
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

# 🚀 Getting Started

## Clone the Repository

```bash
git clone https://github.com/abhishekdaramoni-spec/community-hero-ai.git
```

## Navigate to the Project

```bash
cd community-hero-ai
```

## Install Dependencies

```bash
npm install
```

## Configure Environment Variables

Create a `.env` file.

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

> **Note:** Never commit your actual API key to GitHub.

## Run the Development Server

```bash
npm run dev
```

---

# 🔄 Workflow

```
Citizen Reports Issue
          │
          ▼
AI Analyzes Report
          │
          ▼
Issue Categorized
          │
          ▼
Administrator Reviews
          │
          ▼
Volunteer Assigned
          │
          ▼
Issue Resolved
          │
          ▼
Citizen Receives Update
```

---

# 🔒 Security

- Environment variable based API configuration
- Secure authentication flow
- Role-based access control
- Community-level authorization
- Protected AI API usage

---

# 🌍 Use Cases

- Smart Cities
- Municipal Corporations
- Residential Communities
- Housing Societies
- Educational Campuses
- Rural Development Initiatives

---

# 🚀 Future Enhancements

- Mobile Application
- Push Notifications
- Voice-Based Reporting
- Offline Reporting
- Multi-language Support
- AI Severity Prediction
- Government Portal Integration

---

# 📸 Screenshots

Add screenshots here.

Example:

```
screenshots/
├── login.png
├── dashboard.png
├── report.png
├── map.png
├── admin.png
└── analytics.png
```

---

# 🏆 Hackathon Highlights

✅ AI-Powered Civic Issue Reporting

✅ Google AI Studio (Gemini) Integration

✅ Hyperlocal Community Management

✅ Interactive Issue Mapping

✅ Volunteer Assignment System

✅ Real-Time Status Tracking

✅ Analytics Dashboard

✅ Cloud-Ready Deployment

---

# 👨‍💻 Author

**Abhishek Daramoni**

GitHub:
https://github.com/abhishekdaramoni-spec

---

# 📄 License

This project is licensed under the MIT License.

---

⭐ If you found this project useful, consider giving it a star!
