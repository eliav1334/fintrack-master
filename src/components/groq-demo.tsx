import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { generateWithGroq } from "@/lib/groq"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { loadHistory, saveToHistory } from "@/lib/history"
import { CodeHistoryItem } from "@/lib/types"
import { format } from "date-fns"
import { he } from "date-fns/locale"

export function GroqDemo() {
  const [prompt, setPrompt] = useState<string>("")
  const [response, setResponse] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("code")
  const [history, setHistory] = useState<CodeHistoryItem[]>([])
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const loadedHistory = loadHistory()
    setHistory(loadedHistory.items)
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    try {
      setLoading(true)
      setError("")
      
      const systemPrompt = `אתה מומחה React ו-TypeScript. אנא עזור לי לפתור את הבעיה הבאה:
      ${prompt}
      
      הנחיות:
      1. השתמש ב-TypeScript
      2. השתמש ב-React
      3. השתמש ב-Tailwind CSS
      4. הוסף הערות בעברית
      5. וודא שהקוד נקי ומסודר
      6. הוסף טיפול בשגיאות
      7. הוסף טיפוסים מתאימים
      8. השתמש בקומפוננטות מ-Shadcn UI אם רלוונטי
      
      אנא ספק את הפתרון בפורמט הבא:
      קוד:
      [הקוד כאן]
      
      הסבר:
      [הסבר על הפתרון והשימוש בו]`

      const result = await generateWithGroq(systemPrompt)
      setResponse(result)

      // שמירה בהיסטוריה
      const code = result.split("קוד:")[1]?.split("הסבר:")[0]?.trim() || ""
      const explanation = result.split("הסבר:")[1]?.trim() || ""
      
      const newItem = saveToHistory({
        prompt,
        code,
        explanation,
      })
      
      setHistory(prev => [newItem, ...prev])
    } catch (error) {
      console.error("שגיאה:", error)
      setError("אירעה שגיאה בעת יצירת התשובה")
      setResponse("")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = () => {
    const codeMatch = response.match(/קוד:\n([\s\S]*?)\n\nהסבר:/)
    if (codeMatch) {
      navigator.clipboard.writeText(codeMatch[1].trim())
      alert("הקוד הועתק ללוח!")
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>עוזר פיתוח קוד</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="תאר את הבעיה שברצונך לפתור..."
                className="flex-1"
              />
              <Button 
                onClick={handleGenerate} 
                disabled={loading || !prompt.trim()}
              >
                {loading ? "טוען..." : "צור פתרון"}
              </Button>
            </div>
            
            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                {error}
              </div>
            )}
            
            {response && (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="code">קוד</TabsTrigger>
                  <TabsTrigger value="explanation">הסבר</TabsTrigger>
                </TabsList>
                
                <TabsContent value="code">
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute top-2 left-2"
                      onClick={handleCopyCode}
                    >
                      העתק קוד
                    </Button>
                    <pre className="p-4 bg-muted rounded-lg mt-2 overflow-x-auto">
                      {response.split("קוד:")[1]?.split("הסבר:")[0]?.trim() || ""}
                    </pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="explanation">
                  <div className="p-4 bg-muted rounded-lg mt-2">
                    {response.split("הסבר:")[1]?.trim() || ""}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>היסטוריה</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] overflow-y-auto pr-4">
            <div className="space-y-4">
              {history.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm text-muted-foreground">
                        {format(item.createdAt, "dd/MM/yyyy HH:mm", { locale: he })}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPrompt(item.prompt)
                          setResponse(`קוד:\n${item.code}\n\nהסבר:\n${item.explanation}`)
                        }}
                      >
                        טען
                      </Button>
                    </div>
                    <p className="font-medium mb-2">{item.prompt}</p>
                    <pre className="text-sm bg-muted p-2 rounded-lg overflow-x-auto">
                      {item.code}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 