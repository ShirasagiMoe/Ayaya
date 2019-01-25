class EventNoFoundException extends Error {
  constructor (message) {
    super(message)
    this.name = 'EventNoFoundException'
  }
}

class EventMethodNoFoundException extends Error {
  constructor (message) {
    super(message)
    this.name = 'EventMethodNoFoundException'
  }
}

class EventDispatchException extends Error {
  constructor (message) {
    super(message)
    this.name = 'EventDispatchException'
  }
}

export { EventNoFoundException, EventMethodNoFoundException, EventDispatchException }
