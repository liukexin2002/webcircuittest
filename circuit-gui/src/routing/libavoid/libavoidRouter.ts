import type { RouterEngine } from '../router'
import type { Route, RouteInput } from '../types'
import { AvoidLib } from 'libavoid-js'

let didInit = false

export class LibavoidRouter implements RouterEngine {
  private ready: Promise<void>

  constructor() {
    this.ready = (async () => {
      if (didInit) return
      await AvoidLib.load('/libavoid.wasm')
      didInit = true
    })()
  }

  async route(input: RouteInput): Promise<Route[]> {
    await this.ready
    const Avoid = AvoidLib.getInstance()

    const router = new Avoid.Router(Avoid.PolyLineRouting | Avoid.OrthogonalRouting)
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

    const connectors: Array<{ edgeId: string; conn: any; srcEnd: any; dstEnd: any }> = []
    for (const edge of input.edges) {
      const srcPort = portById.get(edge.sourcePortId)
      const dstPort = portById.get(edge.targetPortId)
      if (!srcPort) throw new Error(`Missing source port: ${edge.sourcePortId}`)
      if (!dstPort) throw new Error(`Missing target port: ${edge.targetPortId}`)

      const srcEnd = new Avoid.ConnEnd(new Avoid.Point(srcPort.point.x, srcPort.point.y))
      const dstEnd = new Avoid.ConnEnd(new Avoid.Point(dstPort.point.x, dstPort.point.y))
      const conn = new Avoid.ConnRef(router)
      conn.setSourceEndpoint(srcEnd)
      conn.setDestEndpoint(dstEnd)
      conn.setRoutingType(Avoid.OrthogonalRouting)
      conn.setHateCrossings(hateCrossings)
      connectors.push({ edgeId: edge.id, conn, srcEnd, dstEnd })
    }
    if (input.edges.length > 0 && connectors.length === 0) {
      throw new Error('No connectors created')
    }

    router.processTransaction()

    const routes: Route[] = []
    for (const { edgeId, conn } of connectors) {
      const polyline = conn.displayRoute()
      const points: Array<{ x: number; y: number }> = []
      const n = polyline.size()
      for (let p = 0; p < n; p += 1) {
        const pt = polyline.get_ps(p)
        points.push({ x: pt.x, y: pt.y })
      }
      routes.push({ edgeId, points })
    }
    if (connectors.length > 0 && routes.every((r) => r.points.length === 0)) {
      throw new Error('No route returned (0 points)')
    }
    return routes
  }

  dispose() {
    return
  }
}
