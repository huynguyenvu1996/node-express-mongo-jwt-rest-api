require('dotenv-safe').config()
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const compression = require('compression')
const helmet = require('helmet')
const cors = require('cors')
const passport = require('passport')
const initMongo = require('./config/mongo')

const app = express()

// Setup express server
app.set('port', process.env.PORT || 3000)

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use(
  bodyParser.json({
    limit: '20mb'
  })
)
app.use(
  bodyParser.urlencoded({
    limit: '20mb',
    extended: true
  })
) /* for parsing application/x-www-urlencoded */
app.use(cors())
app.use(passport.initialize())
app.use(compression())
app.use(helmet())
app.use(express.static('public'))
app.use(require('./app/routes'))
app.listen(app.get('port'))

// Init MongoDB
initMongo()

module.exports = app // for testing