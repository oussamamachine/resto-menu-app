const request = require('supertest')
const express = require('express')

describe('Health endpoint', () => {
  let app

  beforeAll(() => {
    app = express()
    app.get('/', (req, res) => res.json({ status: 'ok' }))
  })

  afterAll(() => {
    // no-op
  })

  it('returns ok json', async () => {
  const res = await request(app).get('/')
    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('status', 'ok')
  })
})
