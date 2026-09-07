export interface PhysicsParams {
  v0: number; // m/s
  angle: number; // degrees
  mass: number; // kg
  windSpeed: number; // m/s
  windDirection: number; // degrees (azimuth)
  windShearEnabled: boolean; // TRUE to use stratospheric winds
  stratosphericWindSpeed: number; // m/s
  stratosphericWindDir: number; // degrees
  airDragEnabled: boolean;
  dragCoefficient: number; // 0.1 to 1.0
  lat: number;
  lng: number;
  elevation: number; // meters
  projectileCount: number;
}

export interface TrajectoryPoint {
  x: number; // Horizontal distance from origin
  y: number; // Altitude
  t: number;
  v: number;
  lat: number;
  lng: number;
}

export function calculateTrajectory(params: PhysicsParams) {
  const { v0, angle, mass, windSpeed, windDirection, windShearEnabled, stratosphericWindSpeed, stratosphericWindDir, airDragEnabled, dragCoefficient, lat, lng, elevation } = params;
  
  const theta = (angle * Math.PI) / 180;
  const azimuth = (windDirection * Math.PI) / 180;
  
  let z = elevation; // Altitude (Up)
  let xE = 0; // East distance
  let yN = 0; // North distance
  
  let vxy = v0 * Math.cos(theta);
  let vz = v0 * Math.sin(theta);
  let vE = vxy * Math.sin(azimuth);
  let vN = vxy * Math.cos(azimuth);
  let t = 0;
  
  const Cd = dragCoefficient ?? 0.47; 
  const rockDensity = 2500;
  const radius = Math.cbrt((mass / rockDensity) / ((4 / 3) * Math.PI));
  const A = Math.PI * radius * radius;
  
  const trajectory: TrajectoryPoint[] = [];
  let maxHeight = z;
  
  const dt = Math.max(0.05, Math.min(0.5, 500 / v0)); 
  
  const kmPerLat = 111.32;
  const latRad = (lat * Math.PI) / 180;
  const kmPerLng = 111.32 * Math.cos(latRad);
  
  // Coriolis Parameter (f = 2 * Omega * sin(lat))
  const OMEGA = 7.2921e-5;
  const f = 2 * OMEGA * Math.sin(latRad);
  
  while (z >= 0 && t < 20000) {
    const currentHorizontalDist = Math.sqrt(xE * xE + yN * yN);
    
    trajectory.push({
      x: currentHorizontalDist,
      y: Math.max(0, z),
      t,
      v: Math.sqrt(vE * vE + vN * vN + vz * vz),
      lat: lat + yN / (kmPerLat * 1000),
      lng: lng + xE / (kmPerLng * 1000),
    });
    
    if (z > maxHeight) maxHeight = z;
    
    // Wind Shear: Wind speed & direction interpolate with altitude up to 15km
    let currentWindSpeed = windSpeed;
    let wE = 0;
    let wN = 0;
    
    if (windShearEnabled) {
      const factor = Math.min(1, Math.max(0, z / 15000));
      const wE_surf = windSpeed * Math.sin(azimuth);
      const wN_surf = windSpeed * Math.cos(azimuth);
      const stratoAzimuth = ((stratosphericWindDir ?? 90) * Math.PI) / 180;
      const stratoSpeed = stratosphericWindSpeed ?? 30;
      const wE_strato = stratoSpeed * Math.sin(stratoAzimuth);
      const wN_strato = stratoSpeed * Math.cos(stratoAzimuth);
      
      wE = wE_surf * (1 - factor) + wE_strato * factor;
      wN = wN_surf * (1 - factor) + wN_strato * factor;
    } else {
      const windShearMultiplier = 1 + Math.min(2.5, z / 6000); 
      currentWindSpeed = windSpeed * windShearMultiplier;
      wE = currentWindSpeed * Math.sin(azimuth);
      wN = currentWindSpeed * Math.cos(azimuth);
    }
    
    // Barometric Air Density
    const rho0 = 1.225;
    const scaleHeight = 8500;
    const currentRho = rho0 * Math.exp(-Math.max(0, z) / scaleHeight);
    const k = airDragEnabled ? (0.5 * currentRho * Cd * A) / mass : 0;
    
    const v_rel_E = vE - wE;
    const v_rel_N = vN - wN;
    const v_rel_z = vz;
    const v_rel = Math.sqrt(v_rel_E * v_rel_E + v_rel_N * v_rel_N + v_rel_z * v_rel_z);
    
    // Drag Acceleration
    const aE_drag = airDragEnabled ? -k * v_rel * v_rel_E : 0;
    const aN_drag = airDragEnabled ? -k * v_rel * v_rel_N : 0;
    const az_drag = airDragEnabled ? -k * v_rel * v_rel_z : 0;
    
    // Coriolis Acceleration (Cross product of Omega and V)
    const aE_cor = f * vN;
    const aN_cor = -f * vE;
    
    // Gravity decreases slightly at extreme altitudes
    const g = 9.81 * Math.pow(6371000 / (6371000 + Math.max(0, z)), 2);
    
    // Euler Integration
    vE += (aE_drag + aE_cor) * dt;
    vN += (aN_drag + aN_cor) * dt;
    vz += (-g + az_drag) * dt;
    
    xE += vE * dt;
    yN += vN * dt;
    z += vz * dt;
    t += dt;
  }
  
  if (trajectory.length > 0) {
    const lastPoint = trajectory[trajectory.length - 1];
    if (lastPoint.y > 0 && z < 0) {
      const fraction = lastPoint.y / (lastPoint.y - z);
      xE = (xE - vE * dt) + vE * dt * fraction;
      yN = (yN - vN * dt) + vN * dt * fraction;
      z = 0;
      t = lastPoint.t + dt * fraction;
    }
  }

  const finalDist = Math.sqrt(xE * xE + yN * yN);
  trajectory.push({
    x: finalDist,
    y: 0,
    t,
    v: Math.sqrt(vE * vE + vN * vN + vz * vz),
    lat: lat + yN / (kmPerLat * 1000),
    lng: lng + xE / (kmPerLng * 1000),
  });

  return {
    trajectory,
    maxDistance: finalDist,
    maxHeight,
    timeOfFlight: t,
  };
}

