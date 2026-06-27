# Furniture Estimation Web App

A professional web-based estimation calculator for furniture manufacturing — wardrobes, beds, and custom furniture. Calculates material, labor, hardware, and overheads to generate quotations.

## Features

- **Material Module** — Dynamic dimension inputs with brand/thickness/type selectors for body, doors, and backing panels
- **Wardrobe Logic** — 2/3/4 door configurations with component area calculations
- **Bed Logic** — King/Queen standard sizes with custom override and cushion headboard toggle
- **Labor Engine** — Automatic 45% of material cost, split into Cutting (15%), Edge Banding (15%), Assembling (15%)
- **Final Pricing** — Optional 18% GST toggle and margin/discount percentage
- **Admin Panel** — Edit material rates, hardware prices, and company details without code changes
- **Client View** — Toggle to hide internal labor breakdown for customer-facing presentations
- **PDF Export** — Download professional quotations via jsPDF

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS v4
- **Backend:** Node.js + Express
- **Storage:** JSON config files (easily swappable for a database)

## Product Catalog

Board materials and hardware follow the manufacturing catalog:

| Category | Options |
|----------|---------|
| Box Board (17mm) | Century, Merino, Panalex, K-board |
| Door Board (17mm) | Century, Merino, Panalex, K-board, UV-Finish |
| Backing Board (9mm) | Century, K-board |
| Multiwood | 17mm, 12mm, 4mm |
| Hardware | L-clamps, Edge band, Locks, Hinges, Bushes, Sliders, Handles, Misc |

All rates are editable in the **Admin** panel without code changes.

## Getting Started

```bash
# Install all dependencies
npm install
cd server && npm install
cd ../client && npm install
cd ..

# Run development (both server + client)
npm run dev
```

- **Estimation Dashboard:** http://localhost:5173
- **API Server:** http://localhost:3001

## Production Build

```bash
npm run build
npm start
```

## Calculation Order

1. Material Cost (area × rate per sq.ft)
2. Labor Cost (45% of material)
3. Hardware + Transport + Installation
4. Subtotal
5. GST (18%, optional)
6. Margin/Discount (applied last)

## Project Structure

```
├── client/          React frontend
│   └── src/
│       ├── components/   UI components
│       └── utils/        Calculation engine & PDF export
├── server/          Express API
│   └── data/        JSON config (materials, hardware)
└── package.json     Root scripts
```
