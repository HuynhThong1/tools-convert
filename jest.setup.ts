import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
import { ReadableStream, WritableStream, TransformStream } from 'stream/web'
import { MessageChannel, MessagePort } from 'worker_threads'
import { setImmediate, clearImmediate } from 'timers'

// Polyfill TextEncoder/TextDecoder for Node.js test environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Polyfill setImmediate/clearImmediate for jsdom
global.setImmediate = setImmediate
global.clearImmediate = clearImmediate

// Polyfill Web Streams API for Node.js test environment
global.ReadableStream = ReadableStream as any
global.WritableStream = WritableStream as any
global.TransformStream = TransformStream as any

// Polyfill MessageChannel/MessagePort for Node.js test environment
global.MessageChannel = MessageChannel as any
global.MessagePort = MessagePort as any

// Mock fetch for tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    blob: () => Promise.resolve(new Blob()),
    headers: new Headers(),
  } as Response)
) as jest.Mock

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
