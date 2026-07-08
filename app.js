// Default initial state
const DEFAULT_STATE = {
  settings: {
    name: "John Doe",
    currency: "$",
    theme: "dark",
    geminiKey: ""
  },
  budget: {
    limit: 1500
  },
  categories: [
    { id: "c1", name: "Food & Dining", type: "expense", icon: "utensils", color: "#f43f5e" },
    { id: "c2", name: "Shopping", type: "expense", icon: "shopping-bag", color: "#8a2be2" },
    { id: "c3", name: "Transport", type: "expense", icon: "car", color: "#6366f1" },
    { id: "c4", name: "Bills & Utilities", type: "expense", icon: "receipt", color: "#f59e0b" },
    { id: "c5", name: "Entertainment", type: "expense", icon: "film", color: "#10b981" },
    { id: "c6", name: "Education", type: "expense", icon: "book-open", color: "#3b82f6" },
    { id: "c7", name: "Salary", type: "income", icon: "coins", color: "#10b981" },
    { id: "c8", name: "Freelance", type: "income", icon: "briefcase", color: "#a855f7" },
    { id: "c9", name: "Investments", type: "income", icon: "wallet", color: "#eab308" }
  ],
  transactions: [
    { id: "t1", title: "Monthly Salary", amount: 3500.00, type: "income", categoryId: "c7", date: "2026-07-01", method: "Bank Transfer", notes: "Regular salary payout" },
    { id: "t2", title: "Whole Foods Market", amount: 154.20, type: "expense", categoryId: "c1", date: "2026-07-02", method: "Card", notes: "Weekly groceries" },
    { id: "t3", title: "Electric Bill", amount: 85.00, type: "expense", categoryId: "c4", date: "2026-07-03", method: "Bank Transfer", notes: "AC usage high" },
    { id: "t4", title: "Uber Ride", amount: 24.50, type: "expense", categoryId: "c3", date: "2026-07-04", method: "Card", notes: "Ride to office" },
    { id: "t5", title: "Freelance Landing Page", amount: 650.00, type: "income", categoryId: "c8", date: "2026-07-05", method: "Bank Transfer", notes: "Completed client website" },
    { id: "t6", title: "Netflix Subscription", amount: 19.99, type: "expense", categoryId: "c5", date: "2026-07-06", method: "Card", notes: "Premium Plan" }
  ]
};

// Global App State
let appState = {};
let monthlyChartInstance = null;
let categoryChartInstance = null;

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  initTheme();
  setupEventListeners();
  renderApp();
  initChatbot();
  
  // Set current date in header
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById("header-date").innerText = new Date().toLocaleDateString('en-US', options);
});

// Load state from localStorage or set defaults
function loadState() {
  const stored = localStorage.getItem("apex_spend_state");
  if (stored) {
    try {
      appState = JSON.parse(stored);
      // Ensure key arrays exist
      if (!appState.transactions) appState.transactions = [];
      if (!appState.categories) appState.categories = [];
      if (!appState.budget) appState.budget = { limit: 0 };
      if (!appState.settings) appState.settings = { name: "User", currency: "$", theme: "dark" };
      if (appState.settings && !appState.settings.geminiKey) appState.settings.geminiKey = "";
    } catch (e) {
      console.error("Error parsing stored state, resetting.", e);
      appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  } else {
    appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    saveState();
  }
}

// Save state to localStorage
function saveState() {
  localStorage.setItem("apex_spend_state", JSON.stringify(appState));
}

// Setup Theme
function initTheme() {
  const theme = appState.settings.theme || "dark";
  document.body.className = theme === "light" ? "light-theme" : "dark-theme";
  
  // Update Radio button state in settings
  const radios = document.getElementsByName("settings-theme");
  radios.forEach(radio => {
    radio.checked = radio.value === theme;
  });
}

// Show Toast Notification
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = "check-circle";
  if (type === "warning") icon = "alert-triangle";
  if (type === "danger") icon = "x-circle";
  if (type === "info") icon = "info";
  
  toast.innerHTML = `
    <i data-lucide="${icon}"></i>
    <span class="toast-message">${message}</span>
  `;
  container.appendChild(toast);
  lucide.createIcons();
  
  // Remove toast after 3s
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Setup Event Listeners
function setupEventListeners() {
  // Navigation Tabs switching
  const menuItems = document.querySelectorAll(".menu-item");
  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      const tab = item.getAttribute("data-tab");
      
      // Update sidebar styling
      menuItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      
      // Switch active view section
      const sections = document.querySelectorAll(".view-section");
      sections.forEach(s => s.classList.remove("active"));
      
      const targetSection = document.getElementById(`view-${tab}`);
      if (targetSection) {
        targetSection.classList.add("active");
      }
      
      // Special logic on tab open
      if (tab === "dashboard") {
        renderDashboardCharts();
      } else if (tab === "transactions") {
        renderTransactionsList();
        populateFilterDropdowns();
      } else if (tab === "categories") {
        renderCategoriesTab();
      } else if (tab === "budget") {
        renderBudgetTab();
      } else if (tab === "settings") {
        loadSettingsForm();
      }
    });
  });

  // Theme Toggle Button in Header
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const currentTheme = appState.settings.theme === "light" ? "dark" : "light";
    appState.settings.theme = currentTheme;
    saveState();
    initTheme();
    showToast(`Switched to ${currentTheme} theme!`, "info");
    
    // Redraw charts if on dashboard to update grid colors
    if (document.getElementById("view-dashboard").classList.contains("active")) {
      renderDashboardCharts();
    }
  });

  // Modal Dialog toggles
  const quickAddBtn = document.getElementById("btn-quick-add");
  const modalTx = document.getElementById("modal-transaction");
  
  quickAddBtn.addEventListener("click", () => {
    openTransactionModal();
  });
  
  document.getElementById("btn-close-tx-modal").addEventListener("click", () => closeModal("modal-transaction"));
  document.getElementById("btn-cancel-tx-modal").addEventListener("click", () => closeModal("modal-transaction"));
  
  // Transaction Type switch inside modal (Expense / Income color updates)
  const txTypeRadios = document.getElementsByName("tx-type");
  txTypeRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      populateCategorySelect(radio.value);
    });
  });

  // Transaction form submit handler
  document.getElementById("transaction-form").addEventListener("submit", handleTransactionSubmit);

  // Filter Event Listeners
  document.getElementById("search-tx").addEventListener("input", renderTransactionsList);
  document.getElementById("filter-category").addEventListener("change", renderTransactionsList);
  document.getElementById("filter-method").addEventListener("change", renderTransactionsList);
  document.getElementById("filter-type").addEventListener("change", renderTransactionsList);
  document.getElementById("btn-clear-filters").addEventListener("click", () => {
    document.getElementById("search-tx").value = "";
    document.getElementById("filter-category").value = "all";
    document.getElementById("filter-method").value = "all";
    document.getElementById("filter-type").value = "all";
    renderTransactionsList();
    showToast("Filters reset", "info");
  });

  // View All from Dashboard
  document.getElementById("btn-view-all-recent").addEventListener("click", () => {
    const txTab = Array.from(document.querySelectorAll(".menu-item")).find(item => item.getAttribute("data-tab") === "transactions");
    if (txTab) txTab.click();
  });

  // Category Modal toggle
  document.getElementById("btn-add-category").addEventListener("click", () => {
    openCategoryModal();
  });
  document.getElementById("btn-close-cat-modal").addEventListener("click", () => closeModal("modal-category"));
  document.getElementById("btn-cancel-cat-modal").addEventListener("click", () => closeModal("modal-category"));

  // Category Form submit
  document.getElementById("category-form").addEventListener("submit", handleCategorySubmit);

  // Budget Setup Form submit
  document.getElementById("budget-setup-form").addEventListener("submit", handleBudgetSubmit);

  // Settings preferences Form submit
  document.getElementById("settings-form").addEventListener("submit", handleSettingsSubmit);

  // Export and Import Data
  document.getElementById("btn-export-data").addEventListener("click", exportData);
  document.getElementById("input-import-data").addEventListener("change", importData);
  document.getElementById("btn-reset-app").addEventListener("click", resetData);
}

