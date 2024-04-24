<script setup>
  import GrillTempControl from './GrillTempControl.vue';
  import FoodTempControl from './FoodTempControl.vue';
  import MainControls from './MainControls.vue';
  import { store } from './store';
  import { ref, watch } from 'vue';
  import { addData, readAllData } from './local_db';
  import { useEventSource } from '@vueuse/core';

  const { status, data, close, open } = useEventSource('/grill/status', [], {
    autoReconnect: true,
  });

  function connect() {
    open();
    store.connectionStatus = status.value;
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
    store.connected            = parsedData.connected;
    store.grillId              = parsedData.grillId;
    store.host                 = parsedData.host;
    store.timestamp            = parsedData.timestamp;
    store.connectionStatus     = status.value;
    console.log(parsedData)
    addData(parsedData)
  });
</script>

<template>
  <div class="grid md:grid-cols-4 gap-2 justify-center">
    <MainControls :close-connection="disconnect" :open-connection="connect" />
    <GrillTempControl />
    <FoodTempControl />
  </div>
</template>