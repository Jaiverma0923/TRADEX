# 📈 TradeX

A full-stack stock portfolio management platform that helps investors track holdings, manage transactions, analyze portfolio performance, and monitor unrealized gains and losses.

### 🌐 Live Demo

https://tradex-26.vercel.app/

---

## 🚀 Features

### Authentication

* Secure authentication with NextAuth
* Email verification workflow
* Protected routes and session management

### Portfolio Management

* Track stock holdings across multiple transactions
* Automatic portfolio aggregation
* Average cost basis calculation
* Position allocation breakdown
* Largest holding insights

### Transaction Tracking

* Record buy and sell transactions
* Complete transaction history
* Portfolio updates based on transaction activity

### Market Data

* Stock search functionality
* Live market price integration
* Current portfolio valuation
* Unrealized profit and loss tracking

### Dashboard Analytics

* Total invested capital
* Current portfolio value
* Unrealized P&L
* Holdings overview
* Portfolio allocation visualization

---

## 🛠 Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* React Hook Form
* Zod

### Backend

* Next.js API Routes
* MongoDB
* Mongoose
* NextAuth

### External APIs

* Finnhub API

---

## 📊 Key Metrics

TradeX automatically calculates:

* Cost Basis
* Average Purchase Price
* Current Portfolio Value
* Unrealized Profit & Loss
* Portfolio Allocation %
* Largest Position

---

## 🔒 Authentication Flow

1. User signs up
2. Verification code sent via email
3. Email verification
4. Secure login
5. Access protected dashboard and portfolio features

---

## ⚙️ Local Setup

```bash
git clone https://github.com/YOUR_USERNAME/tradex.git
cd tradex
npm install
```

Create `.env.local`

```env
MONGODB_URI=your_mongodb_uri

AUTH_SECRET=your_auth_secret

NEXTAUTH_URL=http://localhost:3000

FINNHUB_API_KEY=your_finnhub_api_key
```

Run locally:

```bash
npm run dev
```

---

## 🎯 Future Improvements

* Portfolio performance charts
* Price alerts
* Advanced analytics
* Multi-market support
* Real-time updates

---

## 👨‍💻 Author

**Jai Verma**

B.Tech ECE (IoT) — NSUT

Passionate about Full Stack Development, Backend Engineering, and Building Scalable Web Applications.
