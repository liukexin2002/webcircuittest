import { useEffect, useMemo, useRef, useState } from 'react'
import type { Edge, Point, Port, Route, RouteInput } from '@/routing'
import { LibavoidRouter } from '@/routing'

type Device = {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
}

function toPath(points: Point[]) {
  const compact: Point[] = []
  for (const p of points) {
    const last = compact[compact.length - 1]
    if (!last || last.x !== p.x || last.y !== p.y) compact.push(p)
  }
  if (compact.length === 0) return ''
  return compact.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
}

export function RoutingDemo() {
  const [devices, setDevices] = useState<Device[]>([
    { id: 'a', name: '电容', x: 120, y: 120, width: 140, height: 90 },
    { id: 'b', name: '电感', x: 420, y: 240, width: 140, height: 90 },
  ])

  const [selectedPortId, setSelectedPortId] = useState<string | null>(null)
  const [edges, setEdges] = useState<Edge[]>([{ id: 'e1', sourcePortId: 'a.out', targetPortId: 'b.in' }])

  const router = useMemo(() => new LibavoidRouter(), [])

  useEffect(() => () => router.dispose(), [router])

  const input: RouteInput = useMemo(() => {
    const nodes = devices.map((d) => ({
      id: d.id,
      rect: { x: d.x, y: d.y, width: d.width, height: d.height },
    }))

    const devA = devices.find((d) => d.id === 'a')
    const devB = devices.find((d) => d.id === 'b')

    const ports: Port[] = []
    if (devA) {
      ports.push({
        id: 'a.out',
        nodeId: 'a',
        point: { x: devA.x + devA.width + 10, y: devA.y + devA.height / 2 },
        side: 'east',
      })
    }
    if (devB) {
      ports.push({
        id: 'b.in',
        nodeId: 'b',
        point: { x: devB.x - 10, y: devB.y + devB.height / 2 },
        side: 'west',
      })
    }

    return {
      nodes,
      ports,
      edges,
      options: { shapeBuffer: 12, hateCrossings: true },
    }
  }, [devices, edges])

  const [route, setRoute] = useState<Route | null>(null)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    let isActive = true
    const reqId = (requestIdRef.current += 1)

    router
      .route(input)
      .then((routes) => {
        if (!isActive) return
        if (reqId !== requestIdRef.current) return
        setError(null)
        setRoute(routes[0] ?? null)
      })
      .catch((err) => {
        if (!isActive) return
        if (reqId !== requestIdRef.current) return
        setRoute(null)
        setError(err instanceof Error ? err.message : String(err))
      })

    return () => {
      isActive = false
    }
  }, [input, router])

  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null)

  const portById = useMemo(() => new Map(input.ports.map((p) => [p.id, p])), [input.ports])

  return (
    <div className="relative w-full h-full rounded-md border bg-muted/10 overflow-hidden">
      <svg
        className="w-full h-full touch-none"
        viewBox="0 0 900 600"
        onPointerMove={(e) => {
          const drag = dragRef.current
          if (!drag) return
          const svg = e.currentTarget
          const rect = svg.getBoundingClientRect()
          const x = ((e.clientX - rect.left) / rect.width) * 900
          const y = ((e.clientY - rect.top) / rect.height) * 600
          setDevices((prev) =>
            prev.map((d) =>
              d.id === drag.id ? { ...d, x: x - drag.dx, y: y - drag.dy } : d,
            ),
          )
        }}
        onPointerUp={() => {
          dragRef.current = null
        }}
        onPointerCancel={() => {
          dragRef.current = null
        }}
        onPointerDown={(e) => {
          const target = e.target as Element | null
          if (target?.closest?.('[data-pin="true"]')) return
          setSelectedPortId(null)
        }}
      >
        {route?.points?.length ? (
          <path d={toPath(route.points)} fill="none" stroke="hsl(var(--primary))" strokeWidth={3} />
        ) : null}

        {devices.map((d) => {
          const pinX = d.id === 'a' ? d.x + d.width : d.x
          const pinY = d.y + d.height / 2
          const portId = d.id === 'a' ? 'a.out' : 'b.in'
          const isSelected = selectedPortId === portId
          return (
            <g
              key={d.id}
              onPointerDown={(e) => {
                const target = e.target as Element | null
                if (target?.closest?.('[data-pin="true"]')) return
                e.currentTarget.setPointerCapture(e.pointerId)
                const svg = (e.currentTarget.ownerSVGElement ?? e.currentTarget) as SVGSVGElement
                const rect = svg.getBoundingClientRect()
                const x = ((e.clientX - rect.left) / rect.width) * 900
                const y = ((e.clientY - rect.top) / rect.height) * 600
                dragRef.current = { id: d.id, dx: x - d.x, dy: y - d.y }
              }}
              style={{ cursor: 'grab' }}
            >
              <rect
                x={d.x}
                y={d.y}
                width={d.width}
                height={d.height}
                rx={10}
                fill="hsl(var(--card))"
                stroke="hsl(var(--border))"
              />
              <text
                x={d.x + 12}
                y={d.y + 28}
                fontSize={14}
                fill="hsl(var(--foreground))"
              >
                {d.name}
              </text>
              <circle
                data-pin="true"
                cx={pinX}
                cy={pinY}
                r={7}
                fill="hsl(var(--primary))"
                stroke={isSelected ? 'hsl(var(--ring))' : 'hsl(var(--background))'}
                strokeWidth={2}
                style={{ cursor: 'pointer' }}
                onPointerDown={(e) => {
                  e.stopPropagation()
                  const port = portById.get(portId)
                  if (!port) return
                  setError(null)
                  setRoute(null)
                  setSelectedPortId((prev) => {
                    if (!prev) return port.id
                    if (prev === port.id) return null
                    setEdges([{ id: 'e1', sourcePortId: prev, targetPortId: port.id }])
                    return null
                  })
                }}
              />
            </g>
          )
        })}
      </svg>

      <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
        拖动器件或点击引脚连线{error ? `（路由失败：${error}）` : ''}
      </div>
    </div>
  )
}
