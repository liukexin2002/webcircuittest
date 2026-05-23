import type { Route, RouteInput } from './types'

export interface RouterEngine {
  route(input: RouteInput): Promise<Route[]>
  dispose(): void
}

