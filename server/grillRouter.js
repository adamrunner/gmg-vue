import express from 'express'
import GmgClient from './gmgClient.js'
const gmgClient = new GmgClient()
const router = express.Router()

router.post('/powerOn', (req, res) => {
  gmgClient.powerOn().then((result) => {
    console.log("Result:", result)
    res.statusCode = 204
    res.send("OK")
  })
})
router.post('/powerOff', (req, res) => {
  gmgClient.powerOff().then((result) => {
    console.log("Result:", result)
    res.statusCode = 204
    res.send("OK")
  })
})
router.post('/powerToggle', (req, res) => {
  gmgClient.powerToggle().then((result) => {
    console.log("Result:", result)
    res.statusCode = 204
    res.send("OK")
  })
})
// Server Sent Events for watching the grill status

router.get('/status', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders() // flush the headers to establish SSE with client
  // todo add error handling for when no grill detected
  const interval = setInterval(() => {
    gmgClient.getGrillStatus().then((status) => {
      status.host      = gmgClient.host;
      status.grillId   = gmgClient.grillId;
      status.connected = true;
      status.timestamp = new Date().toISOString();
      res.write(`data: ${JSON.stringify(status)}\n\n`)
    })
  },2000);

  res.on("close", () => {
    clearInterval(interval);
    res.end();
  });
})
// This route is unused currently, remove later
router.post('/discover', (req, res) => {
  gmgClient.discoverGrill().then((grill) => {
    console.log(grill)
    res.json({grill: grill})
  })

})
router.post('/setTempF', (req, res) => {
  console.log("Request:", req.body);
  gmgClient.setGrillTempF(req.body.grill_temp).then((result) => {

    // console.log("Result:", result);
    res.statusCode = 204
    res.send("OK")
  })
})
router.post('/setFoodTempF', (req, res) => {
  console.log("Request:", req.body);
  gmgClient.setFoodTempF(req.body.food_temp).then((result) => {

    // console.log("Result:", result);
    res.statusCode = 204
    res.send("OK")
  })
})

export default router;