# 🕵️‍♂️ Shadowchat: Secure Self-Destruct Messaging

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📖 About the Project
Shadowchat is a privacy-focused, end-to-end encrypted messaging platform designed to eliminate metadata tracking and unauthorized surveillance. Unlike traditional messaging applications that rely on centralized data storage, this platform minimizes server-side footprint and gives users complete control over their digital communication.

## ✨ Key Features
*   **End-to-End Encryption (E2EE):** All messages are encrypted locally on the sender's device using strong cryptographic algorithms (e.g., AES) and can only be decrypted by the intended recipient.
*   **Self-Destructing Messages:** Chat messages automatically delete themselves from both the sender and receiver's devices after being read or after a set time limit.
*   **Zero Server Storage:** The backend server acts exclusively as a relay to pass encrypted messages and does not store any plaintext conversation data.
*   **Anonymous Sessions:** Users can establish secure connections using unique session IDs or QR codes without exposing personal details like phone numbers or emails.
*   **Dynamic Links & Threat Detection:** Features rotating shared links to prevent tracking, alongside automatic detection and removal of harmful links or calls.

## 💻 Tech Stack
Based on the project structure, this application is built using:
*   **Frontend:** React, Vite, Tailwind CSS
*   **Backend:** Node.js, Express.js
*   **Real-time Communication:** WebSockets (Socket.io)
*   **Database / ORM:** Prisma 

## ⚙️ Architecture & Data Flow
1. **Key Generation:** Users generate a public/private cryptographic key pair upon launching the app.
2. **Session Creation & Key Exchange:** Users join via a unique ID/QR code and securely exchange public keys.
3. **Encryption & Relay:** Messages are encrypted locally, sent through the server (which stores nothing), and relayed to the receiver.
4. **Decryption & Auto-Deletion:** The receiver decrypts the message using their private key, and the self-destruct timer initiates.

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation
Run the following commands to clone the repository and install all dependencies for both the frontend and backend in one go:

```bash
# 1. Clone the repository
git clone [https://github.com/Mohit-Singh-Rajput/Shadowchat.git](https://github.com/Mohit-Singh-Rajput/Shadowchat.git)
cd Shadowchat

# 2. Set up the Backend
cd shadowchat_backend
npm install

# 3. Set up the Frontend
cd ../shadowchat
npm install
```

### Environment Variables
**Backend (`shadowchat_backend/.env`):**
Create a `.env` file and add your database and port configurations (refer to `.env.example` if available).

**Frontend (`shadowchat/.env`):**
Create a `.env` file in the `shadowchat` folder and add:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Running the Application
You will need two terminal windows open to run the frontend and backend simultaneously.

**Terminal 1 (Backend):**
```bash
cd shadowchat_backend
npx prisma generate
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd shadowchat
npm run dev
```

## 🎓 Academic Context
This project was initially conceptualized and documented as a Bachelor of Computer Application degree project by Kritty Samixha at Usha Martin University.
