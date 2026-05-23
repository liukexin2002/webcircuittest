import { AvoidLib } from 'libavoid-js'
import type { Route, RouteInput } from '../types'

type RouteMessage = {
  type: 'route'
  requestId: string
  input: RouteInput
}

type RouteResultMessage = {
  type: 'routeResult'
  requestId: string
  routes: Route[]
}

type RouteErrorMessage = {
  type: 'routeError'
  requestId: string
  message: string
}

let isReady = false

async function ensureReady() {
  if (isReady) return
  await AvoidLib.load('/libavoid.wasm')
  isReady = true
}

function routeOnce(input: RouteInput): Route[] {
  const Avoid = AvoidLib.getInstance()

  const router = new Avoid.Router(0)

  const shapeBuffer = input.options?.shapeBuffer ?? 8
  const hateCrossings = input.options?.hateCrossings ?? true

  const shapes = new Map<string, any>()

  for (const node of input.nodes) {
    const x1 = node.rect.x - shapeBuffer
    const y1 = node.rect.y - shapeBuffer
    const x2 = node.rect.x + node.rect.width + shapeBuffer
    const y2 = node.rect.y + node.rect.height + shapeBuffer
    const rect = new Avoid.Rectangle(new Avoid.Point(x1, y1), new Avoid.Point(x2, y2))
    const shape = new Avoid.ShapeRef(router, rect)
    shapes.set(node.id, { rect, shape })
  }

  const portById = new Map(input.ports.map((p) => [p.id, p]))

  const connectors: Array<{ edgeId: string; conn: any }> = []
  const routes: Route[] = []

  for (const edge of input.edges) {
    const srcPort = portById.get(edge.sourcePortId)
    const dstPort = portById.get(edge.targetPortId)
    if (!srcPort || !dstPort) continue

    const srcEnd = new Avoid.ConnEnd(new Avoid.Point(srcPort.point.x, srcPort.point.y))
    const dstEnd = new Avoid.ConnEnd(new Avoid.Point(dstPort.point.x, dstPort.point.y))
    const conn = new Avoid.ConnRef(router, srcEnd, dstEnd)
    conn.setRoutingType(Avoid.OrthogonalRouting)
    conn.setHateCrossings(hateCrossings)
    connectors.push({ edgeId: edge.id, conn })

    Avoid.destroy(srcEnd)
    Avoid.destroy(dstEnd)
  }

  router.processTransaction()

  for (const { edgeId, conn } of connectors) {
    const polyline = conn.displayRoute()
    const points: Array<{ x: number; y: number }> = []
    const n = polyline.size()
    for (let p = 0; p < n; p += 1) {
      const pt = polyline.get_ps(p)
      points.push({ x: pt.x, y: pt.y })
      Avoid.destroy(pt)
    }

    Avoid.destroy(polyline)
    routes.push({ edgeId, points })
  }

  for (const { conn } of connectors) {
    router.deleteConnector(conn)
    Avoid.destroy(conn)
  }

  for (const { rect, shape } of shapes.values()) {
    router.deleteShape(shape)
    Avoid.destroy(shape)
    Avoid.destroy(rect)
  }

  Avoid.destroy(router)
  return routes
}

self.onmessage = async (event: MessageEvent<RouteMessage>) => {
  const message = event.data
  if (!message || message.type !== 'route') return

  try {
    await ensureReady()
    const routes = routeOnce(message.input)
    const res: RouteResultMessage = { type: 'routeResult', requestId: message.requestId, routes }
    self.postMessage(res)
  } catch (err) {
    const res: RouteErrorMessage = {
      type: 'routeError',
      requestId: message.requestId,
      message: err instanceof Error ? err.message : String(err),
    }
    self.postMessage(res)
  }
}
