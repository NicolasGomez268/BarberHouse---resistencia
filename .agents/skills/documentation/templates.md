# Documentation Templates

This file defines canonical documentation templates derived from existing project documentation.
All AI-generated documentation must follow these templates unless explicitly overridden.

---

# Project Technical Documentation Template

## Title

<Project Name>

---

## Overview

<Concise technical summary of the system architecture and purpose>

- System type: <e.g., E-commerce platform, API service, internal tool>
- Architecture: <frontend/backend/serverless/monolith/microservices>
- Primary responsibilities:
  - <Responsibility 1>
  - <Responsibility 2>

---

## Production URL

<Production URL if applicable>

---

## Technology Stack

### Frontend

- <Framework and version>
- <Build tool>
- <Routing library>
- <SDKs and integrations>
- <State management and UI utilities>

### Backend

- <Runtime and version>
- <Framework>
- <Database>
- <Storage>
- <Authentication provider>

### Infrastructure

- <Hosting>
- <Security rules system>
- <CI/CD or deployment platform>

---

## Project Structure

```text
<project-root>/
├── src/
│   ├── components/          # UI components
│   ├── views/               # Page-level components
│   ├── services/            # API clients and external integrations
│   ├── config/              # Configuration files
│   ├── contexts/             # State management
│   ├── middleware/           # Client-side middleware
│   ├── styles/               # Stylesheets
│   ├── types/                # TypeScript types
│   ├── constants/            # Static constants
│   ├── utils/                # Utilities
│   └── main.tsx               # Application entry point
│
├── functions/                # Backend source
│   ├── src/
│   │   ├── controllers/      # HTTP handlers
│   │   ├── services/          # Business logic
│   │   ├── repositories/      # Data access layer
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Auth middleware
│   │   ├── config/             # Backend configuration
│   │   ├── types/              # Backend TypeScript types
│   │   └── index.ts             # Function exports
│   └── lib/                    # Compiled output
│
├── docs/                      # Documentation
├── public/                    # Static assets
├── dist/                      # Frontend build output
├── firebase.json               # Firebase configuration
├── firestore.rules              # Firestore security rules
├── storage.rules                # Cloud Storage security rules
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies
```

## Key Features

<Feature Group Name>

- <Feature 1>

- <Feature 2>


## Authentication & Authorization

- Authentication method: <e.g., Firebase Auth>
- Authorization model: <RBAC/ABAC>
-   Roles:
    * <Role name>: <Permissions>
- Token validation mechanism: <JWT/custom claims>


## Admin Panel (if applicable)

- CRUD interfaces
- Real-time data updates
- Role management

## Frontend Features

- Product catalog with filtering
- Category-based product filtering
- Search functionality with autocomplete
- Product detail modals
- Shopping cart
- WhatsApp integration for orders

---

## Setup & Installation

### Prerequisites

- Node.js 22 or higher
- Firebase CLI
- Google Cloud account with Firebase project

### Frontend Setup

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.production

# Development server
npm run dev

# Production build
npm run build
```

### Backend Setup

```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Start Firebase emulators (local development)
npm run serve

# Deploy to production
firebase deploy --only functions
```
## Environment Configuration

### Frontend (.env.production)

```env
VITE_FIREBASE_PROJECT_ID=jcimbatibles
VITE_FIREBASE_API_KEY=<key>
VITE_FIREBASE_AUTH_DOMAIN=jcimbatibles.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=jcimbatibles.firebasestorage.app
VITE_API_URL=https://us-central1-jcimbatibles.cloudfunctions.net/api
VITE_USE_EMULATOR=false
```

### Backend (functions/package.json)

- Node.js engine: 22
- Firebase Functions runtime: Node.js 22 (1st Gen)

---

## API Endpoints

**Base URL:** `https://us-central1-jcimbatibles.cloudfunctions.net/api`

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | Required | List all products |
| GET | `/products/active` | Public | List active products |
| GET | `/products/:id` | Public | Get product details |
| POST | `/products` | Required | Create product |
| PUT | `/products/:id` | Required | Update product |
| DELETE | `/products/:id` | Required | Delete product |
| PATCH | `/products/:id/toggle` | Required | Activate/deactivate product |

### Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | Required | List all categories |
| GET | `/categories/active` | Public | List active categories |
| POST | `/categories` | Required | Create category |
| PUT | `/categories/:id` | Required | Update category |
| DELETE | `/categories/:id` | Required | Delete category |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | Required | Get current user profile |
| GET | `/users` | Admin | List all users |
| POST | `/users` | Admin | Create user |
| PATCH | `/users/:id/role` | Admin | Update user role |
| DELETE | `/users/:id` | Admin | Delete user |

## Security

### Firestore Rules

- Read access: authenticated users
- Write access: restricted by user role and document ownership
- Public read for active products and categories

### Cloud Storage Rules

- Public read access for product images
- Write access: authenticated users with admin or employee role

### Authentication

- Firebase Authentication with email/password
- Custom claims for role-based access control
- JWT token validation on all protected endpoints

---

## Database Schema

### Products Collection

```
products/
├── name (string)
├── price (number)
├── category (string)
├── imageUrl (string)
├── imageKey (string)
├── badge (string, optional)
├── sizes (string, comma-separated)
├── description (string)
├── active (boolean)
└── createdAt (timestamp)
```

### Categories Collection

```
categories/
├── name (string)
├── active (boolean)
└── createdAt (timestamp)
```

### Users Collection

```
users/
├── email (string)
├── role (string: admin | employee | user)
├── createdAt (timestamp)
└── lastLogin (timestamp)
```

---

## Deployment

### Firebase Hosting

```bash
# Build application
npm run build

# Copy compiled files to public/
cp -r dist/* public/

# Deploy to hosting
firebase deploy --only hosting
```

### Cloud Functions

```bash
# Compile TypeScript
cd functions && npm run build

# Deploy functions
firebase deploy --only functions
```

### Storage & Firestore

```bash
# Deploy all rules
firebase deploy --only storage,firestore
```

## Development Workflow

### Local Development

```bash
# Start Firebase emulators
firebase emulators:start

# In another terminal, run frontend
npm run dev
```

- Configure frontend to use emulator in `.env.development`
- Access application at `http://localhost:5173`

### Production

```bash
# Build frontend
npm run build

# Deploy to hosting
firebase deploy --only hosting

# Monitor logs in Firebase Console
```

---

## Common Tasks

### Add New Product Category

Edit `src/constants/constantIndex.ts` and add to `CurrentCategories` array.

### Upload Product Image

1. Select image in admin panel
2. Click "Subir" (Upload)
3. Image stored in `products/` directory in Cloud Storage
4. URL automatically populated in form

### Create New User with Admin Role

1. Create user in Firebase Console Authentication
2. Run `setup-user-roles.sh` to assign admin role
3. User gains access to admin panel

### Modify Security Rules

1. Edit `firestore.rules` or `storage.rules`
2. Deploy: `firebase deploy --only firestore,storage`
3. Rules effective immediately

---

## Limitations

- Maximum image file size: 5MB
- Product images stored in Cloud Storage (separate from product documents)
- Real-time sync requires active authentication
- Email/password authentication only (no OAuth providers configured)

---

## Build Information

### Frontend Build

- Bundle size: ~605 KB (190 KB gzipped)
- Build time: ~2 seconds
- Modules: 140+

### Backend Build

- TypeScript compilation to JavaScript
- Output: `functions/lib/`
- Size: ~130 KB


## Performance Notes

- React component code-splitting recommended for large bundle
- Firestore queries use composite indexes (see firestore.indexes.json)
- Cloud Storage images serve through Firebase CDN
- Static assets cached via Firebase Hosting

---

## Troubleshooting

### Port 5173 already in use

```bash
npm run dev -- --port 3000
```

### Firebase authentication fails

- Verify API key in .env.production
- Check Firebase Console → Authentication → Settings
- Ensure domain is whitelisted

### Cloud Storage upload fails

- Check storage.rules for correct role configuration
- Verify user has admin or employee role
- Confirm file size < 5MB

### Firestore queries return empty

- Check firestore.rules for read permissions
- Verify user is authenticated
- Check Firestore Console for data existence

---

## References

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Express.js Guide](https://expressjs.com)

## Test Credentials

After running the seed script, use the following credentials for testing:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | AdminPass123! |
| Employee | employee@test.com | EmpPass123! |
| Customer | customer@test.com | CustPass123! |

**Note:** Customer accounts have read-only access to active products and cannot access the admin panel.

---