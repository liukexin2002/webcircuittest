import type { RouterEngine } from '../router'
import type { Route, RouteInput } from '../types'

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

type WorkerMessage = RouteResultMessage | RouteErrorMessage

let requestSeq = 0

export class LibavoidRouter implements RouterEngine {
  private worker: Worker
  private pending = new Map<
    string,
    { resolve: (routes: Route[]) => void; reject: (err: Error) => void }
  >()

  constructor() {
    this.worker = new Worker(new URL('./libavoid.worker.ts', import.meta.url), { type: 'module' })
    this.worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data
      const handler = this.pending.get(message.requestId)
      if (!handler) return
      this.pending.delete(message.requestId)
      if (message.type === 'routeResult') handler.resolve(message.routes)
      else handler.reject(new Error(message.message))
    }
  }

  route(input: RouteInput): Promise<Route[]> {
    const requestId = `${Date.now()}-${(requestSeq += 1)}`
    return new Promise((resolve, reject) => {
      this.pending.set(requestId, { resolve, reject })
      this.worker.postMessage({ type: 'route', requestId, input })
    })
  }

  dispose() {
    for (const { reject } of this.pending.values()) reject(new Error('Router disposed'))
    this.pending.clear()
    this.worker.terminate()
  }
}

