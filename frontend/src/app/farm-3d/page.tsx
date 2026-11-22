'use client';

import React, { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import {
  getOperatorRoomsApi,
  getOperatorTraysApi,
  getMyTraysApi,
} from "@/services/api";
import type { Farm3DRoom, Farm3DTray } from "@/components/farm3d/Farm3DScene";
import SolenneFarmStage from "@/components/farm3d/SolenneFarmStage";
import CheckoutGatewayModal, {
  CheckoutItemConfig,
} from "@/components/checkout/CheckoutGatewayModal";

export default function Farm3DPage() {
  const { isAuthenticated } = useAuth();
  const [rooms, setRooms] = useState<Farm3DRoom[]>([]);
  const [trays, setTrays] = useState<Farm3DTray[]>([]);
  const [ownedTrayCodes, setOwnedTrayCodes] = useState<Set<string>>(new Set());
  const [initialTrayCode, setInitialTrayCode] = useState<string | null>(null);
  const [checkoutItem, setCheckoutItem] = useState<CheckoutItemConfig | null>(null);

  const loadFarmData = useCallback(async () => {
    try {
      const [roomsRes, traysRes] = await Promise.allSettled([
        getOperatorRoomsApi(),
        getOperatorTraysApi(),
      ]);

      if (roomsRes.status === "fulfilled" && Array.isArray(roomsRes.value)) {
        setRooms(roomsRes.value);
      }
      if (traysRes.status === "fulfilled" && Array.isArray(traysRes.value)) {
        setTrays(traysRes.value);
      }

      if (typeof window !== "undefined") {
        const code = new URLSearchParams(window.location.search).get("tray");
        if (code) setInitialTrayCode(code);
      }

      if (isAuthenticated) {
        try {
          const myList = await getMyTraysApi();
          setOwnedTrayCodes(
            new Set(myList.map((m) => m.trayCode).filter(Boolean) as string[])
          );
        } catch {
          // Bỏ qua nếu phiên tạm thời chưa hợp lệ
        }
      } else {
        setOwnedTrayCodes(new Set());
      }
    } catch {
      // Giữ trạng thái hiện tại
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadFarmData();
  }, [loadFarmData]);

  return (
    <main className="min-h-screen bg-[#140D08] text-[#F7EFE6] flex flex-col justify-between font-sans">
      <Navbar />

      <SolenneFarmStage
        rooms={rooms}
        trays={trays}
        ownedTrayCodes={ownedTrayCodes}
        initialTrayCode={initialTrayCode}
        onOpenCheckout={(item) => setCheckoutItem(item)}
      />

      <Footer />

      <CheckoutGatewayModal
        item={checkoutItem}
        onClose={() => setCheckoutItem(null)}
        onTransactionSuccess={() => {
          loadFarmData();
        }}
      />
    </main>
  );
}
