import { reactive } from "vue";

const defaultFields = {
	currentFoodTemp: 0,
	currentGrillTemp: 0,
	desiredFoodTemp: 0,
	desiredGrillTemp: 0,
	fanModeActive: false,
	isOn: false,
	lowPelletAlarmActive: false,
	state: "disconnected",
	host: "",
	grillId: "",
	connected: false,
	timestamp: new Date().getTime(),
	connectionStatus: "CLOSED",
};

export const state = reactive(defaultFields);

export const entriesStore = reactive({
	entries: [],
});

export const seriesStore = reactive({
	series: [
		{
			name: "Grill Temp",
			data: [],
		},
		{
			name: "Food Temp",
			data: [],
		},
	],
});
