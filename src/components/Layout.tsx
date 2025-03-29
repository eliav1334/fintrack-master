import React from 'react'
import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 pb-24">
        <Outlet />
      </div>
      <Navigation />
    </div>
  )
}

export default Layout 