
export interface Dose {
  time: number; // Unix timestamp in milliseconds
  mg: number;
}

// Based on a one-compartment model with first-order absorption and elimination.
// C(t) = (Dose * (ka / (ka - ke))) * (exp(-ke * t) - exp(-ka * t))
// We use a fixed absorption half-life of 1 hour, which gives ka = 0.693/1 and a Tmax of ~3.8h
// when combined with a typical elimination half-life of 11 hours. This matches clinical data.

const ABSORPTION_HALF_LIFE_HOURS = 1.0;
const KA = Math.log(2) / ABSORPTION_HALF_LIFE_HOURS; // Absorption rate constant

/**
 * Calculates the plasma concentration of a single dose at a specific time after administration.
 * @param hoursAfterDose The time in hours since the dose was taken.
 * @param doseMg The dosage in mg.
 * @param eliminationHalfLifeHours The elimination half-life of the drug in hours.
 * @returns The calculated plasma concentration (in arbitrary units proportional to mg/L).
 */
function calculateSingleDoseConcentration(
  hoursAfterDose: number,
  doseMg: number,
  eliminationHalfLifeHours: number
): number {
  if (hoursAfterDose < 0) {
    return 0;
  }

  const ke = Math.log(2) / eliminationHalfLifeHours; // Elimination rate constant

  // The model can have issues if ka is very close to ke.
  if (Math.abs(KA - ke) < 0.0001) {
    // Simplified model for ka = ke, which is C(t) = D * ka * t * exp(-ka * t)
    return doseMg * KA * hoursAfterDose * Math.exp(-KA * hoursAfterDose);
  }
  
  // The term (KA / (KA - ke)) is a scaling factor to normalize the peak.
  const concentration =
    doseMg *
    (KA / (KA - ke)) *
    (Math.exp(-ke * hoursAfterDose) - Math.exp(-KA * hoursAfterDose));

  return concentration;
}

/**
 * Generates the data for the concentration chart over a specified number of days.
 * @param doses A list of dose objects to include in the simulation.
 * @param eliminationHalfLifeHours The elimination half-life to use for the calculation.
 * @param simulationDays The total duration of the simulation in days.
 * @param timeStepHours The interval in hours for each data point.
 * @returns An object containing arrays for chart labels (time) and data (concentration).
 */
export function generateChartData(
  doses: Dose[],
  eliminationHalfLifeHours: number,
  simulationDays: number = 5,
  timeStepHours: number = 0.5
) {
  if (doses.length === 0) {
    return { labels: [], datasets: [] };
  }

  const labels: string[] = [];
  const data: number[] = [];
  
  const startTime = doses.reduce((min, d) => Math.min(min, d.time), Infinity);
  const totalHours = simulationDays * 24;

  for (let i = 0; i <= totalHours; i += timeStepHours) {
    const currentTime = startTime + i * 60 * 60 * 1000;
    let totalConcentration = 0;

    for (const dose of doses) {
      const hoursAfterDose = (currentTime - dose.time) / (1000 * 60 * 60);
      if (hoursAfterDose >= 0) {
        totalConcentration += calculateSingleDoseConcentration(
          hoursAfterDose,
          dose.mg,
          eliminationHalfLifeHours
        );
      }
    }
    
    const date = new Date(currentTime);
    labels.push(date.toLocaleDateString());
    data.push(totalConcentration);
  }

  return {
    labels,
    datasets: [
      {
        label: 'Dexamfetamine Plasma Concentration',
        data,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };
}
