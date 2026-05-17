import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

function App() {
  const paletteItems = useMemo(
    () =>
      [
        { id: 'capacitor', name: '电容' },
        { id: 'inductor', name: '电感' },
      ] as const,
    [],
  )

  const [activeTool, setActiveTool] = useState<(typeof paletteItems)[number]['id']>(
    'capacitor',
  )

  return (
    <div className="h-screen flex flex-col">
      <header className="h-12 border-b flex items-center px-4">
        <div className="font-semibold tracking-tight">电路图编辑器（MVP）</div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-72 border-r bg-muted/20">
          <div className="p-3">
            <div className="text-sm font-medium">器件栏</div>
            <div className="text-xs text-muted-foreground mt-1">选择一个器件后，在画布放置（占位）</div>
          </div>
          <Separator />
          <ScrollArea className="h-[calc(100vh-3rem-1px)]">
            <div className="p-3 space-y-2">
              {paletteItems.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant={activeTool === item.id ? 'default' : 'secondary'}
                  className="w-full justify-start"
                  onClick={() => setActiveTool(item.id)}
                >
                  {item.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        <main className="flex-1 min-w-0 bg-background">
          <div className="p-4 h-full">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">画布</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-3.25rem)]">
                <div className="h-full rounded-md border bg-muted/10 flex items-center justify-center text-sm text-muted-foreground">
                  当前工具：{paletteItems.find((x) => x.id === activeTool)?.name}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