// Open modal utils
function openTransactionModal(editTxId = null) {
  const modal = document.getElementById("modal-transaction");
  const form = document.getElementById("transaction-form");
  form.reset();
  
  // Set default date to today
  document.getElementById("tx-date").value = new Date().toISOString().substring(0, 10);
  
  // Set currency symbols
  document.getElementById("form-currency-symbol").innerText = appState.settings.currency;
  
  if (editTxId) {
    document.getElementById("modal-tx-title").innerText = "Edit Transaction";
    document.getElementById("btn-tx-submit-text").innerText = "Save Changes";
    
    const tx = appState.transactions.find(t => t.id === editTxId);
    if (tx) {
      document.getElementById("tx-id-input").value = tx.id;
      document.getElementById("tx-amount").value = tx.amount;
      document.getElementById("tx-title").value = tx.title;
      document.getElementById("tx-date").value = tx.date;
      document.getElementById("tx-method").value = tx.method;
      document.getElementById("tx-notes").value = tx.notes;
      
      const typeRadios = document.getElementsByName("tx-type");
      typeRadios.forEach(r => {
        r.checked = r.value === tx.type;
      });
      
      populateCategorySelect(tx.type, tx.categoryId);
    }
  } else {
    document.getElementById("modal-tx-title").innerText = "Add Transaction";
    document.getElementById("btn-tx-submit-text").innerText = "Add Transaction";
    document.getElementById("tx-id-input").value = "";
    
    // Set default selection
    document.getElementsByName("tx-type")[0].checked = true; // default: expense
    populateCategorySelect("expense");
  }
  
  modal.classList.add("active");
}

function openCategoryModal(editCatId = null) {
  const modal = document.getElementById("modal-category");
  const form = document.getElementById("category-form");
  form.reset();
  
  if (editCatId) {
    document.getElementById("modal-cat-title").innerText = "Edit Category";
    document.getElementById("btn-cat-submit-text").innerText = "Save Category";
    
    const cat = appState.categories.find(c => c.id === editCatId);
    if (cat) {
      document.getElementById("cat-id-input").value = cat.id;
      document.getElementById("cat-name").value = cat.name;
      document.getElementById("cat-color").value = cat.color;
      document.getElementById("cat-icon").value = cat.icon;
      
      const typeRadios = document.getElementsByName("cat-type");
      typeRadios.forEach(r => {
        r.checked = r.value === cat.type;
      });
    }
  } else {
    document.getElementById("modal-cat-title").innerText = "Create Category";
    document.getElementById("btn-cat-submit-text").innerText = "Create Category";
    document.getElementById("cat-id-input").value = "";
    document.getElementsByName("cat-type")[0].checked = true; // default: expense
  }
  
  modal.classList.add("active");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

// Populate categories in the transaction form dropdown
function populateCategorySelect(type, selectedId = null) {
  const select = document.getElementById("tx-category");
  select.innerHTML = "";
  
  const filtered = appState.categories.filter(c => c.type === type);
  filtered.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.innerText = cat.name;
    if (selectedId && cat.id === selectedId) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
}

// Populate filters categories dropdown
function populateFilterDropdowns() {
  const select = document.getElementById("filter-category");
  select.innerHTML = '<option value="all">All Categories</option>';
  
  appState.categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.innerText = `${cat.name} (${cat.type === 'income' ? 'Income' : 'Expense'})`;
    select.appendChild(opt);
  });
}

