<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps<{
  data: {
    labels: string[];
    datasets: any[];
  };
}>();

const chartData = computed(() => props.data);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          return '€' + context.parsed.y.toLocaleString('hr-HR');
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value: any) {
          return '€' + value.toLocaleString('hr-HR');
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