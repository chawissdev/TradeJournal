# TradeJourney

Trading journal & analytics dashboard. Next.js 14 + Tailwind + Supabase (Postgres) + Prisma.

## Theme

Clean white surfaces, blue primary (`#2563EB`), green for wins, red for losses — matches the reference mockup.

## Stack (all free tier)

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind
- **UI**: lucide-react icons, custom components
- **Charts**: Recharts
- **DB + Auth**: Supabase (Postgres, 500MB free, unlimited auth users)
- **ORM**: Prisma
- **Hosting**: Vercel (Hobby plan — free)

## Quick start

```bash
# 1. Install deps
npm install

# 2. Configure env
cp .env.example .env
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# DATABASE_URL, DIRECT_URL from your Supabase project

# 3. Push schema to Supabase
npx prisma db push
npx prisma generate

# 4. Run dev server
npm run dev
```

Open http://localhost:3000

## Deploy to production (free)

### Supabase setup
1. Create project at https://supabase.com (free tier)
2. Copy connection strings from Project Settings → Database
3. Copy anon key from Project Settings → API
4. In SQL Editor, enable Row Level Security on all tables after `prisma db push`

### Vercel deploy
```bash
npm i -g vercel
vercel
```
Add the four env vars from `.env.example` in the Vercel dashboard.

## Project structure

```
app/
  layout.tsx          # root layout, fonts, globals
  page.tsx            # /  Dashboard
  globals.css         # Tailwind + base styles
components/
  Sidebar.tsx         # left nav + account balance
  TopBar.tsx          # filters, notifications, Add account button
  StatCard.tsx        # NET P&L, win rate, AVG cards with sparkline
  SessionsPanel.tsx   # London / NY / Asia / Outside session breakdown
  CalendarPanel.tsx   # monthly P&L calendar with $ / % toggle
lib/
  prisma.ts           # singleton Prisma client
  supabase.ts         # browser + server Supabase clients
  utils.ts            # cn(), formatCurrency, formatPercent
prisma/
  schema.prisma       # User, Account, Trade, JournalEntry models
```

## MVP roadmap

- [x] Dashboard with stats cards + sessions + calendar
- [ ] Trade Log CRUD (`/trades`)
- [ ] Auth flow (Supabase magic link)
- [ ] Account switcher (multi-account)
- [ ] Daily Journal editor
- [ ] Reports + CSV export
- [ ] Backtesting module

## Replacing mock data

Mock series in `app/page.tsx` and `components/CalendarPanel.tsx` should be replaced with queries:

```ts
// Example server component query
import { prisma } from "@/lib/prisma";

const stats = await prisma.trade.aggregate({
  where: { accountId, entryAt: { gte: monthStart } },
  _sum: { pnl: true },
  _count: true,
});
```
