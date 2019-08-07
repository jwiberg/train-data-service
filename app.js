const express = require('express')
const port = process.env.PORT || 3000
const app = express()
const fs = require('fs')
const low = require('lowdb')
const Memory = require('lowdb/adapters/Memory')
const db = low(new Memory())

app.get('/data_for_train/:train_id', (req, res) => {
  res.send(JSON.stringify(db.get('trains.' + req.params.train_id).value()))
})

app.post('/reserve', (req, res) => {
  res.send("Reserved or not")
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
