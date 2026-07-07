# Implementation Plan - Expense Tracker Web App (Vanilla High-Fidelity SPA) & Vercel Deployment

Due to limited local disk space (~820MB free) on the C: drive, a full Next.js/Node.js stack with its heavy `node_modules` (>300MB) runs the risk of storage errors. We will build the application as a **high-fidelity, lightweight Single Page Application (SPA) using Vanilla HTML, CSS, and JavaScript**.

This approach resolves the disk space issue entirely, runs at lightning speed, requires zero installation files, and deploys instantly to Vercel.

## User Review Required

> [!IMPORTANT]
> **Tech Stack Adjustment**: 
> - **Core**: Single HTML/JS page architecture with tabbed routing to maintain clean state sharing.
> - **Styling**: Vanilla CSS featuring a premium dark/light mode, custom glassmorphic panels, glowing transitions, and responsiveness.
> - **Icons & Charts**: Loaded via CDNs (Lucide Icons and Chart.js) for high performance and visual excellence.
> - **Persistence**: SQLite-like operations stored in local storage (`localStorage`).
> 
> **Vercel Deployment**: We will deploy the project using `npx vercel`. This will prompt you to authenticate (if not logged in) and set up the hosting space.

## Proposed Changes

We will create the project files directly under `C:\Users\DEEP\.gemini\antigravity-ide\scratch\expense-tracker`.

### Expense Tracker Web Client

---

#### [NEW] [index.html](file:///C:/Users/DEEP/.gemini/antigravity-ide/scratch/expense-tracker/index.html)
The primary entry point. Contains:
- Root HTML layout with modern font settings (Google Fonts: Outfit/Inter).
- Clean semantic markup for Sidebar, Header, View Sections, Modals, and Toasts.
- CDN script imports for Lucide Icons and Chart.js.

#### [NEW] [styles.css](file:///C:/Users/DEEP/.gemini/antigravity-ide/scratch/expense-tracker/styles.css)
The design system of the application:
- Curated HSL color palette supporting both premium Dark (Obsidian/Indigo) and Light (Slate/Indigo) modes.
- Glassmorphism design elements (backdrop-filter blur, transparent border gradients).
- Keyframe animations for page transitions, glowing budget bars, and toast slides.
- Fully responsive design from mobile up to desktop.

#### [NEW] [app.js](file:///C:/Users/DEEP/.gemini/antigravity-ide/scratch/expense-tracker/app.js)
The complete application logic, structured cleanly:
- **State Management**: App-wide reactive state object (transactions, categories, budgets, settings).
- **Storage Layer**: CRUD operations for local storage, initializing default categories (Food, Bills, Shopping, Salary, etc.) if empty.
- **Tab Router**: Navigation engine managing tab clicks and fading transitions.
- **Charts Controller**: Drawing and updates of Chart.js elements (Monthly Bar Chart, Category Doughnut Chart).
- **CRUD Operations & Modals**: Manage add/edit/delete flows for Transactions, Categories, and Budget.
- **UI Builders**: Dynamically render transaction history, categories grid, budget alerts, and data exports.

## Verification Plan

### Automated Tests
- Static analysis: Verify valid HTML structure and clean JavaScript console with no errors.

### Manual Verification
- Test all tabs (Dashboard, Transactions, Categories, Budget, Settings).
- Create a transaction, edit it, delete it, and verify the balance, income, expense, and savings calculations update immediately.
- Change theme, select currency, set budget limit, verify warning triggers at 80%.
- Deploy the folder to Vercel with `npx vercel --prod` and check the live application URL.
