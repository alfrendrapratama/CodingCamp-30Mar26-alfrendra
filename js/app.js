// ============================================================
// Constants
// ============================================================

const CATEGORIES = ['Food', 'Transport', 'Fun'];

const COLORS = {
  Food: '#2ecc71',
  Transport: '#3498db',
  Fun: '#f39c12',
};

const STORAGE_KEYS = {
  transactions: 'ebv_transactions',
  budgetLimit: 'ebv_budget_limit',
  theme: 'ebv_theme',
};

// ============================================================
// State
// ============================================================

const state = {
  transactions: [],   // Transaction[]
  budgetLimit: null,  // number | null
  theme: 'dark',      // 'dark' | 'light'
  sortOrder: 'none',  // 'none' | 'amount-asc' | 'amount-desc' | 'category-az'
};

// ============================================================
// Storage Module
// ============================================================

function saveTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
  } catch (e) { /* localStorage unavailable — run in-memory only */ }
}

function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.transactions);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveBudgetLimit(limit) {
  try {
    localStorage.setItem(STORAGE_KEYS.budgetLimit, JSON.stringify(limit));
  } catch (e) { /* ignore */ }
}

function loadBudgetLimit() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.budgetLimit);
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed === 'number' ? parsed : null;
  } catch (e) {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  } catch (e) { /* ignore */ }
}

function loadTheme() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.theme);
    return raw === 'light' ? 'light' : 'dark';
  } catch (e) {
    return 'dark';
  }
}

// ============================================================
// Validation
// ============================================================

function validateTransaction(name, amount, category) {
  const errors = [];
  if (!name || name.trim() === '') {
    errors.push('Item name is required.');
  }
  const num = parseFloat(amount);
  if (amount === '' || amount === null || isNaN(num)) {
    errors.push('Amount must be a valid number.');
  } else if (num <= 0) {
    errors.push('Amount must be greater than zero.');
  }
  if (!CATEGORIES.includes(category)) {
    errors.push('Please select a valid category.');
  }
  return { valid: errors.length === 0, errors };
}

// ============================================================
// Utilities
// ============================================================

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
// View / Render Functions
// ============================================================

let chartInstance = null;

function renderTransactionList(transactions, sortOrder) {
  const list = document.getElementById('transaction-list');
  const emptyState = document.getElementById('empty-state');

  // Sort a copy — never mutate state.transactions for display
  const sorted = [...transactions];
  if (sortOrder === 'amount-asc') {
    sorted.sort((a, b) => a.amount - b.amount);
  } else if (sortOrder === 'amount-desc') {
    sorted.sort((a, b) => b.amount - a.amount);
  } else if (sortOrder === 'category-az') {
    sorted.sort((a, b) => a.category.localeCompare(b.category));
  }

  // Remove existing transaction elements (keep empty-state node)
  Array.from(list.querySelectorAll('.transaction')).forEach(el => el.remove());

  if (sorted.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  sorted.forEach(tx => {
    const div = document.createElement('div');
    div.className = 'transaction';
    div.dataset.id = tx.id;
    div.innerHTML = `
      <div>
        <p>${escapeHtml(tx.name)}</p>
        <small>${escapeHtml(tx.category)}</small>
      </div>
      <div class="right">
        <span class="price">$${tx.amount.toFixed(2)}</span>
        <button class="btn-delete" data-id="${tx.id}" aria-label="Delete ${escapeHtml(tx.name)}">Delete</button>
      </div>`;
    list.appendChild(div);
  });
}

function renderBalance(transactions, budgetLimit) {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const el = document.getElementById('balance-display');
  el.textContent = `$${total.toFixed(2)}`;
  if (budgetLimit !== null && total > budgetLimit) {
    el.classList.add('over-budget');
  } else {
    el.classList.remove('over-budget');
  }
}

function renderChart(transactions) {
  const canvas = document.getElementById('spending-chart');
  const fallback = document.getElementById('chart-fallback');

  if (typeof Chart === 'undefined') {
    canvas.style.display = 'none';
    fallback.style.display = 'block';
    return;
  }

  // Aggregate by category, exclude zero-spend categories
  const totals = {};
  CATEGORIES.forEach(cat => { totals[cat] = 0; });
  transactions.forEach(tx => { totals[tx.category] = (totals[tx.category] || 0) + tx.amount; });

  const labels = CATEGORIES.filter(cat => totals[cat] > 0);
  const data = labels.map(cat => totals[cat]);
  const colors = labels.map(cat => COLORS[cat]);

  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.data.datasets[0].backgroundColor = colors;
    chartInstance.update();
  } else {
    chartInstance = new Chart(canvas, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: 'rgba(255,255,255,0.15)',
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: state.theme === 'light' ? '#1a1a2e' : '#f0f0f0' },
          },
        },
      },
    });
  }
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light');
    document.body.classList.remove('dark');
  } else {
    document.body.classList.add('dark');
    document.body.classList.remove('light');
  }
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'light' ? '🌙 Dark' : '☀️ Light';

  // Update chart legend color to match theme
  if (chartInstance) {
    const legendColor = theme === 'light' ? '#1a1a2e' : '#f0f0f0';
    chartInstance.options.plugins.legend.labels.color = legendColor;
    chartInstance.update();
  }
}

