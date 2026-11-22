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
} from "@react-three/drei";
import * as THREE from "three";
import type { Farm3DRoom, Farm3DTray } from "./Farm3DCanvas";

interface ExplodedFarm3DProps {
  progress: number; // 0 -> 1 driven continuously by scroll
  rooms: Farm3DRoom[];
  trays: Farm3DTray[];
  ownedTrayCodes: Set<string>;
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

function AnimatedSceneContent({
  progress,
  rooms,
  trays,
  ownedTrayCodes,
}: ExplodedFarm3DProps) {
  const { camera } = useThree();
  const roofRef = useRef<THREE.Group>(null);
  const frontGlassRef = useRef<THREE.Group>(null);
  const heroTrayRef = useRef<THREE.Group>(null);
  const heroLedRef = useRef<THREE.Group>(null);
  const heroSensorRef = useRef<THREE.Group>(null);

  // Target tray: ưu tiên khay của user, hoặc khay đang nuôi đầu tiên ở RM01
  const featuredTray = useMemo(() => {
    const owned = trays.find((t) => ownedTrayCodes.has(t.trayCode));
    if (owned) return owned;
    const occupied = trays.find((t) => t.status === "OCCUPIED");
    return occupied || trays[0] || null;
  }, [trays, ownedTrayCodes]);

  // Tính các phase animation từ progress (0 -> 1)
  // 0.00 - 0.22: Ngoại thất tổng thể (Mái đóng, kính phản chiếu)
  // 0.20 - 0.48: Bóc tách mái & vách kính trước (Exploded Cutaway)
  // 0.45 - 0.74: Bay vào buồng RM01 & kéo khay nấm ra khỏi kệ
  // 0.72 - 1.00: Bóc tách 3 lớp khay (Đèn LED lên trên, Cảm biến sang phải, Phôi & Nấm ở giữa)
  useFrame((_, delta) => {
    const p = clamp01(progress);

    const roofLift = smoothstep(0.18, 0.46, p);
    const flyIn = smoothstep(0.42, 0.72, p);
    const trayPull = smoothstep(0.56, 0.78, p);
    const trayExplode = smoothstep(0.74, 0.96, p);

    // 1. Camera bay mượt theo đường cong kiến trúc
    const camX = lerp(lerp(13.5, 4.5, roofLift), lerp(4.5, -2.15, flyIn), flyIn);
    const camY = lerp(lerp(8.2, 10.5, roofLift), lerp(10.5, 2.25, flyIn), flyIn);
    const camZ = lerp(lerp(18.5, 14.5, roofLift), lerp(14.5, 4.35, flyIn), flyIn);

    const tgtX = lerp(0, -3.55, flyIn);
    const tgtY = lerp(1.4, 1.55, flyIn);
    const tgtZ = lerp(0, 1.25, flyIn);

    const k = Math.min(1, delta * 8);
    camera.position.lerp(new THREE.Vector3(camX, camY, camZ), k);
    camera.lookAt(tgtX, tgtY, tgtZ);

    // 2. Bóc tách mái kính lên cao & mờ dần
    if (roofRef.current) {
      roofRef.current.position.y = lerp(3.95, 9.2, roofLift);
      roofRef.current.visible = roofLift < 0.96;
    }

    // 3. Trượt vách kính mặt tiền sang bên / xuống nhẹ
    if (frontGlassRef.current) {
      frontGlassRef.current.position.z = lerp(4.05, 6.2, roofLift);
      frontGlassRef.current.position.y = lerp(1.9, -2.5, roofLift);
      frontGlassRef.current.visible = roofLift < 0.92;
    }

    // 4. Kéo khay nấm nổi bật ra khỏi kệ
    if (heroTrayRef.current) {
      heroTrayRef.current.position.z = lerp(0, 1.85, trayPull);
    }

    // 5. Bóc tách lớp Đèn LED & Cảm biến IoT của khay
    if (heroLedRef.current) {
      heroLedRef.current.position.y = lerp(0.52, 1.28, trayExplode);
    }
    if (heroSensorRef.current) {
      heroSensorRef.current.position.x = lerp(0.58, 1.25, trayExplode);
      heroSensorRef.current.position.y = lerp(0.14, 0.42, trayExplode);
    }
  });

  const showExplodeLabels = progress >= 0.76;

  return (
    <>
      {/* Ánh sáng Studio PBR hoàn toàn nội bộ (không phụ thuộc CDN ngoài) */}
      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.2}
          position={[0, 10, 4]}
          scale={[18, 10, 1]}
          rotation={[Math.PI / 2, 0, 0]}
          color="#FFFBF2"
        />
        <Lightformer
          form="rect"
          intensity={1.4}
          position={[-12, 5, 8]}
          scale={[10, 6, 1]}
          rotation={[0, Math.PI / 3, 0]}
          color="#E2BA78"
        />
        <Lightformer
          form="rect"
          intensity={1.1}
          position={[12, 4, -6]}
          scale={[10, 6, 1]}
          rotation={[0, -Math.PI / 3, 0]}
          color="#D1FAE5"
        />
      </Environment>

      <ambientLight intensity={0.45} />
      <directionalLight
        position={[12, 18, 14]}
        intensity={1.25}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Bóng đổ mềm tiếp xúc dưới nền kiến trúc */}
      <ContactShadows
        position={[0, -0.25, 0]}
        opacity={0.42}
        scale={42}
        blur={2.2}
        far={12}
        color="#24170E"
      />

