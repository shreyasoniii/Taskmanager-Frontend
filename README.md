# 🚀 AI-Powered Task Manager

A full-stack task management application built with **React, Spring Boot, MySQL, JWT Authentication, AI Integration, and Blockchain-based Audit Logging**.

The application helps users manage tasks efficiently while leveraging AI for task description generation and optional on-chain logging for immutable task activity records.

---

## 📌 Features

### 🔐 Authentication & Security

* User Registration & Login
* JWT-based Authentication
* Protected Routes
* Secure API Access
* Spring Security Integration

### 📋 Task Management

* Create Tasks
* Update Tasks
* Delete Tasks
* Mark Tasks as Completed
* View All Tasks
* Task Status Tracking

### 🤖 AI-Powered Features

* Generate Task Descriptions using Gemini AI
* Improve Existing Task Descriptions
* Productivity Assistance

### ⛓️ Blockchain Audit Logging

* Connect MetaMask Wallet
* Store Task Activities On-Chain
* Immutable Audit Records
* Smart Contract Integration
* Local Hardhat/Anvil Support

### 🎨 Modern User Interface

* Responsive Design
* React + Vite Frontend
* Fast and Lightweight
* Clean User Experience

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* JavaScript
* CSS
* Axios

## Backend

* Spring Boot
* Spring Security
* JWT Authentication
* REST APIs
* Maven

## Database

* MySQL

## AI Integration

* Google Gemini API

## Blockchain

* Solidity
* Hardhat
* Ethers.js
* MetaMask
* Anvil

---

# 📂 Project Structure

```text
taskmanager/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── services/
│
├── backend/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── security/
│   └── model/
│
└── onchain/
    ├── contracts/
    ├── scripts/
    └── artifacts/
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/taskmanager.git
cd taskmanager
```

---

## 2️⃣ Backend Setup

Navigate to backend folder:

```bash
cd backend
```

Create an `application.properties` file:

```properties
spring.datasource.url=YOUR_DB_URL
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD

jwt.secret=YOUR_JWT_SECRET

gemini.api.key=YOUR_GEMINI_API_KEY
```

Run backend:

```bash
mvn spring-boot:run
```

Backend runs on:

```text
http://localhost:8081
```

---

## 3️⃣ Frontend Setup

Navigate to frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:8081
```

Run frontend:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## 4️⃣ Blockchain Setup (Optional)

Navigate to:

```bash
cd onchain
```

Install dependencies:

```bash
npm install
```

Start local blockchain:

```bash
anvil --hostname 127.0.0.1 --port 8545
```

Deploy contract:

```bash
npm run deploy:anvil
```

Connect MetaMask and interact with the deployed smart contract.

---
### Backend
Spring Boot REST API for Task Manager  
https://github.com/shreyasoniii/Taskmanager

# 📸 Screenshots

## Login Page

<img width="800" height="450" alt="Screenshot 2026-06-07 at 3 06 10 AM" src="https://github.com/user-attachments/assets/bd8e632a-7224-4e10-8015-11ce4a17d876" />

## Dashboard
<img width="800" height="450" alt="Screenshot 2026-06-07 at 3 06 10 AM" src="https://github.com/user-attachments/assets/a0a38344-a293-4ca0-9765-f7fde281b30e" />



## Create Task

<img width="800" height="450" alt="Screenshot 2026-06-07 at 3 06 48 AM" src="https://github.com/user-attachments/assets/db7eaa33-be55-4bdf-a192-8cfa7dbbe564" />


## AI Task Generator

<img width="800" height="450" alt="Screenshot 2026-06-05 at 8 47 46 PM" src="https://github.com/user-attachments/assets/cbc8c5c5-7c22-477c-9106-7177b70565ff" />


## Blockchain Audit Log

<img width="800" height="450" alt="Screenshot 2026-06-07 at 3 11 27 AM" src="https://github.com/user-attachments/assets/8aa315fc-d50b-4656-992e-6dc5857268e0" />


---

# 🔥 API Highlights

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

### Tasks

```http
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/{id}
DELETE /api/tasks/{id}
```

### AI

```http
POST /api/ai/generate
```

---

# 📈 Future Enhancements

* Task Categories
* Due Date Reminders
* Email Notifications
* Team Collaboration
* AI Task Prioritization
* Analytics Dashboard
* Cloud Blockchain Deployment

---

# 👩‍💻 Author

**Shreya Soni**

Full Stack Java Developer




