# 🍽️ Smart Restaurant Management System & POS Dashboard

[![Vanilla JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Storage](https://img.shields.io/badge/Storage-Browser_LocalStorage-4E88E5)](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> A modern, responsive, and feature-rich web-based **Restaurant Point of Sale (POS) and Management System** built using pure **HTML5, Vanilla CSS3, and modern JavaScript (ES6+)**. Runs 100% client-side with persistent browser storage—no complex backend, node modules, or database configurations required.

---

## 📖 Table of Contents

- [📌 Overview](#-overview)
- [✨ Key Features](#-key-features)
  - [1. 📊 Executive Dashboard](#1--executive-dashboard)
  - [2. 🛒 Point of Sale (POS) Terminal](#2--point-of-sale-pos-terminal)
  - [3. 🍳 Orders & Kitchen Display System (KDS)](#3--orders--kitchen-display-system-kds)
  - [4. 🍔 Menu Management (Full CRUD)](#4--menu-management-full-crud)
  - [5. 🪑 Floor & Table Management](#5--floor--table-management)
  - [6. 📈 Sales Analytics & Reports](#6--sales-analytics--reports)
  - [7. 🧾 Thermal Invoice & Receipt Generator](#7--thermal-invoice--receipt-generator)
  - [8. ⚙️ Settings, Currency & Backup](#8-️-settings-currency--backup)
- [🛠️ Tech Stack & Architecture](#️-tech-stack--architecture)
- [📂 Project Directory Structure](#-project-directory-structure)
- [🚀 Quick Start & How to Run](#-quick-start--how-to-run)
- [💡 Architectural Highlights](#-architectural-highlights)
- [🔮 Future Roadmap](#-future-roadmap)
- [📄 License](#-license)

---

## 📌 Overview

The **Smart Restaurant Management System & POS Dashboard** simulates real-world food and beverage operations. Designed with a clean, high-performance UI inspired by industry-standard POS hardware, it covers everything from floor seating and walk-in/delivery order taking to live kitchen prep tracking, bill generation, and deep sales analytics.

All data persists reliably across browser sessions using `localStorage`, with built-in capabilities to export, import, or reset the entire system database in one click.

---

## ✨ Key Features

### 1. 📊 Executive Dashboard
- **Real-Time KPIs**: Track Total Delivered Revenue, Orders Count, Occupied vs. Total Dining Tables, and Active Orders.
- **Weekly Revenue Trend**: Interactive SVG chart illustrating daily revenue variations across the last 7 days with gradient bars and value callouts.
- **Quick Navigation Hub**: One-click jump cards to quickly jump into the POS terminal, active orders, or floor table view.
- **Live Recent Activity**: Tabular stream of the most recent orders showing customer/table reference, item summaries, timestamps, totals, and color-coded status badges.

### 2. 🛒 Point of Sale (POS) Terminal
- **Viewport-Locked Ergonomic Layout**: Zero annoying window scrollbars—a dedicated menu catalog on the left and a pinned, always-visible order cart on the right.
- **Menu Categorization & Search**: Real-time fuzzy search and category pills (*All, Burgers, Pizza, Fast Food, Desi & Karahi, Beverages, Desserts*).
- **Menu Pagination**: Clean pagination bar (`< 1 2 3 >`) maintaining a fixed grid height regardless of menu size.
- **Order Service Modes**:
  - **Dine-In**: Select an available table from the dynamic restaurant floor.
  - **Takeaway**: Collect walk-in customer name and phone number.
  - **Delivery**: Capture customer name, phone number, and physical delivery address.
- **Dynamic Cart & Bill Calculation**: Real-time item additions, increment/decrement controls, quick remove, subtotal calculation, configurable sales tax (GST), and custom kitchen prep notes.
- **Discount Presets**: Quick discount chips (`0%`, `5%`, `10%`, `15%`) plus a custom cash discount input.
- **Checkout & Tender Modal**:
  - Payment method selector: **Cash**, **Credit/Debit Card (POS)**, or **Online Wallet / UPI**.
  - Cash payment assistant: Quick tender buttons (`Exact`, `+100`, `+500`, `+1,000`, `+5,000`).
  - Real-time Change Due calculator with validation preventing under-tendered checkout.
  - Automatic dining table occupancy lock upon order placement.

### 3. 🍳 Orders & Kitchen Display System (KDS)
- **Dual View Modes**:
  - **List View**: Detailed tabular view displaying Order ID, Service Type / Customer, Items Summary, Time, Payment Method, Total, and interactive Status dropdown.
  - **Kitchen Board (KDS View)**: Visual Kanban-style kitchen cards designed for chefs and line cooks.
- **Kitchen Card Interactions**:
  - **Click-to-Prep Strike-through**: Tap any food item row to mark it prepared with a visual strike-through.
  - **Kitchen Status Transitions**: Single-click workflow progression (`Start Prep` → `Mark Ready` → `Deliver & Settle`).
  - **Urgency Time Tracking**: Real-time elapsed time counters (`Just now`, `Xm ago`) with automated visual warnings:
    - Normal (< 10 minutes)
    - **Urgent / Warning** (10–19 minutes elapsed)
    - **Late Alert** (20+ minutes elapsed)
- **Automatic Table Settle & Release**: When an order is completed/delivered or cancelled, the associated dining table is automatically freed if no other active orders remain.
- **Search & Filter Bar**: Filter by status (`All`, `Pending`, `Preparing`, `Ready`, `Delivered`, `Cancelled`) or search by Order ID, Table, Customer Name, or Dish.

### 4. 🍔 Menu Management (Full CRUD)
- **Create & Edit Dishes**: Modal form to add or modify items with Dish Name, Category, Price, Description, and Image URL.
- **Live Stock Toggles**: Easily flip dishes between **In Stock** and **Out of Stock** with one click. Out-of-stock dishes are disabled from being added in the POS.
- **Category Filter Tabs**: Quickly isolate items by category for editing or deletion.
- **Image Fallbacks**: Robust image fallback logic ensuring pleasant visual placeholders if external image links fail to load.

### 5. 🪑 Floor & Table Management
- **Floor Seating Overview**: Visual cards for every table displaying table name, seat capacity, status badge, and quick action buttons.
- **Real-Time Summary Counters**: Available, Occupied, Reserved, and Total table counts.
- **Active Table Session Inspector**: Click an occupied table to inspect the active dining bill, item breakdown, subtotal, tax, and grand total.
- **Direct Settle & Free**: Settle guest bills directly from the table modal, updating the order to delivered and restoring table availability.
- **POS Direct Link**: Tap `+ New Order` on any available table to jump directly to POS with that table pre-selected.
- **Dynamic Table CRUD**: Modal dialog to add new tables with custom names and seat counts, plus table deletion controls.
- **Status Cycle Toggle**: Rapidly cycle table state (`Available` → `Occupied` → `Reserved`).

### 6. 📈 Sales Analytics & Reports
- **Time Window Filtering**: Toggle between **Last 7 Days (Weekly)** and **Last 30 Days (Monthly)**.
- **Key Performance Indicators**: Total Delivered Revenue, Total Delivered Orders, and Average Order Value (AOV).
- **Interactive SVG Charts**:
  - **Revenue by Day**: Dynamic bar chart showing revenue trajectory.
  - **Order Volume by Day**: Visual distribution of daily order counts.
- **Payment Method Distribution**: Revenue and volume breakdown across **Cash**, **Card / POS**, and **Online / UPI** with visual fill bars.
- **Category Sales Breakdown**: Revenue performance across menu categories (*Burgers, Pizza, Beverages, etc.*).
- **Top Selling Leaderboard**: Ranked best-sellers featuring distinct gold, silver, and bronze rank badges, sales counts, total revenue, and percentage progress bars.

### 7. 🧾 Thermal Invoice & Receipt Generator
- **Print-Optimized Receipt Modal**: Formatted to standard 80mm / 58mm thermal receipt printer dimensions.
- **Comprehensive Receipt Details**:
  - Restaurant branding, branch address, and phone number.
  - Order ID, Service Type (Dine-In / Takeaway / Delivery), Table Number, and Customer details.
  - Itemized table with quantities, unit prices, and line totals.
  - Financial summary: Subtotal, Discount, Tax %, and Grand Total.
  - Payment details: Method used, Cash Tendered, and Change Due.
  - Simulated vector barcode with standardized alphanumeric invoice code.
  - Kitchen preparation notes and cordial footer message.
- **Dedicated Print Engine**: Standalone popup print driver (`window.open`) with custom `@media print` CSS for clean physical printing or PDF saving.

### 8. ⚙️ Settings, Currency & Backup
- **Restaurant Profile**: Configure Restaurant Name, Address, Contact Number, Tax Rate (GST %), and Currency Symbol (e.g. `PKR`, `USD`, `EUR`, `GBP`, `INR`).
- **One-Click JSON Database Export**: Download the entire application state (menu, tables, orders, settings) into a portable, timestamped `.json` file.
- **JSON Database Import / Restore**: Upload any previously exported backup with automated format validation and confirmation.
- **Factory Reset**: Instant option to wipe data and reload initial demo seed items, tables, and sample order history.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies & Tools |
|---|---|
| **Structure** | Semantic HTML5, accessible modal dialogs, SVG icons |
| **Styling** | Vanilla CSS3, CSS Custom Properties (Variables), Flexbox, CSS Grid, `@media print` rules |
| **Logic & State** | Vanilla JavaScript (ES6+), Modular Architecture, DOM Manipulation |
| **Persistence** | Browser `Window.localStorage` API with generic CRUD wrapper |
| **Typography** | Google Fonts ([Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) & [Inter](https://fonts.google.com/specimen/Inter)) |
| **Bundlers / Deps** | **None!** Zero build steps, zero node dependencies, zero backend required |

---

## 📂 Project Directory Structure

```text
restaurant-management-system/
│
├── index.html            # Main Single-Page Application container & modal definitions
│
├── css/                  # Modular View Stylesheets
│   ├── style.css         # Design tokens, CSS variables, typography, buttons, modals & toasts
│   ├── sidebar.css       # Navigation sidebar, brand header & mobile drawer styling
│   ├── dashboard.css     # KPI stat cards, weekly revenue charts & quick actions
│   ├── pos.css           # POS viewport layout, menu pagination, cart & checkout modal
│   ├── orders.css        # Orders list table, status pills & Kitchen Display System (KDS)
│   ├── menu.css          # Menu grid, dish cards, stock toggles & CRUD forms
│   ├── tables.css        # Restaurant floor grid, seating badges & session inspector
│   ├── analytics.css     # Sales charts, category/payment breakdown bars & top item ranks
│   ├── settings.css      # Profile settings, tax controls & database backup actions
│   └── invoice.css       # Printable thermal receipt formatting & print styles
│
├── js/                   # Modular JavaScript Application Logic
│   ├── storage.js        # Generic LocalStorage CRUD wrapper helper
│   ├── data.js           # Seed data generator for initial menu, tables & sample orders
│   ├── dashboard.js      # Dashboard metrics calculation, SVG charting & recent activity
│   ├── pos.js            # POS catalog, search/pagination, cart, discount & payment logic
│   ├── orders.js         # Order tracking, KDS board, urgency timers & auto table release
│   ├── menu.js           # Menu CRUD operations, stock availability & category filtering
│   ├── tables.js         # Floor plan manager, active dining session inspector & settle logic
│   ├── analytics.js      # Sales reporting, date filtering, SVG charts & breakdown bars
│   ├── settings.js       # App configuration, JSON database backup export & import
│   ├── invoice.js        # Receipt rendering, barcode generation & printable window handler
│   └── app.js            # SPA view router, active states & global toast notifications
│
└── README.md             # Project documentation and user guide
```

---

## 🚀 Quick Start & How to Run

Because this project uses standard browser technologies, **no `npm install` or local server is mandatory**.

### Method 1: Direct Browser Launch (Fastest)
1. Clone or download this repository:
   ```bash
   git clone https://github.com/Muhammad-sami-khan/Restaurant-Management-System-POS-Dashboard.git
   ```
2. Navigate to the project directory.
3. Double-click **`index.html`** or right-click and choose **Open With > Google Chrome** (or Edge, Firefox, Brave, Safari).

### Method 2: Visual Studio Code Live Server (Recommended)
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension by *Ritwick Dey* from the Extensions view (`Ctrl + Shift + X`).
3. Right-click `index.html` and select **"Open with Live Server"**.
4. The application will launch at `http://127.0.0.1:5500/index.html` with instant live-reload upon any code edits.

---

## 💡 Architectural Highlights

- **Pure Single-Page Application (SPA)**: Navigation transitions happen instantaneously via client-side DOM switching without full page reloads.
- **Viewport Lock on POS**: Prevents awkward double scrollbars during rush-hour cashier operations. The menu panel and cart panel fit cleanly within the viewport height, with internal scrolling isolated to item lists.
- **Decoupled Data Architecture**: State is mediated through `Storage` (`js/storage.js`), decoupling UI rendering from storage keys and allowing easy future swaps to REST APIs, Firebase, or IndexedDB.
- **Pure SVG Charting**: Visual bar charts and revenue trends are rendered using lightweight, inline SVG elements generated via JavaScript, eliminating the need for heavy external charting packages like Chart.js.

---

## 🔮 Future Roadmap

- [ ] Kitchen audio sound alerts when new orders arrive.
- [ ] User role authentication (Cashier, Waitstaff, Chef, Admin) with permissions.
- [ ] Direct thermal Bluetooth / USB ESC/POS printer driver integration.
- [ ] Multi-branch management support.
- [ ] Backend API sync (Node.js/Express or Python/Django with PostgreSQL/MongoDB).

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use it for personal learning, educational projects, or commercial customization.
