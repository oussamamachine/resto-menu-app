# Resto Menu App

A QR-code-based restaurant menu and ordering system. Each table gets its own QR code customers scan it, browse the menu, and place their order directly from their phone. Staff see incoming orders on a live dashboard and mark them done as they go.

No app install required on the customer side, no separate POS terminal on the staff side.

## Demo

[Watch the demo video](records/rDemoQr.mp4) covers the full customer flow (scan → browse → order) and the admin dashboard receiving and managing orders in real time.

## Features

**Customer**

- Scan a table QR code to open the menu instantly
- Browse by category with images and descriptions in 5 languages (EN, FR, ES, AR, DE)
- Add items to cart, adjust quantities, and submit with name, table number, and any notes

**Admin**

- Live order dashboard — updates via Socket.IO with a 5-second polling fallback
- Menu management: create, edit, and delete items; upload images or paste a URL
- QR code generator: build per-table QR codes ready to download and print

## Tech Stack

| Layer    | Stack                                             |
| -------- | ------------------------------------------------- |
| Frontend | React 18, Vite, React Router, Axios, Tailwind     |
| Backend  | Node.js, Express, MongoDB (Mongoose), Socket.IO   |
| Other    | Multer (uploads), QRCode.js, key-based admin auth |

## Setup

**Requirements:** Node.js 16+, MongoDB (local or Atlas)

```bash
git clone https://github.com/oussamamachine/resto-menu-app
cd qr-menu-demo
npm install          # root deps
npm run install-all  # server + client deps
```

Create `server/.env`:

```env
MONGO_URI=mongodb://localhost:27017/qr-menu
ADMIN_KEY=your-secret-key
CLIENT_URL=http://localhost:3000
PORT=5000
```

## Running

```bash
npm run dev   # both servers via concurrently
```

Or separately:

```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && npm start
```

| Role     | URL                                            |
| -------- | ---------------------------------------------- |
| Customer | `http://localhost:3000/menu/sunrise-cafe`      |
| Admin    | `http://localhost:3000/dashboard/sunrise-cafe` |

On first run the DB seeds itself with a sample restaurant (Sunrise Café) and 21 menu items across 4 categories.

## Project Structure

```
qr-menu-demo/
├── server/
│   ├── server.js        # Express entry point
│   ├── db.js            # Mongoose connection + seed data
│   ├── models/          # Restaurant, MenuItem, Order
│   └── routes/          # menu, orders, restaurant, upload
│
└── client/
    └── src/
        ├── pages/       # MenuView, CartPage, Dashboard, MenuManagement, QRCodeGenerator
        ├── components/  # OrderCard, LanguageSelector
        ├── i18n/        # translations (5 languages) + LanguageContext
        └── lib/api.js   # axios instance
```

## API

| Method | Route                        | Auth  | Description               |
| ------ | ---------------------------- | ----- | ------------------------- |
| GET    | `/api/restaurant?slug=`      | —     | Restaurant info + QR code |
| GET    | `/api/menu?slug=`            | —     | All available menu items  |
| POST   | `/api/orders`                | —     | Place an order            |
| GET    | `/api/orders?slug=&key=`     | admin | List orders               |
| PATCH  | `/api/orders/:id?key=&slug=` | admin | Update order status       |
| DELETE | `/api/orders/:id?key=&slug=` | admin | Remove an order           |
| POST   | `/api/upload?key=&slug=`     | admin | Upload item image         |

## Deployment

**Backend (Render / Railway)**

Set env vars `MONGO_URI`, `ADMIN_KEY`, `CLIENT_URL`, then deploy from `main`.

**Frontend (Vercel / Netlify)**

Build command: `npm run build` — output dir: `dist` — add env var `VITE_API_BASE=https://your-backend.com`.

## Notes

- Admin auth is a plain key in `.env` works fine for a demo, but use proper JWT + bcrypt before going to production
- CORS is wide open by default; lock it down with `ALLOWED_ORIGINS` in env

## Contributing

```bash
git checkout -b feature/add-order-filter
# make your changes
git commit -m "feat: add order filtering to dashboard"
git push origin feature/add-order-filter
# open a pull request
```

## Author

**Oussama Machine**
