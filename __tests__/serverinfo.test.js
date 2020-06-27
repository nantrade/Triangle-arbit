const http = require('http')
test('get API response - serverinfo', done => {
  function callback(data) {
    jest.setTimeout(30000)
    expect(data).toMatch(/<h2>Booted the following process:<\/h2>/)
    done()
  }
  http.get('http://localhost:3000/serverinfo/', (resp) => {
    let data = ''
    resp.on('data', (chunk) => {
      data += chunk
    })
    resp.on('end', () => callback(data))
  }).on('error', (err) => {
    console.log('Error: ' + err.message)
  })
})
