# Evarti Camera Rental

Evarti Camera Rental is an internal, responsive web app for managing camera
rentals at Evarti's Cafe and Event locations. It gives the owner and cashiers a
single place to create rental transactions, calculate charges, print thermal
receipts, and review transaction history. The interface is designed for phones,
tablets, and desktop screens.

This is an operations tool for Evarti staff, not a public customer booking
website. Customers do not book or pay through the site.

## What it does

- **Role-based staff access:** Owner, Cashier 1, and Cashier 2 sign in with
  separate accounts. Cashier 1 is assigned to Cafe, Cashier 2 to Event, and the
  owner can choose a location.
- **Camera catalog:** Owners can add, edit, deactivate, reactivate, and delete
  cameras, update their one- and two-hour rental prices, and upload camera
  photos. Cashiers see active products only.
- **Rental transactions:** Create a transaction with one or more cameras,
  individual rental durations, optional add-ons, and manual pricing for rentals
  longer than two hours. The app calculates end times, totals, cash change, and
  validates prices on the server.
- **Add-on catalog:** Select optional property items, photographer packages,
  photo prints, and file-transfer methods. Owners can change add-on names and
  prices, activate/deactivate options, add new options, or delete them.
  File-transfer prices come from the catalog; the seeded options are not all
  free.
- **Receipts:** Preview, print, and reprint customer receipts on 58 mm thermal
  paper, or print an admin order copy. Selected add-ons and their prices appear
  on the receipt.
- **Transaction history:** Cashiers can access and verify QRIS payments for
  their own transactions; owners can review all transactions, verify QRIS
  payments, void transactions with a reason, and review business reports.
- **Reports:** Owners can view daily, weekly, and monthly summaries and download
  a PDF report.
- **Data snapshots:** Product names and prices are saved with each transaction,
  so later catalog edits or deletions do not change existing receipts.
- **Owner catalog management:** Owners can create, update, activate/deactivate,
  and delete cameras and add-ons. Camera photos can also be uploaded or replaced.

### QRIS payments

QRIS payments are recorded and verified manually. An official DANA QR asset is
not included, so the app does not generate or display a fake payment QR code.

## Technology

- **Frontend:** React 18, Vite, and Lucide icons
- **Backend:** Node.js, Express, and SQLite (`better-sqlite3`)
- **Validation:** Zod
- **API tests:** Node.js Test Runner and Supertest

## Requirements

- Node.js 20 or newer
- npm

## Run locally

From the repository root, create the backend environment file:

```sh
cp back-end/.env.example .env
```

Edit `.env` before starting the app:

- Set `SESSION_SECRET` to a random value of at least 32 characters. For example:

  ```sh
  openssl rand -base64 48
  ```

- Set unique passwords of at least 12 characters for `OWNER_PASSWORD`,
  `CASHIER1_PASSWORD`, and `CASHIER2_PASSWORD`.
- Do not commit `.env` or share its contents.

Install dependencies and start both the API and frontend:

```sh
npm install
npm run dev
```

Open the frontend URL shown by Vite (usually
[`http://localhost:5173`](http://localhost:5173)). The API runs at
[`http://localhost:3000`](http://localhost:3000), and Vite proxies frontend API
requests to it.

The initial login usernames are:

| Role | Username | Password environment variable |
|---|---|---|
| Owner | `owner` | `OWNER_PASSWORD` |
| Cashier 1 | `kasir1` | `CASHIER1_PASSWORD` |
| Cashier 2 | `kasir2` | `CASHIER2_PASSWORD` |

The backend creates its SQLite database and seeds the initial camera and
add-on catalogs on first launch. Changing password variables after the
database has been initialized does not change existing account passwords.
Cashier 1 is restricted to Cafe transactions and Cashier 2 to Event transactions;
the API enforces these location assignments.

### Run frontend and backend separately

Run these commands in separate terminals from the repository root:

```sh
npm run dev:backend
npm run dev:frontend
```

The frontend development server proxies API calls to `http://localhost:3000`.
Set `VITE_API_URL` in `Front-end/.env` only when the API is hosted on a
different origin.

## Tests and production build

Run the backend API tests:

```sh
npm test
```

Build the frontend:

```sh
npm run build
```

## Configuration

The backend reads `.env` from the repository root, or from `back-end/.env` if a
root `.env` is not present.

| Variable | Purpose | Default |
|---|---|---|
| `NODE_ENV` | Runtime mode | `development` |
| `PORT` | API port | `3000` |
| `DATABASE_PATH` | SQLite database file | `./.data/evarti.sqlite` |
| `SESSION_SECRET` | Random session secret, at least 32 characters | Required |
| `FRONTEND_ORIGIN` | Allowed frontend origin(s), comma-separated | `http://localhost:5173` |
| `COOKIE_SECURE` | Send session cookies only over HTTPS | `false` |
| `OWNER_PASSWORD` | Initial owner password | Required |
| `CASHIER1_PASSWORD` | Initial Cashier 1 password | Required |
| `CASHIER2_PASSWORD` | Initial Cashier 2 password | Required |

For production, use HTTPS, set `NODE_ENV=production` and `COOKIE_SECURE=true`,
use strong credentials and a random session secret, and set `FRONTEND_ORIGIN`
to the deployed frontend domain. If the frontend and API use different origins,
set `VITE_API_URL` in `Front-end/.env` and allow the frontend origin in the
backend configuration.

## Project structure

```text
.
├── Front-end/
│   ├── public/evarti-logo.png
│   └── src/
│       ├── services/api.js
│       ├── App.jsx
│       └── styles.css
├── back-end/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.js
│   │   ├── db.js
│   │   └── server.js
│   ├── tests/
│   └── uploads/            # Camera images and private guarantee photos
├── .data/                  # SQLite database (default path)
├── PRD-evarti.md
├── README-hosting.md
├── package.json
└── README.md
```

Transactions are append-only in the application: saved transactions cannot be
edited or deleted; an Owner can void one with a reason. Camera and add-on
catalog changes do not rewrite transaction snapshots.

The SQLite database, `.env`, camera images, and private guarantee photos contain
operational or sensitive data. Keep the database and uploads persistent across
deployments, back them up securely, and do not expose the upload directories
through the web server.
