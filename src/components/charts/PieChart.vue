<template>
  <Pie :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Pie } from 'vue-chartjs';
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
}>();

const chartData = computed(() => props.data);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
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
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
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