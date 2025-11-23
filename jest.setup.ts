import '@testing-library/jest-dom'

// Polyfill for Next.js Request/Response
global.Request = class Request {
  url: string
  method: string
  headers: Headers

  constructor(url: string, init?: any) {
    this.url = url
    this.method = init?.method || 'GET'
    this.headers = new Headers(init?.headers)
  }
} as any

global.Response = class Response {
  body: any
  status: number
  statusText: string
  headers: Headers

  constructor(body?: any, init?: any) {
    this.body = body
    this.status = init?.status || 200
    this.statusText = init?.statusText || 'OK'
    this.headers = new Headers(init?.headers)
  }

  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
  }

  static json(data: any, init?: any) {
    return new Response(data, init)
  }
} as any

global.Headers = class Headers {
  private map = new Map<string, string>()

  constructor(init?: any) {
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this.map.set(key.toLowerCase(), String(value))
      })
    }
  }

  get(name: string) {
    return this.map.get(name.toLowerCase()) || null
  }

  set(name: string, value: string) {
    this.map.set(name.toLowerCase(), value)
  }

  has(name: string) {
    return this.map.has(name.toLowerCase())
  }
} as any
