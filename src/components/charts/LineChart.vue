<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
} from 'chart.js';

ChartJS.register(
  Title, 
  Tooltip, 
  Legend, 
  LineElement, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  Filler
);

const props = defineProps<{
  data: {
    labels: string[];
    datasets: any[];
  };
  title?: string;
  showLegend?: boolean;
  yAxisLabel?: string;
  fill?: boolean;
}>();

const chartData = computed(() => props.data);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index' as const
  },
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
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12
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
          const label = context.dataset.label || '';
          const value = context.parsed.y;
          if (label.toLowerCase().includes('sati') || label.toLowerCase().includes('hour')) {
            return `${label}: ${value}h`;
          }
          return `${label}: €${value.toLocaleString('hr-HR')}`;
        }
      }
    }
  },
  scales: {
    x: {
      display: true,
      title: {
        display: false
      },
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      title: {
        display: !!props.yAxisLabel,
        text: props.yAxisLabel
      },
      ticks: {
        callback: function(value: any) {
          if (props.yAxisLabel?.toLowerCase().includes('sati') || 
              props.yAxisLabel?.toLowerCase().includes('hour')) {
            return value + 'h';
          }
          return '€' + value.toLocaleString('hr-HR');
        }
      }
    }
  },
  elements: {
    line: {
      tension: 0.3
    },
    point: {
      radius: 4,
      hoverRadius: 8
    }
  }
};
</script>

<style scoped>
canvas {
  height: 300px !important;
}
</style>