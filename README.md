# VyvanseViz

This repository has been mostly vibe coded - please do not take it for a thought through and properly build project.

This repository contains a simple visualization tool for the effects of Vyvanse over time. It simulates and visualizes the blood plasma concentration of Dexamfetamine, the active metabolite of Vyvanse.

## Features

- **Dose Management:** Add single or daily doses with specific dosages (in mg), dates, and times. You can also remove individual doses or clear all scheduled doses.
- **Pharmacokinetic Simulation:** The application uses a one-compartment pharmacokinetic model to simulate the drug's concentration over time. It considers a fixed absorption half-life and a configurable elimination half-life for Dexamfetamine.
- **Interactive Chart:** The simulation results are displayed on an interactive line chart. The chart shows the relative concentration of Dexamfetamine in the blood plasma over the simulated period.
- **Configurable Parameters:** Adjust several parameters for the simulation:
  - **Dexamfetamine Half-Life:** The elimination half-life of the drug in hours.
  - **Simulation Days:** The total duration of the simulation in days.
  - **Y-Axis Max:** The maximum value for the Y-axis of the chart, allowing for better visualization of the concentration levels.
- **Sleep Cycle Visualization:** The chart includes shaded areas to represent typical sleep periods (from 11 PM to 6 AM), helping users understand how the drug's concentration might affect their sleep.

## Pharmacokinetic Model

The simulation is based on a one-compartment model with first-order absorption and elimination. The plasma concentration `C` at a given time `t` after a single dose is calculated using the following formula:

```
C(t) = (Dose * (ka / (ka - ke))) * (exp(-ke * t) - exp(-ka * t))
```

Where:

- `C(t)`: The plasma concentration at time `t`.
- `Dose`: The dosage in milligrams (mg).
- `ka`: The absorption rate constant. The simulation uses a fixed absorption half-life of 1 hour, which gives `ka = ln(2) / 1`.
- `ke`: The elimination rate constant, calculated from the user-defined elimination half-life (`ke = ln(2) / half-life`).
- `t`: The time in hours since the dose was administered.

For multiple doses, the total concentration at any given time is the sum of the concentrations from all previous doses.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Cloning the Repository

1. Clone the repo

   ```sh
   git clone https://github.com/yoha-dev/VyvanseViz.git

   ```

2. Installation

   ```sh
   npm install
   ```

## Usage

1.  Start the development server:
    ```sh
    npm run dev
    ```
2.  Open your browser and navigate to the local URL provided.
3.  Use the controls to configure the simulation parameters and add doses.
4.  The chart will update in real-time to show the simulated blood plasma concentration.
