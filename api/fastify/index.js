'use strict'

const fs = require('fs')

const app = require('fastify')({ logger: true })
const FastifyMultipart = require('@fastify/multipart')
const FastifyCors = require('@fastify/cors')

app.register(FastifyCors)
app.register(FastifyMultipart, {
  attachFieldsToBody: 'keyValues',
  limits: { fileSize: 100 * 1024 * 1024 },
})

// global fileStreams
let fileStreams = {}

app.get('/', async () => ({ message: 'Hello, World!', who: 'Fastify' }))

app.post('/upload', async (request, reply) => {
  const { file, chunkIndex, chunkTotal, fileName, state } = request.body

  if (!file || !chunkIndex || !chunkTotal || !fileName || !state) {
    return reply.code(400).send({ error: 'Missing parameters.' })
  }

  console.log(`Hit !!! [${+chunkIndex + 1}/${+chunkTotal}]`)

  if (!fileStreams[state]) {
    fileStreams[state] = []
  }

  fileStreams[state][+chunkIndex] = file

  if (fileStreams[state].length === +chunkTotal) {
    const mergedBuffer = Buffer.concat(fileStreams[state])

    fs.writeFileSync(`./upload/${state.slice(0, 8) + '_' + fileName}`, mergedBuffer)

    delete fileStreams[state]
    console.log('Data written to file successfully.')
  }

  reply.send({ success: true })
})

app.listen({ port: 5001 }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`Fastify server listening on ${address}`)
})
