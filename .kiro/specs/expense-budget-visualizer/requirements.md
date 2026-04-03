# Requirements Document

## Introduction

Expense & Budget Visualizer adalah web app mobile-friendly berbasis HTML/CSS/Vanilla JS untuk tracking pengeluaran harian. App ini memungkinkan user menambah, menghapus, dan memvisualisasikan transaksi berdasarkan kategori, dengan dukungan localStorage, dark/light mode, budget limit alert, dan sorting. Tidak ada backend — semua data disimpan di sisi klien.

## Glossary

- **App**: Aplikasi Expense & Budget Visualizer secara keseluruhan
- **Transaction**: Satu entri pengeluaran yang terdiri dari item name, amount, dan category
- **Transaction_List**: Daftar scrollable semua transaksi yang tersimpan
- **Form**: Input form untuk menambahkan transaksi baru
- **Balance_Display**: Komponen UI yang menampilkan total pengeluaran saat ini
- **Chart**: Pie chart yang menampilkan distribusi pengeluaran per kategori menggunakan Chart.js
- **Storage**: Browser localStorage yang digunakan untuk persistensi data
- **Budget_Limit**: Nilai batas pengeluaran yang ditetapkan oleh user
- **Theme_Toggle**: Kontrol UI untuk beralih antara dark mode dan light mode
- **Sorter**: Mekanisme pengurutan transaksi berdasarkan amount atau category

---

## Requirements

### Requirement 1: Input Form

**User Story:** As a user, I want to fill in a form with item name, amount, and category, so that I can record a new expense transaction.

#### Acceptance Criteria

1. THE Form SHALL display three input fields: item name (text), amount (number), and category (dropdown with options: Food, Transport, Fun).
2. WHEN the user submits the Form with all fields filled, THE App SHALL add the transaction to the Transaction_List and update the Balance_Display.
3. IF the user submits the Form with one or more empty fields, THEN THE Form SHALL display a validation error message and SHALL NOT add the transaction.
4. WHEN a transaction is successfully added, THE Form SHALL reset all input fields to their default empty state.
5. THE Form SHALL accept amount values as positive numbers only; IF a non-positive or non-numeric value is entered, THEN THE Form SHALL display a validation error.

---

### Requirement 2: Transaction List

**User Story:** As a user, I want to see a scrollable list of all my transactions, so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display all stored transactions, each showing item name, amount, and category.
2. THE Transaction_List SHALL be scrollable when the number of transactions exceeds the visible area.
3. WHEN the user clicks the delete button on a transaction, THE App SHALL remove that transaction from the Transaction_List, update the Balance_Display, and update the Chart.
4. WHEN no transactions exist, THE Transaction_List SHALL display an empty state message.

---

### Requirement 3: Total Balance Display

**User Story:** As a user, I want to see my total spending at a glance, so that I know how much I've spent overall.

#### Acceptance Criteria

1. THE Balance_Display SHALL show the sum of all transaction amounts, formatted as currency (e.g., $0.00).
2. WHEN a transaction is added or deleted, THE Balance_Display SHALL update automatically without page reload.
3. WHILE the total balance is below or equal to the Budget_Limit, THE Balance_Display SHALL render the balance value in the default text color.
4. WHEN the total balance exceeds the Budget_Limit, THE Balance_Display SHALL render the balance value in red to indicate overspending.

---

### Requirement 4: Visual Pie Chart

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand where my money is going.

#### Acceptance Criteria

1. THE Chart SHALL render a pie chart using Chart.js showing spending distribution across all categories (Food, Transport, Fun).
2. WHEN a transaction is added or deleted, THE Chart SHALL update automatically to reflect the new distribution.
3. WHEN a category has zero spending, THE Chart SHALL exclude that category from the pie chart segments.
4. THE Chart SHALL display a distinct color for each category to ensure visual differentiation.

---

### Requirement 5: Data Persistence

**User Story:** As a user, I want my transactions to be saved between sessions, so that I don't lose my data when I close or refresh the browser.

