# Design Document: Expense & Budget Visualizer

## Overview

Expense & Budget Visualizer adalah single-page web app berbasis HTML/CSS/Vanilla JS yang memungkinkan user mencatat, memvisualisasikan, dan mengelola pengeluaran harian. Semua data disimpan di browser localStorage — tidak ada backend.

App ini dibangun di atas UI glass-panel yang sudah ada (`index.html` + `css/style.css`) dengan menambahkan satu file JavaScript (`js/app.js`) sebagai satu-satunya logic layer.

**Stack:**

- HTML5 (struktur, sudah ada)
- CSS3 dengan CSS Custom Properties (theming, sudah ada)
- Vanilla JavaScript ES6+ (`js/app.js`, baru)
- Chart.js (CDN, untuk pie chart)

---

## Architecture

App menggunakan arsitektur **MVC-lite** sederhana dalam satu file JS:

```
┌─────────────────────────────────────────────────────┐
│                     index.html                      │
│  (DOM structure + Chart.js CDN + js/app.js script)  │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                    js/app.js                        │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │    State    │  │  Controller  │  │   View    │  │
│  │  (in-mem)   │◄─┤  (handlers)  ├─►│ (render)  │  │
│  └──────┬──────┘  └──────────────┘  └───────────┘  │
│         │                                           │
│  ┌──────▼──────┐                                    │
│  │  Storage    │                                    │
│  │(localStorage│                                    │
│  └─────────────┘                                    │
└─────────────────────────────────────────────────────┘
```

**Data flow:**

1. User berinteraksi dengan DOM (form submit, delete, sort, theme toggle, budget input)
2. Controller handler memvalidasi input dan memutasi State
3. State disinkronkan ke localStorage via Storage module
4. View re-render semua komponen yang terpengaruh (Transaction_List, Balance_Display, Chart)

---

## Components and Interfaces

### State Object

```js
// State tunggal yang menjadi sumber kebenaran
const state = {
  transactions: [], // Transaction[]
  budgetLimit: null, // number | null
  theme: "dark", // 'dark' | 'light'
  sortOrder: "none", // 'none' | 'amount-asc' | 'amount-desc' | 'category-az'
};
```

### Storage Module

```js
// Membaca/menulis state ke localStorage
function saveTransactions(transactions)  // → void
function loadTransactions()              // → Transaction[]
function saveBudgetLimit(limit)          // → void
function loadBudgetLimit()               // → number | null
function saveTheme(theme)                // → void
function loadTheme()                     // → 'dark' | 'light'
```

### Controller Functions

```js
function handleAddTransaction(event)     // → void  (form submit)
function handleDeleteTransaction(id)     // → void  (delete button click)
function handleSortChange(sortOrder)     // → void  (sort select change)
function handleThemeToggle()             // → void  (toggle button click)
function handleBudgetChange(value)       // → void  (budget input change)
```

### View / Render Functions

```js
function renderTransactionList(transactions, sortOrder)  // → void
function renderBalance(transactions, budgetLimit)        // → void
function renderChart(transactions)                       // → void
function applyTheme(theme)                               // → void
```

### Validation Functions

```js
function validateTransaction(name, amount, category)
// → { valid: boolean, errors: string[] }
```

---

## Data Models

### Transaction

```js
/**
 * @typedef {Object} Transaction
 * @property {string} id         - UUID unik (crypto.randomUUID() atau Date.now())
 * @property {string} name       - Nama item (non-empty string)
 * @property {number} amount     - Jumlah pengeluaran (positive number)
 * @property {string} category   - 'Food' | 'Transport' | 'Fun'
 * @property {number} timestamp  - Unix timestamp saat transaksi dibuat
 */
```

### localStorage Keys

| Key                | Value                     | Tipe     |
| ------------------ | ------------------------- | -------- |
| `ebv_transactions` | JSON array of Transaction | `string` |
| `ebv_budget_limit` | angka atau `"null"`       | `string` |
| `ebv_theme`        | `"dark"` atau `"light"`   | `string` |

### Category Colors (Chart.js)

| Category  | Color     |
| --------- | --------- |
| Food      | `#2ecc71` |
| Transport | `#3498db` |
| Fun       | `#f39c12` |

---

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Valid transaction grows list and appears in it

_For any_ transaction list and a valid transaction (non-empty name, positive amount, valid category), adding it should result in the transaction list length increasing by exactly one and the new transaction appearing in the list.

**Validates: Requirements 1.2, 2.1**

---

### Property 2: Invalid transaction is rejected

_For any_ form submission where name is empty, amount is non-positive, or amount is non-numeric, the transaction list should remain unchanged (no new entry added).

**Validates: Requirements 1.3, 1.5**

---

### Property 3: Balance equals sum of amounts

_For any_ transaction list, the displayed balance should always equal the arithmetic sum of all transaction amounts in the list.

**Validates: Requirements 3.1, 3.2**

---

### Property 4: Delete removes exactly one transaction

_For any_ transaction list containing a transaction with a given id, deleting that transaction should result in a list that no longer contains that id and has length reduced by exactly one.

**Validates: Requirements 2.3**

---

### Property 5: Transaction persistence round-trip

_For any_ transaction list, saving it to localStorage and then loading it back should produce a list that is deeply equal to the original.

**Validates: Requirements 5.1, 5.2, 5.3**

---

### Property 6: Theme persistence round-trip

_For any_ theme value ('dark' or 'light'), saving it to localStorage and loading it back should return the same theme value.

**Validates: Requirements 6.3, 6.4**

---

### Property 7: Budget limit persistence round-trip

