const http = require('http')
test('get API response - api~timestamp', done => {
  function callback(data) {
    jest.setTimeout(30000)
    expect(data).toMatch(/Welcome to api timestamp/)
    done()
  }
  http.get('http://localhost:3000/api/timestamp/', (resp) => {
    let data = ''
    resp.on('data', (chunk) => {
      data += chunk
    })
    resp.on('end', () => callback(data))
  }).on('error', (err) => {
    console.log('Error: ' + err.message)
  })
})
