const getRawValue = (hex: string, position: number) => {
  const value = hex.substring(position, position + 2)
  const parsed = Number.parseInt(value, 16)
  return parsed
}

const getGrillState = (hex: string) => {
  const statusCharacter = hex.charAt(61)
  const status = Number.parseInt(statusCharacter, 10)
  let statusString: string
  if (status === 0) statusString = 'off'
  else if (status === 1) statusString = 'on'
  else if (status === 2) statusString = 'fan mode'
  else statusString = 'unknown'
  return statusString
}

const getCurrentGrillTemp = (hex: string) => {
  const first = getRawValue(hex, 4)
  const second = getRawValue(hex, 6)
  return first + (second * 256)
}

const getLowPelletAlarmActive = (hex: string) => {
  const first = getRawValue(hex, 48)
  const second = getRawValue(hex, 50)
  const value = first + (second * 256)
  return value === 128
}

const getDesiredGrillTemp = (hex: string) => {
  const first = getRawValue(hex, 12)
  const second = getRawValue(hex, 14)
  return first + (second * 256)
}

const getCurrentFoodTemp = (hex: string) => {
  const first = getRawValue(hex, 8)
  const second = getRawValue(hex, 10)
  const currentFoodTemp = first + (second * 256)
  return currentFoodTemp >= 557 ? 0 : currentFoodTemp
}

const getDesiredFoodTemp = (hex: string) => {
  const first = getRawValue(hex, 56)
  const second = getRawValue(hex, 58)
  return first + (second * 256)
}

class GmgStatus {
  isOn: boolean
  currentGrillTemp: number
  desiredGrillTemp: number
  currentFoodTemp: number
  desiredFoodTemp: number
  fanModeActive: boolean
  lowPelletAlarmActive: boolean
  host: string
  grillId: string
  timestamp: number
  state: string
  _hex: string
  constructor(bytes: Buffer) {
    const hex = Buffer.from(bytes).toString('hex')
    this.state = getGrillState(hex)
    this._hex = hex
    this.isOn = this.state === 'on'
    this.currentGrillTemp = getCurrentGrillTemp(hex)
    this.desiredGrillTemp = this.isOn ? getDesiredGrillTemp(hex) : 0
    this.currentFoodTemp = getCurrentFoodTemp(hex)
    this.desiredFoodTemp = this.isOn ? getDesiredFoodTemp(hex) : 0
    this.fanModeActive = this.state === 'fan mode'
    this.lowPelletAlarmActive = getLowPelletAlarmActive(hex)
  }
}
export { GmgStatus }