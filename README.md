# Tukuaplikasi Admin Frontend

Admin dashboard built with Next.js and Tailwind CSS.

## Features

- User authentication (login/register)
- User management (list, edit, delete, role management)
- Product management (CRUD with image/file upload)
- Category management (CRUD)
- Payment approval (view pending payments, approve/reject)

## Setup

1. Install dependencies:
```bash
yarn install
```

2. Create `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8081/api
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Pages

- `/login` - Admin login page
- `/dashboard` - Main dashboard
- `/dashboard/users` - User management
- `/dashboard/products` - Product management
- `/dashboard/categories` - Category management
- `/dashboard/payments` - Payment approval
