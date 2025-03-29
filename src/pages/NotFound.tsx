import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const NotFound: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-xl text-muted-foreground">הדף שחיפשת לא נמצא</p>
        <Link to="/">
          <Button>חזרה לדף הבית</Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFound
