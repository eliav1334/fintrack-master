import { GroqDemo } from "@/components/groq-demo"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>מערכת ניהול קוד חכמה</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            השתמש בכלי זה כדי ליצור ולנהל קוד בצורה חכמה ויעילה. 
            המערכת תשתמש ב-Groq כדי ליצור קוד איכותי בהתאם לדרישות שלך.
          </p>
        </CardContent>
      </Card>

      <GroqDemo />
    </main>
  )
} 