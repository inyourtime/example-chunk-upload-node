const { Readable } = require('stream')

/**
 * Merges multiple Readable streams into a single Readable stream.
 *
 * @param {Array<Readable>} readableArray - An array of Readable streams to merge.
 * @return {Readable} A new Readable stream that emits data from all the input streams.
 */
module.exports.mergeReadable = (readableArray) => {
  return new Readable({
    /**
     * Reads data from each stream in the given array and pushes it into the merged stream.
     */
    read() {
      readableArray.forEach((stream) => {
        stream.on('data', (chunk) => {
          this.push(chunk)
        })

        stream.on('end', () => {
          readableArray.splice(readableArray.indexOf(stream), 1)
          if (readableArray.length === 0) {
            this.push(null) // Mark the end of data in the merged stream
          }
        })
      })
    },
  })
}
