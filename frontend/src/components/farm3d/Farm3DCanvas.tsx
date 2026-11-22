'use client';

import React, { useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export interface Farm3DRoom {
  roomId: number;
  roomCode: string;
  roomName: string;
  totalTrays?: number;
  occupiedTrays?: number;
  availableTrays?: number;
  maintenanceTrays?: number;
  tempMin?: number;
  tempMax?: number;
  humidityMin?: number;
  humidityMax?: number;
  co2Max?: number;
}

export interface Farm3DTray {
  trayId: number;
  trayCode: string;
  roomId: number;
  rackNumber: number;
  shelfLevel: number;
  positionNumber: number;
  status: string;
  speciesName?: string | null;
  inoculationDate?: string | null;
  expectedHarvestDate?: string | null;
  customerName?: string | null;
}

export type CameraMode = "overview" | "top2d" | "room" | "tray" | "tour";
export type LightingMode = "day" | "night" | "uvc";

interface CameraRigProps {
  mode: CameraMode;
  targetPos: [number, number, number];
  cameraPos: [number, number, number];
  controlsRef: React.RefObject<any>;
}

function CameraRig({ mode, targetPos, cameraPos, controlsRef }: CameraRigProps) {
  const { camera } = useThree();
  const desiredPos = useMemo(() => new THREE.Vector3(...cameraPos), [cameraPos]);
  const desiredTarget = useMemo(() => new THREE.Vector3(...targetPos), [targetPos]);
  const isAnimating = useRef(true);

  useEffect(() => {
    isAnimating.current = true;
  }, [mode, cameraPos, targetPos]);

  useFrame((_, delta) => {
    if (!isAnimating.current) return;
    const speed = Math.min(1, delta * 3.8);
    camera.position.lerp(desiredPos, speed);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(desiredTarget, speed);
      controlsRef.current.update();
    }
    if (
      camera.position.distanceTo(desiredPos) < 0.06 &&
      (!controlsRef.current || controlsRef.current.target.distanceTo(desiredTarget) < 0.06)
    ) {
      isAnimating.current = false;
    }
  });

  return null;
}

function getRoomCenterX(roomIndex: number): number {
  // 3 chambers spaced cleanly along X: -11, 0, +11
  return (roomIndex - 1) * 11.2;
}

function getTrayWorldPosition(
  tray: Farm3DTray,
  roomIndexMap: Map<number, number>
): [number, number, number] {
  const roomIdx = roomIndexMap.get(tray.roomId) ?? 0;
  const roomX = getRoomCenterX(roomIdx);
  const rack = Math.max(1, Number(tray.rackNumber) || 1);
  const shelf = Math.max(1, Number(tray.shelfLevel) || 1);
  const pos = Math.max(1, Number(tray.positionNumber) || 1);

  // Racks arranged left/right inside chamber: rack 1 = -2.3, rack 2 = +2.3, rack 3 = 0 (or offset)
  const rackOffsetX = rack === 1 ? -2.35 : rack === 2 ? 2.35 : 0;
  const x = roomX + rackOffsetX;
  const y = 0.45 + (shelf - 1) * 0.72;
  const z = -2.2 + ((pos - 1) % 4) * 1.45;
  return [x, y, z];
}

function getSpeciesVisual(speciesName?: string | null) {
  const s = (speciesName || "").toLowerCase();
  if (s.includes("linh chi")) {
    return { capColor: "#B45309", stemColor: "#D97706", scale: 1.05 };
  }
  if (s.includes("đông trùng") || s.includes("hạ thảo")) {
    return { capColor: "#F59E0B", stemColor: "#FBBF24", scale: 0.9 };
  }
  return { capColor: "#D6CFC4", stemColor: "#EFECE6", scale: 1.0 };
}

