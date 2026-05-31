/**
 * 领域事件类型定义
 * 定义领域模型状态变更时发布的事件类型
 */

import type { Id, Point, DeviceRotation } from '../types';
import type { Device } from '../entities/Device';
import type { Connection } from '../entities/Connection';
import type { Net } from '../entities/Net';
import type { Waypoint } from '../entities/Connection';

export enum DomainEventType {
  DEVICE_ADDED = 'device:added',
  DEVICE_REMOVED = 'device:removed',
  DEVICE_MOVED = 'device:moved',
  DEVICE_ROTATED = 'device:rotated',
  
  CONNECTION_ADDED = 'connection:added',
  CONNECTION_REMOVED = 'connection:removed',
  CONNECTION_UPDATED = 'connection:updated',
  CONNECTION_SELECTED = 'connection:selected',
  
  NET_CREATED = 'net:created',
  NET_REMOVED = 'net:removed',
  NET_UPDATED = 'net:updated',
  
  PIN_CONNECTED = 'pin:connected',
  PIN_DISCONNECTED = 'pin:disconnected',
  
  ROUTING_STARTED = 'routing:started',
  ROUTING_COMPLETED = 'routing:completed',
  
  SELECTION_CHANGED = 'selection:changed',
  CIRCUIT_LOADED = 'circuit:loaded',
  CIRCUIT_CLEARED = 'circuit:cleared'
}

export interface BaseDomainEvent {
  type: DomainEventType;
  timestamp: number;
}

export interface DeviceAddedEvent extends BaseDomainEvent {
  type: DomainEventType.DEVICE_ADDED;
  device: Device;
}

export interface DeviceRemovedEvent extends BaseDomainEvent {
  type: DomainEventType.DEVICE_REMOVED;
  deviceId: Id;
}

export interface DeviceMovedEvent extends BaseDomainEvent {
  type: DomainEventType.DEVICE_MOVED;
  deviceId: Id;
  position: Point;
  previousPosition: Point;
}

export interface DeviceRotatedEvent extends BaseDomainEvent {
  type: DomainEventType.DEVICE_ROTATED;
  deviceId: Id;
  rotation: DeviceRotation;
  previousRotation: DeviceRotation;
}

export interface ConnectionAddedEvent extends BaseDomainEvent {
  type: DomainEventType.CONNECTION_ADDED;
  connection: Connection;
}

export interface ConnectionRemovedEvent extends BaseDomainEvent {
  type: DomainEventType.CONNECTION_REMOVED;
  connectionId: Id;
}

export interface ConnectionUpdatedEvent extends BaseDomainEvent {
  type: DomainEventType.CONNECTION_UPDATED;
  connectionId: Id;
  waypoints: Waypoint[];
  previousWaypoints: Waypoint[];
}

export interface ConnectionSelectedEvent extends BaseDomainEvent {
  type: DomainEventType.CONNECTION_SELECTED;
  connectionId: Id | null;
}

export interface NetCreatedEvent extends BaseDomainEvent {
  type: DomainEventType.NET_CREATED;
  net: Net;
}

export interface NetRemovedEvent extends BaseDomainEvent {
  type: DomainEventType.NET_REMOVED;
  netId: Id;
}

export interface NetUpdatedEvent extends BaseDomainEvent {
  type: DomainEventType.NET_UPDATED;
  netId: Id;
  name?: string;
  color?: string | null;
}

export interface PinConnectedEvent extends BaseDomainEvent {
  type: DomainEventType.PIN_CONNECTED;
  deviceId: Id;
  pinId: Id;
  netId: Id;
}

export interface PinDisconnectedEvent extends BaseDomainEvent {
  type: DomainEventType.PIN_DISCONNECTED;
  deviceId: Id;
  pinId: Id;
  previousNetId: Id;
}

export interface RoutingStartedEvent extends BaseDomainEvent {
  type: DomainEventType.ROUTING_STARTED;
  connectionIds: Id[];
}

export interface RoutingCompletedEvent extends BaseDomainEvent {
  type: DomainEventType.ROUTING_COMPLETED;
  connectionIds: Id[];
}

export interface SelectionChangedEvent extends BaseDomainEvent {
  type: DomainEventType.SELECTION_CHANGED;
  selectedIds: Set<Id>;
  previousSelectedIds: Set<Id>;
}

export interface CircuitLoadedEvent extends BaseDomainEvent {
  type: DomainEventType.CIRCUIT_LOADED;
  circuit: any;
}

export interface CircuitClearedEvent extends BaseDomainEvent {
  type: DomainEventType.CIRCUIT_CLEARED;
}

export type DomainEvent =
  | DeviceAddedEvent
  | DeviceRemovedEvent
  | DeviceMovedEvent
  | DeviceRotatedEvent
  | ConnectionAddedEvent
  | ConnectionRemovedEvent
  | ConnectionUpdatedEvent
  | ConnectionSelectedEvent
  | NetCreatedEvent
  | NetRemovedEvent
  | NetUpdatedEvent
  | PinConnectedEvent
  | PinDisconnectedEvent
  | RoutingStartedEvent
  | RoutingCompletedEvent
  | SelectionChangedEvent
  | CircuitLoadedEvent
  | CircuitClearedEvent;

export type DomainEventCallback<T extends DomainEvent = DomainEvent> = (
  event: T
) => void;
