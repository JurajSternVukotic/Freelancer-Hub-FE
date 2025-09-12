<template>
  <Doughnut :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const props = defineProps<{
  data: {
    labels: string[];
    datasets: any[];
  };
  title?: string;
  showLegend?: boolean;
  cutout?: string;
}>();

const chartData = computed(() => props.data);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: props.cutout || '50%',
  plugins: {
    title: {
      display: !!props.title,
      text: props.title,
      font: {
        size: 16,
        weight: 'bold'
      }
    },
    legend: {
      display: props.showLegend !== false,
      position: 'right' as const,
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12
        },
        generateLabels: function(chart: any) {
          const data = chart.data;
          if (data.labels.length && data.datasets.length) {
            const dataset = data.datasets[0];
            const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
            
            return data.labels.map((label: string, index: number) => {
              const value = dataset.data[index];
              const percentage = ((value / total) * 100).toFixed(1);
              
              return {
                text: `${label} (${percentage}%)`,
                fillStyle: dataset.backgroundColor[index],
                strokeStyle: dataset.backgroundColor[index],
                lineWidth: 0,
                pointStyle: 'circle',
                index: index
              };
            });
          }
          return [];
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      callbacks: {
        label: function(context: any) {
          const label = context.label || '';
          const value = context.parsed;
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: €${value.toLocaleString('hr-HR')} (${percentage}%)`;
        }
      }
    }
  }
};
</script>

<style scoped>
canvas {
  height: 300px !important;
}
</style>