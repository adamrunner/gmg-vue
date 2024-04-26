<script setup>
import { state } from './store';

const handleSubmit = (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const desiredGrillTemp = formData.get('grill_temp');
  fetch('/grill/setTempF', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ grill_temp: desiredGrillTemp }),
  });
};
</script>

<template>
  <div class="md:col-start-2 p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
    <form class="space-y-6" @submit="handleSubmit">
      <p class="text-white">
        Current Grill Temp: {{ state.currentGrillTemp }} ºF
      </p>
      <div>
        <label for="grill_temp" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Desired Grill Temp</label>
        <input type="number" v-bind:disabled="!state.isOn" v-bind:value="state.desiredGrillTemp" id="grill_temp" name="grill_temp" min="0" max="500" class="block w-full px-3 py-2 mt-1 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700">
      </div>
      <button type="submit" v-bind:disabled="!state.isOn" class="text-white disabled:cursor-not-allowed disabled:bg-slate-700 disabled:hover:bg-slate-700 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Set Temperature</button>
    </form>
  </div>
</template>

<style scoped>
</style>