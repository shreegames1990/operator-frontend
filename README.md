# Operator Monorepo

This is a monorepo containing the Operator frontend applications.

## Structure

```
operator-frontend/
├── apps/
│   ├── user-frontend/     # User-facing frontend (port 3001)
│   └── admin-frontend/    # Admin panel (port 3002)
├── packages/
│   └── shared/            # Shared utilities, types, and components
└── package.json           # Root workspace configuration
```

## Getting Started

### Install Dependencies

```bash
bun install
```

### Development

Run both frontends:
```bash
bun run dev
```

Run user frontend only:
```bash
bun run dev:user
```

Run admin frontend only:
```bash
bun run dev:admin
```

## Applications

### User Frontend (`apps/user-frontend`)
- Port: 3001
- Public-facing application for users to play games
- Accessible at `http://localhost:3001`

### Admin Frontend (`apps/admin-frontend`)
- Port: 3002
- Admin panel with role-based access control
- Only accessible to users with `ADMIN` role
- Accessible at `http://localhost:3002`

## Authentication

Both applications use wallet-based authentication via Web3Modal/Wagmi. The admin panel checks for the `ADMIN` userType in the user data returned from the login API.

## Shared Package

The `@operator/shared` package contains:
- Wallet provider configuration
- API utilities (`walletLogin`, `getGameToken`, `getUsersList`, game CRUD operations)
- Type definitions (`UserType`, `UserData`, `Game`, etc.)

## Environment Variables

Both applications require:
- `NEXT_PUBLIC_API_BASE_URL` - Backend API base URL (default: `http://localhost:3000`)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID (get one at https://cloud.walletconnect.com)

User frontend also requires game-related environment variables (see `apps/user-frontend/.env.example` if available).

Create a `.env.local` file in the root directory or in each app directory with these variables. See `.env.example` for reference.
