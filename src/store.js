import { reactive } from "vue";

export const store = reactive({
  currentFoodTemp: 0,
  currentGrillTemp: 0,
  desiredFoodTemp: 0,
  desiredGrillTemp: 0,
  fanModeActive: false,
  isOn: false,
  lowPelletAlarmActive: false,
  state: "off",
  host: "",
  grillId: "",
  connected: false,
  connectionStatus: ""
})