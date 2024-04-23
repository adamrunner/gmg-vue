<script setup>
  import { PowerIcon } from '@heroicons/vue/24/solid';
  import { WifiIcon } from '@heroicons/vue/24/solid';
  import { store } from './store';

  defineProps(['closeConnection']);

  function togglePower() {
    store.isOn = !store.isOn;
    fetch('/grill/powerToggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })
  }
</script>

<template>
  <div class="flex md:col-start-2 md:col-span-2 p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 text-left">
    <div class="flex-1">
      <button @click="togglePower" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
        <PowerIcon class="h-6 w-6 inline-block" />
        Power
      </button>
      <p class="text-white">Status: {{store?.state || "Off" }}</p>
    </div>
    <div class="flex-1">
        <button @click="closeConnection" class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
          Disconnect
        </button>
    </div>
    <div class="flex-1">
      <p class="text-white">Connected: {{store?.connected}}</p>
      <p class="text-white">Grill ID: {{store?.grillId}}</p>
      <p class="text-white">Host: {{store?.host}}</p>
      <p class="text-white">Last Update: {{store?.timestamp}}</p>
    </div>
  </div>

</template>

<style scoped>
</style>