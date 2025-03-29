import { Suspense, lazy } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Home, Receipt, Upload, PieChart, Settings as SettingsIcon } from 'lucide-react'

// Lazy loading for pages
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Transactions = lazy(() => import('@/pages/Transactions'))
const Import = lazy(() => import('@/pages/Import'))
const Reports = lazy(() => import('@/pages/Reports'))
const Settings = lazy(() => import('@/pages/Settings'))
const NotFound = lazy(() => import('@/pages/NotFound'))

// Loading component
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
      <p className="text-sm text-muted-foreground">טוען...</p>
    </div>
  </div>
)

// Navigation component
const Navigation = () => (
  <nav className="fixed bottom-0 right-0 left-0 bg-background border-t border-border p-2 z-50">
    <div className="container mx-auto flex justify-around items-center">
      <Link to="/" className="flex flex-col items-center p-2 text-muted-foreground hover:text-primary">
        <Home className="h-6 w-6" />
        <span className="text-xs">דשבורד</span>
      </Link>
      <Link to="/transactions" className="flex flex-col items-center p-2 text-muted-foreground hover:text-primary">
        <Receipt className="h-6 w-6" />
        <span className="text-xs">עסקאות</span>
      </Link>
      <Link to="/import" className="flex flex-col items-center p-2 text-muted-foreground hover:text-primary">
        <Upload className="h-6 w-6" />
        <span className="text-xs">ייבוא</span>
      </Link>
      <Link to="/reports" className="flex flex-col items-center p-2 text-muted-foreground hover:text-primary">
        <PieChart className="h-6 w-6" />
        <span className="text-xs">דוחות</span>
      </Link>
      <Link to="/settings" className="flex flex-col items-center p-2 text-muted-foreground hover:text-primary">
        <SettingsIcon className="h-6 w-6" />
        <span className="text-xs">הגדרות</span>
      </Link>
    </div>
  </nav>
)

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background font-sans antialiased pb-16" dir="rtl">
        <main className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-center mb-8">מעקב הוצאות</h1>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/import" element={<Import />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Navigation />
        <Toaster />
      </div>
    </BrowserRouter>
  )
}

export default App
