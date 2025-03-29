import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, PieChart, Upload, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigationItems = [
  {
    icon: Home,
    label: 'דשבורד',
    path: '/',
    color: 'text-blue-500'
  },
  {
    icon: PieChart,
    label: 'דוחות',
    path: '/reports',
    color: 'text-green-500'
  },
  {
    icon: Upload,
    label: 'ייבוא',
    path: '/import',
    color: 'text-purple-500'
  },
  {
    icon: Settings,
    label: 'הגדרות',
    path: '/settings',
    color: 'text-orange-500'
  }
]

const Navigation: React.FC = () => {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-4 gap-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors',
                  isActive ? 'bg-secondary' : 'hover:bg-secondary/50'
                )}
              >
                <item.icon
                  className={cn(
                    'h-6 w-6 mb-1 transition-colors',
                    isActive ? item.color : 'text-muted-foreground'
                  )}
                />
                <span
                  className={cn(
                    'text-xs font-medium',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Navigation 