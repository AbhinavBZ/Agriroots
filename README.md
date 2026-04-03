# 🌿 AgriRoots

AgriRoots is a comprehensive, full-stack digital agriculture platform designed to empower farmers and agricultural enthusiasts. It provides essential tools spanning crop guides, real-time market prices, insurance, loan applications, and a dedicated farming e-commerce store. 

Built with a fast, modern **MySQL + Express + React + Node.js** stack, AgriRoots is geared towards maximizing agricultural productivity through data-driven decisions.

## 🚀 Key Features

* **Real-time Market & MSP Data**: Live tracking of local market commodity prices via the official data.gov.in AGMARKNET API.
* **Intelligent Crop Guide**: Detailed guides on seasonal patterns, crop cycles, expected profitability, common diseases, and their remedies.
* **E-Commerce Store**: A fully functional local shop and cart system for purchasing seeds, farming tools, and fertilizers.
* **Loans & Insurance Application**: Dedicated modules for requesting agricultural loans, machinery insurance, and farm protection.
* **Active Community Forum**: Discuss farming strategies, request weather help, and report bugs in a nested comment section with likes.
* **Secure User Authentication**: Complete user login, registration, and profile management using secure JWT and Bcrypt hashing.

## 🛠 Tech Stack

**Frontend Environment:**
* **React** powered by **Vite** (for lightning-fast builds and HMR)
* Context API for state management

**Backend Environment:**
* **Node.js** & **Express** handlingREST API mechanics
* **MySQL** database integration using `mysql2` connection pools (optimized for quick connections)
* Stateless authentication via **JSON Web Tokens (JWT)**

## ✨ Local Setup

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v16+)
* [MySQL Server](https://dev.mysql.com/downloads/installer/)

### 2. Installation
Clone the repository and install the dependencies for both the client and server.

```bash
# Clone the repository
git clone https://github.com/yourusername/AgriRoots-Live.git
cd AgriRoots-Live

# Install Backend dependencies
cd server
npm install

# Install Frontend dependencies
cd ../client
npm install
```

### 3. Environment Variables Setup
Create a new file named `.env` inside the `server` directory and add the following keys. Replace the values with your actual database details.

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=agriroots
JWT_SECRET=agriroots_super_secret_key_2025
DATAGOV_API_KEY=your_datagov_api_key_here
```

### 4. Running the Development Server
*Note: The backend gracefully auto-initializes all 15 MySQL tables upon the first connection. You don't need to manually import any SQL schemas!*

**Start the Backend API (from the `/server` folder):**
```bash
npm run dev
```

**Start the Frontend App (from the `/client` folder):**
```bash
npm run dev
```

Your browser should automatically pop open, but if it doesn't, navigate to `http://localhost:5173`.

## 🌐 Live Deployment setup

This project is built to deploy smoothly on **Vercel** with a Cloud MySQL Database.
1. Move the local MySQL database to a cloud provider like **Aiven**.
2. Supply Vercel with the environment variables listed above (including your new Aiven database host/passwords).
3. Vercel utilizes the included `vercel.json` file to bridge the monolithic Express API into serverless functions.