      {/* Đế sân vườn kiến trúc (Plinth) */}
      <group position={[0, -0.18, 0]}>
        <RoundedBox args={[25.5, 0.36, 12.2]} radius={0.14} smoothness={4} receiveShadow>
          <meshStandardMaterial color="#D8E2D5" roughness={0.75} />
        </RoundedBox>
        <RoundedBox args={[24.4, 0.16, 11.2]} position={[0, 0.22, 0]} radius={0.08} receiveShadow>
          <meshStandardMaterial color="#F2ECE1" roughness={0.55} />
        </RoundedBox>

        {/* Cây xanh tối giản xung quanh khuôn viên */}
        {[
          [-11.2, 0.3, 4.4],
          [-10.1, 0.3, 4.9],
          [11.0, 0.3, 4.5],
          [11.4, 0.3, -3.8],
        ].map(([tx, ty, tz], idx) => (
          <group key={idx} position={[tx, ty, tz]}>
            <mesh position={[0, 0.45, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.1, 0.9, 8]} />
              <meshStandardMaterial color="#6B442C" roughness={0.85} />
            </mesh>
            <mesh position={[0, 1.15, 0]} castShadow>
              <dodecahedronGeometry args={[0.55, 1]} />
              <meshStandardMaterial color="#6A8D73" roughness={0.75} />
            </mesh>
            <mesh position={[0.25, 0.92, 0.18]} castShadow>
              <dodecahedronGeometry args={[0.36, 1]} />
              <meshStandardMaterial color="#7FA187" roughness={0.75} />
            </mesh>
          </group>
        ))}

        {/* Sảnh kính lối vào phía trước */}
        <group position={[0, 0.9, 4.85]}>
          <RoundedBox args={[3.0, 1.7, 1.6]} radius={0.05} castShadow>
            <meshPhysicalMaterial
              color="#E6F4EE"
              transmission={0.65}
              opacity={1}
              transparent
              roughness={0.08}
              ior={1.45}
              thickness={0.2}
            />
          </RoundedBox>
          <RoundedBox args={[3.2, 0.12, 1.8]} position={[0, 0.88, 0]} radius={0.03}>
            <meshStandardMaterial color="#C8B9A6" metalness={0.65} roughness={0.25} />
          </RoundedBox>
        </group>
      </group>

