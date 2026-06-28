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

### *AI-Powered Hyperlocal Problem Solver*

<p align="center">

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge\&logo=react\&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge\&logo=typescript\&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge\&logo=node.js\&logoColor=white)
![Google AI Studio](https://img.shields.io/badge/Google%20AI%20Studio-Gemini-4285F4?style=for-the-badge\&logo=google)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge\&logo=vite\&logoColor=white)

</p>

---

# 🌍 Overview

**Community Hero AI** is an intelligent civic issue management platform that empowers communities to report, monitor, and resolve local infrastructure problems efficiently.

Citizens can report issues such as potholes, damaged streetlights, garbage accumulation, water leaks, and other public infrastructure concerns. The platform leverages **Google AI Studio (Gemini)** to analyze reports, assist with categorization, and streamline issue management.

---

# 🎯 Problem Statement

Many communities struggle with:

* Delayed issue reporting
* Lack of transparency
* Manual categorization
* Poor communication
* No centralized tracking system

Community Hero AI addresses these challenges through an AI-assisted workflow and a role-based management system.

---

# ✨ Key Features

| Feature                | Description                                                     |
| ---------------------- | --------------------------------------------------------------- |
| 📝 Issue Reporting     | Citizens can submit civic issues with descriptions and images   |
| 🤖 AI Analysis         | Google Gemini assists with categorizing and summarizing reports |
| 🗺 Interactive Map     | View issues geographically within the community                 |
| 👨‍💼 Admin Dashboard  | Manage reports and assign volunteers                            |
| 👷 Volunteer Dashboard | View assigned tasks and update issue status                     |
| 📊 Analytics Dashboard | Visualize issue trends and resolution statistics                |
| 🔐 Role-Based Access   | Separate interfaces for citizens, admins, and volunteers        |

---

# 🤖 AI Workflow

```mermaid
flowchart LR

A[Citizen Reports Issue]
-->B[Image & Description]

B-->C[Google AI Studio - Gemini]

C-->D[Issue Category]

D-->E[Priority Suggestion]

E-->F[Administrator Review]

F-->G[Volunteer Assignment]

G-->H[Issue Resolution]

H-->I[Citizen Updated]
```

---

# 🏗 System Architecture

```mermaid
flowchart TD

Citizen --> Frontend

Volunteer --> Frontend

Admin --> Frontend

Frontend --> Backend

Backend --> GoogleAI

Backend --> Database

GoogleAI[Google AI Studio Gemini]

Database[(Project Data)]
```

---

# 🖥 Application Workflow

```mermaid
flowchart TD

Login

Login --> Dashboard

Dashboard --> ReportIssue

Dashboard --> CommunityMap

Dashboard --> MyReports

Dashboard --> Analytics

Dashboard --> WorkerDashboard

Dashboard --> AdminDashboard

ReportIssue --> AIAnalysis

AIAnalysis --> Assigned

Assigned --> Resolved
```

---

# 📸 Application Screenshots

## 🔐 Login

![Login](screenshots/login.png)

---

## 🏠 Citizen Dashboard

![Dashboard](screenshots/dashboard.png)

---

## 📝 Report Issue

![Report](screenshots/report.png)

---

## 🗺 Community Map

![Map](screenshots/map.png)

---

## 👨‍💼 Admin Dashboard

![Admin](screenshots/admin.png)

---

## 👷 Volunteer Dashboard

![Volunteer](screenshots/worker.png)

---

## 📊 Analytics Dashboard

![Analytics](screenshots/analytics.png)

---

# 📊 Project Highlights

```text
✔ AI Assisted Issue Categorization

✔ Interactive Community Map

✔ Real-Time Issue Tracking

✔ Role-Based Access

✔ Analytics Dashboard

✔ Volunteer Assignment

✔ Hyperlocal Community Management
```

---

# 🛠 Tech Stack

## Frontend

* React
* TypeScript
* Vite
* CSS

## Backend

* Node.js
* TypeScript

## Artificial Intelligence

* Google AI Studio
* Gemini API

---

# 📂 Project Structure

```
community-hero-ai/

├── assets/

├── data/

├── src/

│   ├── components/

│   ├── data/

│   ├── App.tsx

│   ├── main.tsx

│   └── types.ts

├── server.ts

├── package.json

├── vite.config.ts

├── tsconfig.json

└── README.md
```

---

# 🚀 Installation

Clone the repository

```bash
git clone https://github.com/abhishekdaramoni-spec/community-hero-ai.git
```

Move into the project directory

```bash
cd community-hero-ai
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
GEMINI_API_KEY=YOUR_API_KEY
```

Run the application

```bash
npm run dev
```

---

# 🔒 Security

* Environment variable based API configuration
* Secure authentication workflow
* Role-based authorization
* Community-specific data visibility
* Protected AI API usage

---

# 🌍 Possible Applications

* Smart Cities
* Municipal Corporations
* Residential Communities
* Educational Campuses
* Housing Societies
* Village Development

---

# 🚀 Future Enhancements

* 📱 Mobile Application
* 🌐 Multi-language Support
* 🔔 Push Notifications
* 🎙 Voice-Based Reporting
* 📍 GPS Location Detection
* 📷 Improved AI Vision Analysis
* 📴 Offline Reporting
* ☁ Cloud Database Integration

---

# 👨‍💻 Developer

**Abhishek Daramoni**

GitHub:

https://github.com/abhishekdaramoni-spec

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.
