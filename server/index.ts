
import express from 'express'
import bodyParser from 'body-parser'
import homepageRouter from './homepageRouter.js'
import grillRouter from './grillRouter.js'
const app = express()
const port = 3000

app.use(express.static('public'))

app.set('view engine', 'ejs');
app.use(bodyParser.json());

app.use('/grill', grillRouter);
app.use(homepageRouter);

app.listen(port, () => {
  console.log(`GMG-Vue  app listening on port ${port}`)
})