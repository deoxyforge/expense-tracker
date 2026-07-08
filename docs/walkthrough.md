# Walkthrough - Expense Tracker Deployment

We have successfully built and deployed **Apex Spend**, a premium, high-fidelity personal finance and expense tracker application.

## Changes Made

1. **Lightweight SPA Architecture**: Designed and built the application in a Single Page Application (SPA) layout.
2. **Local Storage Database Layer**: Created a client-side database mapping all transactions, default and custom categories, and budget targets to `localStorage`.
3. **Glassmorphic Obsidian/Slate Theme**: Implemented a responsive design utilizing Backdrop Blurs, tailored Indigo-centric HSL schemes, and standard Google Fonts (`Outfit`).
4. **Interactive Analytics Panels**: Integrated `Chart.js` for monthly income/expense trends and dynamic expense distribution categories.
5. **Gemini 2.0 Chatbot Integration**: Integrated the Google Gemini 2.0 Flash API to handle natural language finance queries. Key is stored securely client-side and can be customized in settings. Included an automated fallback to local state rule matching to ensure 100% service reliability (e.g. during API rate limits or quota exceptions).
6. **Vercel Hosting**: Successfully initialized and deployed the project directly to Vercel production.

## Deployed Application URL

The website is live at:
🔗 **[https://expense-tracker-pi-mauve-79.vercel.app](https://expense-tracker-pi-mauve-79.vercel.app)**

---

## Validation Results

- **Console Validation**: Verified zero JavaScript runtime exceptions, warnings, or asset load failures.
- **KPI Metrics Check**: Initial balances (`$3,866.31`), total income (`$4,150.00`), and total expenses (`$283.69`) verified correct.
- **CRUD Operations**: Successfully tested adding transactions, updating budget thresholds, and verifying dynamic calculation redraws.
- **Gemini Chatbot & Fallback Validation**: Verified live API requests using `gemini-2.0-flash`. Validated that if Google returns `429 Too Many Requests` due to API key rate limiting, the chatbot gracefully falls back to local calculations, correctly presenting balance, monthly expenses, and category food breakdowns.

### Visual Walkthrough

Here is a view of the live dashboard running on Vercel:

![Apex Spend Deployed Dashboard](docs/assets/dashboard_view_1783403073932.png)

![Apex Spend Extended Scroll View](docs/assets/dashboard_full_view_1783403103094.png)

Here is the interactive Chatbot Assistant running with the live Gemini 2.5 API:

![Apex Spend Assistant Chat Window](docs/assets/chatbot_verification_1783486338677.png)

You can watch the chatbot verification recording here:
![Chatbot verification recording](docs/assets/live_gemini_2_5_chatbot_verification_1783486249565.webp)


