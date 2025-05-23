"use client";

import { useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions,
  Plugin,
  Chart,
} from "chart.js";
import { Scatter } from "react-chartjs-2";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

// Quadrant plugin
const quadrants: Plugin<"scatter"> = {
  id: "quadrants",
  beforeDraw: (chart) => {
    const { ctx, chartArea, scales } = chart;
    if (!chartArea) return;
    const { left, right, top, bottom } = chartArea;
    // Get meanAge from chart.config (injected via plugin closure)
    const meanAge = (chart as any)._meanAge ?? 0;
    console.log("Mean Age: ", meanAge);
    // Draw vertical line at meanAge (x axis is priority, y axis is days old)
    const midX = scales.x.getPixelForValue(5); // x=5 for priority midpoint
    const midY = scales.y.getPixelForValue(meanAge); // y=meanAge for mean age

    ctx.save();
    // Top Left
    ctx.fillStyle = "rgba(255,220,220,0.25)";
    ctx.fillRect(left, top, midX - left, midY - top);
    // Top Right
    ctx.fillStyle = "rgba(220,220,255,0.25)";
    ctx.fillRect(midX, top, right - midX, midY - top);
    // Bottom Right
    ctx.fillStyle = "rgba(220,255,220,0.25)";
    ctx.fillRect(midX, midY, right - midX, bottom - midY);
    // Bottom Left
    ctx.fillStyle = "rgba(255,255,220,0.25)";
    ctx.fillRect(left, midY, midX - left, bottom - midY);

    // Draw vertical line (priority midpoint)
    ctx.strokeStyle = "#888";
    ctx.beginPath();
    ctx.moveTo(midX, top);
    ctx.lineTo(midX, bottom);
    ctx.stroke();
    // Draw horizontal line (mean age)
    ctx.beginPath();
    ctx.moveTo(left, midY);
    ctx.lineTo(right, midY);
    ctx.stroke();
    ctx.restore();
  },
};

const options: ChartOptions<"scatter"> = {
  plugins: {
    legend: { display: true },
    tooltip: {
      callbacks: {
        label: function (context) {
          const point = context.raw as { x: number; y: number; title?: string };
          // Show task title in tooltip
          return point.title ? `${point.title} (Days Old: ${point.y})` : `Days Old: ${point.y}`;
        },
        title: function (context) {
          // Show priority name as tooltip title
          return context[0]?.dataset?.label || '';
        }
      }
    },
  },
  scales: {
    x: {
      type: "linear",
      position: "bottom",
      min: 0,
      max: 10,
      grid: { color: "#bbb" },
      title: {
        display: true,
        text: "Priority",
      },
    },
    y: {
      min: 0,
      max: 70,
      grid: { color: "#bbb" },
      title: {
        display: true,
        text: "Days Old",
      },
    },
  },
  elements: {
    point: {
      radius: 5,
    },
  },
};

const data = {
  datasets: [
    {
      label: "Sample Data",
      data: [
        { x: -5, y: 6 },
        { x: 4, y: 5 },
        { x: -7, y: -6 },
        { x: 8, y: -7 },
      ],
      backgroundColor: "rgba(75, 192, 192, 1)",
    },
  ],
};

interface ChartDataset {
  data: { x: number; y: number; title?: string }[];
  label: string;
  backgroundColor: string;
}

export default function FourQuadrantScatter({ taskData, meanAge }: { taskData: ChartDataset[], meanAge: number }) {
  const chartRef = useRef<ChartJS<"scatter"> | null>(null);

  // Custom effect to inject meanAge into the chart instance after render
  useEffect(() => {
    if (chartRef.current) {
      (chartRef.current as any)._meanAge = meanAge;
      chartRef.current.update();
    }
  }, [meanAge, taskData]);

  const chartData = {
    datasets: taskData
  };

  return (
    <div style={{ width: 600, height: 400 }}>
      <Scatter
        ref={chartRef}
        data={chartData}
        options={options}
        plugins={[quadrants]}
      />
    </div>
  );
}