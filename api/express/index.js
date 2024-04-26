'use strict'

const express = require('express')

const app = express()

app.get('/', (req, res) => {
  res.send({
    message: 'Hello, World!',
    who: 'Express',
  })
})

app.listen(3000, () => {
  console.log('Express server listening on port 3000')
})
