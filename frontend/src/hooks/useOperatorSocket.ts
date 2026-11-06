"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import type { AlertItem, DeviceAction, SensorReading } from "@/components/operator/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3000";

interface Handlers {
  onAlert?: (a: AlertItem) => void;
  onDevice?: (d: DeviceAction) => void;
  onSensor?: (r: SensorReading) => void;
}

export function useOperatorSocket(handlers: Handlers) {
  const [connected, setConnected] = useState(false);
  const latest = useRef(handlers);
  latest.current = handlers;

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    
    socket.on("connect", () => {
      setConnected(true);
      socket.emit("subscribe", { rooms: "all" });
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("alert:new", (a: AlertItem) => latest.current.onAlert?.(a));
    socket.on("device:action", (d: DeviceAction) => latest.current.onDevice?.(d));
    socket.on("sensor:update", (r: SensorReading) => latest.current.onSensor?.(r));

    return () => {
      socket.disconnect();
    };
  }, []);

  return { connected };
}