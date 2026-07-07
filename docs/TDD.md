# Expense Tracker App - Technical Design Document (TDD)

**Project Name:** Expense Tracker  
**Version:** 1.0  
**Document Type:** Technical Design Document (SPA Website Version)

---

# 1. Project Overview
Expense Tracker (Apex Spend) is a high-fidelity single-page web application that allows users to manage personal finances by recording income and expenses, organizing transactions into categories, tracking budgets, and viewing spending analytics.

---

# 2. System Architecture
The application is built using a lightweight SPA (Single Page Application) frontend that stores state in browser local storage. It does not require a backend API, making it extremely fast and suitable for static web hosting.

```plain text
+---------------------------------------+
|                Client                 |
|             (index.html)              |
|        Framer/Google Fonts/CSS        |
+-------------------+-------------------+
                    |
          Local Data Operations
                    |
+-------------------+-------------------+
|             Controller                |
|              (app.js)                 |
|   State Management & Chart.js Engine  |
+-------------------+-------------------+
                    |
           JSON Read / Write
                    |
+-------------------+-------------------+
|         Browser LocalStorage          |
|        (Key: apex_spend_state)        |
+---------------------------------------+
```

---

# 3. Technology Stack
- **Structure**: Vanilla HTML5
- **Styling**: Custom Vanilla CSS (Obsidian Dark and Sleek Light modes, flexbox/grid layout, glassmorphic panels)
- **Logics**: Vanilla JS (ES6+)
- **Charting**: Chart.js (CDN-delivered, interactive bar and doughnut charts)
- **Icons**: Lucide Icons (CDN-delivered svg icons)
- **Deployment**: Vercel Static Hosting

---

# 4. Folder Structure
```plain text
expense-tracker/
│
├── docs/                      # Project Documentation
│   ├── PRD.md                 # Product Requirements
│   ├── TDD.md                 # Technical Design
│   ├── implementation_plan.md # Steps of implementation
│   └── walkthrough.md         # Final validation details
│
├── index.html                 # App Layout & CDN scripts
├── styles.css                 # Custom Styling System
└── app.js                     # State Controller & Calculations
```

---

# 5. Data Schema (Local Storage JSON)
The entire state is stored in a single JSON object under the key `apex_spend_state`:

### Settings
```json
{
  "name": "String",
  "currency": "String",
  "theme": "dark | light"
}
```

### Budget
```json
{
  "limit": "Decimal"
}
```

### Categories
```json
[
  {
    "id": "String",
    "name": "String",
    "type": "income | expense",
    "icon": "String",
    "color": "String"
  }
]
```

### Transactions
```json
[
  {
    "id": "String",
    "title": "String",
    "amount": "Decimal",
    "type": "income | expense",
    "categoryId": "String",
    "date": "String (YYYY-MM-DD)",
    "method": "Cash | Card | Bank Transfer | Other",
    "notes": "String"
  }
]
```

---

# 6. Calculations & Business Logic
### Balance
$$\text{Balance} = \sum \text{Income} - \sum \text{Expenses}$$

### Monthly Budget Progress
$$\text{Progress \%} = \left(\frac{\text{Current Month Expenses}}{\text{Budget Limit}}\right) \times 100$$
Warnings:
- Triggered at $\ge 80\%$ (Amber Warning Card)
- Triggered at $\ge 100\%$ (Red Danger Warning Card)
