import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const body = await req.json();
    const { mode, ballisticResult, aerosolResult, params, aerosolParams, academicMetrics } = body;

    const volcanoName = (() => {
      // Find matching volcano or default to generic
      if (Math.abs(params.lat - (-6.102)) < 0.01) return "Krakatoa 1883";
      if (Math.abs(params.lat - (-8.247)) < 0.01) return "Tambora 1815";
      if (Math.abs(params.lat - (-7.540)) < 0.01) return "Merapi";
      if (Math.abs(params.lat - (40.822)) < 0.01) return "Vesuvius";
      if (Math.abs(params.lat - (46.191)) < 0.01) return "Mount St. Helens";
      if (Math.abs(params.lat - (15.143)) < 0.01) return "Pinatubo 1991";
      return "Volcano";
    })();

    let prompt = "";
    if (mode === 'ballistic') {
      prompt = `
You are a senior volcanologist and disaster management expert from PVMBG (Pusat Vulkanologi dan Mitigasi Bencana Geologi).
A user has run a simulation of the ${volcanoName} eruption using a 3D ballistic projectile model with Coriolis effect and Barometric wind shear (red zone evacuation).
Here are the simulation parameters and results:
- Ejection Velocity: ${params.v0} m/s
- Ejection Angle: ${params.angle} degrees
- Total Ejecta Mass (Estimated): ${academicMetrics.totalMassKg.toExponential(2)} kg
- Projectile Count: ${params.projectileCount} scattered fragments
- Base Wind Speed: ${params.windSpeed} m/s
- Wind Direction (Azimuth): ${params.windDirection} degrees
- Air Drag: ${params.airDragEnabled ? "Enabled (Barometric)" : "Disabled"}

Academic Metrics:
- Kinetic Energy: ${academicMetrics.kineticEnergyJoules.toExponential(2)} Joules
- Explosive Yield: ${academicMetrics.megatonsTNT} Megatons of TNT
- Estimated VEI: ${academicMetrics.vei}
- Maximum Impact Distance: ${(ballisticResult.maxDistance / 1000).toFixed(2)} km
- Maximum Apex Height: ${(ballisticResult.maxHeight / 1000).toFixed(2)} km

Write a short, professional, and urgent disaster warning / mitigation advice (max 3 short paragraphs) in Indonesian. 
Explain what this level of explosive energy means for people in the impact radius. Tailor the advice based on the location if it is a famous volcano like Merapi, Vesuvius, Tambora, etc.
Be realistic and authoritative but easy to understand. Format the output in Markdown.
`;
    } else {
      prompt = `
You are a senior climatologist and disaster management expert from PVMBG (Pusat Vulkanologi dan Mitigasi Bencana Geologi).
A user has run a simulation of the ${volcanoName} eruption using a stratospheric aerosol model (global climate impact).
Here are the simulation parameters and results:
- Estimated VEI: ${academicMetrics.vei}
- Total Ejecta Mass: ${academicMetrics.totalMassKg.toExponential(2)} kg
- Simulation Duration: ${aerosolParams.days} days
- Stratospheric Wind (Jet Stream): ${aerosolParams.stratosphericWind} m/s

Academic Metrics:
- Calculated Global Temperature Drop: -${academicMetrics.globalCoolingC}°C
- Maximum Spread Distance: ${aerosolResult.maxDistance.toFixed(0)} km
- Maximum Diffusion Radius: ${aerosolResult.maxRadius.toFixed(0)} km

Write a short, professional, and scientific explanation (max 3 short paragraphs) in Indonesian regarding the global impact.
Explain how this specific temperature drop (-${academicMetrics.globalCoolingC}°C) and volcanic winter will affect global agriculture and climate.
Relate the severity to the specific volcano chosen (${volcanoName}) if applicable.
Be realistic and authoritative but easy to understand. Format the output in Markdown.
`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Gen Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
