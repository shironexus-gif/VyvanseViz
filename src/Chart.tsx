import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface ChartProps {
  chartData: any;
  yAxisMax?: number;
}

const Chart = ({ chartData, yAxisMax }: ChartProps) => {
    if (!chartData || !chartData.labels || chartData.labels.length === 0) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Add a dose to see the simulation.</div>;
    }

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Simulated Dexamfetamine Blood Plasma Concentration',
        },
      },
      scales: {
        x: {
            ticks: {
                maxRotation: 0,
                maxTicksLimit: 10
            },
            title: {
                display: true,
                text: 'Time'
            }
        },
        y: {
          title: {
            display: true,
            text: 'Relative Concentration (proportional to mg)',
          },
          max: yAxisMax,
        },
      },
    };

  return <Line options={options} data={chartData} />;
};

export default Chart;