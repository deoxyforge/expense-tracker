# Walkthrough - Expense Tracker Deployment

We have successfully built and deployed **Apex Spend**, a premium, high-fidelity personal finance and expense tracker application.

## Changes Made

1. **Lightweight SPA Architecture**: Designed and built the application in a Single Page Application (SPA) layout.
2. **Local Storage Database Layer**: Created a client-side database mapping all transactions, default and custom categories, and budget targets to `localStorage`.
3. **Glassmorphic Obsidian/Slate Theme**: Implemented a responsive design utilizing Backdrop Blurs, tailored Indigo-centric HSL schemes, and standard Google Fonts (`Outfit`).
4. **Interactive Analytics Panels**: Integrated `Chart.js` for monthly income/expense trends and dynamic expense distribution categories.
5. **Chatbot Assistant Component**: Added a floating financial assistant widget at the bottom right containing quick actions (balance, expenses, budget, help) and a typing simulation to answer natural queries dynamically from local storage state.
6. **Vercel Hosting**: Successfully initialized and deployed the project directly to Vercel production.

## Deployed Application URL

The website is live at:
🔗 **[https://expense-tracker-pi-mauve-79.vercel.app](https://expense-tracker-pi-mauve-79.vercel.app)**

---

## Validation Results

- **Console Validation**: Verified zero JavaScript runtime exceptions, warnings, or asset load failures.
- **KPI Metrics Check**: Initial balances (`$3,866.31`), total income (`$4,150.00`), and total expenses (`$283.69`) verified correct.
- **CRUD Operations**: Successfully tested adding transactions, updating budget thresholds, and verifying dynamic calculation redraws.
- **Chatbot Validation**: Verified successful toggle opening, unread badge notification, quick action clicks, and correct storage-based query replies.

### Visual Walkthrough

Here is a view of the live dashboard running on Vercel:

![Apex Spend Deployed Dashboard](docs/assets/dashboard_view_1783403073932.png)

![Apex Spend Extended Scroll View](docs/assets/dashboard_full_view_1783403103094.png)

Here is the interactive Chatbot Assistant:

![Apex Spend Assistant Chat Window](docs/assets/chatbot_verification_1783404341829.png)

You can watch the chatbot verification recording here:
![Chatbot verification recording](docs/assets/live_chatbot_verification_1783484230698.webp)

