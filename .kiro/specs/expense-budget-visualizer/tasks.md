# Implementation Plan: Expense & Budget Visualizer

## Overview

Implementasi dilakukan dalam satu file JavaScript (`js/app.js`) yang di-wire ke `index.html` yang sudah ada. Pendekatan MVC-lite: State → Storage → Controller → View. Setiap task membangun di atas task sebelumnya hingga semua komponen terhubung.

## Tasks

- [x] 1. Update index.html dan setup js/app.js
  - Tambahkan CDN Chart.js ke `index.html`
  - Tambahkan elemen HTML yang dibutuhkan: budget input, theme toggle button, sort select, error message container, empty state message
  - Tambahkan `<script src="js/app.js">` di akhir body
  - Buat file `js/app.js` dengan State object awal dan konstanta (CATEGORIES, COLORS, localStorage keys)
  - Termasuk responsive design untuk mobile device
  - _Requirements: 9.1, 9.2_

- [x] 2. Implementasi Storage module dan State initialization
  - [x] 2.1 Implementasi fungsi Storage (`saveTransactions`, `loadTransactions`, `saveBudgetLimit`, `loadBudgetLimit`, `saveTheme`, `loadTheme`)
    - Tangani JSON.parse error dengan fallback ke nilai default
    - Tangani localStorage tidak tersedia dengan try/catch
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]\* 2.2 Write property test untuk transaction persistence round-trip
    - **Property 5: Transaction persistence round-trip**
    - **Validates: Requirements 5.1, 5.2, 5.3**

  - [ ]\* 2.3 Write property test untuk theme persistence round-trip
    - **Property 6: Theme persistence round-trip**
    - **Validates: Requirements 6.3, 6.4**

  - [ ]\* 2.4 Write property test untuk budget limit persistence round-trip
    - **Property 7: Budget limit persistence round-trip**
    - **Validates: Requirements 7.5**

  - [x] 2.5 Implementasi inisialisasi app saat load (`initApp`)
    - Load transactions, budgetLimit, theme dari localStorage
    - Fallback ke nilai default jika localStorage kosong
    - _Requirements: 5.3, 5.4, 6.4, 7.5_

- [x] 3. Implementasi Validation dan Controller: Add Transaction
  - [x] 3.1 Implementasi `validateTransaction(name, amount, category)`
    - Return `{ valid: boolean, errors: string[] }`
    - Validasi: name non-empty, amount positif dan numerik, category valid
    - _Requirements: 1.3, 1.5_

  - [ ]\* 3.2 Write property test untuk invalid transaction rejected
    - **Property 2: Invalid transaction rejected**
    - **Validates: Requirements 1.3, 1.5**

  - [x] 3.3 Implementasi `handleAddTransaction(event)`
    - Validasi input, tampilkan error inline jika tidak valid
    - Generate ID dengan `crypto.randomUUID()` atau fallback `Date.now() + Math.random()`
    - Tambah transaction ke state, simpan ke localStorage, reset form
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]\* 3.4 Write property test untuk valid transaction grows list
    - **Property 1: Valid transaction grows list and appears in it**
    - **Validates: Requirements 1.2, 2.1**

  - [ ]\* 3.5 Write property test untuk form resets after successful add
    - **Property 11: Form resets after successful add**
    - **Validates: Requirements 1.4**

- [x] 4. Implementasi View: renderTransactionList dan renderBalance
  - [x] 4.1 Implementasi `renderTransactionList(transactions, sortOrder)`
    - Render semua transaksi dengan nama, amount, category, dan delete button
    - Tampilkan empty state message jika tidak ada transaksi
    - List scrollable via CSS (max-height + overflow-y)
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 4.2 Implementasi `renderBalance(transactions, budgetLimit)`
    - Hitung sum semua amounts, format sebagai currency (`$0.00`)
    - Warna merah jika total > budgetLimit, default jika tidak
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]\* 4.3 Write property test untuk balance equals sum of amounts
    - **Property 3: Balance equals sum of amounts**
    - **Validates: Requirements 3.1, 3.2**

  - [ ]\* 4.4 Write property test untuk balance color reflects budget status
    - **Property 8: Balance color reflects budget status**
    - **Validates: Requirements 3.3, 3.4, 7.2, 7.3, 7.4**

