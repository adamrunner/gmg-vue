<script setup>
  import GrillTempControl from './GrillTempControl.vue';
  import FoodTempControl from './FoodTempControl.vue';
  import MainControls from './MainControls.vue';
  import { store, entriesStore } from './store';
  import { ref, watch } from 'vue';
  import { addData, readAllData, clearAllData } from './localDb';
  import { useEventSource } from '@vueuse/core';

  const { status, data, close, open } = useEventSource('/grill/status', [], {
    autoReconnect: true,
    immediate: false,
  });


  function connect() {
    open();
    store.connectionStatus = status.value;
  }

  function loadAllData() {
    readAllData().then((data) => {
      entriesStore.entries.push(...data);
    });

  }

  function deleteAllData() {
    clearAllData().then(() => {
      entriesStore.entries = [];
      console.log("Data Cleared");
    })
  }

  const disconnect = () => {
    close();
    store.currentGrillTemp     = 0;
    store.currentFoodTemp      = 0;
    store.desiredFoodTemp      = 0;
    store.desiredGrillTemp     = 0;
    store.fanModeActive        = false;
    store.isOn                 = false;
    store.lowPelletAlarmActive = false;
    store.state                = "disconnected";
    store.connected            = false;
    store.grillId              = "";
    store.host                 = "";
    store.timestamp            = new Date().toISOString();
    store.connectionStatus     = status.value;
  }

  watch(data, (newData) => {
    const parsedData           = JSON.parse(newData);
    store.currentGrillTemp     = parsedData.currentGrillTemp;
    store.currentFoodTemp      = parsedData.currentFoodTemp;
    store.desiredFoodTemp      = parsedData.desiredFoodTemp;
    store.desiredGrillTemp     = parsedData.desiredGrillTemp;
    store.fanModeActive        = parsedData.fanModeActive;
    store.isOn                 = parsedData.isOn;
    store.lowPelletAlarmActive = parsedData.lowPelletAlarmActive;
    store.state                = parsedData.state;
    store.connected            = status.value === 'OPEN';
    store.grillId              = parsedData.grillId;
    store.host                 = parsedData.host;
    store.timestamp            = parsedData.timestamp;
    store.connectionStatus     = status.value;
    console.log(parsedData)
    addData(parsedData)
    entriesStore.entries.push(parsedData);
  });
  // connect();
  // loadAllData();
</script>

<template>
  <div class="grid md:grid-cols-4 gap-2 justify-center">
    <MainControls :close-connection="disconnect" :open-connection="connect" :load-all-data="loadAllData" :delete-all-data="deleteAllData"/>
    <GrillTempControl />
    <FoodTempControl />
    <div class="md:col-start-2 md:col-span-2 p-6  bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <p class="text-white">Entries Store Count: {{ entriesStore.entries.length }}</p>
    </div>

  </div>
</template>