      {/* 3 Buồng nuôi khung nhôm Champagne & Tường sau kiến trúc */}
      {[-7.2, 0, 7.2].map((cx, rIdx) => {
        const room = rooms[rIdx];
        return (
          <group key={rIdx} position={[cx, 0, 0]}>
            {/* Sàn Epoxy phòng sạch từng buồng */}
            <RoundedBox args={[6.6, 0.12, 7.8]} position={[0, 0.08, 0]} radius={0.04} receiveShadow>
              <meshStandardMaterial color="#F7F3EB" roughness={0.3} metalness={0.05} />
            </RoundedBox>

            {/* Tường sau và vách ngăn giữa các buồng */}
            <RoundedBox args={[6.6, 3.8, 0.14]} position={[0, 1.98, -3.9]} radius={0.04} receiveShadow>
              <meshStandardMaterial color="#EAE3D6" roughness={0.6} />
            </RoundedBox>

            {/* Khung trụ nhôm Champagne bo góc */}
            {[-3.25, 3.25].map((px) =>
              [-3.85, 3.85].map((pz) => (
                <mesh key={`${px}-${pz}`} position={[px, 1.98, pz]} castShadow>
                  <boxGeometry args={[0.14, 3.85, 0.14]} />
                  <meshStandardMaterial color="#C7B299" metalness={0.75} roughness={0.25} />
                </mesh>
              ))
            )}

            {/* Vách kính bên buồng */}
            <mesh position={[-3.25, 1.98, 0]}>
              <boxGeometry args={[0.04, 3.65, 7.6]} />
              <meshPhysicalMaterial
                color="#DCFCE7"
                transparent
                opacity={0.26}
                roughness={0.08}
                metalness={0.1}
              />
            </mesh>
            <mesh position={[3.25, 1.98, 0]}>
              <boxGeometry args={[0.04, 3.65, 7.6]} />
              <meshPhysicalMaterial
                color="#DCFCE7"
                transparent
                opacity={0.26}
                roughness={0.08}
                metalness={0.1}
              />
            </mesh>

            {/* 2 Dãy kệ 5 tầng trong mỗi buồng */}
            {[-1.55, 1.55].map((rx, rackIdx) => (
              <group key={rackIdx} position={[rx, 0.15, -0.35]}>
                {/* 4 Cột thép không gỉ */}
                {[-0.65, 0.65].map((px) =>
                  [-2.6, 2.6].map((pz) => (
                    <mesh key={`${px}-${pz}`} position={[px, 1.65, pz]} castShadow>
                      <cylinderGeometry args={[0.032, 0.032, 3.3, 10]} />
                      <meshStandardMaterial color="#94A3B8" metalness={0.8} roughness={0.25} />
                    </mesh>
                  ))
                )}

                {/* 4 tầng khay tiêu chuẩn */}
                {[0.38, 1.05, 1.72, 2.39].map((sy, sIdx) => (
                  <group key={sIdx} position={[0, sy, 0]}>
                    {/* Thanh đỡ tầng */}
                    <mesh position={[0, -0.06, 0]} castShadow>
                      <boxGeometry args={[1.32, 0.04, 5.2]} />
                      <meshStandardMaterial color="#CBD5E1" metalness={0.65} roughness={0.3} />
                    </mesh>

                    {/* 3 khay trên mỗi tầng */}
                    {[-1.65, 0, 1.65].map((tz, tIdx) => {
                      const isHeroSlot =
                        rIdx === 0 && rackIdx === 0 && sIdx === 1 && tIdx === 2;
                      if (isHeroSlot) return null; // Render riêng Hero Tray có bóc tách!
                      const capColor =
                        rIdx === 2 ? "#B45309" : rIdx === 1 ? "#F5F0E6" : "#E2DDD5";
                      return (
                        <group key={tIdx} position={[0, 0.02, tz]}>
                          <RoundedBox args={[1.08, 0.12, 1.35]} radius={0.03} castShadow>
                            <meshStandardMaterial color="#E7DFD3" roughness={0.35} metalness={0.15} />
                          </RoundedBox>
                          {/* Khối phôi + nấm hữu cơ */}
                          <mesh position={[0, 0.1, 0]} castShadow>
                            <boxGeometry args={[0.82, 0.08, 1.05]} />
                            <meshStandardMaterial color="#4A3525" roughness={0.9} />
                          </mesh>
                          {[-0.25, 0.18].map((mz, mIdx) => (
                            <group key={mIdx} position={[mIdx === 0 ? -0.1 : 0.12, 0.16, mz]}>
                              <mesh position={[0, 0.05, 0]} castShadow>
                                <cylinderGeometry args={[0.035, 0.045, 0.11, 8]} />
                                <meshStandardMaterial color="#F3EFEA" roughness={0.6} />
                              </mesh>
                              <mesh position={[0, 0.13, 0]} castShadow>
                                <sphereGeometry
                                  args={[0.12, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.58]}
                                />
                                <meshStandardMaterial color={capColor} roughness={0.45} />
                              </mesh>
                            </group>
                          ))}
                        </group>
                      );
                    })}
                  </group>
                ))}
              </group>
            ))}

            {/* Nhãn nổi tên buồng khi đã bóc mái (progress 0.25 -> 0.65) */}
            {room && progress > 0.22 && progress < 0.65 && (
              <Html position={[0, 4.15, 0]} center distanceFactor={16}>
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

      {/* HERO TRAY (Khay bóc tách 3 lớp tại RM01 - Kệ 1 - Tầng 2) */}
      <group position={[-7.2 - 1.55, 0.15 + 1.05, -0.35 + 1.65]}>
        <group ref={heroTrayRef}>
          {/* Lớp 01: Khay & Khối Phôi Nấm */}
          <RoundedBox args={[1.14, 0.14, 1.38]} radius={0.035} castShadow>
            <meshStandardMaterial
              color="#E2BA78"
              metalness={0.35}
              roughness={0.3}
              emissive="#92400E"
              emissiveIntensity={0.22}
            />
          </RoundedBox>
          <mesh position={[0, 0.11, 0]} castShadow>
            <boxGeometry args={[0.88, 0.1, 1.1]} />
            <meshStandardMaterial color="#4A3525" roughness={0.9} />
          </mesh>
          {[
            [-0.18, 0.18, -0.22, 1.15],
            [0.18, 0.2, 0.12, 1.25],
            [-0.05, 0.16, 0.28, 0.95],
          ].map(([mx, my, mz, ms], idx) => (
            <group key={idx} position={[mx, my, mz]} scale={ms}>
              <mesh position={[0, 0.05, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.05, 0.12, 10]} />
                <meshStandardMaterial color="#F7F3EE" roughness={0.55} />
              </mesh>
              <mesh position={[0, 0.14, 0]} castShadow>
                <sphereGeometry args={[0.13, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
                <meshStandardMaterial color="#E6DFD5" roughness={0.42} />
              </mesh>
            </group>
          ))}

          {/* Lớp 02: Cảm Biến IoT LoRaWAN tách sang phải */}
          <group ref={heroSensorRef} position={[0.58, 0.14, 0.2]}>
            <RoundedBox args={[0.18, 0.28, 0.14]} radius={0.03} castShadow>
              <meshStandardMaterial color="#C28E58" metalness={0.65} roughness={0.25} />
            </RoundedBox>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.18, 8]} />
              <meshStandardMaterial color="#24170E" metalness={0.8} />
            </mesh>
            {showExplodeLabels && (
              <>
                <Line
                  points={[
                    [0, 0, 0],
                    [-0.45, -0.05, 0],
                  ]}
                  color="#C28E58"
                  lineWidth={1.5}
                />
                <Html position={[0.15, 0.34, 0]} center>
                  <div className="px-2.5 py-1 rounded-xl bg-[#24170E]/95 text-white border border-[#E2BA78] shadow-lg text-[10px] font-bold whitespace-nowrap pointer-events-none">
                    <span className="text-[#E2BA78] font-mono mr-1">02</span>
                    Cảm Biến IoT (23.6°C • 90%)
                  </div>
                </Html>
              </>
            )}
          </group>

          {/* Lớp 03: Thanh Đèn LED Quang Phổ nhấc lên trên */}
          <group ref={heroLedRef} position={[0, 0.52, 0]}>
            <RoundedBox args={[0.92, 0.07, 1.16]} radius={0.02} castShadow>
              <meshStandardMaterial color="#334155" metalness={0.75} roughness={0.3} />
            </RoundedBox>
            <mesh position={[0, -0.04, 0]}>
              <boxGeometry args={[0.8, 0.02, 1.05]} />
              <meshStandardMaterial
                color="#FEF3C7"
                emissive="#FDE68A"
                emissiveIntensity={1.5}
              />
            </mesh>
            {showExplodeLabels && (
              <>
                <Line
                  points={[
                    [0, -0.05, 0],
                    [0, -0.65, 0],
                  ]}
                  color="#E2BA78"
                  lineWidth={1.5}
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
            <Html position={[-0.65, 0.22, 0.55]} center>
              <div className="px-2.5 py-1 rounded-xl bg-white/95 text-[#24170E] border border-[#24170E] shadow-lg text-[10px] font-bold whitespace-nowrap pointer-events-none">
                <span className="font-mono mr-1">01</span>
                {featuredTray ? featuredTray.trayCode : "Khối Phôi & Nấm"}
              </div>
            </Html>
          )}
        </group>
      </group>

      {/* Vách kính mặt tiền (trượt mở khi bóc tách) */}
      <group ref={frontGlassRef} position={[0, 1.9, 4.05]}>
        <mesh>
          <boxGeometry args={[21.4, 3.65, 0.08]} />
          <meshPhysicalMaterial
            color="#E0F2FE"
            transmission={0.55}
            transparent
            opacity={0.75}
            roughness={0.08}
            metalness={0.12}
          />
        </mesh>
      </group>

      {/* Mái kính & khung nhôm Champagne (nhấc bổng lên khi cuộn chuột) */}
      <group ref={roofRef} position={[0, 3.95, 0]}>
        <RoundedBox args={[22.2, 0.22, 8.5]} radius={0.06} castShadow>
          <meshStandardMaterial color="#D6C7B2" metalness={0.65} roughness={0.3} />
        </RoundedBox>
        {[-7.2, 0, 7.2].map((rx, idx) => (
          <mesh key={idx} position={[rx, 0.14, 0]}>
            <boxGeometry args={[5.6, 0.06, 6.8]} />
            <meshPhysicalMaterial
              color="#E6F4EE"
              transmission={0.5}
              transparent
              opacity={0.8}
              roughness={0.1}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}

export default function ExplodedFarm3D(props: ExplodedFarm3DProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [13.5, 8.2, 18.5], fov: 38, near: 0.1, far: 120 }}
      className="w-full h-full"
    >
      <color attach="background" args={["#EFE8DC"]} />
      <fog attach="fog" args={["#EFE8DC", 28, 68]} />
      <AnimatedSceneContent {...props} />
    </Canvas>
  );
}