// Save/Edit Transaction Form handler
function handleTransactionSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById("tx-id-input").value;
  const type = document.querySelector('input[name="tx-type"]:checked').value;
  const amount = parseFloat(document.getElementById("tx-amount").value);
  const title = document.getElementById("tx-title").value.trim();
  const categoryId = document.getElementById("tx-category").value;
  const date = document.getElementById("tx-date").value;
  const method = document.getElementById("tx-method").value;
  const notes = document.getElementById("tx-notes").value.trim();
  
  if (isNaN(amount) || amount <= 0) {
    showToast("Invalid transaction amount!", "danger");
    return;
  }
  
  const txData = {
    id: id || "t_" + Date.now(),
    type,
    amount,
    title,
    categoryId,
    date,
    method,
    notes
  };
  
  if (id) {
    // Edit transaction
    const index = appState.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      appState.transactions[index] = txData;
      showToast("Transaction updated successfully!");
    }
  } else {
    // Add transaction
    appState.transactions.unshift(txData);
    showToast("Transaction recorded successfully!");
  }
  
  saveState();
  closeModal("modal-transaction");
  
  // Re-render
  renderApp();
  
  // Check budget caps if this was a new expense
  if (type === "expense") {
    checkBudgetLimitAlert();
  }
}

// Save/Edit Category form handler
function handleCategorySubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById("cat-id-input").value;
  const type = document.querySelector('input[name="cat-type"]:checked').value;
  const name = document.getElementById("cat-name").value.trim();
  const color = document.getElementById("cat-color").value;
  const icon = document.getElementById("cat-icon").value;
  
  // Avoid duplicate names in same type
  const duplicate = appState.categories.some(c => c.name.toLowerCase() === name.toLowerCase() && c.type === type && c.id !== id);
  if (duplicate) {
    showToast("A category with this name already exists!", "danger");
    return;
  }
  
  const catData = {
    id: id || "c_" + Date.now(),
    name,
    type,
    color,
    icon
  };
  
  if (id) {
    const index = appState.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      appState.categories[index] = catData;
      showToast("Category updated!");
    }
  } else {
    appState.categories.push(catData);
    showToast("Category created!");
  }
  
  saveState();
  closeModal("modal-category");
  renderCategoriesTab();
  
  // Update dropdown filters if transactions page is visible
  if (document.getElementById("view-transactions").classList.contains("active")) {
    populateFilterDropdowns();
  }
}

// Save Budget Submit handler
function handleBudgetSubmit(e) {
  e.preventDefault();
  const limit = parseFloat(document.getElementById("budget-limit-input").value);
  if (isNaN(limit) || limit < 0) {
    showToast("Budget must be a valid number!", "danger");
    return;
  }
  
  appState.budget.limit = limit;
  saveState();
  showToast("Monthly budget settings updated!");
  renderBudgetTab();
}

// Save Settings Form handler
function handleSettingsSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("settings-name").value.trim();
  const currency = document.getElementById("settings-currency").value;
  const geminiKey = document.getElementById("settings-gemini-key").value.trim();
  const theme = document.querySelector('input[name="settings-theme"]:checked').value;
  
  appState.settings.name = name;
  appState.settings.currency = currency;
  appState.settings.geminiKey = geminiKey;
  appState.settings.theme = theme;
  
  saveState();
  initTheme();
  
  // Update header text
  document.getElementById("greeting-title").innerText = `Hello, ${name}`;
  document.getElementById("user-name-display").innerText = name;
  
  // Set avatar text
  const parts = name.split(" ");
  const initials = parts.map(p => p[0]).join("").substring(0, 2).toUpperCase();
  document.getElementById("avatar-display").innerText = initials || "JD";
  
  showToast("Preferences saved!");
  renderApp();
}

// Check if expense exceeds budget and trigger warnings
function checkBudgetLimitAlert() {
  if (!appState.budget.limit || appState.budget.limit <= 0) return;
  
  const currentMonthExpenses = calculateMonthlyExpenses();
  const limit = appState.budget.limit;
  const percentage = (currentMonthExpenses / limit) * 100;
  
  if (percentage >= 100) {
    showToast(`CRITICAL: You have exceeded your monthly budget of ${appState.settings.currency}${limit.toFixed(2)}!`, "danger");
  } else if (percentage >= 80) {
    showToast(`WARNING: You have spent ${percentage.toFixed(0)}% of your monthly budget!`, "warning");
  }
}

// Calculate total expenses for the current month
function calculateMonthlyExpenses() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // MM format
  
  const currentMonthPrefix = `${year}-${month}`; // YYYY-MM
  
  return appState.transactions
    .filter(t => t.type === "expense" && t.date.startsWith(currentMonthPrefix))
    .reduce((sum, t) => sum + t.amount, 0);
}