- [ ] 5. Checkpoint — Pastikan semua tests pass, tanya user jika ada pertanyaan.

- [x] 6. Implementasi Controller: Delete Transaction dan Sort
  - [x] 6.1 Implementasi `handleDeleteTransaction(id)`
    - Hapus transaction dari state berdasarkan id
    - Simpan ke localStorage, re-render list, balance, dan chart
    - _Requirements: 2.3, 5.2_

  - [ ]\* 6.2 Write property test untuk delete removes exactly one
    - **Property 4: Delete removes exactly one transaction**
    - **Validates: Requirements 2.3**

  - [x] 6.3 Implementasi `handleSortChange(sortOrder)` dan logika sort di `renderTransactionList`
    - Sort by amount ascending/descending dan category A–Z menggunakan `.sort()`
    - Sort hanya mempengaruhi tampilan, tidak mutasi state.transactions
    - Pertahankan sort order aktif saat transaksi baru ditambahkan
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]\* 6.4 Write property test untuk sort produces correct order and does not mutate data
    - **Property 9: Sort order correct + display-only**
    - **Validates: Requirements 8.2, 8.3**

  - [ ]\* 6.5 Write property test untuk sort maintained after add
    - **Property 12: Sort maintains active order after add**
    - **Validates: Requirements 8.4**

- [x] 7. Implementasi View: renderChart dengan Chart.js
  - [x] 7.1 Implementasi `renderChart(transactions)`
    - Agregasi spending per category (Food, Transport, Fun)
    - Exclude kategori dengan total 0 dari chart segments
    - Gunakan warna per kategori: Food `#2ecc71`, Transport `#3498db`, Fun `#f39c12`
    - Inisialisasi Chart.js instance; update (tidak re-create) saat data berubah
    - Tampilkan pesan fallback teks jika Chart.js gagal load
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]\* 7.2 Write property test untuk chart excludes zero-spending categories
    - **Property 10: Chart excludes zero-spending categories**
    - **Validates: Requirements 4.3**

- [x] 8. Implementasi Theme Toggle dan Budget Limit
  - [x] 8.1 Implementasi `applyTheme(theme)` dan `handleThemeToggle()`
    - Update CSS custom properties via JavaScript untuk dark/light mode
    - Simpan preferensi ke localStorage
    - Default ke dark mode jika tidak ada preferensi tersimpan
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 8.2 Implementasi `handleBudgetChange(value)`
    - Parse dan validasi nilai budget limit
    - Simpan ke localStorage, re-evaluate balance color segera
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 9. Wiring: Event Listeners dan integrasi semua komponen
  - Pasang event listener: form submit → `handleAddTransaction`, delete button (event delegation) → `handleDeleteTransaction`, sort select → `handleSortChange`, theme toggle → `handleThemeToggle`, budget input → `handleBudgetChange`
  - Panggil `initApp()` saat DOM ready untuk load data dari localStorage dan render semua komponen
  - Pastikan setiap aksi (add/delete/sort/theme/budget) memicu re-render komponen yang relevan
  - _Requirements: 1.2, 2.3, 3.2, 4.2, 5.1, 5.2, 5.3, 6.2, 7.4, 8.4, 10.2_

- [x] 10. Responsiveness dan polish CSS
  - Tambahkan CSS untuk scrollable transaction list (max-height, overflow-y)
  - Pastikan layout benar di 320px–1440px (media queries sudah ada, tambahkan jika perlu)
  - Tambahkan style untuk error message inline, empty state, budget input, theme toggle, sort select
  - _Requirements: 10.3, 10.4_

- [x] 11. Final Checkpoint — Pastikan semua tests pass, tanya user jika ada pertanyaan.

## Notes

- Tasks bertanda `*` bersifat opsional dan bisa dilewati untuk MVP lebih cepat
- Setiap task mereferensikan requirements spesifik untuk traceability
- Property tests menggunakan fast-check dengan minimum 100 iterasi per property
- Unit tests menggunakan Jest atau native `console.assert`
- Semua logic ada di satu file `js/app.js` sesuai constraint Requirement 9.2
