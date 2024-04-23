<script setup>
  import GrillTempControl from './GrillTempControl.vue';
  import FoodTempControl from './FoodTempControl.vue';
  import MainControls from './MainControls.vue';
  import { store } from './store';
  import { ref, watch } from 'vue';
  import { addData, readAllData } from './local_db';
  import { useEventSource } from '@vueuse/core';
  const { status, data, close } = useEventSource('/grill/status', [], {
    autoReconnect: true,
  })
  watch(data, (newData) => {
    const parsedData           = JSON.parse(newData)
    store.currentGrillTemp     = parsedData.currentGrillTemp
    store.currentFoodTemp      = parsedData.currentFoodTemp
    store.desiredFoodTemp      = parsedData.desiredFoodTemp
    store.desiredGrillTemp     = parsedData.desiredGrillTemp
    store.fanModeActive        = parsedData.fanModeActive
    store.isOn                 = parsedData.isOn
    store.lowPelletAlarmActive = parsedData.lowPelletAlarmActive
    store.state                = parsedData.state
    store.connected            = parsedData.connected
    store.grillId              = parsedData.grillId
    store.host                 = parsedData.host
    store.timestamp            = parsedData.timestamp
    console.log(parsedData)
    addData(parsedData)
  })
  defineExpose({ close })
</script>

<template>
  <div class="grid md:grid-cols-4 gap-2 justify-center">
    <MainControls :close-connection="close"/>
    <GrillTempControl />
    <FoodTempControl />
  </div>
</template>