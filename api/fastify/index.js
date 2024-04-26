'use strict'

const app = require('fastify')({ logger: true })

app.get('/', async () => ({ message: 'Hello, World!', who: 'Fastify' }))

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`Fastify server listening on ${address}`)
})
