<script setup>
  import { PowerIcon } from '@heroicons/vue/24/solid';
  // import { ArrowPathIcon } from '@heroicons/vue/24/solid';
  import { state } from './store';

  defineProps(['closeConnection', 'openConnection', 'loadAllData', 'deleteAllData']);

  function togglePower() {
    state.isOn = !state.isOn;
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
    <div class="flex-1 justify-items-start">
      <button @click="togglePower" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
        <PowerIcon class="h-6 w-6 inline-block" />
        Power
      </button>
      <p class="text-white">Status: {{state?.state || "Off" }}</p>
    </div>

    <div class="flex-1 justify-items-center">
      <p class="text-white">Connected: {{state?.connected}}</p>
      <p class="text-white">Grill ID: {{state?.grillId}}</p>
      <p class="text-white">Host: {{state?.host}}</p>
      <p class="text-white">Last Update: {{state?.timestamp}}</p>
    </div>

    <div class="flex-1 text-right">
        <button v-if="state?.connectionStatus == 'OPEN'" @click="closeConnection" class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
          Disconnect
        </button>
        <button v-if="state?.connectionStatus == 'CONNECTING'" class="text-white bg-yellow-700 hover:bg-yellow-800 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800">
          Connecting...
        </button>
        <button v-if="state?.connectionStatus == 'CLOSED'" @click="openConnection" class="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
          Connect
        </button>
        <br>
        <button @click="loadAllData" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg mt-2.5 text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
          Load All Data
        </button>
        <button @click="deleteAllData" class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg mt-2.5 text-sm px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
          Delete All Data
        </button>
    </div>
  </div>

</template>

<style scoped>
</style>