export interface AerosolParams {
  days: number;
  stratosphericWind: number; // m/s
  lat: number;
  lng: number;
  diffusionRate: number; // radius expansion per day
}

export interface AshPoint {
  day: number;
  lat: number;
  lng: number;
  radiusKm: number;
  distanceKm: number;
}

export function calculateAerosolSpread(params: AerosolParams) {
  const trajectory: AshPoint[] = [];
  const kmPerDay = params.stratosphericWind * 3.6 * 24; 
  
  // 1 degree latitude ~ 111.32 km
  const kmPerLng = 111.32 * Math.cos((params.lat * Math.PI) / 180);
  
  for (let d = 0; d <= params.days; d += 0.2) {
    const dist = kmPerDay * d;
    const lngOffset = -(dist / kmPerLng); // Bergerak ke arah Barat (minus)
    let lng = (params.lng + lngOffset);
    
    // Normalisasi Longitude agar tidak menabrak batas peta (-180 ke 180)
    while (lng < -180) lng += 360;
    while (lng > 180) lng -= 360;
    
    trajectory.push({
      day: d,
      // Sedikit efek wobbling (penyebaran lintang) karena difusi angin
      lat: params.lat + (Math.sin(d) * 5), 
      lng,
      // Radius difusi melebar seiring waktu
      radiusKm: 150 + (d * params.diffusionRate), 
      distanceKm: dist
    });
  }
  return { 
    trajectory, 
    maxDistance: trajectory[trajectory.length - 1].distanceKm,
    maxRadius: trajectory[trajectory.length - 1].radiusKm
  };
}
export function calculateEruption(params: PhysicsParams) {
  const primary = calculateTrajectory(params);
  const spread = [];
  
  // Generate multiple scattered projectiles
  for (let i = 0; i < params.projectileCount; i++) {
    const v0 = params.v0 * (0.6 + Math.random() * 0.8); // 60% to 140% of initial velocity
    const angle = Math.max(10, Math.min(85, params.angle + (Math.random() * 40 - 20))); // +/- 20 deg
    const windDirection = params.windDirection + (Math.random() * 60 - 30); // +/- 30 deg spread
    const mass = params.mass * (0.2 + Math.random() * 2); // 0.2x to 2.2x mass variance
    
    spread.push(calculateTrajectory({
      ...params,
      v0, angle, windDirection, mass
    }));
  }

  return {
    primary,
    spread,
    maxDistance: primary.maxDistance,
    maxHeight: primary.maxHeight,
    timeOfFlight: primary.timeOfFlight,
  };
}

export interface AcademicMetrics {
  totalMassKg: number;
  vei: number;
  kineticEnergyJoules: number;
  megatonsTNT: number;
  globalCoolingC: number;
  massEruptionRateKgS: number;
  plumeHeightKm: number;
}

export function calculateAcademicMetrics(params: PhysicsParams, aerosolParams: AerosolParams): AcademicMetrics {
  // Scale up mass linearly with projectile count to simulate macroscopic event
  const scaleFactor = 2e8; 
  const totalMassKg = params.mass * Math.max(1, params.projectileCount) * scaleFactor;
  const volumeM3 = totalMassKg / 2500;
  
  // Plume Height H approx max height of ballistic (simplified termodynamics model)
  const plumeHeightKm = Math.max(0, (Math.pow(params.v0 * Math.sin(params.angle * Math.PI / 180), 2) / (2 * 9.81))) / 1000;
  
  // Mass Eruption Rate (MER) based on Sparks (1986): H = 2.00 * (MER)^0.241 -> MER = (H/2.00)^(1/0.241)
  const massEruptionRateKgS = plumeHeightKm > 0 ? Math.pow(plumeHeightKm / 2.00, 1 / 0.241) : 0;
  
  // VEI calculation based on volume: log10(V) - 4
  const vei = Math.max(0, Math.log10(volumeM3) - 4);
  
  // Kinetic Energy: 1/2 m v^2
  const kineticEnergyJoules = 0.5 * totalMassKg * Math.pow(params.v0, 2);
  const megatonsTNT = kineticEnergyJoules / 4.184e15;
  
  // Cooling approx: Pinatubo (VEI 6) caused ~0.5C drop. Tambora (VEI 7) ~1.5C drop.
  const coolingC = Math.min(5, Math.pow(10, vei - 6) * 0.5 * (aerosolParams.days / 30));
  
  return {
    totalMassKg,
    vei: parseFloat(vei.toFixed(1)),
    kineticEnergyJoules,
    megatonsTNT: parseFloat(megatonsTNT.toFixed(2)),
    globalCoolingC: parseFloat(coolingC.toFixed(2)),
    massEruptionRateKgS,
    plumeHeightKm
  };
}
