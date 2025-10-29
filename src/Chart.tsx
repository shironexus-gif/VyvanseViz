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
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  annotationPlugin
);

interface ChartProps {
  chartData: any;
  yAxisMax?: number;
}

const Chart = ({ chartData, yAxisMax }: ChartProps) => {
    if (!chartData || !chartData.labels || chartData.labels.length === 0) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Add a dose to see the simulation.</div>;
    }

    const annotations: any[] = [];
    if (chartData.labels.length > 0) {
        const minDate = new Date(chartData.labels[0]);
        const maxDate = new Date(chartData.labels[chartData.labels.length - 1]);

        let currentDate = new Date(minDate);
        currentDate.setHours(23, 0, 0, 0);

        while (currentDate <= maxDate) {
            const sleepStart = new Date(currentDate);
            const sleepEnd = new Date(currentDate);
            sleepEnd.setDate(sleepEnd.getDate() + 1);
            sleepEnd.setHours(6, 0, 0, 0);

            annotations.push({
                type: 'box',
                xMin: sleepStart.getTime(),
                xMax: sleepEnd.getTime(),
                backgroundColor: 'rgba(0, 0, 255, 0.1)',
                borderColor: 'transparent',
            });

            currentDate.setDate(currentDate.getDate() + 1);
            currentDate.setHours(23, 0, 0, 0);
        }
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
        annotation: {
            annotations: annotations
        }
      },
      scales: {
        x: {
            type: 'time' as const,
            time: {
                unit: 'day' as const,
                displayFormats: {
                    day: 'dd.MM.yyyy'
                }
            },
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