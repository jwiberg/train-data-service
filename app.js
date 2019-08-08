const express = require('express')
const port = process.env.PORT || 3000
const fs = require('fs')
const low = require('lowdb')
const Memory = require('lowdb/adapters/Memory')
const db = low(new Memory())
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/data_for_train/:train_id', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(db.get(`trains.${req.params.train_id}`).value()))
})

app.post('/reserve', (req, res) => {
  const seats = JSON.parse(req.body.seats)
  const bookedSeats = []
  seats.forEach((seat) => {
    if (db.get(`trains.${req.body.train_id}.seats.${seat}.booking_reference`).value()) {
      bookedSeats.push(seat)
    }
  })

  if (bookedSeats.length > 0) {
    res.status(409)
    res.send(`Seats ${bookedSeats.join()} already booked.`)
  } else {
    seats.forEach((seat) => {
      db.get(`trains.${req.body.train_id}.seats.${seat}`)
        .assign({ booking_reference: req.body.booking_reference })
        .write()
    })
    res.send('Seats succesfully booked!')
  }
})

app.listen(port, () => {
  fs.readFile('trains.json', (err, data) => {
    if (err) throw err
    db.defaults({ trains: JSON.parse(data) })
      .write()
    console.log('Trains loaded to database.')
  })
  console.log('Example app listening on port ' + port + '!')
})