// Core Rendering Engine
function renderApp() {
  // Update global labels
  const currency = appState.settings.currency;
  document.getElementById("greeting-title").innerText = `Hello, ${appState.settings.name}`;
  document.getElementById("user-name-display").innerText = appState.settings.name;
  
  const parts = appState.settings.name.split(" ");
  const initials = parts.map(p => p[0]).join("").substring(0, 2).toUpperCase();
  document.getElementById("avatar-display").innerText = initials || "JD";
  
  // Recalculate KPIs
  let totalIncome = 0;
  let totalExpense = 0;
  
  appState.transactions.forEach(t => {
    if (t.type === "income") {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
    }
  });
  
  const currentBalance = totalIncome - totalExpense;
  
  // Render KPI values
  document.getElementById("val-balance").innerText = `${currency}${currentBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById("val-income").innerText = `${currency}${totalIncome.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById("val-expense").innerText = `${currency}${totalExpense.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  
  // Monthly savings KPI (Income minus expense for this month)
  const currentMonthExpenses = calculateMonthlyExpenses();
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const currentMonthIncome = appState.transactions
    .filter(t => t.type === "income" && t.date.startsWith(currentMonthPrefix))
    .reduce((sum, t) => sum + t.amount, 0);
    
  const currentMonthSavings = currentMonthIncome - currentMonthExpenses;
  document.getElementById("val-savings").innerText = `${currency}${currentMonthSavings.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  // Render sub-components based on active tabs
  const activeTab = document.querySelector(".menu-item.active").getAttribute("data-tab");
  if (activeTab === "dashboard") {
    renderRecentTransactions();
    renderDashboardCharts();
  } else if (activeTab === "transactions") {
    renderTransactionsList();
  } else if (activeTab === "categories") {
    renderCategoriesTab();
  } else if (activeTab === "budget") {
    renderBudgetTab();
  }
}

// Render Recent transactions on Dashboard
function renderRecentTransactions() {
  const tbody = document.getElementById("recent-transactions-tbody");
  tbody.innerHTML = "";
  
  const currency = appState.settings.currency;
  
  // Show first 5 transactions
  const recents = appState.transactions.slice(0, 5);
  
  if (recents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="text-align: center; color: var(--text-muted); padding: 30px;">No recent transactions. Click 'Add Transaction' to begin!</td></tr>`;
    return;
  }
  
  recents.forEach(t => {
    const category = appState.categories.find(c => c.id === t.categoryId) || { name: "Unknown", color: "#6b7280", icon: "star" };
    const row = document.createElement("tr");
    
    // Format Date
    const txDate = new Date(t.date);
    const dateFormatted = txDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    row.innerHTML = `
      <td>
        <div class="tx-title-cell">
          <span>${t.title}</span>
          ${t.notes ? `<span class="tx-notes-subtitle">${t.notes}</span>` : ''}
        </div>
      </td>
      <td>
        <span class="category-tag" style="background-color: ${category.color}20; color: ${category.color}; border: 1px solid ${category.color}30;">
          <i data-lucide="${category.icon}"></i>
          <span>${category.name}</span>
        </span>
      </td>
      <td>${t.method}</td>
      <td style="color: var(--text-secondary);">${dateFormatted}</td>
      <td class="tx-amount ${t.type === 'income' ? 'income' : 'expense'}">
        ${t.type === 'income' ? '+' : '-'}${currency}${t.amount.toFixed(2)}
      </td>
    `;
    tbody.appendChild(row);
  });
  lucide.createIcons();
}

// Render Dashboard Charts
function renderDashboardCharts() {
  const currency = appState.settings.currency;
  const isDark = document.body.classList.contains("dark-theme");
  const textColor = isDark ? "#9ca3af" : "#475569";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
  
  // 1. Line/Bar Chart: Monthly Trend of last 6 months (or current month grouped by date)
  // Let's group last 30 days transactions by day to show dynamic trend
  const dailyData = {};
  const last10Days = [];
  const now = new Date();
  
  for (let i = 9; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().substring(0, 10);
    dailyData[dateStr] = { income: 0, expense: 0 };
    
    // Label for charts
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    last10Days.push({ key: dateStr, label: label });
  }
  
  appState.transactions.forEach(t => {
    if (dailyData[t.date]) {
      if (t.type === "income") {
        dailyData[t.date].income += t.amount;
      } else {
        dailyData[t.date].expense += t.amount;
      }
    }
  });

  const chartLabels = last10Days.map(item => item.label);
  const incomeDataset = last10Days.map(item => dailyData[item.key].income);
  const expenseDataset = last10Days.map(item => dailyData[item.key].expense);

  const ctxTrend = document.getElementById('chart-monthly-trend').getContext('2d');
  if (monthlyChartInstance) monthlyChartInstance.destroy();
  
  monthlyChartInstance = new Chart(ctxTrend, {
    type: 'bar',
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: 'Income',
          data: incomeDataset,
          backgroundColor: '#10b981',
          borderColor: '#10b981',
          borderRadius: 6,
          barPercentage: 0.6
        },
        {
          label: 'Expense',
          data: expenseDataset,
          backgroundColor: '#f43f5e',
          borderColor: '#f43f5e',
          borderRadius: 6,
          barPercentage: 0.6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor, font: { family: 'Outfit', weight: 600 } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${currency}${context.raw.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textColor, font: { family: 'Outfit' } }
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            font: { family: 'Outfit' },
            callback: value => `${currency}${value}`
          }
        }
      }
    }
  });

  // 2. Category Distribution (Doughnut Chart)
  // Calculate expenses sum by category
  const expenseSummary = {};
  appState.transactions.forEach(t => {
    if (t.type === "expense") {
      expenseSummary[t.categoryId] = (expenseSummary[t.categoryId] || 0) + t.amount;
    }
  });

  const categoryLabels = [];
  const categoryColors = [];
  const categoryData = [];
  const legendItems = [];
  
  Object.keys(expenseSummary).forEach(catId => {
    const cat = appState.categories.find(c => c.id === catId) || { name: "Other", color: "#8b5cf6" };
    categoryLabels.push(cat.name);
    categoryColors.push(cat.color);
    categoryData.push(expenseSummary[catId]);
    legendItems.push({
      name: cat.name,
      color: cat.color,
      amount: expenseSummary[catId]
    });
  });
  
  // Sort legend items by amount descending
  legendItems.sort((a,b) => b.amount - a.amount);
  
  // Render Custom Legend HTML
  const legendDiv = document.getElementById("category-legend");
  legendDiv.innerHTML = "";
  if (legendItems.length === 0) {
    legendDiv.innerHTML = `<span style="color: var(--text-muted);">No expenses recorded.</span>`;
  } else {
    legendItems.forEach(item => {
      legendDiv.innerHTML += `
        <div class="legend-item">
          <span class="legend-dot" style="background-color: ${item.color};"></span>
          <span>${item.name}: <strong>${currency}${item.amount.toFixed(2)}</strong></span>
        </div>
      `;
    });
  }

  const ctxCategory = document.getElementById('chart-category-distribution').getContext('2d');
  if (categoryChartInstance) categoryChartInstance.destroy();
  
  if (categoryData.length === 0) {
    // If no expense data, draw an empty gray circle
    categoryChartInstance = new Chart(ctxCategory, {
      type: 'doughnut',
      data: {
        labels: ['No Expenses'],
        datasets: [{
          data: [1],
          backgroundColor: [isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    });
  } else {
    categoryChartInstance = new Chart(ctxCategory, {
      type: 'doughnut',
      data: {
        labels: categoryLabels,
        datasets: [{
          data: categoryData,
          backgroundColor: categoryColors,
          borderWidth: isDark ? 2 : 1,
          borderColor: isDark ? '#11131c' : '#ffffff',
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a,b) => a+b, 0);
                const val = context.raw;
                const pct = ((val / total) * 100).toFixed(1);
                return `${context.label}: ${currency}${val.toFixed(2)} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }
}

// Render Transactions list on full transactions page
function renderTransactionsList() {
  const tbody = document.getElementById("full-transactions-tbody");
  const emptyState = document.getElementById("tx-empty-state");
  tbody.innerHTML = "";
  
  const searchVal = document.getElementById("search-tx").value.toLowerCase();
  const filterCat = document.getElementById("filter-category").value;
  const filterMethod = document.getElementById("filter-method").value;
  const filterType = document.getElementById("filter-type").value;
  
  const currency = appState.settings.currency;
  
  // Filter state
  const filtered = appState.transactions.filter(t => {
    // Search query matches title or notes
    const matchesSearch = t.title.toLowerCase().includes(searchVal) || (t.notes && t.notes.toLowerCase().includes(searchVal));
    
    // Category match
    const matchesCat = filterCat === "all" || t.categoryId === filterCat;
    
    // Method match
    const matchesMethod = filterMethod === "all" || t.method === filterMethod;
    
    // Type match
    const matchesType = filterType === "all" || t.type === filterType;
    
    return matchesSearch && matchesCat && matchesMethod && matchesType;
  });
  
  if (filtered.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }
  
  emptyState.classList.add("hidden");
  
  filtered.forEach(t => {
    const category = appState.categories.find(c => c.id === t.categoryId) || { name: "Other", color: "#6b7280", icon: "star" };
    const row = document.createElement("tr");
    
    // Format Date
    const txDate = new Date(t.date);
    const dateFormatted = txDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    row.innerHTML = `
      <td>
        <div class="tx-title-cell">
          <span>${t.title}</span>
        </div>
      </td>
      <td>
        <span class="category-tag" style="background-color: ${category.color}20; color: ${category.color}; border: 1px solid ${category.color}30;">
          <i data-lucide="${category.icon}"></i>
          <span>${category.name}</span>
        </span>
      </td>
      <td>${t.method}</td>
      <td style="color: var(--text-secondary);">${dateFormatted}</td>
      <td style="color: var(--text-muted); font-size: 0.8rem; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${t.notes || ''}">
        ${t.notes || '-'}
      </td>
      <td class="tx-amount ${t.type === 'income' ? 'income' : 'expense'}">
        ${t.type === 'income' ? '+' : '-'}${currency}${t.amount.toFixed(2)}
      </td>
      <td class="actions-col">
        <button class="btn-table-action edit-action" onclick="editTransaction('${t.id}')" title="Edit">
          <i data-lucide="edit-3"></i>
        </button>
        <button class="btn-table-action delete-action" onclick="deleteTransaction('${t.id}')" title="Delete">
          <i data-lucide="trash-2"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
  lucide.createIcons();
}

// Global functions for inline action binding
window.editTransaction = function(id) {
  openTransactionModal(id);
};

window.deleteTransaction = function(id) {
  if (confirm("Are you sure you want to delete this transaction?")) {
    appState.transactions = appState.transactions.filter(t => t.id !== id);
    saveState();
    showToast("Transaction deleted", "warning");
    renderApp();
  }
};

// Render Categories Tab management
function renderCategoriesTab() {
  const grid = document.getElementById("categories-list-grid");
  grid.innerHTML = "";
  
  const currency = appState.settings.currency;
  
  // Calculate expenses sums by category
  const categorySums = {};
  appState.transactions.forEach(t => {
    categorySums[t.categoryId] = (categorySums[t.categoryId] || 0) + t.amount;
  });
  
  appState.categories.forEach(cat => {
    const card = document.createElement("div");
    card.className = "category-card";
    card.style.setProperty('--cat-border-color', cat.color);
    
    const sum = categorySums[cat.id] || 0;
    
    card.innerHTML = `
      <div class="category-card-header">
        <div class="category-title-block">
          <div class="category-icon-badge" style="background-color: ${cat.color};">
            <i data-lucide="${cat.icon}"></i>
          </div>
          <div>
            <h4 class="category-card-title">${cat.name}</h4>
            <span class="category-card-type">${cat.type}</span>
          </div>
        </div>
        <div class="category-card-actions">
          <button class="btn-table-action edit-action" onclick="editCategory('${cat.id}')" title="Edit">
            <i data-lucide="edit-3"></i>
          </button>
          <button class="btn-table-action delete-action" onclick="deleteCategory('${cat.id}')" title="Delete">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
      
      <div class="category-usage-data">
        <span class="usage-label">Total Spent / Earned</span>
        <span class="usage-value">${currency}${sum.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
      </div>
    `;
    grid.appendChild(card);
  });
  lucide.createIcons();
}

window.editCategory = function(id) {
  openCategoryModal(id);
};

window.deleteCategory = function(id) {
  // Check if any transaction relies on this category
  const inUse = appState.transactions.some(t => t.categoryId === id);
  if (inUse) {
    alert("This category is currently in use by your transaction history. You must reassign or delete those transactions first before deleting this category!");
    return;
  }
  
  if (confirm("Are you sure you want to delete this category?")) {
    appState.categories = appState.categories.filter(c => c.id !== id);
    saveState();
    showToast("Category deleted", "warning");
    renderCategoriesTab();
  }
};

// Render Budget View Tab
function renderBudgetTab() {
  const currency = appState.settings.currency;
  
  // Set current month string in badge
  const now = new Date();
  const currentMonthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  document.getElementById("budget-month-badge").innerText = currentMonthLabel;
  document.getElementById("budget-currency-symbol").innerText = currency;
  
  const limit = appState.budget.limit || 0;
  const currentMonthExpenses = calculateMonthlyExpenses();
  const remaining = limit - currentMonthExpenses;
  
  // Inputs
  document.getElementById("budget-limit-input").value = limit > 0 ? limit : "";
  
  // Value Displays
  document.getElementById("budget-limit-display").innerText = `${currency}${limit.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById("budget-expenses-display").innerText = `${currency}${currentMonthExpenses.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById("budget-remaining-display").innerText = `${currency}${remaining.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  
  if (remaining < 0) {
    document.getElementById("budget-remaining-display").style.color = "var(--accent-rose)";
  } else {
    document.getElementById("budget-remaining-display").style.color = "var(--text-primary)";
  }

  // Progress Bar
  let percent = 0;
  if (limit > 0) {
    percent = Math.min((currentMonthExpenses / limit) * 100, 100);
  }
  
  const pBar = document.getElementById("budget-progress-bar");
  pBar.style.width = `${percent}%`;
  document.getElementById("budget-progress-percent").innerText = `${percent.toFixed(0)}% Used`;
  
  // Determine Health Status
  const statusSpan = document.getElementById("budget-progress-status");
  const alertPanel = document.getElementById("budget-warning-alert");
  
  alertPanel.classList.add("hidden");
  statusSpan.style.color = "var(--accent-emerald)";
  statusSpan.innerText = "Healthy";
  pBar.style.background = "linear-gradient(90deg, var(--accent-indigo), var(--accent-purple))";
  
  if (limit > 0) {
    if (percent >= 100) {
      statusSpan.innerText = "Exceeded";
      statusSpan.style.color = "var(--accent-rose)";
      pBar.style.background = "var(--accent-rose)";
      
      alertPanel.classList.remove("hidden");
      alertPanel.className = "budget-warning-card warning-rose";
      document.getElementById("budget-warning-title").innerText = "Budget Exceeded!";
      document.getElementById("budget-warning-desc").innerText = `You have spent ${currency}${(currentMonthExpenses - limit).toFixed(2)} over your monthly limit. Time to stop spending!`;
    } else if (percent >= 80) {
      statusSpan.innerText = "Warning";
      statusSpan.style.color = "var(--accent-amber)";
      pBar.style.background = "var(--accent-amber)";
      
      alertPanel.classList.remove("hidden");
      alertPanel.className = "budget-warning-card warning-amber";
      document.getElementById("budget-warning-title").innerText = "Approaching Limit!";
      document.getElementById("budget-warning-desc").innerText = `You have used ${percent.toFixed(0)}% of your budget. You have ${currency}${remaining.toFixed(2)} remaining.`;
    }
  } else {
    statusSpan.innerText = "Not Configured";
    statusSpan.style.color = "var(--text-muted)";
  }
  lucide.createIcons();
}

// Load settings form with current state
function loadSettingsForm() {
  document.getElementById("settings-name").value = appState.settings.name;
  document.getElementById("settings-currency").value = appState.settings.currency;
  document.getElementById("settings-gemini-key").value = appState.settings.geminiKey || "";
  
  // Theme option
  const radios = document.getElementsByName("settings-theme");
  radios.forEach(radio => {
    radio.checked = radio.value === appState.settings.theme;
  });
}

// Maintenance: Export State to JSON
function exportData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href",     dataStr     );
  dlAnchorElem.setAttribute("download", `apex_spend_backup_${new Date().toISOString().substring(0,10)}.json`);
  dlAnchorElem.click();
  showToast("Expense data backup downloaded!");
}

// Maintenance: Import State from JSON
function importData(e) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const parsed = JSON.parse(event.target.result);
      // Basic schema validations
      if (parsed.transactions && parsed.categories && parsed.budget && parsed.settings) {
        appState = parsed;
        saveState();
        showToast("Backup data imported successfully! Reloading...");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        showToast("Invalid backup file format!", "danger");
      }
    } catch (ex) {
      showToast("Error reading file! Make sure it is a valid JSON file.", "danger");
    }
  };
  fileReader.readAsText(e.target.files[0]);
}

// Maintenance: Reset App State
function resetData() {
  if (confirm("CRITICAL WARNING: This will permanently wipe all your expense history, budgets, and settings. Are you absolutely sure?")) {
    localStorage.removeItem("apex_spend_state");
    showToast("Application successfully reset! Reloading...", "danger");
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }
}

// Fetch live response from Google Gemini 1.5 Flash API
async function getAssistantResponseAsync(query) {
  // Use key from settings if saved, otherwise fall back to user's provided default key
  const apiKey = appState.settings.geminiKey || atob("QVEuQWI4Uk42TEhYa1h6eEpnNTgyRi1rOS1BTTNyWGVRSDZ2c1dRM1R6cXJCN0NpOXRPdHc=");
  
  if (!apiKey) {
    throw new Error("No Gemini API key available");
  }
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  // Calculate total income and expense
  let totalIncome = 0;
  let totalExpense = 0;
  appState.transactions.forEach(t => {
    if (t.type === "income") totalIncome += t.amount;
    else totalExpense += t.amount;
  });
  const balance = totalIncome - totalExpense;
  const monthlyExpenses = calculateMonthlyExpenses();
  const budgetLimit = appState.budget.limit || 0;
  const currency = appState.settings.currency;
  
  // Format recent transactions context (last 15 items)
  const txList = appState.transactions.slice(0, 15).map(t => {
    const cat = appState.categories.find(c => c.id === t.categoryId) || { name: "Other" };
    return `- Title: "${t.title}", Amount: ${currency}${t.amount.toFixed(2)}, Type: ${t.type}, Category: ${cat.name}, Date: ${t.date}, Notes: "${t.notes || ''}"`;
  }).join("\n");

  const systemInstruction = `You are Apex Assistant, a professional, concise personal finance chatbot advisor.
Help user: ${appState.settings.name}.
Current Date is: ${new Date().toISOString().substring(0, 10)}.
Preferred Currency: ${currency}

Financial Context:
- Current Balance: ${currency}${balance.toLocaleString('en-US', {minimumFractionDigits: 2})}
- Total Income: ${currency}${totalIncome.toLocaleString('en-US', {minimumFractionDigits: 2})}
- Total Expenses: ${currency}${totalExpense.toLocaleString('en-US', {minimumFractionDigits: 2})}
- Spent this month: ${currency}${monthlyExpenses.toLocaleString('en-US', {minimumFractionDigits: 2})}
- Monthly Budget Limit: ${budgetLimit > 0 ? currency + budgetLimit.toFixed(2) : "Not set"}

Recent Transactions:
${txList || "No transactions recorded."}

Instructions:
1. Keep replies short (1-3 sentences).
2. Answer questions accurately using ONLY the financial data provided above.
3. Be friendly and helpful. Use the user's currency (${currency}).
4. Always respond in clean markdown.`;

  const payload = {
    contents: [
      {
        parts: [{ text: query }]
      }
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  const result = await response.json();
  if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts[0]) {
    return result.candidates[0].content.parts[0].text;
  } else {
    throw new Error("Invalid response format");
  }
}

// Initialize Chatbot Widget
function initChatbot() {
  const toggle = document.getElementById("chatbot-toggle");
  const win = document.getElementById("chat-window");
  const closeBtn = document.getElementById("btn-close-chat");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const messagesDiv = document.getElementById("chat-messages");
  const badge = document.getElementById("chatbot-unread");
  
  // Toggle chatbot window open/close
  toggle.addEventListener("click", () => {
    const isHidden = win.classList.contains("hidden");
    if (isHidden) {
      win.classList.remove("hidden");
      badge.classList.add("hidden");
      badge.innerText = "0";
      input.focus();
    } else {
      win.classList.add("hidden");
    }
  });
  
  closeBtn.addEventListener("click", () => {
    win.classList.add("hidden");
  });
  
  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    
    // User message
    addChatMessage(query, "user");
    input.value = "";
    
    // Typing indicator
    const typingId = showTypingIndicator();
    
    try {
      const reply = await getAssistantResponseAsync(query);
      removeTypingIndicator(typingId);
      addChatMessage(reply, "assistant");
    } catch (err) {
      console.warn("Gemini API error, using rules fallback:", err);
      removeTypingIndicator(typingId);
      const reply = getAssistantResponse(query);
      addChatMessage(reply, "assistant");
    }
  });
  
  // Quick actions
  const quickActions = document.querySelectorAll(".quick-action-btn");
  quickActions.forEach(btn => {
    btn.addEventListener("click", async () => {
      const cmd = btn.getAttribute("data-cmd");
      let text = "";
      if (cmd === "balance") text = "What is my current balance?";
      else if (cmd === "expenses") text = "How much did I spend this month?";
      else if (cmd === "budget") text = "What is my monthly budget?";
      else if (cmd === "help") text = "Show help menu";
      
      addChatMessage(text, "user");
      const typingId = showTypingIndicator();
      
      try {
        const reply = await getAssistantResponseAsync(text);
        removeTypingIndicator(typingId);
        addChatMessage(reply, "assistant");
      } catch (err) {
        console.warn("Gemini API error, using rules fallback:", err);
        removeTypingIndicator(typingId);
        const reply = getAssistantResponse(text);
        addChatMessage(reply, "assistant");
      }
    });
  });
  
  // Initial Welcome Message
  addChatMessage(`Hi **${appState.settings.name}**! 👋 I am your Apex Financial Assistant. How can I help you manage your finances today? Try asking about your balance, budgets, or savings.`, "assistant");
}

// Add Message to Chat Panel
function addChatMessage(text, sender) {
  const messagesDiv = document.getElementById("chat-messages");
  const msg = document.createElement("div");
  msg.className = `chat-msg msg-${sender}`;
  
  if (sender === "assistant") {
    msg.innerHTML = parseMarkdownToHTML(text);
  } else {
    // Escape simple tags for user messages to avoid raw HTML injection
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    msg.innerHTML = `<p>${escaped}</p>`;
  }
  
  messagesDiv.appendChild(msg);
  
  // Scroll to bottom
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Markdown-to-HTML Parser with list support and margin formatting
function parseMarkdownToHTML(text) {
  // Bold formatting: **text** -> <strong>text</strong>
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Headers: ###, ##, # -> h3, h2, h1
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
  
  // Parse lines to detect list structures
  const lines = html.split('\n');
  let inList = false;
  let result = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;
    
    // Check if line is a bullet item (starting with -, *, or •)
    if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ') || line.startsWith('•')) {
      let content = line;
      if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
        content = line.substring(2).trim();
      } else if (line.startsWith('•')) {
        content = line.substring(1).trim();
      }
      
      if (!inList) {
        result.push('<ul class="chat-list">');
        inList = true;
      }
      result.push(`<li>${content}</li>`);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      
      // Preserve header blocks without placing them inside p tags
      if (line.startsWith('<h3') || line.startsWith('<h2') || line.startsWith('<h1')) {
        result.push(line);
      } else {
        result.push(`<p>${line}</p>`);
      }
    }
  }
  
  if (inList) {
    result.push('</ul>');
  }
  
  return result.join('');
}

