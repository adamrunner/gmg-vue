import { createSocket } from 'node:dgram';
import { GmgStatus } from './gmgStatus.js';

const commands = Object.freeze({
  powerOn: 'UK001!',
  powerOff: 'UK004!',
  getGrillStatus: 'UR001!',
  getGrillId: 'UL!',
  setGrillTempF: (temp) => `UT${temp}!`,
  setFoodTempF: (temp) => `UF${temp}!`
});

const defaults = Object.freeze({
  port: 8080,
  host: '255.255.255.255',
  tries: 3,
  timeout: 1500,
  retryMs: 2000,
  grillId: ''
});

const getCommandData = (command) => {
  const fullCommand = `${command}!\n`
  const data = Buffer.from(fullCommand, 'ascii')
  return data
}

class GmgClient {
  constructor(options) {
    this.options = { ...defaults, ...options };
    this.port = this.options.port;
    this.host = this.options.host;
    this.tries = this.options.tries;
    this.retryMs = this.options.retryMs;
  }

  async getGrillStatus() {
    const result = await this.sendCommand(commands.getGrillStatus);
    return new GmgStatus(result.msg);
  }

  async getGrillId() {
    const result = await this.sendCommand(commands.getGrillId);
    return result.msg.toString();
  }

  async powerOff() {
    const status = await this.getGrillStatus();
    if (status.isOn) {
      await this.sendCommand(commands.powerOff);
    }
  }

  async powerOn() {
    const status = await this.getGrillStatus();
    if (!status.isOn) {
      await this.sendCommand(commands.powerOn);
    }
  }

  async powerToggle() {
    const status = await this.getGrillStatus();
    if (status.isOn) {
      await this.sendCommand(commands.powerOff);
    } else {
      await this.sendCommand(commands.powerOn);
    }
  }

  async setGrillTempF(temp) {
    const status = await this.getGrillStatus();
    if (status.isOn) {
      await this.sendCommand(commands.setGrillTempF(temp));
    }
    // TODO: throw error if grill is off
  }

  async setFoodTempF(temp) {
    const status = await this.getGrillStatus();
    if (status.isOn) {
      await this.sendCommand(commands.setFoodTempF(temp));
    }
    // TODO: throw error if grill is off
  }

  async discoverGrill({ tries = this.tries } = {}) {
    return new Promise((res, rej) => {
      let attempts = 0
      let schedule
      const socket = createSocket('udp4')
      const data = getCommandData(commands.getGrillId)
      const finish = (result) => {
        if (schedule) clearInterval(schedule)
        socket.removeAllListeners('message')
        socket.close()
        result instanceof Error ? rej(result) : res(result)
      }

      socket.bind(() => {
        // Listen for response
        socket.setBroadcast(true)
        socket.on('message', (msg, info) => {
          // Make sure the response is not a broadcast to ourself
          if (!msg.equals(data)) {
            this.host = info.address;
            this.grillId = msg.toString();
            finish(this)
            console.log(`Received discovery response dgram from Grill (${info.address}:${info.port})`)
          }
        })

        // Send Commands
        console.log('Attempting grill discovery...')
        schedule = setInterval(() => {
          if (attempts >= tries) {
            const error = new Error(
              `No response from Grill (${this.host}:${this.port}) after [${attempts}] discovery attempts!`)
            finish(error)
            console.log(error)
          } else {
            attempts++
            socket.send(data, 0, data.byteLength, this.port, this.host, error => {
              if (error) {
                console.log(`Grill (${this.host}:${this.port}) discovery broadcast dgram send failed -> ${error}`)
              } else {
                console.log(`Grill (${this.host}:${this.port}) discovery broadcast dgram sent -> Attempt #${attempts}`)
              }
            })
          }
        }, this.retryMs)
      })
    })
  }

  async sendCommand(command, { tries = this.tries } = {}) {
    if (this.host === defaults.host) {
      console.log('Grill host is broadcast address!')
      await this.discoverGrill()
    }

    return await new Promise((res, rej) => {
      let attempts = 0
      let schedule
      const socket = createSocket('udp4')
      const data = getCommandData(command)
      const offset = data.byteLength

      const finish = (result) => {
        if (schedule) clearInterval(schedule)
        socket.removeAllListeners('message')
        socket.close()
        result instanceof Error ? rej(result) : res(result)
      }

      // Listen for response
      socket.on('message', (msg, info) => {
        if (info.address === this.host) {
          finish({ msg, info })
          console.log(`Received response dgram from Grill (${info.address}:${info.port})`)
          console.log(`Response: ${msg.toString()}`)
          console.log("Info: ", info)
        }
      })

      // Send Commands
      schedule = setInterval(() => {
        if (attempts > tries) {
          const error = new Error(`No response from Grill after [${attempts}] command sent attempts!`)
          finish(error)
          console.log(error)
        } else {
          attempts++
          socket.send(data, 0, offset, this.port, this.host, error => {
            if (error) {
              console.log(`Grill (${this.host}:${this.port}) [${command}] command dgram send failed -> ${error}`)
            } else {
              console.log(`Grill (${this.host}:${this.port}) [${command}] command dgram sent -> Attempt #${attempts}.`)
            }
          })
        }
      }, this.retryMs)
    })
  }
}

export default GmgClient;