<script setup>
  import GrillTempControl from './GrillTempControl.vue';
  import FoodTempControl from './FoodTempControl.vue';
  import MainControls from './MainControls.vue';
  import { state, entriesStore, seriesStore } from './store';
  import { ref, watch } from 'vue';
  import { addData, readAllData, clearAllData } from './localDb';
  import { useEventSource } from '@vueuse/core';

  const { status, data, close, open } = useEventSource('/grill/status', [], {
    autoReconnect: true,
    immediate: false,
  });

  const chartOptions = ref({
    chart: {
      id: 'realtime',
      width: '100%',
      height: 350,
      type: 'line',
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: {
          speed: 500
        }
      },
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    xaxis: {
      type: 'datetime',
    },
    yaxis: {
      labels: {
        formatter: (value) => value.toFixed(2)
      }
    },
    stroke: {
      curve: 'smooth'
    },
    markers: {
      size: 0
    },
    series: seriesStore.series,
  });
  function connect() {
    open();
    state.connectionStatus = status.value;
  }

  function loadAllData() {
    readAllData().then((data) => {
      entriesStore.entries.push(...data);
      for (const entry of data) {
        addDataToSeries(entry);
      }
    });

  }

  function addDataToSeries(data) {
    seriesStore.series[0].data.push([data.timestamp, data.currentGrillTemp]);
    seriesStore.series[1].data.push([data.timestamp, data.currentFoodTemp]);
  }

  function deleteAllData() {
    clearAllData().then(() => {
      entriesStore.entries       = [];
      seriesStore.series[0].data = [];
      seriesStore.series[1].data = [];
      console.log("Data Cleared");
    })
  }

  const disconnect = () => {
    close();
    state.currentGrillTemp     = 0;
    state.currentFoodTemp      = 0;
    state.desiredFoodTemp      = 0;
    state.desiredGrillTemp     = 0;
    state.fanModeActive        = false;
    state.isOn                 = false;
    state.lowPelletAlarmActive = false;
    state.state                = "disconnected";
    state.connected            = false;
    state.grillId              = "";
    state.host                 = "";
    state.timestamp            = new Date().getTime();
    state.connectionStatus     = status.value;
  }

  watch(data, (newData) => {
    const parsedData           = JSON.parse(newData);
    state.currentGrillTemp     = parsedData.currentGrillTemp;
    state.currentFoodTemp      = parsedData.currentFoodTemp;
    state.desiredFoodTemp      = parsedData.desiredFoodTemp;
    state.desiredGrillTemp     = parsedData.desiredGrillTemp;
    state.fanModeActive        = parsedData.fanModeActive;
    state.isOn                 = parsedData.isOn;
    state.lowPelletAlarmActive = parsedData.lowPelletAlarmActive;
    state.state                = parsedData.state;
    state.connected            = status.value === 'OPEN';
    state.grillId              = parsedData.grillId;
    state.host                 = parsedData.host;
    state.timestamp            = parsedData.timestamp;
    state.connectionStatus     = status.value;
    console.log(parsedData)
    addData(parsedData)
    addDataToSeries(parsedData);
    entriesStore.entries.push(parsedData);
  });
  // connect();
  // loadAllData();
</script>

<template>
  <div class="grid md:grid-cols-4 gap-2 justify-center">
    <MainControls :close-connection="disconnect" :open-connection="connect" :load-all-data="loadAllData"
      :delete-all-data="deleteAllData" />
    <GrillTempControl />
    <FoodTempControl />
    <div
      class="md:col-start-2 md:col-span-2 p-6  bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <apexchart v-if="seriesStore.series[0].data[0]" type="line" :options="chartOptions" :series="seriesStore.series"></apexchart>
    </div>

  </div>
</template>