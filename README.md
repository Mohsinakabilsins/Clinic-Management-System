# ClinicQ 2.0 — Premium MERN Clinic Operations Platform

ClinicQ 2.0 is a polished, full-stack MERN clinic operating system built around the original ClinicQ concept.

## What is included

- Premium responsive dashboard with full design system
- JWT authentication with admin, receptionist and doctor roles
- Multi-screen operations workspace
- Real-time Socket.IO queue
- Reception patient registration and token generation
- Doctor queue console with call, start and complete flow
- Public patient live queue page
- Appointment calendar / day schedule
- Team and doctor management
- Analytics dashboard with KPI cards and visual charts
- Daily operational reports and CSV export
- Notifications center
- Clinic settings and queue controls
- MongoDB / Mongoose backend
- Seeded demo data
- Clinic-isolated access control

## Run in VS Code

Requirements: Node.js 18+ and MongoDB.

```bash
npm install
npm run install:all
```

Copy:

```text
backend/.env.example -> backend/.env
```

Seed the demo:

```bash
npm run seed
```

Run everything:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@clinicq.com | Admin123! |
| Reception | reception@clinicq.com | Reception123! |
| Doctor | doctor@clinicq.com | Doctor123! |

## Product structure

```text
clinicq-2.0/
├── backend/
│   └── src/
│       ├── models/
│       ├── routes/
│       ├── middleware/
│       ├── utils/
│       └── server.js
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── api.js
        └── App.jsx
```
