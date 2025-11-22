# CLAUDE.md - FinTrack AI Assistant Guide

**Last Updated:** 2025-11-22
**Project:** FinTrack - Personal Finance Management System
**Version:** 0.1.0

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Structure](#architecture--structure)
3. [Development Guidelines](#development-guidelines)
4. [Key Technologies](#key-technologies)
5. [State Management](#state-management)
6. [Data Models](#data-models)
7. [Common Tasks](#common-tasks)
8. [File Locations Reference](#file-locations-reference)
9. [Testing & Quality](#testing--quality)
10. [Deployment](#deployment)

---

## Project Overview

### What is FinTrack?

FinTrack (project name: "manger-tool") is a comprehensive personal finance tracking web application built for Hebrew-speaking users. It enables users to:

- Track income and expenses with detailed categorization
- Import transactions from multiple file formats (CSV, Excel, JSON)
- Create and monitor budgets with alerts
- Generate financial reports and analytics
- Auto-categorize transactions using mappings
- Track specialized transactions (installment payments, electricity bills)
- Receive AI-powered financial recommendations

### Key Statistics

- **Total Source Files:** 254
- **Lines of Code:** ~5,500
- **UI Components:** 80+ (shadcn/ui based)
- **Custom Hooks:** 22+ finance-specific hooks
- **Default Categories:** 82 pre-configured categories
- **Supported Languages:** Hebrew (RTL layout)
- **Currency:** Israeli New Sheqel (₪)

### Project Philosophy

- **Hebrew-First:** All UI text, categories, and user-facing content in Hebrew with RTL layout
- **LocalStorage Persistence:** All data stored client-side, no backend required
- **Type Safety:** Strict TypeScript throughout
- **Component Modularity:** Small, focused, reusable components
- **User-Friendly:** Simple imports, auto-categorization, smart date parsing

---

## Architecture & Structure

### Directory Layout

```
/home/user/fintrack-master/
├── src/
│   ├── app/                    # Application initialization
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components (80+ files)
│   │   ├── dashboard/          # Dashboard components (8 files)
│   │   ├── transactions/       # Transaction components (10 files)
│   │   ├── budgets/            # Budget components (4 files)
│   │   ├── import/             # Import components (3 files)
│   │   └── reports/            # Report components (2 files)
│   ├── context/                # React Context & reducers
│   │   ├── FinanceContext.tsx  # Main context provider
│   │   ├── defaultValues.ts    # Default categories & settings
│   │   └── reducers/           # State reducers (8 files)
│   ├── hooks/                  # Custom React hooks
│   │   └── finance/            # Finance hooks (22+ files)
│   │       ├── income/         # Income-specific hooks
│   │       └── storage/        # Persistence hooks
│   ├── lib/                    # Utility libraries
│   │   └── utils.ts            # Common utilities
│   ├── modules/                # Feature modules
│   │   ├── core/finance/       # Core business logic
│   │   └── features/           # Optional features
│   ├── pages/                  # Route pages (7 files)
│   ├── services/               # External services
│   │   ├── dateService.ts      # Date parsing/formatting
│   │   ├── fileService.ts      # File validation
│   │   └── import/             # Import services
│   ├── stores/                 # Zustand stores
│   │   └── financeStore.ts     # Main finance store
│   ├── types/                  # TypeScript definitions
│   │   ├── index.ts            # Core types
│   │   └── finance.ts          # Finance types
│   └── utils/                  # Utility functions
│       ├── financeUtils.ts     # Finance calculations
│       └── parser/             # File parsers
│           ├── csv/            # CSV parser
│           └── excel/          # Excel parser
├── public/                     # Static assets
└── [config files]              # Build & dev configs
```

### Page Structure

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Dashboard.tsx | Financial overview, charts, summary cards |
| `/transactions` | Transactions.tsx | Transaction CRUD operations |
| `/import` | Import.tsx | File upload and bulk import |
| `/reports` | Reports.tsx | Advanced analytics |
| `/budgets` | Budgets.tsx | Budget management |
| `/settings` | Settings.tsx | App configuration |
| `*` | NotFound.tsx | 404 error page |

### Component Hierarchy

```
App
├── Navigation (bottom bar, RTL layout)
└── Routes (lazy-loaded)
    ├── Dashboard
    │   ├── DashboardSummaryCards (income/expense/balance)
    │   ├── DashboardCharts
    │   │   ├── ExpenseChart (bar chart)
    │   │   ├── CashFlowChart (line chart)
    │   │   └── ExpensePieChart (category breakdown)
    │   ├── RecentTransactions
    │   ├── BudgetAlertCard
    │   └── RecommendationsCard (AI-powered)
    ├── Transactions
    │   ├── TransactionForm (Dialog with validation)
    │   ├── TransactionList (Filterable table)
    │   ├── InstallmentForm
    │   ├── ElectricityBillForm
    │   └── TransactionDeleteDialog
    ├── Import
    │   ├── FileUploader (drag-and-drop)
    │   ├── ColumnMapper (CSV column mapping)
    │   └── TransactionPreview (pre-import review)
    ├── Budgets
    │   ├── BudgetForm
    │   ├── BudgetList
    │   ├── CategoryForm
    │   └── CategoryList
    └── Reports
        └── AdvancedReportView
```

---

## Development Guidelines

### Code Style & Conventions

#### TypeScript

- **Strict mode enabled** - All TypeScript strict checks active
- **No unused variables** - `noUnusedLocals` and `noUnusedParameters` enabled
- **Explicit types preferred** - Avoid `any`, use proper interfaces
- **Path aliases** - Use `@/` prefix for all imports from `src/`

```typescript
// ✅ Good
import { Transaction } from '@/types'
import { useFinanceState } from '@/hooks/finance/useFinanceState'

// ❌ Bad
import { Transaction } from '../../../types'
```

#### Component Conventions

1. **Functional components only** - No class components
2. **Named exports for components** - `export function ComponentName() {}`
3. **Props interfaces** - Always define props interface
4. **Hooks at top** - All hooks before any logic
5. **Early returns** - Handle edge cases early

```typescript
// ✅ Good component structure
interface TransactionFormProps {
  initialData?: Transaction
  onSubmit: (data: Transaction) => void
}

export function TransactionForm({ initialData, onSubmit }: TransactionFormProps) {
  // Hooks first
  const { state, addTransaction } = useFinanceState()
  const form = useForm<Transaction>()

  // Early returns
  if (!state) return null

  // Logic
  const handleSubmit = (data: Transaction) => {
    onSubmit(data)
  }

  // Render
  return <form>...</form>
}
```

#### File Naming

- **Components:** PascalCase - `TransactionForm.tsx`
- **Hooks:** camelCase with 'use' prefix - `useTransactionForm.ts`
- **Utils:** camelCase - `financeUtils.ts`
- **Types:** camelCase - `index.ts`, `finance.ts`
- **Constants:** camelCase - `defaultValues.ts`

#### Import Order

1. External dependencies (React, libraries)
2. Internal types
3. Internal hooks
4. Internal components
5. Internal utilities
6. Styles

```typescript
// ✅ Good import order
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { Transaction, TransactionType } from '@/types'
import { useFinanceState } from '@/hooks/finance/useFinanceState'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/utils/financeUtils'
```

### Hebrew & RTL Guidelines

#### Text Direction

- All text content must be in Hebrew
- Use RTL (`direction: rtl`) layout throughout
- Tailwind classes: Use logical properties when possible

```tsx
// ✅ Good - logical properties
<div className="text-right">טקסט בעברית</div>

// Context-aware positioning
<div className="mr-4"> // margin-right in RTL = margin-left visually
```

#### Translation Conventions

- **Transaction Types:** `'הכנסה'` (income), `'הוצאה'` (expense)
- **UI Labels:** Always in Hebrew
- **Category Names:** Hebrew with appropriate icons
- **Date Formatting:** Hebrew locale with DD/MM/YYYY

```typescript
// ✅ Good - Hebrew labels
const labels = {
  income: 'הכנסה',
  expense: 'הוצאה',
  budget: 'תקציב',
  category: 'קטגוריה'
}

// Date formatting
import { format } from 'date-fns'
import { he } from 'date-fns/locale'

format(new Date(), 'dd/MM/yyyy', { locale: he })
```

### State Management Best Practices

#### When to Use Zustand Store

Use for **global state** that needs persistence:

- Transactions
- Budgets
- Categories
- Financial summaries

```typescript
import { useFinanceStore } from '@/stores/financeStore'

const { transactions, addTransaction } = useFinanceStore()
```

#### When to Use Context

Use for **computed values** and **actions**:

- Finance operations (add, update, delete)
- Derived data (filtered transactions, stats)

```typescript
import { useTransactions } from '@/context/FinanceContext'

const { transactions, addTransaction, deleteTransaction } = useTransactions()
```

#### When to Use Local State

Use for **UI-only state**:

- Dialog open/closed
- Form inputs (managed by React Hook Form)
- Temporary filters
- Loading states

```typescript
const [isDialogOpen, setIsDialogOpen] = useState(false)
```

### Form Handling

All forms use **React Hook Form** + **Zod validation**:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const transactionSchema = z.object({
  date: z.string(),
  amount: z.number().positive(),
  description: z.string().min(1),
  type: z.enum(['הכנסה', 'הוצאה']),
  categoryId: z.string()
})

type TransactionFormData = z.infer<typeof transactionSchema>

const form = useForm<TransactionFormData>({
  resolver: zodResolver(transactionSchema),
  defaultValues: {
    type: 'הוצאה'
  }
})
```

### Error Handling

1. **Type Safety** - Let TypeScript catch errors at compile time
2. **Zod Validation** - Validate all user inputs
3. **Toast Notifications** - Use Sonner for user feedback
4. **Duplicate Detection** - Check before adding transactions
5. **File Validation** - Validate uploads before processing

```typescript
import { toast } from 'sonner'

try {
  addTransaction(newTransaction)
  toast.success('העסקה נוספה בהצלחה')
} catch (error) {
  toast.error('שגיאה בהוספת העסקה')
  console.error(error)
}
```

---

## Key Technologies

### Core Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework |
| **TypeScript** | 5.2.2 | Type safety |
| **Vite** | 5.1.4 | Build tool & dev server |
| **React Router** | 7.4.0 | Client-side routing |
| **Zustand** | 4.5.1 | Global state management |
| **Tailwind CSS** | 3.4.1 | Styling |

### UI Components

| Library | Purpose |
|---------|---------|
| **shadcn/ui** | Pre-built component library |
| **Radix UI** | Headless accessible components |
| **Lucide React** | Icon library |
| **Sonner** | Toast notifications |

### Forms & Validation

| Library | Purpose |
|---------|---------|
| **React Hook Form** | Form state management |
| **Zod** | Schema validation |
| **@hookform/resolvers** | RHF + Zod integration |

### Data Processing

| Library | Purpose |
|---------|---------|
| **XLSX** | Excel file parsing |
| **date-fns** | Date manipulation |
| **Groq SDK** | AI recommendations |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Husky** | Git hooks |
| **PostCSS** | CSS processing |

---

## State Management

### Dual State Architecture

FinTrack uses a **hybrid state management** approach:

```
┌─────────────────────────────────────┐
│         Zustand Store               │
│  (Global State + Persistence)       │
│                                     │
│  - transactions[]                   │
│  - summary: FinancialSummary        │
│  - localStorage auto-sync           │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│       FinanceContext                │
│  (React Context + Reducers)         │
│                                     │
│  - Provides actions to components   │
│  - Handles complex state logic      │
│  - Manages categories & budgets     │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│         Components                  │
│  (via custom hooks)                 │
│                                     │
│  - useTransactions()                │
│  - useBudgets()                     │
│  - useFinanceStats()                │
└─────────────────────────────────────┘
```

### Zustand Store

**Location:** `/home/user/fintrack-master/src/stores/financeStore.ts`

**State Shape:**

```typescript
interface FinanceStore {
  transactions: Transaction[]
  summary: FinancialSummary | null

  // Actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  importTransactions: (transactions: ImportedTransaction[]) => void
  calculateSummary: () => void
  exportData: () => string
  importData: (data: string) => void
  resetStore: () => void
}
```

**Usage:**

```typescript
import { useFinanceStore } from '@/stores/financeStore'

function MyComponent() {
  const { transactions, addTransaction } = useFinanceStore()

  const handleAdd = () => {
    addTransaction({
      date: '2025-11-22',
      amount: 100,
      description: 'תיאור',
      type: 'הוצאה',
      categoryId: 'cat-1'
    })
  }
}
```

### Finance Context

**Location:** `/home/user/fintrack-master/src/context/FinanceContext.tsx`

**Provides:**

- Transaction operations
- Budget management
- Category operations
- Import format management
- Category mapping (auto-categorization)

**Usage:**

```typescript
import { useTransactions, useBudgets } from '@/context/FinanceContext'

function MyComponent() {
  const { transactions, addTransaction } = useTransactions()
  const { budgets, setBudget } = useBudgets()
}
```

### Reducers

**Location:** `/home/user/fintrack-master/src/context/reducers/`

| Reducer | Purpose |
|---------|---------|
| `financeReducer.ts` | Main state reducer |
| `transactionReducer.ts` | Transaction CRUD |
| `budgetReducer.ts` | Budget operations |
| `categoryReducer.ts` | Category management |
| `importFormatReducer.ts` | Import templates |
| `categoryMappingReducer.ts` | Auto-categorization |
| `systemStateReducer.ts` | System config |

### Custom Hooks

**Finance Hooks** (`/src/hooks/finance/`):

```typescript
// State access
import { useFinanceState } from '@/hooks/finance/useFinanceState'
import { useFinanceActions } from '@/hooks/finance/useFinanceActions'

// Computed data
import { useFinanceStats } from '@/hooks/finance/useFinanceStats'
import { useTransactionFilters } from '@/hooks/finance/useTransactionFilters'
import { useChartData } from '@/hooks/finance/useChartData'
import { useBudgetAlerts } from '@/hooks/finance/useBudgetAlerts'

// Utilities
import { useCurrencyFormatter } from '@/hooks/finance/useCurrencyFormatter'
import { useMonthlyIncomes } from '@/hooks/finance/useMonthlyIncomes'
```

**Storage Hooks** (`/src/hooks/finance/storage/`):

```typescript
import { useLocalStorage } from '@/hooks/finance/storage/useLocalStorage'
import { useDataPersistence } from '@/hooks/finance/storage/useDataPersistence'
import { useInitialDataLoad } from '@/hooks/finance/storage/useInitialDataLoad'
import { useImportBlocker } from '@/hooks/finance/storage/useImportBlocker'
```

---

## Data Models

### Core Types

**Location:** `/home/user/fintrack-master/src/types/index.ts`

#### Transaction

```typescript
export type TransactionType = 'הכנסה' | 'הוצאה' // Income | Expense

export interface Transaction {
  id: string
  date: string                      // ISO date string
  amount: number                    // Amount in ILS
  description: string               // Transaction description
  type: TransactionType             // Income or Expense
  categoryId: string                // Reference to category
  notes?: string                    // Optional notes
  cardNumber?: string               // Credit card last 4 digits

  // Installment tracking
  isInstallment?: boolean
  installmentDetails?: {
    installmentNumber: number       // Current installment (1-based)
    totalInstallments: number       // Total installments
    originalTransactionDate?: string
    totalAmount?: number
    currentInstallment?: number
    remainingAmount?: number
  }

  // Credit card import data
  transactionCode?: string          // Unique transaction code
  businessCategory?: string         // Business type
  businessIdentifier?: string       // Business ID
  originalAmount?: number           // Original foreign currency amount

  // Electricity bill tracking
  isElectricityBill?: boolean
  mainMeterReading?: {
    current: number
    previous: number
    date: string
  }
  secondaryMeterReading?: {
    current: number
    previous: number
    date: string
  }
  electricityRate?: number          // Rate per kWh
  vatRate?: number                  // VAT percentage

  // Metadata
  sheetName?: string                // Excel sheet source
  createdAt?: string                // Creation timestamp
}
```

#### Category

```typescript
export interface CategoryType {
  id: string
  name: string                      // Hebrew name
  type: TransactionType             // Income or Expense
  color: string                     // Hex color
  icon: string                      // Lucide icon name
}
```

#### Budget

```typescript
export interface Budget {
  id: string
  categoryId: string                // Category to budget
  amount: number                    // Budget limit
  startDate: string
  endDate?: string
  period?: "daily" | "weekly" | "monthly" | "yearly"
}
```

#### File Import Format

```typescript
export interface FileImportFormat {
  id: string
  name: string
  mapping: {
    date?: string                   // Column name for date
    amount?: string                 // Column name for amount
    description?: string            // Column name for description
    type?: string                   // Column name for type
    category?: string               // Column name for category
    cardNumber?: string             // Column name for card number
    totalAmount?: string            // Column name for total amount
    installmentNumber?: string      // Column name for installment #
    totalInstallments?: string      // Column name for total installments
    originalTransactionDate?: string
    chargeDate?: string
    transactionCode?: string
    businessCategory?: string
    businessIdentifier?: string
  }
  dateFormat?: string               // e.g., 'DD/MM/YYYY'
  delimiter?: string                // CSV delimiter
  skipEmptyRows?: boolean
  headerRowIndex?: number           // Which row has headers (0-based)
  sheetSupport?: boolean            // Supports multi-sheet Excel
  typeIdentifier?: {
    column: string
    incomeValues: string[]          // Values that indicate income
    expenseValues: string[]         // Values that indicate expense
  }
  installmentIdentifier?: {
    pattern: string                 // Regex to detect installments
    installmentPattern: string      // Regex to extract installment info
  }
  creditCardFormat?: boolean        // Is this a credit card format?
}
```

#### Category Mapping

```typescript
export interface CategoryMapping {
  id?: string
  description: string               // Transaction description pattern
  categoryId: string                // Category to assign
}
```

### Default Categories

**Location:** `/home/user/fintrack-master/src/context/defaultValues.ts`

82 pre-configured categories organized by:

- **Income:** Salary types, allowances, benefits
- **Housing:** Rent, mortgage, utilities, maintenance
- **Transportation:** Fuel, parking, tolls, public transit
- **Car Maintenance:** Repairs, tires, accidents, insurance
- **Insurance:** Car, health, life, property
- **Communications:** Internet, cellular, TV
- **Food:** Supermarket, restaurants, cafes
- **Health:** Medical, dental, pharmacy, treatments
- **Children:** Education, daycare, activities
- **Savings:** Savings accounts, investments, payments

Each category includes:
- Unique ID
- Hebrew name
- Type (income/expense)
- Color code
- Icon name

---

## Common Tasks

### Adding a New Feature

1. **Create types** (if needed) in `/src/types/`
2. **Add reducer logic** in `/src/context/reducers/`
3. **Create custom hooks** in `/src/hooks/`
4. **Build UI components** in `/src/components/`
5. **Add page** (if needed) in `/src/pages/`
6. **Update routing** in `/src/App.tsx`

### Adding a New Transaction Type

1. Edit `/src/types/index.ts` - Add fields to `Transaction` interface
2. Edit `/src/context/reducers/transactionReducer.ts` - Handle new fields
3. Edit `/src/components/transactions/TransactionForm.tsx` - Add form fields
4. Update validation schema with Zod
5. Test import/export with new fields

### Adding a New Category

```typescript
import { useFinanceState } from '@/hooks/finance/useFinanceState'

const { addCategory } = useFinanceState()

addCategory({
  id: 'cat-new',
  name: 'שם קטגוריה',
  type: 'הוצאה',
  color: '#FF5733',
  icon: 'ShoppingCart' // Lucide icon name
})
```

### Adding a New Import Format

```typescript
import { useImportFormats } from '@/context/FinanceContext'

const { addImportFormat } = useImportFormats()

addImportFormat({
  id: 'format-new',
  name: 'My Bank Format',
  mapping: {
    date: 'Transaction Date',
    amount: 'Amount',
    description: 'Details',
    type: 'Type'
  },
  dateFormat: 'DD/MM/YYYY',
  delimiter: ',',
  headerRowIndex: 0
})
```

### Filtering Transactions

```typescript
import { useTransactionFilters } from '@/hooks/finance/useTransactionFilters'

const {
  filteredTransactions,
  setDateRange,
  setTypeFilter,
  setCategoryFilter
} = useTransactionFilters()

// Filter by date range
setDateRange({ start: '2025-01-01', end: '2025-01-31' })

// Filter by type
setTypeFilter('הוצאה')

// Filter by category
setCategoryFilter('cat-food')
```

### Calculating Statistics

```typescript
import { useFinanceStats } from '@/hooks/finance/useFinanceStats'

const stats = useFinanceStats({
  startDate: '2025-01-01',
  endDate: '2025-01-31'
})

console.log(stats.totalIncome)
console.log(stats.totalExpenses)
console.log(stats.balance)
console.log(stats.expensesByCategory)
```

### Working with localStorage

All Zustand state is automatically persisted to localStorage. Manual operations:

```typescript
import { useLocalStorage } from '@/hooks/finance/storage/useLocalStorage'

const { saveToLocalStorage, loadFromLocalStorage, clearLocalStorage } = useLocalStorage()

// Manual save
saveToLocalStorage('key', data)

// Manual load
const data = loadFromLocalStorage('key')

// Clear all
clearLocalStorage()
```

### Importing Transactions from File

```typescript
import { importFromExcel } from '@/services/import/excelImporter'
import { importFromJSON } from '@/services/import/jsonImporter'

// Excel import
const handleExcelUpload = async (file: File) => {
  try {
    const transactions = await importFromExcel(file, importFormat)
    addTransactions(transactions)
    toast.success(`${transactions.length} עסקאות יובאו בהצלחה`)
  } catch (error) {
    toast.error('שגיאה בייבוא הקובץ')
  }
}

// JSON import
const handleJSONUpload = async (file: File) => {
  try {
    const transactions = await importFromJSON(file)
    addTransactions(transactions)
  } catch (error) {
    toast.error('שגיאה בייבוא JSON')
  }
}
```

---

## File Locations Reference

### Critical Files

```
Entry Points:
  /home/user/fintrack-master/src/main.tsx
  /home/user/fintrack-master/src/App.tsx

Core State Management:
  /home/user/fintrack-master/src/stores/financeStore.ts
  /home/user/fintrack-master/src/context/FinanceContext.tsx

Type Definitions:
  /home/user/fintrack-master/src/types/index.ts
  /home/user/fintrack-master/src/types/finance.ts

Default Data:
  /home/user/fintrack-master/src/context/defaultValues.ts

Main Pages:
  /home/user/fintrack-master/src/pages/Dashboard.tsx
  /home/user/fintrack-master/src/pages/Transactions.tsx
  /home/user/fintrack-master/src/pages/Import.tsx
  /home/user/fintrack-master/src/pages/Reports.tsx
  /home/user/fintrack-master/src/pages/Budgets.tsx

Key Components:
  /home/user/fintrack-master/src/components/transactions/TransactionForm.tsx
  /home/user/fintrack-master/src/components/dashboard/DashboardSummaryCards.tsx
  /home/user/fintrack-master/src/components/import/FileUploader.tsx

Parsers:
  /home/user/fintrack-master/src/utils/parser/excel/parseExcel.ts
  /home/user/fintrack-master/src/utils/parser/csv/parseCSV.ts

Services:
  /home/user/fintrack-master/src/services/dateService.ts
  /home/user/fintrack-master/src/services/fileService.ts
  /home/user/fintrack-master/src/services/import/excelImporter.ts

Utilities:
  /home/user/fintrack-master/src/utils/financeUtils.ts
  /home/user/fintrack-master/src/lib/utils.ts

Config Files:
  /home/user/fintrack-master/vite.config.ts
  /home/user/fintrack-master/tsconfig.json
  /home/user/fintrack-master/tailwind.config.js
  /home/user/fintrack-master/package.json
```

### Component Directories

```
UI Components (shadcn/ui):
  /home/user/fintrack-master/src/components/ui/

Domain Components:
  /home/user/fintrack-master/src/components/dashboard/
  /home/user/fintrack-master/src/components/transactions/
  /home/user/fintrack-master/src/components/budgets/
  /home/user/fintrack-master/src/components/import/
  /home/user/fintrack-master/src/components/reports/

Hooks:
  /home/user/fintrack-master/src/hooks/finance/
  /home/user/fintrack-master/src/hooks/finance/income/
  /home/user/fintrack-master/src/hooks/finance/storage/

Reducers:
  /home/user/fintrack-master/src/context/reducers/
```

---

## Testing & Quality

### Current Setup

- **ESLint:** TypeScript + React Hooks rules
- **TypeScript:** Strict mode with all checks enabled
- **Prettier:** Code formatting (via npm script)
- **Husky:** Git hooks for pre-commit checks

### No Unit Tests Yet

Currently, there is **no dedicated testing framework** (Jest, Vitest, etc.) configured.

### Quality Checks

```bash
# Type checking
npm run build  # Runs tsc before build

# Linting
npm run lint

# Code formatting
npm run format
```

### Adding Tests (Recommended)

If you need to add tests:

1. Install Vitest: `npm install -D vitest @testing-library/react @testing-library/jest-dom`
2. Create `vitest.config.ts`
3. Add test scripts to `package.json`
4. Create `__tests__` directories
5. Write tests with `.test.tsx` or `.spec.tsx` extensions

---

## Deployment

### Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Dev server features:
# - Hot module replacement (HMR)
# - Auto-open browser
# - Port 3000 (strict)
# - File watching with polling
```

### Production Build

```bash
# Build for production
npm run build

# Output: dist/
# - Type-checked TypeScript
# - Minified with esbuild
# - Code-split chunks
# - Source maps included
# - CSS extracted and minified

# Preview production build
npm run preview
```

### Build Configuration

**Code Splitting:**

- `vendor.js` - React, React DOM, React Router
- `ui-core.js` - Radix UI components
- `finance.js` - Finance module utilities
- `utils.js` - Helper functions

**Optimization:**

- Target: `esnext` (modern browsers)
- Minifier: `esbuild` (fast)
- Asset inline limit: 4KB
- CSS code splitting: enabled
- Chunk size warning: 1000KB

### Deployment Platforms

**Recommended:**

1. **Lovable Platform** - Native deployment
   - Visit project URL
   - Click Share → Publish
   - URL: https://lovable.dev/projects/bf0d4811-65f2-45b1-b721-d03583af3ef8

2. **Netlify** - For custom domains
   - Connect GitHub repo
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Vercel, GitHub Pages, Cloudflare Pages** - Standard static hosting

**Mobile Apps (Capacitor):**

```bash
# Build for iOS/Android
npm run build

# Capacitor sync
npx cap sync

# Open in Xcode/Android Studio
npx cap open ios
npx cap open android
```

### Environment Variables

Currently, the app **does not use environment variables**. All configuration is client-side.

If you need to add them:

1. Create `.env` file
2. Add `VITE_` prefix to variables
3. Access via `import.meta.env.VITE_VARIABLE_NAME`

---

## AI Assistant Guidelines

### When Working with This Codebase

1. **Always use Hebrew** for user-facing text
2. **Respect RTL layout** - Don't break right-to-left flow
3. **Maintain type safety** - No `any` types
4. **Follow file structure** - Keep components in correct directories
5. **Use existing hooks** - Don't reinvent the wheel
6. **Validate user input** - Use Zod schemas
7. **Test imports** - Verify CSV/Excel parsing works
8. **Check localStorage** - Ensure persistence works
9. **Maintain accessibility** - Use Radix UI properly
10. **Keep it simple** - This is a client-side app, no backend complexity needed

### Common Pitfalls to Avoid

❌ **Don't** create English UI text
✅ **Do** use Hebrew for all user-facing content

❌ **Don't** bypass Zod validation
✅ **Do** define schemas for all forms

❌ **Don't** use left-to-right layouts
✅ **Do** maintain RTL throughout

❌ **Don't** create new state management
✅ **Do** use existing Zustand + Context

❌ **Don't** ignore TypeScript errors
✅ **Do** fix all type issues

❌ **Don't** add backend dependencies
✅ **Do** keep it client-side only

❌ **Don't** create duplicate utilities
✅ **Do** check existing utils first

❌ **Don't** break existing imports
✅ **Do** test file parsing after changes

### Before Making Changes

1. Read relevant files in `/src/types/`
2. Check existing hooks in `/src/hooks/finance/`
3. Review similar components in `/src/components/`
4. Understand the state flow (Zustand → Context → Components)
5. Check if the feature already exists

### After Making Changes

1. Run `npm run lint` to check for errors
2. Run `npm run build` to verify TypeScript compilation
3. Test in browser with `npm run dev`
4. Verify localStorage persistence
5. Test with actual CSV/Excel files (if touching import)
6. Check mobile responsiveness
7. Verify RTL layout isn't broken

---

## Quick Reference

### Import Paths

```typescript
// Types
import { Transaction, CategoryType, Budget } from '@/types'

// Hooks
import { useTransactions, useBudgets } from '@/context/FinanceContext'
import { useFinanceStats } from '@/hooks/finance/useFinanceStats'
import { useLocalStorage } from '@/hooks/finance/storage/useLocalStorage'

// Components
import { Button } from '@/components/ui/button'
import { TransactionForm } from '@/components/transactions/TransactionForm'

// Utils
import { formatCurrency } from '@/utils/financeUtils'
import { cn } from '@/lib/utils'

// Services
import { parseDate } from '@/services/dateService'
import { validateFile } from '@/services/fileService'
```

### Useful Commands

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
```

### Key Constants

```typescript
// Transaction types
const INCOME = 'הכנסה'
const EXPENSE = 'הוצאה'

// Max limits
const MAX_TRANSACTIONS = 50000
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Date format
const DATE_FORMAT = 'DD/MM/YYYY'

// Currency
const CURRENCY = '₪'
const LOCALE = 'he-IL'
```

---

## Support & Resources

### Documentation

- **Project README:** `/home/user/fintrack-master/README.md`
- **This Guide:** `/home/user/fintrack-master/CLAUDE.md`
- **Lovable Docs:** https://docs.lovable.dev/

### Technology Docs

- **React:** https://react.dev/
- **TypeScript:** https://www.typescriptlang.org/
- **Vite:** https://vitejs.dev/
- **Zustand:** https://github.com/pmndrs/zustand
- **React Hook Form:** https://react-hook-form.com/
- **Zod:** https://zod.dev/
- **shadcn/ui:** https://ui.shadcn.com/
- **Tailwind CSS:** https://tailwindcss.com/

### Getting Help

- **Issues:** Report bugs or request features via GitHub issues
- **Lovable Support:** Use Lovable platform for AI-assisted development

---

**Last Updated:** 2025-11-22
**Maintained By:** AI Assistants & FinTrack Team
**Version:** 1.0.0
