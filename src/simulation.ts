export interface Dose {
  time: number; // Unix timestamp in milliseconds
  mg: number;
}

// Based on a one-compartment model with first-order absorption and elimination.
// C(t) = (Dose * (ka / (ka - ke))) * (exp(-ke * t) - exp(-ka * t))

const DEFAULT_TMAX_HOURS = 3.5;
const MIN_TIME_VALUE = 0.1; // Prevents degenerate inputs

function calculateAbsorptionRateConstant(
  eliminationRateConstant: number,
  targetTmaxHours: number
): number {
  const ke = Math.max(eliminationRateConstant, Number.EPSILON);
  const desiredTmax = Math.max(targetTmaxHours, MIN_TIME_VALUE);

  // Start the Newton iteration slightly above ke to avoid division by zero.
  let ka = Math.max(ke + 1 / desiredTmax, ke + 1e-4);

  for (let i = 0; i < 25; i++) {
    const numerator = Math.log(ka) - Math.log(ke);
    const denominator = ka - ke;

    // Guard against pathological numerical behaviour.
    if (denominator === 0) {
      ka = ke + 1e-4;
      break;
    }

    const f = numerator / denominator - desiredTmax;

    if (Math.abs(f) < 1e-6) {
      break;
    }

    const derivative =
      ((1 / ka) * denominator - numerator) / (denominator * denominator);

    if (derivative === 0) {
      break;
    }

    ka -= f / derivative;

    if (!Number.isFinite(ka)) {
      ka = ke + 1e-4;
      break;
    }

    if (ka <= ke) {
      ka = ke + 1e-4;
      break;
    }
  }

  return ka;
}

/**
 * Calculates the plasma concentration of a single dose at a specific time after administration.
 * @param hoursAfterDose The time in hours since the dose was taken.
 * @param doseMg The dosage in mg.
 * @param eliminationRateConstant The elimination rate constant (1/hours).
 * @param absorptionRateConstant The absorption rate constant (1/hours).
 * @returns The calculated plasma concentration (in arbitrary units proportional to mg/L).
 */
function calculateSingleDoseConcentration(
  hoursAfterDose: number,
  doseMg: number,
  eliminationRateConstant: number,
  absorptionRateConstant: number
): number {
  if (hoursAfterDose < 0) {
    return 0;
  }

  const ke = eliminationRateConstant;
  const ka = absorptionRateConstant;

  // The model can have issues if ka is very close to ke.
  if (Math.abs(ka - ke) < 0.0001) {
    // Simplified model for ka = ke, which is C(t) = D * ka * t * exp(-ka * t)
    return doseMg * ka * hoursAfterDose * Math.exp(-ka * hoursAfterDose);
  }

  // The term (ka / (ka - ke)) is a scaling factor to normalize the peak.
  const concentration =
    doseMg *
    (ka / (ka - ke)) *
    (Math.exp(-ke * hoursAfterDose) - Math.exp(-ka * hoursAfterDose));

  return concentration;
}

/**
 * Generates the data for the concentration chart over a specified number of days.
 * @param doses A list of dose objects to include in the simulation.
 * @param eliminationHalfLifeHours The elimination half-life to use for the calculation.
 * @param simulationDays The total duration of the simulation in days.
 * @param timeStepHours The interval in hours for each data point.
 * @param absorptionTmaxHours Target time (in hours) to reach peak concentration.
 * @returns An object containing arrays for chart labels (time) and data (concentration).
 */
export function generateChartData(
  doses: Dose[],
  eliminationHalfLifeHours: number,
  simulationDays: number = 5,
  timeStepHours: number = 0.5,
  absorptionTmaxHours: number = DEFAULT_TMAX_HOURS
) {
  if (doses.length === 0) {
    return { labels: [], datasets: [] };
  }

  const labels: number[] = [];
  const data: number[] = [];

  const startTime = doses.reduce((min, d) => Math.min(min, d.time), Infinity);
  const totalHours = simulationDays * 24;
  const halfLife = Math.max(eliminationHalfLifeHours, MIN_TIME_VALUE);
  const eliminationRateConstant = Math.log(2) / halfLife;
  const absorptionRateConstant = calculateAbsorptionRateConstant(
    eliminationRateConstant,
    absorptionTmaxHours
  );

  for (let i = 0; i <= totalHours; i += timeStepHours) {
    const currentTime = startTime + i * 60 * 60 * 1000;
    let totalConcentration = 0;

    for (const dose of doses) {
      const hoursAfterDose = (currentTime - dose.time) / (1000 * 60 * 60);
      if (hoursAfterDose >= 0) {
        totalConcentration += calculateSingleDoseConcentration(
          hoursAfterDose,
          dose.mg,
          eliminationRateConstant,
          absorptionRateConstant
        );
      }
    }
    
    labels.push(currentTime);
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