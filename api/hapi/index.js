'use strict'

const fs = require('fs')
const Hapi = require('@hapi/hapi')

const { mergeReadable } = require('./util')

// global fileStreams
let fileStreams = {}

const init = async () => {
  const server = Hapi.server({
    port: 5001,
    host: 'localhost',
    routes: {
      cors: true,
    },
  })

  server.route({
    method: 'GET',
    path: '/',
    handler: () => ({ message: 'Hello, World!', who: 'HapiJS' }),
  })

  /**
   * Upload API
   */
  server.route({
    method: 'POST',
    path: '/upload',
    options: {
      payload: {
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data',
        maxBytes: 100 * 1024 * 1024, // 100 MB
        multipart: {
          output: 'stream',
        },
      },
    },
    handler: async (request, h) => {
      const { file, chunkIndex, chunkTotal, fileName, state } = request.payload
      if (!file || !chunkIndex || !chunkTotal || !fileName || !state) {
        return h.response({ error: 'Missing parameters.' }).code(400)
      }

      console.info(`Hit !!! [${+chunkIndex + 1}/${+chunkTotal}]`)

      if (!fileStreams[state]) {
        fileStreams[state] = []
      }

      fileStreams[state][+chunkIndex] = file

      if (fileStreams[state].length === +chunkTotal) {
        const assembledStream = mergeReadable(fileStreams[state])
        delete fileStreams[state]

        const writableStream = fs.createWriteStream(
          `./upload/${state.slice(0, 8) + '_' + fileName}`
        )

        assembledStream.pipe(writableStream)

        writableStream.on('finish', () => {
          console.log('Data written to file successfully.')
        })

        writableStream.on('error', (err) => {
          console.error('Error writing to file:', err)
        })
      }

      return h.response({ message: 'File uploaded successfully.' }).code(200)
    },
  })

  await server.start()
  console.log('Hapi Server running on %s', server.info.uri)
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

init()