function showError(message) {
  const el = document.getElementById('error-message');
  el.textContent = message;
  el.classList.add('visible');
}

function clearError() {
  const el = document.getElementById('error-message');
  el.textContent = '';
  el.classList.remove('visible');
}

function renderAll() {
  renderTransactionList(state.transactions, state.sortOrder);
  renderBalance(state.transactions, state.budgetLimit);
  renderChart(state.transactions);
}

// ============================================================
// Controller Functions
// ============================================================

function handleAddTransaction(event) {
  event.preventDefault();
  clearError();

  const name = document.getElementById('item-name').value.trim();
  const amountRaw = document.getElementById('item-amount').value;
  const category = document.getElementById('item-category').value;

  const { valid, errors } = validateTransaction(name, amountRaw, category);
  if (!valid) {
    showError(errors.join(' '));
    return;
  }

  const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

  const transaction = {
    id,
    name,
    amount: parseFloat(amountRaw),
    category,
    timestamp: Date.now(),
  };

  state.transactions.push(transaction);
  saveTransactions(state.transactions);
  renderAll();

  // Reset form
  document.getElementById('transaction-form').reset();
}

function handleDeleteTransaction(id) {
  state.transactions = state.transactions.filter(tx => tx.id !== id);
  saveTransactions(state.transactions);
  renderAll();
}

function handleSortChange(sortOrder) {
  state.sortOrder = sortOrder;
  renderTransactionList(state.transactions, state.sortOrder);
}

function handleThemeToggle() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  saveTheme(state.theme);
  applyTheme(state.theme);
}

function handleBudgetChange(value) {
  const num = parseFloat(value);
  state.budgetLimit = (!value || isNaN(num) || num <= 0) ? null : num;
  saveBudgetLimit(state.budgetLimit);
  renderBalance(state.transactions, state.budgetLimit);
}

// ============================================================
// Event Binding & Initialization
// ============================================================

function bindEvents() {
  document.getElementById('transaction-form')
    .addEventListener('submit', handleAddTransaction);

  document.getElementById('transaction-list')
    .addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-delete');
      if (btn) handleDeleteTransaction(btn.dataset.id);
    });

  document.getElementById('sort-select')
    .addEventListener('change', (e) => handleSortChange(e.target.value));

  document.getElementById('theme-toggle')
    .addEventListener('click', handleThemeToggle);

  document.getElementById('budget-limit')
    .addEventListener('input', (e) => handleBudgetChange(e.target.value));
}

function init() {
  // Load persisted state
  state.transactions = loadTransactions();
  state.budgetLimit = loadBudgetLimit();
  state.theme = loadTheme();

  // Restore budget input field
  const budgetInput = document.getElementById('budget-limit');
  if (state.budgetLimit !== null) budgetInput.value = state.budgetLimit;

  applyTheme(state.theme);
  bindEvents();
  renderAll();
}

document.addEventListener('DOMContentLoaded', init);
