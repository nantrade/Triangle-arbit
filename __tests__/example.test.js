const http = require('http')
test('get API response - example', done => {
  function callback(data) {
    jest.setTimeout(30000)
    expect(data).toEqual('Welcome to example<br/>url:/example/')
    done()
  }
  http.get('http://localhost:3000/example/', (resp) => {
    let data = ''
    resp.on('data', (chunk) => {
      data += chunk
    })
    resp.on('end', () => callback(data))
  }).on('error', (err) => {
    console.log('Error: ' + err.message)
  })
})
