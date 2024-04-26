'use strict'

const fs = require('fs')

const express = require('express')
const multer = require('multer')
const cors = require('cors')

const app = express()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } })

app.use(cors())

// global fileStreams
let fileStreams = {}

app.get('/', (req, res) => {
  res.send({
    message: 'Hello, World!',
    who: 'Express',
  })
})

app.post('/upload', upload.single('file'), (req, res) => {
  const { chunkIndex, chunkTotal, fileName, state } = req.body
  const file = req.file

  if (!file || !chunkIndex || !chunkTotal || !fileName || !state) {
    return res.status(400).send('Invalid request')
  }

  console.log(`Hit !!! [${+chunkIndex + 1}/${+chunkTotal}]`)

  if (!fileStreams[state]) {
    fileStreams[state] = []
  }

  fileStreams[state][+chunkIndex] = file.buffer

  if (fileStreams[state].length === +chunkTotal) {
    const mergedBuffer = Buffer.concat(fileStreams[state])

    fs.writeFileSync(`./upload/${state.slice(0, 8) + '_' + fileName}`, mergedBuffer)

    delete fileStreams[state]
    console.log('Data written to file successfully.')
  }

  return res.status(200).json({ message: 'File uploaded successfully.' })
})

app.listen(5001, () => {
  console.log('Express server listening on port 5001')
})
