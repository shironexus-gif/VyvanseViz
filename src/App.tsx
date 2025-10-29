import { useState, useEffect } from 'react';
import './App.css';
import Chart from './Chart';
import { generateChartData, Dose } from './simulation';

function App() {
  const [doses, setDoses] = useState<Dose[]>([]);
  const [chartData, setChartData] = useState({});
  
  // Form state
  const [halfLife, setHalfLife] = useState(11);
  const [newDoseMg, setNewDoseMg] = useState(30);
  const [newDoseTime, setNewDoseTime] = useState('08:00');
  const [newDoseDate, setNewDoseDate] = useState(new Date().toISOString().split('T')[0]);
  const [simulationDays, setSimulationDays] = useState(5);

  useEffect(() => {
    const data = generateChartData(doses, halfLife, simulationDays);
    setChartData(data);
  }, [doses, halfLife, simulationDays]);

  const addDose = () => {
    const [hours, minutes] = newDoseTime.split(':').map(Number);
    const doseDateTime = new Date(newDoseDate);
    doseDateTime.setHours(hours, minutes, 0, 0);

    const newDose: Dose = {
      time: doseDateTime.getTime(),
      mg: newDoseMg,
    };

    setDoses(prevDoses => [...prevDoses, newDose].sort((a, b) => a.time - b.time));
  };

  const removeDose = (timeToRemove: number) => {
    setDoses(prevDoses => prevDoses.filter(dose => dose.time !== timeToRemove));
  };

  const addDailyDoses = (days: number) => {
    const [hours, minutes] = newDoseTime.split(':').map(Number);
    const startDate = new Date(newDoseDate);
    startDate.setHours(hours, minutes, 0, 0);

    const newDoses: Dose[] = [];
    for (let i = 0; i < days; i++) {
        const doseDateTime = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        newDoses.push({ time: doseDateTime.getTime(), mg: newDoseMg });
    }

    setDoses(prevDoses => [...prevDoses, ...newDoses].sort((a, b) => a.time - b.time));
  }

  return (
    <div className="App">
      <h1>Vyvanse Plasma Concentration Simulator</h1>
      
      <div className="controls">
        <h2>Configuration</h2>
        <div className="control-grid">
          <div className="control-item">
            <label htmlFor="halfLife">Dexamfetamine Half-Life (hours)</label>
            <input
              id="halfLife"
              type="number"
              value={halfLife}
              onChange={(e) => setHalfLife(Number(e.target.value))}
            />
          </div>
          <div className="control-item">
            <label htmlFor="simulationDays">Simulation Days</label>
            <input
              id="simulationDays"
              type="number"
              value={simulationDays}
              min={3}
              max={10}
              onChange={(e) => setSimulationDays(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <Chart chartData={chartData} />

      
      <div className="controls">
        <h2>Add Doses</h2>
        <div className="control-grid">
          <div className="control-item">
            <label htmlFor="doseMg">Dosage (mg)</label>
            <input
              id="doseMg"
              type="number"
              value={newDoseMg}
              onChange={(e) => setNewDoseMg(Number(e.target.value))}
            />
          </div>
          <div className="control-item">
            <label htmlFor="doseDate">Start Date</label>
            <input
              id="doseDate"
              type="date"
              value={newDoseDate}
              onChange={(e) => setNewDoseDate(e.target.value)}
            />
          </div>
          <div className="control-item">
            <label htmlFor="doseTime">Time</label>
            <input
              id="doseTime"
              type="time"
              value={newDoseTime}
              onChange={(e) => setNewDoseTime(e.target.value)}
            />
          </div>
          <div className="control-item">
            <button onClick={addDose}>Add Single Dose</button>
          </div>
          <div className="control-item">
            <button onClick={() => addDailyDoses(simulationDays)}>Add Daily for {simulationDays} Days</button>
          </div>
        </div>
      </div>

      
      {doses.length > 0 && (
        <div className="doses-list">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h2>Scheduled Doses</h2>
            <button onClick={() => setDoses([])}>Remove All</button>
          </div>
          <ul>
            {doses.map((dose) => (
              <li key={dose.time}>
                <span>
                  {dose.mg}mg on {new Date(dose.time).toLocaleString()}
                </span>
                <button className="remove-dose" onClick={() => removeDose(dose.time)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}

export default App;