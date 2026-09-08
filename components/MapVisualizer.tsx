'use client';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker, Circle, useMap, LayersControl, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { PhysicsParams, TrajectoryPoint, AshPoint } from '@/utils/physics';
import { SimulationMode } from '@/hooks/useSimulation';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface Props {
  mode: SimulationMode;
  ballisticResult: {
    primary: import('@/utils/physics').TrajectoryResult;
    worstCase: import('@/utils/physics').TrajectoryResult;
    spread: import('@/utils/physics').TrajectoryResult[];
  };
  aerosolResult: {
    trajectory: AshPoint[];
  };
  progressIndex: number;
  params: PhysicsParams;
}

function MapController({ mode, startPosLat, startPosLng }: { mode: SimulationMode, startPosLat: number, startPosLng: number }) {
  const map = useMap();
  useEffect(() => {
    if (mode === 'aerosol') {
      map.setZoom(3);
      map.panTo([0, startPosLng]);
    } else {
      map.setZoom(8);
      map.panTo([startPosLat, startPosLng]);
    }
  }, [mode, map, startPosLat, startPosLng]);
  return null;
}

export default function MapVisualizer({ mode, ballisticResult, aerosolResult, progressIndex, params }: Props) {
  const primary = ballisticResult.primary.trajectory;
  const startPos: [number, number] = [primary[0]?.lat || -6.102, primary[0]?.lng || 105.423];

  return (
    <div className="w-full h-full relative z-[1]">
      <MapContainer 
        center={startPos} 
        zoom={8} 
        minZoom={3}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <MapController mode={mode} startPosLat={startPos[0]} startPosLng={startPos[1]} />
        <LayersControl position="bottomright">
          <LayersControl.BaseLayer checked name="Citra Satelit">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              noWrap={true}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Peta Biasa (Preview)">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              noWrap={true}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* SHOCKWAVE / SEISMIC ANIMATION (Physically Accurate) */}
        {(() => {
          if (progressIndex === 0) return null;
          
          if (!startPos || typeof startPos[0] !== 'number' || typeof startPos[1] !== 'number' || isNaN(startPos[0]) || isNaN(startPos[1])) {
             return null;
          }

          // In our physics engine (utils/physics.ts), the step size (dt) is typically 0.1s.
          // progressIndex is effectively the number of ticks.
          // Real-world time elapsed in seconds:
          const dt = 0.1;
          const timeElapsedSeconds = progressIndex * dt; 

          // Propagation Velocities (meters per second)
          const VELOCITY_SEISMIC = 5000; // ~5 km/s for crustal P-waves/Surface waves
          const VELOCITY_ACOUSTIC = 343; // ~343 m/s for atmospheric shockwave (Speed of sound)

          // Current Radius (r = v * t)
          const currentRadiusSeismic = VELOCITY_SEISMIC * timeElapsedSeconds;
          const currentRadiusAcoustic = VELOCITY_ACOUSTIC * timeElapsedSeconds;

          // Energy Proxy (To determine maximum propagation distance before attenuation)
          // E_k = 1/2 * m * v^2
          const energyKj = 0.5 * params.mass * Math.pow(params.v0, 2) / 1000;
          
          // Logarithmic scaling for realistic attenuation based on energy levels
          const baseLog = Math.max(0, Math.log10((isNaN(energyKj) ? 0 : energyKj) + 1));
          
          // Max Distances (Atenuasi Fisika)
          // 1. Seismic wave (Volcanic tremors attenuate fast due to fractured crust)
          // Range: ~50 km (small eruptions) to ~800 km (supervolcanoes)
          const maxDistanceSeismic = 10000 + Math.pow(baseLog, 2.5) * 2000; 
          
          // 2. Acoustic wave (Infrasound/Barometric waves travel incredibly far, eg. Krakatoa heard 4800km away)
          // Range: ~100 km (small) to ~10,000+ km (supervolcanoes)
          const maxDistanceAcoustic = 20000 + Math.pow(baseLog, 4) * 1200;

          // Attenuation (Fade out opacity based on distance traveled vs max distance)
          // The seismic wave travels VERY fast, so it will disappear quickly from the map.
          // The acoustic wave travels slower, lingering longer.
          const opacitySeismic = Math.max(0, 1 - (currentRadiusSeismic / maxDistanceSeismic));
          const opacityAcoustic = Math.max(0, 1 - (currentRadiusAcoustic / maxDistanceAcoustic));

          // If both have faded out completely, stop rendering them to save performance
          if (opacitySeismic <= 0 && opacityAcoustic <= 0) return null;

          return (
            <>
              {/* Inner strong seismic tremor (Ground P/S/Surface Waves) */}
              {opacitySeismic > 0 && (
                <Circle 
                  center={startPos}
                  radius={currentRadiusSeismic}
                  pathOptions={{
                    color: '#ef4444',
                    fillColor: '#ef4444',
                    weight: Math.max(1, 4 * opacitySeismic), // Line thins out as it travels
                    opacity: opacitySeismic * 0.8,
                    fillOpacity: opacitySeismic * 0.1,
                  }}
                />
              )}
              
              {/* Outer slow shockwave (Atmospheric / Infrasound) */}
              {opacityAcoustic > 0 && (
                <Circle 
                  center={startPos}
                  radius={currentRadiusAcoustic}
                  pathOptions={{
                    color: '#ffffff',
                    fillColor: 'transparent',
                    weight: 2,
                    opacity: opacityAcoustic * 0.7,
                    dashArray: '4 8'
                  }}
                />
              )}
            </>
          );
        })()}

        {mode === 'aerosol' ? (
          // AEROSOL RENDER LAYER
          (() => {
            const currentAsh = aerosolResult.trajectory[Math.min(progressIndex, aerosolResult.trajectory.length - 1)];
            if (!currentAsh) return null;
            
            // Generate path trail
            const pathPositions: [number, number][] = aerosolResult.trajectory.slice(0, progressIndex + 1).map(p => [p.lat, p.lng]);
            
            return (
              <>
                <Polyline positions={pathPositions} color="#a855f7" weight={2} opacity={0.5} dashArray="4 8" />
                <Circle 
                  center={[currentAsh.lat, currentAsh.lng]}
                  radius={currentAsh.radiusKm * 1000} // Leaflet radius is in meters
                  pathOptions={{
                    color: 'transparent',
                    fillColor: '#d4d4d4',
                    fillOpacity: 0.4,
                  }}
                >
                  <Popup>
                    <div className="text-xs">
                      <b>Awan Abu Vulkanik</b><br />
                      Hari ke: {currentAsh.day.toFixed(1)}<br />
                      Jarak dari Krakatau: {currentAsh.distanceKm.toFixed(0)} km<br />
                      Radius Sebaran: {currentAsh.radiusKm.toFixed(0)} km
                    </div>
                  </Popup>
                </Circle>
              </>
            );
          })()
        ) : (
          // BALLISTIC RENDER LAYER
          <>
            {(() => {
              const currentT = primary[Math.min(progressIndex, primary.length - 1)]?.t || 0;
              if (currentT <= 0) return null;
              
              const windDirRad = (params.windDirection * Math.PI) / 180;
              const numPuffs = 6;
              
              return Array.from({ length: numPuffs }).map((_, i) => {
                const factor = (i + 1) / numPuffs; // e.g. 0.16, 0.33, 0.5...
                const puffT = currentT * factor;
                const puffDriftDist = params.windSpeed * puffT;
                
                // Add some lateral spread perpendicular to the wind
                const lateralOffset = (i % 2 === 0 ? 1 : -1) * (puffT * 1.5);
                
                const sLat = startPos[0] + (puffDriftDist * Math.cos(windDirRad) + lateralOffset * Math.sin(windDirRad)) / 111320;
                const sLng = startPos[1] + (puffDriftDist * Math.sin(windDirRad) - lateralOffset * Math.cos(windDirRad)) / 110570;
                
                // Older puffs (smaller factor) are larger
                const sRad = 1500 + puffT * (12 + params.windSpeed * 0.4); 
                const sOp = Math.max(0, 0.4 - (puffT / 1500));
                
                if (sOp <= 0.05) return null;
                
                return (
                  <Circle 
                    key={`smoke-${i}`}
                    center={[sLat, sLng]}
                    radius={sRad}
                    pathOptions={{ 
                      color: 'transparent', 
                      fillColor: i % 2 === 0 ? '#a3a3a3' : '#737373', // Mix light and dark ash 
                      fillOpacity: sOp 
                    }}
                  />
                );
              });
            })()}

            {ballisticResult.spread.map((spreadResult, idx) => {
              const currentSpread = spreadResult.trajectory.slice(0, progressIndex + 1);
              // Downsample to max 50 points per polyline to prevent browser crash
              const step = Math.max(1, Math.floor(currentSpread.length / 50));
              const downsampledPositions: [number, number][] = currentSpread
                .filter((_, i) => i % step === 0 || i === currentSpread.length - 1)
                .map(p => [p.lat, p.lng]);
                
              if (downsampledPositions.length === 0) return null;
              const currentPos = downsampledPositions[downsampledPositions.length - 1];

              return (
                <React.Fragment key={idx}>
                  <Polyline positions={downsampledPositions} color="#f59e0b" weight={1.5} opacity={0.4} dashArray="2 4" />
                  {downsampledPositions.length > 1 && (
                    <CircleMarker center={currentPos} radius={2.5} pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.8 }} />
                  )}
                </React.Fragment>
              );
            })}
            
            {(() => {
              const currentPrimary = primary.slice(0, progressIndex + 1);
              // Downsample primary trajectory as well
              const step = Math.max(1, Math.floor(currentPrimary.length / 100));
              const positions: [number, number][] = currentPrimary
                .filter((_, i) => i % step === 0 || i === currentPrimary.length - 1)
                .map(p => [p.lat, p.lng]);
                
              const currentPos: [number, number] = positions[positions.length - 1] || startPos;
              const angle = ballisticResult.primary.telemetry?.angle.toFixed(1) || 45;
              
              return (
                <React.Fragment>
                  <Polyline positions={positions} color="#ef4444" weight={4} opacity={0.9} />
                  {positions.length > 1 && (
                    <CircleMarker center={currentPos} radius={6} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 1 }}>
                      <Tooltip permanent direction="right" offset={[10, 0]} className="bg-neutral-900 border-neutral-800 text-white text-xs opacity-90 shadow-lg">
                        <span className="text-red-400 font-bold">Utama</span> (Elevasi: {angle}°)
                      </Tooltip>
                    </CircleMarker>
                  )}
                </React.Fragment>
              );
            })()}

            {/* Worst Case Trajectory (Green) */}
            {(() => {
              if (!ballisticResult.worstCase) return null;
              
              const currentWorstCase = ballisticResult.worstCase.trajectory.slice(0, progressIndex + 1);
              const step = Math.max(1, Math.floor(currentWorstCase.length / 100));
              const positions: [number, number][] = currentWorstCase
                .filter((_, i) => i % step === 0 || i === currentWorstCase.length - 1)
                .map(p => [p.lat, p.lng]);
                
              const currentPos: [number, number] = positions[positions.length - 1] || startPos;
              const angle = ballisticResult.worstCase.telemetry?.angle.toFixed(1) || 45;
              
              return (
                <React.Fragment>
                  <Polyline positions={positions} color="#22c55e" weight={4} opacity={0.9} />
                  {positions.length > 1 && (
                    <CircleMarker center={currentPos} radius={6} pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 1 }}>
                      <Tooltip permanent direction="left" offset={[-10, 0]} className="bg-neutral-900 border-neutral-800 text-white text-xs opacity-90 shadow-lg">
                        <span className="text-green-400 font-bold">Worst Case</span> (Elevasi: {angle}°)
                      </Tooltip>
                    </CircleMarker>
                  )}
                </React.Fragment>
              );
            })()}
          </>
        )}

        <Marker position={startPos} icon={icon}>
          <Popup>Pusat Erupsi (Titik Awal)</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