#### Acceptance Criteria

1. WHEN a transaction is added, THE Storage SHALL save the updated transaction list to localStorage.
2. WHEN a transaction is deleted, THE Storage SHALL save the updated transaction list to localStorage.
3. WHEN the App loads, THE App SHALL read all transactions from localStorage and render them in the Transaction_List, Balance_Display, and Chart.
4. IF localStorage is empty or unavailable, THEN THE App SHALL initialize with an empty transaction list and SHALL NOT throw an error.

---

### Requirement 6: Dark/Light Mode Toggle

**User Story:** As a user, I want to switch between dark and light mode, so that I can use the app comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Theme_Toggle SHALL be accessible from the main UI at all times.
2. WHEN the user activates the Theme_Toggle, THE App SHALL switch between dark mode and light mode by updating CSS custom properties (CSS Variables) via JavaScript.
3. WHEN the theme is changed, THE App SHALL save the selected theme preference to localStorage.
4. WHEN the App loads, THE App SHALL apply the previously saved theme preference from localStorage; IF no preference is saved, THEN THE App SHALL default to dark mode.

---

### Requirement 7: Budget Limit

**User Story:** As a user, I want to set a budget limit, so that I get a visual warning when my total spending exceeds it.

#### Acceptance Criteria

1. THE App SHALL provide an input field for the user to set a Budget_Limit value.
2. WHEN the total balance exceeds the Budget_Limit, THE Balance_Display SHALL change the balance text color to red.
3. WHEN the total balance is at or below the Budget_Limit, THE Balance_Display SHALL revert the balance text color to the default color.
4. WHEN the user updates the Budget_Limit, THE App SHALL immediately re-evaluate the balance against the new limit and update the Balance_Display color accordingly.
5. WHEN the App loads, THE App SHALL restore the previously saved Budget_Limit from localStorage; IF none is saved, THEN THE App SHALL default to no limit (no warning shown).

---

### Requirement 8: Sort Transactions

**User Story:** As a user, I want to sort my transactions by amount or category, so that I can find and analyze my expenses more easily.

#### Acceptance Criteria

1. THE Sorter SHALL provide options to sort transactions by amount (ascending/descending) and by category (A–Z).
2. WHEN the user selects a sort option, THE Transaction_List SHALL re-render the transactions in the selected order using JavaScript's `.sort()` method.
3. WHEN transactions are sorted, THE Balance_Display and THE Chart SHALL remain unchanged (sorting is display-only).
4. WHEN a new transaction is added, THE Transaction_List SHALL maintain the currently active sort order.

---

### Requirement 9: Technical Constraints

**User Story:** As a developer, I want the app to be built with plain HTML/CSS/Vanilla JS, so that it has no build dependencies and runs directly in any modern browser.

#### Acceptance Criteria

1. THE App SHALL be implemented using only HTML, CSS, and Vanilla JavaScript with no frameworks or libraries except Chart.js.
2. THE App SHALL have exactly one CSS file located at `css/style.css` and exactly one JavaScript file located at `js/app.js`.
3. THE App SHALL function correctly on Chrome, Firefox, Edge, and Safari (latest stable versions).
4. THE App SHALL require no backend server, build step, or test setup to run.

---

### Requirement 10: Performance and Responsiveness

**User Story:** As a user, I want the app to load fast and respond instantly to my interactions, so that I have a smooth experience on both desktop and mobile.

#### Acceptance Criteria

1. THE App SHALL render the initial UI within 2 seconds on a standard broadband connection.
2. WHEN the user adds or deletes a transaction, THE App SHALL update the Transaction_List, Balance_Display, and Chart within 100ms.
3. THE App SHALL display correctly on screen widths from 320px to 1440px using responsive CSS (media queries or CSS Grid/Flexbox).
4. THE App SHALL maintain a clean, minimal glass UI design with clear visual hierarchy and readable typography using the Poppins font.
