// -----------------------------------------------------------------------------------
// SCIENTIFIC PHYSICS ENGINE
// Upgraded to employ 4th-Order Runge-Kutta (RK4) integration, 
// US Standard Atmosphere 1976 (ISA) modeling, and Mach-dependent wave drag.
// -----------------------------------------------------------------------------------

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
  dragCoefficient: number; // 0.1 to 1.0 (Base Subsonic Cd)
  lat: number;
  lng: number;
  elevation: number; // meters
  projectileCount: number;
  launchAzimuth?: number; // Explicit launch direction (0-360 compass). If undefined, defaults to windDirection for max-range calculation.
}

export interface TrajectoryPoint {
  x: number; // Horizontal distance from origin
  y: number; // Altitude
  t: number;
  v: number;
  lat: number;
  lng: number;
}

// Return type of calculateTrajectory
export interface TrajectoryResult {
  trajectory: TrajectoryPoint[];
  maxDistance: number;
  maxHeight: number;
  timeOfFlight: number;
  telemetry: {
    mass: number;
    launchVelocity: number;
    angle: number;
    launchAzimuth: number;
    impactVelocity: number;
    maxMach: number;
    maxCd: number;
    radius: number;
    baseCd: number;
    rockDensity: number;
    initialRho: number;
    initialA: number;
    coriolisF: number;
  };
}

// US Standard Atmosphere 1976 Model
// Calculates Temperature (K), Density (kg/m3), and Speed of Sound (m/s) based on Altitude (m)
function getAtmosphericProperties(z: number) {
  let T: number, P: number, rho: number;
  const g0 = 9.80665;
  const M = 0.0289644; // Molar mass of Earth's air
  const R = 8.31432; // Universal gas constant
  
  if (z < 11000) {
    // Troposphere
    const T0 = 288.15;
    const P0 = 101325;
    const L = -0.0065; // Lapse rate (K/m)
    T = T0 + L * z;
    P = P0 * Math.pow(T / T0, (-g0 * M) / (R * L));
  } else if (z < 20000) {
    // Tropopause (Isothermal layer)
    const T11 = 216.65;
    const P11 = 22632.1;
    T = T11;
    P = P11 * Math.exp((-g0 * M * (z - 11000)) / (R * T));
  } else {
    // Stratosphere
    const T20 = 216.65;
    const P20 = 5474.89;
    const L = 0.001; // Temp increases in stratosphere
    T = T20 + L * (z - 20000);
    P = P20 * Math.pow(T / T20, (-g0 * M) / (R * L));
  }
  
  rho = (P * M) / (R * T);
  // Speed of sound (a = sqrt(gamma * R_specific * T))
  const gamma = 1.4;
  const R_sp = 287.05;
  const a = Math.sqrt(gamma * R_sp * T);
  
  return { rho, a };
}

// Mach-dependent Drag Coefficient (Wave Drag Phenomenon)
// Volcanic bombs ejected at v0 > 300m/s will experience supersonic wave drag, drastically increasing Cd.
function getMachDependentDrag(baseCd: number, machNumber: number): number {
  if (machNumber < 0.8) return baseCd; // Subsonic
  if (machNumber < 1.2) {
    // Transonic drag rise (approximate linear interpolation to a peak)
    return baseCd + (1.2 - baseCd) * ((machNumber - 0.8) / 0.4);
  }
  // Supersonic (slowly decreases after peaking at M~1.2, but remains higher than subsonic)
  return 1.2 - 0.2 * Math.min(1, (machNumber - 1.2) / 3.0);
}

