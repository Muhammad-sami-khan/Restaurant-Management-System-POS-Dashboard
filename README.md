# 🍽️ Smart Restaurant Management System & POS Dashboard

> A clean, responsive, and easy-to-use web-based Restaurant Point of Sale (POS) and Management System built using pure **HTML5, CSS3, and Vanilla JavaScript**.

---

## 📌 Project Overview

Hey there! 👋 This is a **Restaurant Management & POS System** created as a front-end web project. The goal of this project is to simulate how real-world restaurants handle their day-to-day operations—from taking customer orders at the counter to managing dining tables, tracking menu items, and viewing sales analytics.

The best part? **No complicated backend or database setup is needed!** Everything runs smoothly right inside the browser using `localStorage`, meaning your data persists even if you refresh or close the page.

---

## ✨ Key Features

Here is a breakdown of what this project can do:

### 1. 📊 Interactive Dashboard
- **Quick Business Stats**: View today's total revenue, order count, active tables, and average order value at a glance.
- **Recent Orders**: Quickly see incoming orders and their current status.
- **Top Selling Items**: Highlights popular dishes to see what customers love most.

### 2. 🛒 Point of Sale (POS) Terminal
- **Visual Food Menu**: Filter items by category (Burgers, Pizza, Drinks, Desserts, etc.) with real-time search.
- **Dynamic Cart**: Add items, increase/decrease quantities, or remove items with automatic bill calculation.
- **Order Types**: Choose between **Dine-In** (assign a table), **Takeaway**, or **Home Delivery**.
- **Discounts & Taxes**: Automatically calculates subtotal, configurable tax (GST), and discounts.
- **Instant Checkout**: Places orders and immediately generates a printable customer invoice.

### 3. 📋 Order Management
- View all placed orders in real-time.
- Filter orders by status: `Pending`, `Preparing`, `Ready`, `Completed`, or `Cancelled`.
- Update the progress of any order as kitchen staff prepares food.
- View and reprint previous invoices whenever needed.

### 4. 🍔 Menu Management (CRUD)
- **Add New Items**: Easily add food items with name, category, price, description, and image URL.
- **Edit & Delete**: Update prices or details of existing dishes.
- **Stock Availability**: Toggle items between *In Stock* and *Out of Stock* to disable them on the POS.

### 5. 🪑 Table Management
- Visual floor plan showing restaurant tables (e.g., Table 1 to 12).
- Real-time status indicators: **Available** (Green), **Occupied** (Red), and **Reserved** (Orange).
- Seat capacity indicators and quick status toggle buttons.

### 6. 📈 Sales Analytics & Reports
- Summary of total revenue and sales trends.
- Category-wise sales breakdown to see top-performing categories.
- Payment method distribution (Cash, Card, Online).

### 7. 🧾 Printable Invoice & Receipts
- Clean receipt modal designed like a real thermal cash register bill.
- One-click print function (`Ctrl + P` / browser print) formatted specifically for receipts.

### 8. ⚙️ Settings & Data Control
- Customize Restaurant Name, Address, Contact Info, and Tax Rates.
- Choose your preferred currency (PKR, USD, EUR, GBP, INR, etc.).
- **Backup & Reset**: Export data as JSON, import previous backups, or reset to sample demo data anytime.

---

## 🛠️ Built With (Tech Stack)

This project is built from scratch without heavy frameworks or libraries to keep it lightweight, fast, and easy for students/beginners to learn:

- **HTML5**: Semantic structure and accessible modal dialogs.
- **CSS3**: Modern styling, custom CSS variables, responsive grid & flexbox layouts, smooth transitions, and mobile drawer sidebar.
- **Vanilla JavaScript (ES6+)**: Clean, modular code structure handling state management, calculations, DOM manipulation, and routing.
- **Browser LocalStorage**: Persistent client-side data storage without needing a SQL/NoSQL database server.
- **Google Fonts**: Inter typography for a modern, sleek UI.

---

## 📂 Folder Structure

```text
restaurent-management-system/
│
├── index.html            # Main Single Page Application (SPA) container
│
├── css/                  # Modular Stylesheets
│   ├── style.css         # Base styles, variables, typography, modals & toasts
│   ├── sidebar.css       # Navigation sidebar & mobile hamburger menu
│   ├── dashboard.css     # Dashboard cards, widgets & quick stats
│   ├── pos.css           # POS catalog grid, search & shopping cart
│   ├── orders.css        # Order list tables & status badges
│   ├── menu.css          # Menu items cards & management modals
│   ├── tables.css        # Table layout grid & status cards
│   ├── analytics.css     # Sales reports & visual summary cards
│   ├── settings.css      # System configuration form styles
│   └── invoice.css       # Printable thermal receipt formatting
│
├── js/                   # Modular JavaScript Logic
│   ├── storage.js        # LocalStorage CRUD wrapper helper
│   ├── data.js           # Default seed menu items, tables & sample orders
│   ├── dashboard.js      # Dashboard metrics & recent activity logic
│   ├── pos.js            # POS cart, item selection, tax & checkout handling
│   ├── orders.js         # Order tracking, status updates & filtering
│   ├── menu.js           # Menu CRUD (Add, Edit, Delete, Toggle Stock)
│   ├── tables.js         # Table status management
│   ├── analytics.js      # Sales reporting & revenue calculations
│   ├── settings.js       # App settings & data export/import handler
│   ├── invoice.js        # Receipt rendering and print handler
│   └── app.js            # App router, global modal/toast helpers & init
│
└── README.md             # Project documentation (You are here!)
```

---

## 🚀 How to Run the Project Locally

No installation (`npm install`) or local server setup is strictly required! You can run it directly:

### Option 1: Direct in Browser (Easiest)
1. Download or clone this repository.
2. Open the project folder on your computer.
3. Double-click **`index.html`** or right-click and choose **Open with > Google Chrome** (or any modern browser like Edge, Firefox, Brave).

### Option 2: Using VS Code Live Server (Recommended)
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension (by *Ritwick Dey*) from the VS Code Extensions tab (`Ctrl + Shift + X`).
3. Right-click `index.html` and click **"Open with Live Server"**.
4. Your browser will automatically open at `http://127.0.0.1:5500/index.html` with live-reloading enabled.

---

## 💡 What I Learned Building This Project

This project covers key practical web development concepts for students:
1. **Single Page Application (SPA) Architecture**: Switching views smoothly with JavaScript without reloading the web page.
2. **State & Storage Management**: Reading and writing structured JSON data to `localStorage` to create a complete CRUD system.
3. **Component-Based CSS**: Splitting CSS into dedicated, maintainable files for each screen.
4. **Calculations & Business Logic**: Accurately calculating dynamic totals, item quantities, discounts, and percentage taxes.
5. **Print Styling**: Using `@media print` rules to create receipt invoices suitable for physical thermal printing.

---

## 🔮 Future Improvements

Here are a few ideas to expand this project further:
- [ ] Connect to a backend server (Node.js/Express + MongoDB or Python/Django + PostgreSQL).
- [ ] Add Kitchen Display System (KDS) with live audio alerts for new orders.
- [ ] User role authentication (Cashier vs Admin vs Kitchen Staff).
- [ ] Barcode / QR Code generation on receipts for invoice verification.

---



