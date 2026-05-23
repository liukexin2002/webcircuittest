import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RoutingDemo } from '@/features/routing-demo/RoutingDemo'

function App() {
  return (
    <div className="h-screen flex flex-col">
      <header className="h-12 border-b flex items-center px-4">
        <div className="font-semibold tracking-tight">电路图编辑器（MVP）</div>
      </header>

      <main className="flex-1 min-w-0 bg-background">
        <div className="p-4 h-full">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">连线避障（libavoid）</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-3.25rem)]">
              <RoutingDemo />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default App
