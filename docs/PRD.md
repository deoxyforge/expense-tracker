# Expense Tracker App - Product Requirements Document (PRD)

**Project Name:** Expense Tracker  
**Version:** 1.1  
**Target Audience:** Students, professionals, portfolio project  

---

# 1. Project Overview
Expense Tracker is a personal finance application that helps users manage their daily expenses and income. Users can record transactions, organize them into categories, set budget limits, and view spending statistics.
This version introduces a client-side **AI Assistant (Chatbot)** powered by the Gemini 1.5 Flash model using the user's own API key.

---

# 2. Problem Statement
People often forget where they spend their money and struggle to interpret their spending patterns. Without direct analysis, it is difficult to spot saving opportunities.
The app resolves this by tracking all transactions in one place and providing an **AI Financial Assistant** to offer instant, personalized insights on demand.

---

# 3. Goals
- Record income and expenses
- Show current balance, income, expenses, and monthly savings
- Categorize transactions
- Display charts (Monthly trend & category distribution)
- **AI Financial Assistant**: Answer questions about balance, savings, budget alerts, and category summaries.
- Search and filter transaction history

---

# 4. Core Features
## AI Assistant (Chatbot)
User can:
- Open/Close a floating chat assistant window at the bottom right.
- Input natural language questions about their finance state (e.g. "What is my balance?", "Did I exceed my budget?", "How much did I spend on food?").
- Click quick-action buttons (Balance, Expenses, Budget, Help) for instant replies.
- View typing animation indicators while the AI generates answers.

## Settings
User can configure:
- **Gemini API Key**: Secure input field to enter their own API key. The key must be stored strictly client-side in the browser's `localStorage` and sent directly to Google's API endpoints. No intermediate servers are used.
- Full Name
- Currency Symbol
- Appearance Theme (Obsidian Dark / Sleek Light)

## Budgeting
User can:
- Set monthly budget limits.
- View progress bars.
- Receive warnings when expenses exceed 80% and 100% of limits.

---

# 5. Non-Functional Requirements
- **Security**: The Gemini API key must never be leaked, logged, or sent to any server other than `https://generativelanguage.googleapis.com`.
- **Offline Support**: Core tracker functions (local storage CRUD) work offline; AI features gracefully disable with an internet or API key error toast.
- **Fast Loading**: The application must be lightweight (< 100 KB total) and start instantly.
