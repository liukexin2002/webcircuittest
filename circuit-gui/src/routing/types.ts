export type Point = { x: number; y: number }

export type Rect = { x: number; y: number; width: number; height: number }

export type PortSide = 'north' | 'south' | 'east' | 'west'

export type NodeShape = {
  id: string
  rect: Rect
}

export type Port = {
  id: string
  nodeId: string
  point: Point
  side: PortSide
}

export type Edge = {
  id: string
  sourcePortId: string
  targetPortId: string
}

export type Route = {
  edgeId: string
  points: Point[]
}

export type RouteInput = {
  nodes: NodeShape[]
  ports: Port[]
  edges: Edge[]
  options?: {
    shapeBuffer?: number
    hateCrossings?: boolean
  }
}

