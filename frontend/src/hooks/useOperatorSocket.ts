"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import type { AlertItem, DeviceAction, SensorReading } from "@/components/operator/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000";

export interface TrayOccupiedEvent {
  trayId: number;
  roomId?: number;
  orderId: number;
  orderCode: string;
  packageId: number;
  timestamp: string;
}

export interface HarvestRequestedEvent {
  harvestId: number;
  orderId: number;
  deliveryType: string;
  timestamp: string;
}

interface Handlers {
  onAlert?: (a: AlertItem) => void;
  onDevice?: (d: DeviceAction) => void;
  onSensor?: (r: SensorReading) => void;
  onTrayOccupied?: (t: TrayOccupiedEvent) => void;
  onHarvestRequested?: (h: HarvestRequestedEvent) => void;
}

export function useOperatorSocket(handlers: Handlers, enabled: boolean = true) {
  const [connected, setConnected] = useState(false);
  const latest = useRef(handlers);
  latest.current = handlers;

  useEffect(() => {
    if (!enabled) return;
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    
    socket.on("connect", () => {
      setConnected(true);
      socket.emit("subscribe", { rooms: "all" });
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("alert:new", (a: AlertItem) => latest.current.onAlert?.(a));
    socket.on("device:action", (d: DeviceAction) => latest.current.onDevice?.(d));
    socket.on("sensor:update", (r: SensorReading) => latest.current.onSensor?.(r));
    socket.on("tray:occupied", (t: TrayOccupiedEvent) => latest.current.onTrayOccupied?.(t));
    socket.on("harvest:requested", (h: HarvestRequestedEvent) => latest.current.onHarvestRequested?.(h));

    return () => {
      socket.disconnect();
    };
  }, [enabled]);

  return { connected };
}