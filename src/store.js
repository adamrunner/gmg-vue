import { reactive } from "vue";
const fields = {
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
  connectionStatus: "CLOSED"
}
export const store = reactive(fields)

export const entriesStore = reactive({
  entries: []
})