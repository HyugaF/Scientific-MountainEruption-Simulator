import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PhysicsParams, TrajectoryResult, AerosolParams, AshPoint, AcademicMetrics } from './physics';
import { SimulationMode } from '@/hooks/useSimulation';

export function generateSimulationReport(
  mode: SimulationMode,
  params: PhysicsParams,
  aerosolParams: AerosolParams,
  ballisticResult: { primary: TrajectoryResult; worstCase: TrajectoryResult },
  aerosolResult: { trajectory: AshPoint[] },
  academicMetrics: AcademicMetrics
) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(234, 88, 12); // Orange
  doc.text('KRAKATAU SIMULATION REPORT', 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Simulation Mode: ${mode === 'ballistic' ? 'Ballistic (Local)' : 'Aerosol (Global)'}`, 14, 30);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36);

  if (mode === 'ballistic') {
    // Ballistic params
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Input Parameters', 14, 46);
    
    const paramData = [
      ['Initial Velocity', `${params.v0} m/s`],
      ['Launch Angle', `${params.angle}°`],
      ['Projectile Mass', `${params.mass} kg`],
      ['Wind Speed (Surface)', `${params.windSpeed} m/s`],
      ['Drag Coefficient', `${params.dragCoefficient}`],
    ];

    autoTable(doc, {
      startY: 50,
      head: [['Parameter', 'Value']],
      body: paramData,
      theme: 'grid',
      headStyles: { fillColor: [234, 88, 12] },
    });

    // Key Results
    const finalY = (doc as any).lastAutoTable.finalY || 50;
    doc.text('Primary Trajectory Results', 14, finalY + 10);
    
    const resultData = [
      ['Max Distance', `${(ballisticResult.primary.maxDistance / 1000).toFixed(2)} km`],
      ['Max Altitude', `${(ballisticResult.primary.maxHeight / 1000).toFixed(2)} km`],
      ['Time of Flight', `${ballisticResult.primary.timeOfFlight.toFixed(1)} s`],
      ['Impact Velocity', `${ballisticResult.primary.trajectory[ballisticResult.primary.trajectory.length - 1]?.v.toFixed(1)} m/s`]
    ];

    autoTable(doc, {
      startY: finalY + 15,
      head: [['Metric', 'Value']],
      body: resultData,
      theme: 'grid',
      headStyles: { fillColor: [44, 62, 80] },
    });

    // Detailed Trajectory
    const trajY = (doc as any).lastAutoTable.finalY || finalY + 15;
    doc.text('Trajectory Data Points (Sampled)', 14, trajY + 10);
    
    // Sample max 50 points to fit nicely
    const step = Math.max(1, Math.floor(ballisticResult.primary.trajectory.length / 50));
    const trajData = ballisticResult.primary.trajectory.filter((_, i) => i % step === 0).map(p => [
      p.t.toFixed(1),
      (p.x / 1000).toFixed(2),
      (p.y / 1000).toFixed(2),
      p.v.toFixed(1)
    ]);

    autoTable(doc, {
      startY: trajY + 15,
      head: [['Time (s)', 'Distance (km)', 'Altitude (km)', 'Velocity (m/s)']],
      body: trajData,
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233] },
    });

  } else {
    // Aerosol
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Aerosol Parameters', 14, 46);
    
    const paramData = [
      ['Simulation Days', `${aerosolParams.days} days`],
      ['Stratospheric Wind', `${aerosolParams.stratosphericWind} m/s`],
      ['Diffusion Rate', `${aerosolParams.diffusionRate} km/day`],
    ];

    autoTable(doc, {
      startY: 50,
      head: [['Parameter', 'Value']],
      body: paramData,
      theme: 'grid',
      headStyles: { fillColor: [168, 85, 247] },
    });

    // Academic Metrics
    const finalY = (doc as any).lastAutoTable.finalY || 50;
    doc.text('Academic Analysis', 14, finalY + 10);
    
    const resultData = [
      ['Ejected Mass', `${academicMetrics.totalMassKg.toExponential(2)} kg`],
      ['Estimated VEI', `${academicMetrics.vei.toFixed(1)}`],
      ['Kinetic Energy', `${academicMetrics.kineticEnergyJoules.toExponential(2)} J (${academicMetrics.megatonsTNT.toFixed(1)} MT)`],
      ['Global Temp Delta', `${academicMetrics.globalCoolingC < 0 ? '' : '+'}${academicMetrics.globalCoolingC.toFixed(2)} °C`]
    ];

    autoTable(doc, {
      startY: finalY + 15,
      head: [['Metric', 'Value']],
      body: resultData,
      theme: 'grid',
      headStyles: { fillColor: [44, 62, 80] },
    });

    // Ash Trajectory
    const trajY = (doc as any).lastAutoTable.finalY || finalY + 15;
    doc.text('Ash Dispersion Log', 14, trajY + 10);
    
    const trajData = aerosolResult.trajectory.map(p => [
      p.day.toFixed(1),
      p.lat.toFixed(4),
      p.lng.toFixed(4),
      p.distanceKm.toFixed(0),
      p.radiusKm.toFixed(0)
    ]);

    autoTable(doc, {
      startY: trajY + 15,
      head: [['Day', 'Latitude', 'Longitude', 'Distance (km)', 'Radius (km)']],
      body: trajData,
      theme: 'striped',
      headStyles: { fillColor: [168, 85, 247] },
    });
  }

  doc.save(`Krakatau_Simulation_${mode}_${new Date().getTime()}.pdf`);
}