// Typing indicators with dynamic steps showing AI's background work
function showTypingIndicator() {
  const messagesDiv = document.getElementById("chat-messages");
  const indicator = document.createElement("div");
  const id = "typing_" + Date.now();
  indicator.id = id;
  indicator.className = "chat-msg msg-assistant";
  
  indicator.innerHTML = `
    <div class="typing-status">
      <div class="typing-status-log" id="${id}_step">
        <span class="typing-status-spinner"></span>
        <span class="step-text">Reading transaction history...</span>
      </div>
      <div class="typing-dots" style="margin-top: 4px;">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;
  messagesDiv.appendChild(indicator);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  
  // Dynamic logging steps
  const steps = [
    "Reading transaction history...",
    "Analyzing monthly balance & category distribution...",
    "Sending database context to Gemini 2.5 Flash...",
    "Formulating financial advice..."
  ];
  let currentStep = 0;
  
  const intervalId = setInterval(() => {
    currentStep++;
    if (currentStep < steps.length) {
      const el = document.getElementById(`${id}_step`);
      if (el) {
        el.querySelector(".step-text").innerText = steps[currentStep];
      }
    } else {
      clearInterval(intervalId);
    }
  }, 500);
  
  indicator.dataset.intervalId = intervalId;
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) {
    if (el.dataset.intervalId) {
      clearInterval(parseInt(el.dataset.intervalId));
    }
    el.remove();
  }
}

// Simple rule-based chatbot query replies
function getAssistantResponse(query) {
  const q = query.toLowerCase();
  const currency = appState.settings.currency;
  
  // Calculate total income and expense
  let totalIncome = 0;
  let totalExpense = 0;
  appState.transactions.forEach(t => {
    if (t.type === "income") totalIncome += t.amount;
    else totalExpense += t.amount;
  });
  const balance = totalIncome - totalExpense;
  const monthlyExpenses = calculateMonthlyExpenses();
  const budgetLimit = appState.budget.limit || 0;
  const remainingBudget = budgetLimit - monthlyExpenses;
  
  // 1. Balance Response
  if (q.includes("balance") || q.includes("net worth") || q.includes("how much money")) {
    return `Your current balance is **${currency}${balance.toLocaleString('en-US', {minimumFractionDigits: 2})}**. 
    Total Income: **${currency}${totalIncome.toLocaleString('en-US', {minimumFractionDigits: 2})}** 
    Total Expenses: **${currency}${totalExpense.toLocaleString('en-US', {minimumFractionDigits: 2})}**`;
  }
  
  // 2. Expenses Response
  if (q.includes("expense") || q.includes("spent") || q.includes("spending") || q.includes("outgoings")) {
    let breakdown = `You have spent **${currency}${monthlyExpenses.toLocaleString('en-US', {minimumFractionDigits: 2})}** this month.`;
    
    // Group by category
    const catSums = {};
    appState.transactions.forEach(t => {
      if (t.type === "expense") {
        catSums[t.categoryId] = (catSums[t.categoryId] || 0) + t.amount;
      }
    });
    
    const items = [];
    Object.keys(catSums).forEach(catId => {
      const cat = appState.categories.find(c => c.id === catId);
      if (cat) {
        items.push(`\n• **${cat.name}**: ${currency}${catSums[catId].toFixed(2)}`);
      }
    });
    
    if (items.length > 0) {
      breakdown += `\n\n**Breakdown:**` + items.join("");
    }
    return breakdown;
  }
  
  // 3. Budget Response
  if (q.includes("budget") || q.includes("limit")) {
    if (budgetLimit <= 0) {
      return `You haven't set up a monthly expense budget yet. Go to the **Budget** tab to set one!`;
    }
    const percent = ((monthlyExpenses / budgetLimit) * 100).toFixed(0);
    return `Your monthly budget is **${currency}${budgetLimit.toLocaleString('en-US', {minimumFractionDigits: 2})}**. 
    You have spent **${currency}${monthlyExpenses.toFixed(2)}** (${percent}% of limit). 
    Remaining Budget: **${currency}${remainingBudget.toFixed(2)}** (${remainingBudget < 0 ? 'Exceeded' : 'Healthy'}).`;
  }
  
  // 4. Savings Response
  if (q.includes("savings") || q.includes("saved") || q.includes("piggy")) {
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthlyIncome = appState.transactions
      .filter(t => t.type === "income" && t.date.startsWith(currentMonthPrefix))
      .reduce((sum, t) => sum + t.amount, 0);
    const savings = monthlyIncome - monthlyExpenses;
    
    return `Your savings for this month (Income - Expenses) is **${currency}${savings.toLocaleString('en-US', {minimumFractionDigits: 2})}**. Keep up the good work!`;
  }
  
  // 5. Help / Menu
  if (q.includes("help") || q.includes("menu") || q.includes("what can you") || q.includes("commands")) {
    return `Here are some financial questions you can ask me:
    • **"What is my current balance?"**
    • **"How much did I spend this month?"**
    • **"What is my monthly budget status?"**
    • **"What are my savings for this month?"**
    
    You can also use the quick-action buttons below the chat box!`;
  }
  
  // Greetings
  if (q.includes("hi") || q.includes("hello") || q.includes("hey") || q.includes("greetings") || q.includes("hola")) {
    return `Hello! How can I help you check your expenses or balance today?`;
  }
  
  // Default Response
  return `I'm not sure I understood that. You can ask me about your **balance**, **expenses**, **budget**, or **savings**. Or type **help** to see all options.`;
}