function TrayMesh({
  tray,
  position,
  isOwned,
  isSelected,
  onSelect,
}: {
  tray: Farm3DTray;
  position: [number, number, number];
  isOwned: boolean;
  isSelected: boolean;
  onSelect: (tray: Farm3DTray) => void;
}) {
  const isOccupied = tray.status === "OCCUPIED";
  const isMaintenance = tray.status === "MAINTENANCE";

  const trayColor = isSelected
    ? "#C28E58"
    : isOwned
    ? "#E2BA78"
    : isOccupied
    ? "#10B981"
    : isMaintenance
    ? "#F43F5E"
    : "#E7DFD3";

  const speciesVis = getSpeciesVisual(tray.speciesName);

  // Compute subtle growth scale from inoculation date (0.45 -> 1.15)
  const growthFactor = useMemo(() => {
    if (!isOccupied) return 0;
    if (!tray.inoculationDate) return 0.85;
    const days = Math.max(
      1,
      Math.floor((Date.now() - new Date(tray.inoculationDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
    return Math.min(1.15, Math.max(0.45, 0.45 + (days / 30) * 0.7));
  }, [isOccupied, tray.inoculationDate]);

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(tray);
      }}
    >
      {/* Khay vật lý */}
      <RoundedBox args={[1.15, 0.14, 1.05]} radius={0.03} smoothness={2} castShadow receiveShadow>
        <meshStandardMaterial
          color={trayColor}
          roughness={0.35}
          metalness={isOwned || isSelected ? 0.35 : 0.15}
          emissive={isSelected ? "#C28E58" : isOwned ? "#92400E" : "#000000"}
          emissiveIntensity={isSelected ? 0.45 : isOwned ? 0.25 : 0}
        />
      </RoundedBox>

      {/* Giá thể & Cụm nấm 3D nếu khay đang nuôi */}
      {isOccupied && (
        <group position={[0, 0.12, 0]} scale={growthFactor * speciesVis.scale}>
          {/* Khối phôi hữu cơ */}
          <mesh position={[0, 0.04, 0]} castShadow>
            <boxGeometry args={[0.85, 0.1, 0.75]} />
            <meshStandardMaterial color="#4A3525" roughness={0.9} />
          </mesh>
          {/* 3 cây nấm đại diện trên khay */}
          {[
            [-0.18, 0.12, -0.12, 1.0],
            [0.16, 0.14, 0.08, 1.15],
            [-0.02, 0.1, 0.18, 0.85],
          ].map(([mx, my, mz, ms], idx) => (
            <group key={idx} position={[mx, my, mz]} scale={ms}>
              <mesh position={[0, 0.05, 0]} castShadow>
                <cylinderGeometry args={[0.035, 0.045, 0.12, 8]} />
                <meshStandardMaterial color={speciesVis.stemColor} roughness={0.6} />
              </mesh>
              <mesh position={[0, 0.13, 0]} castShadow>
                <sphereGeometry args={[0.11, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
                <meshStandardMaterial color={speciesVis.capColor} roughness={0.45} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* Nhãn nổi cho khay đang được chọn */}
      {isSelected && (
        <Html position={[0, 0.65, 0]} center distanceFactor={12}>
          <div className="px-2.5 py-1 rounded-xl bg-[#24170E]/95 text-white border border-[#E2BA78] shadow-lg text-[10px] font-bold whitespace-nowrap pointer-events-none">
            {tray.trayCode}
            {isOwned ? " • Khay của bạn" : ""}
          </div>
        </Html>
      )}
    </group>
  );
}

function ChamberCutaway({
  room,
  roomIndex,
  isSelected,
  lightingMode,
  onSelectRoom,
}: {
  room: Farm3DRoom;
  roomIndex: number;
  isSelected: boolean;
  lightingMode: LightingMode;
  onSelectRoom: (roomId: number) => void;
}) {
  const cx = getRoomCenterX(roomIndex);
  const lightColor =
    lightingMode === "uvc" ? "#A855F7" : lightingMode === "night" ? "#F59E0B" : "#FFFBEB";
  const lightIntensity = lightingMode === "night" ? 0.65 : lightingMode === "uvc" ? 0.8 : 1.1;

  return (
    <group position={[cx, 0, 0]}>
      {/* Sàn phòng sạch ISO Class 5 */}
      <RoundedBox
        args={[9.2, 0.24, 8.2]}
        position={[0, -0.12, 0]}
        radius={0.08}
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelectRoom(room.roomId);
        }}
      >
        <meshStandardMaterial
          color={isSelected ? "#EFE6D8" : "#F5EFE6"}
          roughness={0.5}
          metalness={0.05}
        />
      </RoundedBox>

      {/* Viền phát sáng khi buồng được chọn */}
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[4.4, 4.55, 4]} />
          <meshBasicMaterial color="#C28E58" />
        </mesh>
      )}

      {/* Tường sau cắt lớp (Cutaway Back Wall) */}
      <RoundedBox args={[9.0, 3.8, 0.18]} position={[0, 1.9, -4.0]} radius={0.05} receiveShadow>
        <meshStandardMaterial color="#E6DDD0" roughness={0.65} />
      </RoundedBox>

      {/* Tường kính bên trái & phải */}
      <mesh position={[-4.5, 1.9, 0]}>
        <boxGeometry args={[0.08, 3.8, 8.0]} />
        <meshPhysicalMaterial
          color="#D1FAE5"
          transparent
          opacity={0.22}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[4.5, 1.9, 0]}>
        <boxGeometry args={[0.08, 3.8, 8.0]} />
        <meshPhysicalMaterial
          color="#D1FAE5"
          transparent
          opacity={0.22}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* Thanh đèn quang phổ trên trần mở */}
      {[-2.35, 2.35].map((rx, idx) => (
        <group key={idx} position={[rx, 3.75, 0]}>
          <mesh>
            <boxGeometry args={[0.25, 0.08, 6.2]} />
            <meshStandardMaterial
              color={lightColor}
              emissive={lightColor}
              emissiveIntensity={lightingMode === "uvc" ? 1.4 : 0.7}
            />
          </mesh>
          <pointLight position={[0, -0.4, 0]} color={lightColor} intensity={lightIntensity} distance={7} />
        </group>
      ))}

      {/* Khung kệ thép không gỉ (2 dãy kệ x 5 tầng) */}
      {[-2.35, 2.35].map((rx, rIdx) => (
        <group key={rIdx} position={[rx, 0, -0.1]}>
          {[-0.65, 0.65].map((px) =>
            [-2.9, 2.9].map((pz) => (
              <mesh key={`${px}-${pz}`} position={[px, 1.75, pz]} castShadow>
                <cylinderGeometry args={[0.035, 0.035, 3.5, 8]} />
                <meshStandardMaterial color="#94A3B8" metalness={0.7} roughness={0.3} />
              </mesh>
            ))
          )}
        </group>
      ))}

      {/* Nhãn nổi trên buồng giống phong cách Dormer (Reel 1) */}
      <Html position={[0, 4.35, 0]} center distanceFactor={18}>
        <button
          type="button"
          onClick={() => onSelectRoom(room.roomId)}
          className={`px-3 py-1.5 rounded-full border shadow-md backdrop-blur-md text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
            isSelected
              ? "bg-[#24170E] text-white border-[#E2BA78]"
              : "bg-white/90 text-[#24170E] border-[#DECFC0] hover:border-[#C28E58]"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{room.roomCode}</span>
          <span className="opacity-70 font-normal">
            {room.occupiedTrays ?? 0}/{room.totalTrays ?? 0} khay
          </span>
        </button>
      </Html>
    </group>
  );
}

interface Farm3DCanvasProps {
  rooms: Farm3DRoom[];
  trays: Farm3DTray[];
  ownedTrayCodes: Set<string>;
  selectedRoomId: number | null;
  selectedTray: Farm3DTray | null;
  cameraMode: CameraMode;
  tourStep: number;
  lightingMode: LightingMode;
  showHotspots: boolean;
  activeHotspot: number | null;
  onSelectRoom: (roomId: number) => void;
  onSelectTray: (tray: Farm3DTray) => void;
  onSelectHotspot: (id: number) => void;
}

const TOUR_KEYFRAMES: Array<{ cam: [number, number, number]; target: [number, number, number] }> = [
  { cam: [0, 14, 22], target: [0, 1.2, 0] },       // 01. Toàn cảnh khu trang trại
  { cam: [-11.2, 4.2, 8.5], target: [-11.2, 1.4, -0.5] }, // 02. Bay vào buồng RM01
  { cam: [-13.4, 2.5, 4.2], target: [-13.5, 1.6, -1.2] }, // 03. Dãy kệ đa tầng
  { cam: [-12.2, 1.9, 1.4], target: [-13.5, 1.3, -0.7] }, // 04. Cận cảnh khay nấm & IoT
];

export default function Farm3DCanvas({
  rooms,
  trays,
  ownedTrayCodes,
  selectedRoomId,
  selectedTray,
  cameraMode,
  tourStep,
  lightingMode,
  showHotspots,
  activeHotspot,
  onSelectRoom,
  onSelectTray,
  onSelectHotspot,
}: Farm3DCanvasProps) {
  const controlsRef = useRef<any>(null);

  const roomIndexMap = useMemo(() => {
    const map = new Map<number, number>();
    rooms.forEach((r, idx) => map.set(r.roomId, idx));
    return map;
  }, [rooms]);

  const { cameraPos, targetPos } = useMemo<{
    cameraPos: [number, number, number];
    targetPos: [number, number, number];
  }>(() => {
    if (cameraMode === "top2d") {
      return { cameraPos: [0, 28, 0.01], targetPos: [0, 0, 0] };
    }
    if (cameraMode === "tour") {
      const kf = TOUR_KEYFRAMES[Math.min(TOUR_KEYFRAMES.length - 1, Math.max(0, tourStep))];
      return { cameraPos: kf.cam, targetPos: kf.target };
    }
    if (cameraMode === "tray" && selectedTray) {
      const [tx, ty, tz] = getTrayWorldPosition(selectedTray, roomIndexMap);
      return {
        cameraPos: [tx + 2.3, ty + 1.15, tz + 2.6],
        targetPos: [tx, ty, tz],
      };
    }
    if (cameraMode === "room" && selectedRoomId !== null) {
      const rIdx = roomIndexMap.get(selectedRoomId) ?? 0;
      const cx = getRoomCenterX(rIdx);
      return {
        cameraPos: [cx + 0.5, 4.4, 9.2],
        targetPos: [cx, 1.4, -0.5],
      };
    }
    // overview isometric cutaway
    return { cameraPos: [0, 14, 21.5], targetPos: [0, 1.0, 0] };
  }, [cameraMode, tourStep, selectedRoomId, selectedTray, roomIndexMap]);

  const activeTrayPos = useMemo<[number, number, number] | null>(() => {
    if (!selectedTray) return null;
    return getTrayWorldPosition(selectedTray, roomIndexMap);
  }, [selectedTray, roomIndexMap]);

  const bgColor = lightingMode === "night" ? "#161311" : lightingMode === "uvc" ? "#191224" : "#F3EDE3";

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden border border-[#DECFC0] dark:border-[#474039] shadow-xl">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 14, 21.5], fov: 42, near: 0.1, far: 120 }}
      >
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[bgColor, 34, 75]} />

        <ambientLight intensity={lightingMode === "day" ? 0.75 : 0.35} />
        <directionalLight
          position={[14, 24, 16]}
          intensity={lightingMode === "day" ? 1.15 : 0.45}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Sân nền tổng thể trang trại */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.26, 0]} receiveShadow>
          <planeGeometry args={[80, 50]} />
          <meshStandardMaterial
            color={lightingMode === "night" ? "#1E1B18" : "#E5DEC9"}
            roughness={0.9}
          />
        </mesh>

        {/* 3 Buồng nuôi cắt lớp */}
        {rooms.map((room, idx) => (
          <ChamberCutaway
            key={room.roomId}
            room={room}
            roomIndex={idx}
            isSelected={selectedRoomId === room.roomId}
            lightingMode={lightingMode}
            onSelectRoom={onSelectRoom}
          />
        ))}

        {/* Toàn bộ khay nấm vật lý từ SQL Server */}
        {trays.map((tray) => {
          const pos = getTrayWorldPosition(tray, roomIndexMap);
          return (
            <TrayMesh
              key={tray.trayId}
              tray={tray}
              position={pos}
              isOwned={ownedTrayCodes.has(tray.trayCode)}
              isSelected={selectedTray?.trayId === tray.trayId}
              onSelect={onSelectTray}
            />
          );
        })}

        {/* 3 Điểm Hotspot tương tác phong cách Reel 4 (01 Phôi nấm, 02 Cảm biến IoT, 03 Đèn quang phổ) */}
        {showHotspots && activeTrayPos && (
          <group position={activeTrayPos}>
            {[
              { id: 1, offset: [0, 0.35, 0] as [number, number, number], label: "01" },
              { id: 2, offset: [0.68, 0.15, 0.45] as [number, number, number], label: "02" },
              { id: 3, offset: [0, 0.95, -0.35] as [number, number, number], label: "03" },
            ].map((pin) => (
              <Html key={pin.id} position={pin.offset} center distanceFactor={10}>
                <button
                  type="button"
                  onClick={() => onSelectHotspot(pin.id)}
                  className={`w-7 h-7 rounded-full font-mono text-[11px] font-black border-2 shadow-lg transition transform hover:scale-110 cursor-pointer flex items-center justify-center ${
                    activeHotspot === pin.id
                      ? "bg-[#24170E] text-[#E2BA78] border-[#E2BA78]"
                      : "bg-white text-[#24170E] border-[#24170E]"
                  }`}
                >
                  {pin.label}
                </button>
              </Html>
            ))}
          </group>
        )}

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.08}
          maxPolarAngle={Math.PI / 2 - 0.06}
          minDistance={2.5}
          maxDistance={42}
        />

        <CameraRig
          mode={cameraMode}
          cameraPos={cameraPos}
          targetPos={targetPos}
          controlsRef={controlsRef}
        />
      </Canvas>
    </div>
  );
}
