# Expense Tracker App - Product Requirements Document (PRD)

**Project Name:** Expense Tracker  
**Version:** 1.0  
**Target Audience:** Students, beginners, portfolio project  

---

# 1. Project Overview
Expense Tracker is a simple application that helps users manage their daily expenses and income. Users can add transactions, organize them into categories, view spending statistics, and monitor their financial balance.
The goal is to make personal finance easy without unnecessary complexity.

---

# 2. Problem Statement
People often forget where they spend their money. Without tracking expenses, it becomes difficult to:
- Save money
- Control spending
- Plan budgets

The app solves this by keeping all transactions in one place.

---

# 3. Goals
- Record income and expenses
- Show current balance
- Categorize transactions
- View monthly spending
- Display charts
- Search previous transactions

---

# 4. Target Users
- Students
- Professionals
- Freelancers
- Anyone wanting to manage personal finances

---

# 5. User Roles
Only one role: **User**  
Can:
- Register/Login
- Add expense
- Add income
- Edit transaction
- Delete transaction
- View dashboard
- View reports
- Manage categories
- Update profile

---

# 6. Core Features
## Authentication
User can:
- Register
- Login
- Logout
- Reset password

## Dashboard
Show:
- Current Balance
- Total Income
- Total Expense
- Savings
- Recent Transactions
- Monthly Summary

## Add Transaction
Fields:
- Title
- Amount
- Category
- Type (Income/Expense)
- Date
- Notes
- Payment Method
Buttons:
- Save
- Cancel

## Categories
Default categories:
**Expense:** Food, Shopping, Transport, Bills, Entertainment, Education, Health, Travel  
**Income:** Salary, Freelance, Business, Investment, Gift  

Users can:
- Create category
- Edit category
- Delete category

## Transaction History
Features:
- View all transactions
- Edit transaction
- Delete transaction
- Search & Filter (Date, Category, Type)

## Reports
Charts:
- Pie Chart by Category
- Monthly Expense Chart
- Income vs Expense

## Budget
User can:
- Set monthly budget
- System shows budget used, remaining budget, and triggers warning alerts at 80% and 100% usage.

## Search
Search by title, notes, and category.

## Profile & Settings
User can update:
- Name
- Currency
- Appearance Theme (Dark Mode / Light Mode)
- Export Data / Reset Data

---

# 7. Database Tables (Conceptual Design)
## Users
- `id` (UUID)
- `name` (String)
- `email` (String)
- `password` (String)
- `created_at` (Timestamp)

## Transactions
- `id` (UUID)
- `user_id` (UUID)
- `title` (String)
- `amount` (Decimal)
- `type` (Income/Expense)
- `category_id` (UUID)
- `date` (Date)
- `notes` (Text)
- `payment_method` (String)

## Categories
- `id` (UUID)
- `user_id` (UUID)
- `name` (String)
- `type` (Income/Expense)
- `color` (String)
- `icon` (String)

## Budgets
- `id` (UUID)
- `user_id` (UUID)
- `amount` (Decimal)
- `month` (Integer)
- `year` (Integer)
