import { type RemoteInfo, createSocket } from 'node:dgram';
import { GmgStatus } from './gmgStatus.js';

interface GmgClientOptions {
  port: number;
  host: string;
  tries: number;
  retryMs: number;
  timeout?: number;
  grillId?: string;
}

interface Command {
  cmd: string | ((arg: number) => string);
}


const commands = Object.freeze({
  powerOn: 'UK001!',
  powerOff: 'UK004!',
  getGrillStatus: 'UR001!',
  getGrillId: 'UL!',
  setGrillTempF: (temp) => `UT${temp}!`,
  setFoodTempF: (temp) => `UF${temp}!`
});

const defaults: GmgClientOptions = Object.freeze({
  port: 8080,
  host: '255.255.255.255',
  tries: 3,
  timeout: 1500,
  retryMs: 2000,
  grillId: ''
});

const getCommandData = (command: Command): Buffer => {
  const fullCommand = `${command.cmd}!\n`;
  return Buffer.from(fullCommand, 'ascii');
};


class GmgClient {
  options: GmgClientOptions
  port: number;
  host: string;
  tries: number;
  retryMs: number;
  grillId: string;
  constructor(options: GmgClientOptions) {
    this.options = { ...defaults, ...options };
    this.port = this.options.port;
    this.host = this.options.host;
    this.tries = this.options.tries;
    this.retryMs = this.options.retryMs;
  }

  async getGrillStatus(command: Command = {cmd: commands.getGrillStatus}): Promise<GmgStatus> {
    const result = await this.sendCommand(command);

    return new GmgStatus(result.msg);
  }

  async getGrillId(command: Command = {cmd: commands.getGrillId}) {
    const result = await this.sendCommand(command);
    return result.msg.toString();
  }

  async powerOff(command: Command = {cmd: commands.powerOff}) {
    const status = await this.getGrillStatus();
    if (status.isOn) {
      await this.sendCommand(command);
    }
  }

  async powerOn(command: Command = {cmd: commands.powerOn}) {
    const status = await this.getGrillStatus();
    if (!status.isOn) {
      await this.sendCommand(command);
    }
  }

  async powerToggle() {
    const status = await this.getGrillStatus();
    if (status.isOn) {
      const command: Command = {cmd: commands.powerOff};
      await this.sendCommand(command);
    } else {
      const command: Command = {cmd: commands.powerOn};
      await this.sendCommand(command);
    }

  }

  async setGrillTempF(temp: number) {
    const status = await this.getGrillStatus();
    if (status.isOn) {
      const command: Command = {cmd: commands.setGrillTempF(temp)};
      await this.sendCommand(command);
    }
    // TODO: throw error if grill is off
  }

  async setFoodTempF(temp: number) {
    const status = await this.getGrillStatus();
    if (status.isOn) {
      const command: Command = {cmd: commands.setFoodTempF(temp)};
      await this.sendCommand(command);
    }
    // TODO: throw error if grill is off
  }

  async discoverGrill({ tries = this.tries } = {}) {
    return new Promise((res, rej) => {
      let attempts = 0
      let schedule: string | number | NodeJS.Timeout | undefined
      const socket = createSocket('udp4')
      const data = getCommandData({cmd: commands.getGrillId})
      const finish = (result: Error | GmgClient) => {
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

  private async sendCommand(command: Command): Promise<{ msg: Buffer; info: RemoteInfo }> {
    if (this.host === defaults.host) {
      console.log('Grill host is broadcast address!')
      await this.discoverGrill()
    }

    return await new Promise((res, rej) => {
      let attempts = 0

      const socket = createSocket('udp4')
      const data = getCommandData(command)
      const offset = data.byteLength

      const finish = (result: Error | { msg: Buffer; info: RemoteInfo }) => {
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
      const schedule = setInterval(() => {
        if (attempts > this.tries) {
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

export { GmgClient, defaults as GmgDefaults };