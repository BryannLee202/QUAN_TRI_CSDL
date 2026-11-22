'use client';

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  RoundedBox,
  Html,
  Line,
  Sparkles,
} from "@react-three/drei";
import * as THREE from "three";
import type { Farm3DRoom, Farm3DTray, LightingMode } from "./Farm3DCanvas";

interface ExplodedFarm3DProps {
  progress: number; // 0 -> 1 driven continuously by scroll or quick-jump
  rooms: Farm3DRoom[];
  trays: Farm3DTray[];
  ownedTrayCodes: Set<string>;
  lightingMode?: LightingMode;
  mistEnabled?: boolean;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const CLUSTER_OFFSETS: Array<[number, number, number, number]> = [
  [-0.22, 0.16, -0.32, 0.95],
  [0.18, 0.17, -0.28, 1.1],
  [-0.04, 0.19, -0.04, 1.2],
  [-0.24, 0.16, 0.24, 0.9],
  [0.2, 0.17, 0.28, 1.05],
];

function MushroomCluster({
  speciesIndex,
  scale = 1,
}: {
  speciesIndex: number; // 0 = Oyster, 1 = Lion's Mane, 2 = Reishi
  scale?: number;
}) {
  const capColor =
    speciesIndex === 2 ? "#B45309" : speciesIndex === 1 ? "#F7F3EA" : "#DFD8CE";
  const stemColor =
    speciesIndex === 2 ? "#D97706" : speciesIndex === 1 ? "#EFECE6" : "#F3EFEA";

  return (
    <group scale={scale}>
      {CLUSTER_OFFSETS.map(([mx, my, mz, ms], idx) => (
        <group key={idx} position={[mx, my, mz]} scale={ms}>
          {speciesIndex === 1 ? (
            // Nấm Hầu Thủ (Lion's Mane): chùm cầu xếp tầng mịn
            <>
              <mesh position={[0, 0.08, 0]} castShadow>
                <dodecahedronGeometry args={[0.11, 2]} />
                <meshStandardMaterial color={capColor} roughness={0.72} />
              </mesh>
              <mesh position={[0.05, 0.04, 0.05]} castShadow>
                <dodecahedronGeometry args={[0.065, 1]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.75} />
              </mesh>
            </>
          ) : (
            // Bào Ngư Xám / Linh Chi Đỏ: thân + tán mũ bóng nhẹ
            <>
              <mesh position={[0, 0.045, 0]} castShadow>
                <cylinderGeometry args={[0.028, 0.04, 0.1, 10]} />
                <meshStandardMaterial color={stemColor} roughness={0.55} />
              </mesh>
              <mesh
                position={[0, 0.11, 0]}
                scale={speciesIndex === 2 ? [1.25, 0.55, 1.1] : [1.05, 0.72, 1.05]}
                castShadow
              >
                <sphereGeometry args={[0.105, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
                <meshStandardMaterial
                  color={capColor}
                  roughness={speciesIndex === 2 ? 0.25 : 0.45}
                  metalness={speciesIndex === 2 ? 0.15 : 0.02}
                />
              </mesh>
            </>
          )}
        </group>
      ))}
    </group>
  );
}

function AnimatedSceneContent({
  progress,
  rooms,
  trays,
  ownedTrayCodes,
  lightingMode = "day",
  mistEnabled = true,
}: ExplodedFarm3DProps) {
  const { camera } = useThree();
  const roofRef = useRef<THREE.Group>(null);
  const frontGlassRef = useRef<THREE.Group>(null);
  const heroTrayRef = useRef<THREE.Group>(null);
  const heroLedRef = useRef<THREE.Group>(null);
  const heroSensorRef = useRef<THREE.Group>(null);

  const featuredTray = useMemo(() => {
    const owned = trays.find((t) => ownedTrayCodes.has(t.trayCode));
    if (owned) return owned;
    const occupied = trays.find((t) => t.status === "OCCUPIED");
    return occupied || trays[0] || null;
  }, [trays, ownedTrayCodes]);

  const ledColor =
    lightingMode === "uvc" ? "#C084FC" : lightingMode === "night" ? "#FBBF24" : "#FEF3C7";
  const ledEmissive =
    lightingMode === "uvc" ? "#9333EA" : lightingMode === "night" ? "#F59E0B" : "#FDE68A";

  useFrame((_, delta) => {
    const p = clamp01(progress);

    const roofLift = smoothstep(0.16, 0.44, p);
    const flyIn = smoothstep(0.42, 0.72, p);
    const trayPull = smoothstep(0.56, 0.78, p);
    const trayExplode = smoothstep(0.74, 0.96, p);

    const camX = lerp(lerp(13.2, 4.2, roofLift), lerp(4.2, -2.05, flyIn), flyIn);
    const camY = lerp(lerp(8.0, 10.2, roofLift), lerp(10.2, 2.2, flyIn), flyIn);
    const camZ = lerp(lerp(18.2, 14.2, roofLift), lerp(14.2, 4.25, flyIn), flyIn);

    const tgtX = lerp(0, -3.55, flyIn);
    const tgtY = lerp(1.4, 1.52, flyIn);
    const tgtZ = lerp(0, 1.25, flyIn);

    const k = Math.min(1, delta * 8.5);
    camera.position.lerp(new THREE.Vector3(camX, camY, camZ), k);
    camera.lookAt(tgtX, tgtY, tgtZ);

    if (roofRef.current) {
      roofRef.current.position.y = lerp(3.98, 9.6, roofLift);
      roofRef.current.visible = roofLift < 0.96;
    }

    if (frontGlassRef.current) {
      frontGlassRef.current.position.z = lerp(4.05, 6.4, roofLift);
      frontGlassRef.current.position.y = lerp(1.9, -2.8, roofLift);
      frontGlassRef.current.visible = roofLift < 0.92;
    }

    if (heroTrayRef.current) {
      heroTrayRef.current.position.z = lerp(0, 1.88, trayPull);
    }

    if (heroLedRef.current) {
      heroLedRef.current.position.y = lerp(0.52, 1.32, trayExplode);
    }
    if (heroSensorRef.current) {
      heroSensorRef.current.position.x = lerp(0.58, 1.28, trayExplode);
      heroSensorRef.current.position.y = lerp(0.14, 0.44, trayExplode);
    }
  });

  const showExplodeLabels = progress >= 0.75;

  return (
    <>
      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.4}
          position={[0, 12, 4]}
          scale={[20, 12, 1]}
          rotation={[Math.PI / 2, 0, 0]}
          color="#FFFDF7"
        />
        <Lightformer
          form="rect"
          intensity={1.5}
          position={[-14, 6, 8]}
          scale={[12, 6, 1]}
          rotation={[0, Math.PI / 3, 0]}
          color="#E2BA78"
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          position={[14, 5, -6]}
          scale={[12, 6, 1]}
          rotation={[0, -Math.PI / 3, 0]}
          color="#D1FAE5"
        />
      </Environment>

      <ambientLight intensity={lightingMode === "day" ? 0.5 : 0.26} />
      <directionalLight
        position={[12, 20, 14]}
        intensity={lightingMode === "day" ? 1.3 : 0.55}
        color={lightingMode === "uvc" ? "#E9D5FF" : "#FFFBF2"}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0004}
      />

      <ContactShadows
        position={[0, -0.24, 0]}
        opacity={0.45}
        scale={44}
        blur={2.0}
        far={12}
        color="#24170E"
      />

      {/* Hạt sương siêu âm lơ lửng trong không gian phòng sạch */}
      {mistEnabled && (
        <Sparkles
          count={95}
          scale={[21, 3.2, 7.2]}
          position={[0, 2.0, 0]}
          size={1.6}
          speed={0.28}
          opacity={0.42}
          color={lightingMode === "uvc" ? "#D8B4FE" : "#ECFDF5"}
        />
      )}

      {/* Đế sân vườn kiến trúc & lối đi đá */}
      <group position={[0, -0.18, 0]}>
        <RoundedBox args={[25.8, 0.36, 12.6]} radius={0.14} smoothness={4} receiveShadow>
          <meshStandardMaterial color="#D5E0D2" roughness={0.78} />
        </RoundedBox>
        <RoundedBox args={[24.6, 0.16, 11.4]} position={[0, 0.22, 0]} radius={0.08} receiveShadow>
          <meshStandardMaterial color="#F3EDE2" roughness={0.5} />
        </RoundedBox>

        {/* Tấm đá bước dạo lối vào */}
        {[-7.2, 0, 7.2].map((wx, idx) => (
          <RoundedBox
            key={idx}
            args={[1.6, 0.04, 1.2]}
            position={[wx, 0.31, 4.9]}
            radius={0.02}
            receiveShadow
          >
            <meshStandardMaterial color="#D6CEC2" roughness={0.85} />
          </RoundedBox>
        ))}

        {/* Cây xanh cảnh quan */}
        {[
          [-11.4, 0.3, 4.4],
          [-10.2, 0.3, 5.0],
          [11.2, 0.3, 4.5],
          [11.5, 0.3, -3.9],
        ].map(([tx, ty, tz], idx) => (
          <group key={idx} position={[tx, ty, tz]}>
            <mesh position={[0, 0.45, 0]} castShadow>
              <cylinderGeometry args={[0.065, 0.095, 0.9, 10]} />
              <meshStandardMaterial color="#6B442C" roughness={0.85} />
            </mesh>
            <mesh position={[0, 1.15, 0]} castShadow>
              <dodecahedronGeometry args={[0.55, 2]} />
              <meshStandardMaterial color="#658A6F" roughness={0.75} />
            </mesh>
            <mesh position={[0.25, 0.92, 0.18]} castShadow>
              <dodecahedronGeometry args={[0.36, 1]} />
              <meshStandardMaterial color="#7FA187" roughness={0.75} />
            </mesh>
          </group>
        ))}

        {/* Sảnh kính Airlock lối vào */}
        <group position={[0, 0.95, 4.9]}>
          <RoundedBox args={[3.1, 1.75, 1.65]} radius={0.05} castShadow>
            <meshPhysicalMaterial
              color="#E6F4EE"
              transmission={0.62}
              opacity={1}
              transparent
              roughness={0.06}
              ior={1.45}
              thickness={0.2}
            />
          </RoundedBox>
          <RoundedBox args={[3.3, 0.12, 1.85]} position={[0, 0.92, 0]} radius={0.03}>
            <meshStandardMaterial color="#C8B9A6" metalness={0.72} roughness={0.22} />
          </RoundedBox>
        </group>
      </group>

      {/* 3 Buồng nuôi Cleanroom */}
      {[-7.2, 0, 7.2].map((cx, rIdx) => {
        const room = rooms[rIdx];
        return (
          <group key={rIdx} position={[cx, 0, 0]}>
            {/* Sàn Epoxy bóng mờ & vạch kẻ hành lang an toàn */}
            <RoundedBox args={[6.6, 0.12, 7.8]} position={[0, 0.08, 0]} radius={0.04} receiveShadow>
              <meshStandardMaterial color="#F7F4ED" roughness={0.28} metalness={0.08} />
            </RoundedBox>
            <mesh position={[0, 0.145, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.1, 6.4]} />
              <meshStandardMaterial color="#E6EFEA" roughness={0.4} />
            </mesh>

            {/* Tường sau + Bảng điều khiển SCADA IoT gắn tường */}
            <RoundedBox args={[6.6, 3.82, 0.14]} position={[0, 1.98, -3.9]} radius={0.04} receiveShadow>
              <meshStandardMaterial color="#EBE4D8" roughness={0.55} />
            </RoundedBox>
            {/* Màn hình SCADA mini trên tường sau */}
            <group position={[0, 1.85, -3.81]}>
              <RoundedBox args={[0.9, 0.58, 0.04]} radius={0.02}>
                <meshStandardMaterial color="#1E293B" metalness={0.6} roughness={0.3} />
              </RoundedBox>
              <mesh position={[0, 0, 0.025]}>
                <planeGeometry args={[0.78, 0.46]} />
                <meshStandardMaterial
                  color="#10B981"
                  emissive="#059669"
                  emissiveIntensity={0.85}
                />
              </mesh>
            </group>

            {/* Ống thép dẫn sương siêu âm & khe thông gió HEPA phía trên */}
            <mesh position={[0, 3.55, -3.6]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.07, 0.07, 5.8, 12]} />
              <meshStandardMaterial color="#CBD5E1" metalness={0.85} roughness={0.2} />
            </mesh>

            {/* Khung trụ nhôm Champagne */}
            {[-3.25, 3.25].map((px) =>
              [-3.85, 3.85].map((pz) => (
                <mesh key={`${px}-${pz}`} position={[px, 1.98, pz]} castShadow>
                  <boxGeometry args={[0.14, 3.88, 0.14]} />
                  <meshStandardMaterial color="#C7B299" metalness={0.78} roughness={0.22} />
                </mesh>
              ))
            )}

            {/* Vách kính bên buồng */}
            <mesh position={[-3.25, 1.98, 0]}>
              <boxGeometry args={[0.04, 3.65, 7.6]} />
              <meshPhysicalMaterial
                color="#DCFCE7"
                transparent
                opacity={0.25}
                roughness={0.06}
                metalness={0.12}
              />
            </mesh>
            <mesh position={[3.25, 1.98, 0]}>
              <boxGeometry args={[0.04, 3.65, 7.6]} />
              <meshPhysicalMaterial
                color="#DCFCE7"
                transparent
                opacity={0.25}
                roughness={0.06}
                metalness={0.12}
              />
            </mesh>

            {/* 2 Dãy kệ 5 tầng kèm thanh đèn LED quang phổ dưới mỗi tầng */}
            {[-1.55, 1.55].map((rx, rackIdx) => (
              <group key={rackIdx} position={[rx, 0.15, -0.35]}>
                {[-0.65, 0.65].map((px) =>
                  [-2.6, 2.6].map((pz) => (
                    <mesh key={`${px}-${pz}`} position={[px, 1.68, pz]} castShadow>
                      <cylinderGeometry args={[0.032, 0.032, 3.36, 10]} />
                      <meshStandardMaterial color="#94A3B8" metalness={0.85} roughness={0.22} />
                    </mesh>
                  ))
                )}

                {[0.38, 1.05, 1.72, 2.39].map((sy, sIdx) => (
                  <group key={sIdx} position={[0, sy, 0]}>
                    {/* Thanh đỡ tầng */}
                    <mesh position={[0, -0.06, 0]} castShadow>
                      <boxGeometry args={[1.32, 0.04, 5.2]} />
                      <meshStandardMaterial color="#CBD5E1" metalness={0.7} roughness={0.28} />
                    </mesh>
                    {/* Thanh đèn LED quang phổ gắn dưới mặt tầng */}
                    <mesh position={[0, 0.56, 0]}>
                      <boxGeometry args={[0.24, 0.025, 4.9]} />
                      <meshStandardMaterial
                        color={ledColor}
                        emissive={ledEmissive}
                        emissiveIntensity={lightingMode === "uvc" ? 1.5 : 0.9}
                      />
                    </mesh>

                    {/* 3 khay trên mỗi tầng */}
                    {[-1.65, 0, 1.65].map((tz, tIdx) => {
                      const isHeroSlot =
                        rIdx === 0 && rackIdx === 0 && sIdx === 1 && tIdx === 2;
                      if (isHeroSlot) return null;
                      return (
                        <group key={tIdx} position={[0, 0.02, tz]}>
                          <RoundedBox args={[1.1, 0.12, 1.36]} radius={0.03} castShadow>
                            <meshStandardMaterial color="#E7DFD3" roughness={0.32} metalness={0.18} />
                          </RoundedBox>
                          <mesh position={[0, 0.09, 0]} castShadow>
                            <boxGeometry args={[0.86, 0.08, 1.1]} />
                            <meshStandardMaterial color="#4A3525" roughness={0.92} />
                          </mesh>
                          <MushroomCluster speciesIndex={rIdx} scale={0.95} />
                        </group>
                      );
                    })}
                  </group>
                ))}
              </group>
            ))}

            {room && progress > 0.22 && progress < 0.65 && (
              <Html position={[0, 4.2, 0]} center distanceFactor={16}>
                <div className="px-3 py-1 rounded-full bg-white/92 backdrop-blur-md border border-[#DECFC0] shadow-md text-[11px] font-bold text-[#24170E] whitespace-nowrap flex items-center gap-1.5 pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{room.roomCode}</span>
                  <span className="opacity-70 font-normal">
                    {room.occupiedTrays ?? 0}/{room.totalTrays ?? 0} khay
                  </span>
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {/* HERO TRAY (Khay bóc tách 3 lớp sắc nét) */}
      <group position={[-7.2 - 1.55, 0.15 + 1.05, -0.35 + 1.65]}>
        <group ref={heroTrayRef}>
          <RoundedBox args={[1.16, 0.14, 1.4]} radius={0.035} castShadow>
            <meshStandardMaterial
              color="#E2BA78"
              metalness={0.4}
              roughness={0.28}
              emissive="#92400E"
              emissiveIntensity={0.22}
            />
          </RoundedBox>
          <mesh position={[0, 0.11, 0]} castShadow>
            <boxGeometry args={[0.9, 0.1, 1.14]} />
            <meshStandardMaterial color="#4A3525" roughness={0.92} />
          </mesh>
          <MushroomCluster speciesIndex={0} scale={1.15} />

          {/* Lớp 02: Cảm Biến IoT LoRaWAN */}
          <group ref={heroSensorRef} position={[0.58, 0.14, 0.2]}>
            <RoundedBox args={[0.2, 0.3, 0.16]} radius={0.03} castShadow>
              <meshStandardMaterial color="#C28E58" metalness={0.72} roughness={0.22} />
            </RoundedBox>
            <mesh position={[0, 0.22, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
              <meshStandardMaterial color="#24170E" metalness={0.85} />
            </mesh>
            {showExplodeLabels && (
              <>
                <Line
                  points={[
                    [0, 0, 0],
                    [-0.48, -0.05, 0],
                  ]}
                  color="#C28E58"
                  lineWidth={1.6}
                />
                <Html position={[0.16, 0.36, 0]} center>
                  <div className="px-2.5 py-1 rounded-xl bg-[#24170E]/95 text-white border border-[#E2BA78] shadow-lg text-[10px] font-bold whitespace-nowrap pointer-events-none">
                    <span className="text-[#E2BA78] font-mono mr-1">02</span>
                    Cảm Biến IoT (23.6°C • 90%)
                  </div>
                </Html>
              </>
            )}
          </group>

          {/* Lớp 03: Thanh Đèn Quang Phổ */}
          <group ref={heroLedRef} position={[0, 0.52, 0]}>
            <RoundedBox args={[0.94, 0.07, 1.18]} radius={0.02} castShadow>
              <meshStandardMaterial color="#334155" metalness={0.78} roughness={0.25} />
            </RoundedBox>
            <mesh position={[0, -0.04, 0]}>
              <boxGeometry args={[0.82, 0.02, 1.06]} />
              <meshStandardMaterial
                color={ledColor}
                emissive={ledEmissive}
                emissiveIntensity={1.6}
              />
            </mesh>
            {showExplodeLabels && (
              <>
                <Line
                  points={[
                    [0, -0.05, 0],
                    [0, -0.68, 0],
                  ]}
                  color="#E2BA78"
                  lineWidth={1.6}
                />
                <Html position={[0, 0.28, 0]} center>
                  <div className="px-2.5 py-1 rounded-xl bg-[#24170E]/95 text-white border border-[#E2BA78] shadow-lg text-[10px] font-bold whitespace-nowrap pointer-events-none">
                    <span className="text-[#E2BA78] font-mono mr-1">03</span>
                    Đèn Quang Phổ LED 5000K
                  </div>
                </Html>
              </>
            )}
          </group>

          {showExplodeLabels && (
            <Html position={[-0.68, 0.24, 0.58]} center>
              <div className="px-2.5 py-1 rounded-xl bg-white/95 text-[#24170E] border border-[#24170E] shadow-lg text-[10px] font-bold whitespace-nowrap pointer-events-none">
                <span className="font-mono mr-1">01</span>
                {featuredTray ? featuredTray.trayCode : "Khối Phôi & Nấm"}
              </div>
            </Html>
          )}
        </group>
      </group>

      {/* Vách kính mặt tiền */}
      <group ref={frontGlassRef} position={[0, 1.9, 4.05]}>
        <mesh>
          <boxGeometry args={[21.4, 3.65, 0.08]} />
          <meshPhysicalMaterial
            color="#E0F2FE"
            transmission={0.58}
            transparent
            opacity={0.72}
            roughness={0.06}
            metalness={0.14}
          />
        </mesh>
      </group>

      {/* Mái kính kèm khung xương nhôm Champagne */}
      <group ref={roofRef} position={[0, 3.98, 0]}>
        <RoundedBox args={[22.4, 0.22, 8.6]} radius={0.06} castShadow>
          <meshStandardMaterial color="#D6C7B2" metalness={0.7} roughness={0.26} />
        </RoundedBox>
        {[-7.2, 0, 7.2].map((rx, idx) => (
          <group key={idx} position={[rx, 0.14, 0]}>
            <mesh>
              <boxGeometry args={[5.8, 0.06, 7.0]} />
              <meshPhysicalMaterial
                color="#E6F4EE"
                transmission={0.55}
                transparent
                opacity={0.82}
                roughness={0.08}
              />
            </mesh>
            {/* Khung xương ngang trên mái kính */}
            {[-2.2, 0, 2.2].map((mz) => (
              <mesh key={mz} position={[0, 0.04, mz]}>
                <boxGeometry args={[5.8, 0.05, 0.08]} />
                <meshStandardMaterial color="#B8A48D" metalness={0.75} roughness={0.25} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    </>
  );
}

export default function ExplodedFarm3D(props: ExplodedFarm3DProps) {
  return (
    <Canvas
      shadows
      dpr={[1.5, 2]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.06,
      }}
      camera={{ position: [13.2, 8.0, 18.2], fov: 37, near: 0.1, far: 120 }}
      className="w-full h-full"
    >
      <color attach="background" args={[props.lightingMode === "night" ? "#1A1613" : "#EFE8DC"]} />
      <fog
        attach="fog"
        args={[props.lightingMode === "night" ? "#1A1613" : "#EFE8DC", 28, 70]}
      />
      <AnimatedSceneContent {...props} />
    </Canvas>
  );
}