export function calculateTrajectory(params: PhysicsParams): TrajectoryResult {
  const { v0, angle, mass, windSpeed, windDirection, windShearEnabled, stratosphericWindSpeed, stratosphericWindDir, airDragEnabled, dragCoefficient, lat, lng, elevation } = params;
  
  const theta = (angle * Math.PI) / 180;
  
  // Launch Azimuth: If not explicitly set, we launch downwind (windDirection) to simulate worst-case maximum hazard distance.
  const effectiveLaunchAzimuth = params.launchAzimuth !== undefined ? params.launchAzimuth : params.windDirection;
  
  // Compass Heading to Math Angle conversion
  // Compass: 0 = North, 90 = East, 180 = South, 270 = West
  // Math: 0 = East (+X), 90 = North (+Y), 180 = West (-X), 270 = South (-Y)
  // To convert Compass to Math: Math_Angle = 90 - Compass_Heading
  const launchAzimuthMath = ((90 - effectiveLaunchAzimuth) * Math.PI) / 180;
  const trueWindAzimuthMath = ((90 - params.windDirection) * Math.PI) / 180; // Wind is ALWAYS the global wind direction

  const baseCd = dragCoefficient ?? 0.47; 
  const rockDensity = 2500; // Basaltic/Andesitic density kg/m3
  const radius = Math.cbrt((mass / rockDensity) / ((4 / 3) * Math.PI));
  const A = Math.PI * radius * radius;
  
  const kmPerLat = 111.32;
  const latRad = (lat * Math.PI) / 180;
  const kmPerLng = 111.32 * Math.cos(latRad);
  
  // Coriolis Parameter
  const OMEGA = 7.2921e-5;
  const f = 2 * OMEGA * Math.sin(latRad);
  
  // RK4 State Array: [xE, yN, z, vE, vN, vz]
  let state = [
    0, 
    0, 
    elevation, 
    v0 * Math.cos(theta) * Math.cos(launchAzimuthMath), // vE (X-axis, uses cos for East)
    v0 * Math.cos(theta) * Math.sin(launchAzimuthMath), // vN (Y-axis, uses sin for North)
    v0 * Math.sin(theta)
  ];
  let t = 0;
  let maxHeight = elevation;
  let maxMach = 0;
  let maxCd = 0;
  
  const trajectory: TrajectoryPoint[] = [];
  
  // Adaptive time step based on velocity (finer steps for high velocity to prevent integration explosion)
  const dt = Math.max(0.01, Math.min(0.5, 200 / v0)); 
  
  // Derivative function for RK4
  const getDerivatives = (currentState: number[], currentTime: number) => {
    const [currX, currY, currZ, currVE, currVN, currVZ] = currentState;
    
    // Wind Shear Model
    let wE = 0, wN = 0;
    
    if (windShearEnabled) {
      const factor = Math.min(1, Math.max(0, currZ / 15000));
      const wE_surf = windSpeed * Math.cos(trueWindAzimuthMath);
      const wN_surf = windSpeed * Math.sin(trueWindAzimuthMath);
      const stratoAzimuthMath = ((90 - (stratosphericWindDir ?? 90)) * Math.PI) / 180;
      const stratoSpeed = stratosphericWindSpeed ?? 30;
      const wE_strato = stratoSpeed * Math.cos(stratoAzimuthMath);
      const wN_strato = stratoSpeed * Math.sin(stratoAzimuthMath);
      wE = wE_surf * (1 - factor) + wE_strato * factor;
      wN = wN_surf * (1 - factor) + wN_strato * factor;
    } else {
      const windShearMultiplier = 1 + Math.min(2.5, Math.max(0, currZ) / 6000); 
      const currentWindSpeed = windSpeed * windShearMultiplier;
      wE = currentWindSpeed * Math.cos(trueWindAzimuthMath);
      wN = currentWindSpeed * Math.sin(trueWindAzimuthMath);
    }
    
    const { rho, a } = getAtmosphericProperties(Math.max(0, currZ));
    
    const v_rel_E = currVE - wE;
    const v_rel_N = currVN - wN;
    const v_rel_z = currVZ; // Assuming vertical wind is negligible
    const v_rel = Math.sqrt(v_rel_E ** 2 + v_rel_N ** 2 + v_rel_z ** 2);
    
    // Mach Number & Dynamic Drag
    const machNumber = v_rel / a;
    const Cd = airDragEnabled ? getMachDependentDrag(baseCd, machNumber) : 0;
    
    if (machNumber > maxMach) maxMach = machNumber;
    if (Cd > maxCd) maxCd = Cd;
    
    const k = (0.5 * rho * Cd * A) / mass;
    
    // Gravity varies by altitude
    const g = 9.80665 * Math.pow(6371000 / (6371000 + Math.max(0, currZ)), 2);
    
    const aE = (airDragEnabled ? -k * v_rel * v_rel_E : 0) + (f * currVN); // Drag + Coriolis
    const aN = (airDragEnabled ? -k * v_rel * v_rel_N : 0) - (f * currVE); // Drag + Coriolis
    const aZ = -g + (airDragEnabled ? -k * v_rel * v_rel_z : 0);
    
    return [currVE, currVN, currVZ, aE, aN, aZ];
  };

  while (state[2] >= 0 && t < 20000) { // state[2] is z
    trajectory.push({
      x: Math.sqrt(state[0] ** 2 + state[1] ** 2),
      y: Math.max(0, state[2]),
      t,
      v: Math.sqrt(state[3] ** 2 + state[4] ** 2 + state[5] ** 2),
      lat: lat + state[1] / (kmPerLat * 1000),
      lng: lng + state[0] / (kmPerLng * 1000),
    });
    
    if (state[2] > maxHeight) maxHeight = state[2];
    
    // 4th-Order Runge-Kutta (RK4) Step
    const k1 = getDerivatives(state, t);
    const state_k2 = state.map((s, i) => s + 0.5 * dt * k1[i]);
    const k2 = getDerivatives(state_k2, t + 0.5 * dt);
    const state_k3 = state.map((s, i) => s + 0.5 * dt * k2[i]);
    const k3 = getDerivatives(state_k3, t + 0.5 * dt);
    const state_k4 = state.map((s, i) => s + dt * k3[i]);
    const k4 = getDerivatives(state_k4, t + dt);
    
    state = state.map((s, i) => s + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    t += dt;
  }
  
  // Exact Ground Intersection (Interpolation)
  if (trajectory.length > 0) {
    const lastPoint = trajectory[trajectory.length - 1];
    if (lastPoint.y > 0 && state[2] < 0) {
      const fraction = lastPoint.y / (lastPoint.y - state[2]);
      // Step backward from the underground state to exactly z = 0
      state[0] = state[0] - state[3] * dt * (1 - fraction); 
      state[1] = state[1] - state[4] * dt * (1 - fraction); 
      state[2] = 0;
      t = lastPoint.t + dt * fraction;
    }
  }

  const finalDist = Math.sqrt(state[0] ** 2 + state[1] ** 2);
  trajectory.push({
    x: finalDist,
    y: 0,
    t,
    v: Math.sqrt(state[3] ** 2 + state[4] ** 2 + state[5] ** 2),
    lat: lat + state[1] / (kmPerLat * 1000),
    lng: lng + state[0] / (kmPerLng * 1000),
  });

  const initialAtmos = getAtmosphericProperties(Math.max(0, elevation));
  
  return {
    trajectory,
    maxDistance: finalDist,
    maxHeight,
    timeOfFlight: t,
    telemetry: {
      mass,
      launchVelocity: v0,
      angle: angle, // Capture the original elevation angle
      launchAzimuth: effectiveLaunchAzimuth, // Capture the compass direction
      impactVelocity: Math.sqrt(state[3] ** 2 + state[4] ** 2 + state[5] ** 2),
      maxMach,
      maxCd,
      radius,
      baseCd,
      rockDensity,
      initialRho: initialAtmos.rho,
      initialA: initialAtmos.a,
      coriolisF: f
    }
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
      // Efek penyimpangan lintang yang lebih natural dan pelan (drift atmosferik)
      // Mengurangi gelombang sinusoidal dari 5 derajat (550 km) menjadi 0.5 derajat (55km)
      lat: params.lat + (Math.sin(d / 2) * 0.5) - (d * 0.05), 
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
  const spread = [];
  
  let worstSpreadParams = null;
  let maxSpreadDist = -1;
  
  // 360-DEGREE RADIAL FRAGMENTATION SIMULATION
  // Eruptions generate a spread of particles, but we must strictly respect the user's chosen material type (mass).
  // If the user selects "Ash", the spread must be entirely ash. If they select "Bomb", it must be bombs.
  
  for (let i = 0; i < params.projectileCount; i++) {
    
    // Deterministic velocity and angle spreads using sine waves (Golden Angle modulation)
    // Velocity spread: 40% to 100% of user's v0 (no spread particle exceeds the user's maximum v0 input)
    let v0 = params.v0 * (0.4 + 0.6 * (Math.sin(i * 137.5) * 0.5 + 0.5)); 
    
    // Angle spread: +/- 15 degrees oscillating around user's chosen angle
    let angle = Math.max(10, Math.min(85, params.angle + (Math.sin(i * 98.7) * 15))); 
    
    // Mass spread: 10% to 200% of the user's chosen base mass.
    // This natural variation preserves the characteristic of the selected material class.
    let mass = params.mass * (0.1 + 1.9 * (Math.sin(i * 211.3) * 0.5 + 0.5));
    
    // Ejected radially 360 degrees (evenly spaced based on golden angle approximation)
    let launchAzimuth = (i * 137.508) % 360; 
    
    const trajParams = { ...params, v0, angle, launchAzimuth, mass };
    const traj = calculateTrajectory(trajParams);
    spread.push(traj);
    
    if (traj.maxDistance > maxSpreadDist) {
      maxSpreadDist = traj.maxDistance;
      worstSpreadParams = trajParams;
    }
  }

  // PRIMARY TRAJECTORY (User's Exact Input)
  // We calculate the primary trajectory using strictly the parameters set by the user.
  // Note: Since we don't have an azimuth slider for the vent launch direction, we assume
  // the main plume follows the wind direction.
  const primary = calculateTrajectory({
    ...params,
    launchAzimuth: params.windDirection
  });

  // WORST CASE TRAJECTORY
  // The absolute maximum hazard boundary from the spread
  const worstCase = calculateTrajectory({
    ...(worstSpreadParams || params),
    launchAzimuth: params.windDirection
  });

  return {
    primary,
    worstCase,
    spread,
    maxDistance: worstCase.maxDistance,
    maxHeight: worstCase.maxHeight,
    timeOfFlight: worstCase.timeOfFlight,
    telemetry: worstCase.telemetry
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