_For any_ budget limit value (positive number or null), saving it to localStorage and loading it back should return an equivalent value.

**Validates: Requirements 7.5**

---

### Property 8: Balance color reflects budget status

_For any_ transaction list and budget limit, if the total balance exceeds the budget limit then the balance display should use red color; if the total balance is at or below the budget limit then the balance display should use the default color. This must hold immediately after any budget limit update.

**Validates: Requirements 3.3, 3.4, 7.2, 7.3, 7.4**

---

### Property 9: Sort produces correct order and does not mutate data

_For any_ transaction list and sort order, after sorting: (a) the rendered list should be in the correct order per the selected criterion, and (b) the underlying transaction data, computed balance, and chart aggregation should be identical to before sorting.

**Validates: Requirements 8.2, 8.3**

---

### Property 10: Chart excludes zero-spending categories

_For any_ transaction list, the chart data should only include categories that have a total spending greater than zero.

**Validates: Requirements 4.3**

---

### Property 11: Form resets after successful add

_For any_ valid transaction submission, after the transaction is added, all form input fields should be empty/reset to their default state.

**Validates: Requirements 1.4**

---

### Property 12: Sort maintains active order after add

_For any_ active sort order and any valid new transaction, after adding the transaction the list should still be rendered in the same sort order.

**Validates: Requirements 8.4**

---

## Error Handling

| Scenario                                                   | Handling                                                          |
| ---------------------------------------------------------- | ----------------------------------------------------------------- |
| Form submitted with empty name                             | Tampilkan pesan error inline, jangan tambah transaksi             |
| Form submitted dengan amount ≤ 0 atau non-numerik          | Tampilkan pesan error inline, jangan tambah transaksi             |
| localStorage tidak tersedia (private mode, quota exceeded) | Tangkap exception, app tetap berjalan dengan in-memory state saja |
| localStorage berisi JSON rusak                             | Tangkap JSON.parse error, fallback ke array kosong                |
| Chart.js gagal load (CDN offline)                          | Chart area menampilkan pesan fallback teks                        |
| `crypto.randomUUID` tidak tersedia (browser lama)          | Fallback ke `Date.now() + Math.random()` sebagai ID               |

---

## Testing Strategy

### Dual Testing Approach

Testing menggunakan dua pendekatan komplementer:

1. **Unit tests** — untuk contoh spesifik, edge case, dan kondisi error
2. **Property-based tests** — untuk memverifikasi properti universal di berbagai input

### Library

- **Unit testing**: [Jest](https://jestjs.io/) (via CDN atau minimal setup) atau native browser test dengan `console.assert`
- **Property-based testing**: [fast-check](https://fast-check.dev/) — library PBT untuk JavaScript/TypeScript

### Unit Test Coverage

Fokus unit test pada:

- Validasi form: contoh spesifik (string kosong, angka negatif, angka nol)
- Inisialisasi app saat localStorage kosong
- Render empty state saat tidak ada transaksi
- Integrasi Chart.js: chart diinisialisasi dan diupdate dengan benar

### Property-Based Test Configuration

Setiap property test dikonfigurasi minimum **100 iterasi**.

Tag format: `Feature: expense-budget-visualizer, Property {N}: {property_text}`

| Property | Test Description                    | fast-check Arbitraries                                                                                      |
| -------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| P1       | Valid transaction grows list        | `fc.string()`, `fc.float({min:0.01})`, `fc.constantFrom('Food','Transport','Fun')`                          |
| P2       | Invalid transaction rejected        | `fc.constant('')`, `fc.float({max:0})`                                                                      |
| P3       | Balance = sum of amounts            | `fc.array(transactionArb)`                                                                                  |
| P4       | Delete removes exactly one          | `fc.array(transactionArb, {minLength:1})`                                                                   |
| P5       | Transaction persistence round-trip  | `fc.array(transactionArb)`                                                                                  |
| P6       | Theme persistence round-trip        | `fc.constantFrom('dark','light')`                                                                           |
| P7       | Budget limit persistence round-trip | `fc.oneof(fc.float({min:0.01}), fc.constant(null))`                                                         |
| P8       | Balance color reflects budget       | `fc.array(transactionArb)`, `fc.float({min:0.01})`                                                          |
| P9       | Sort order correct + display-only   | `fc.array(transactionArb)`, `fc.constantFrom('amount-asc','amount-desc','category-az')`                     |
| P10      | Chart excludes zero categories      | `fc.array(transactionArb)`                                                                                  |
| P11      | Form resets after add               | `fc.record({name: fc.string({minLength:1}), amount: fc.float({min:0.01}), category: fc.constantFrom(...)})` |
| P12      | Sort maintained after add           | `fc.array(transactionArb)`, `fc.constantFrom(...)`, `transactionArb`                                        |

### Example: Property Test Skeleton (fast-check)

```js
// Feature: expense-budget-visualizer, Property 3: Balance equals sum of amounts
fc.assert(
  fc.property(fc.array(transactionArb), (transactions) => {
    const balance = computeBalance(transactions);
    const expected = transactions.reduce((sum, t) => sum + t.amount, 0);
    return Math.abs(balance - expected) < 0.001; // float tolerance
  }),
  { numRuns: 100 },
);

// Feature: expense-budget-visualizer, Property 5: Transaction persistence round-trip
fc.assert(
  fc.property(fc.array(transactionArb), (transactions) => {
    saveTransactions(transactions);
    const loaded = loadTransactions();
    return JSON.stringify(loaded) === JSON.stringify(transactions);
  }),
  { numRuns: 100 },
);
```
