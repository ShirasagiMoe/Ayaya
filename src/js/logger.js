class Logger {
  constructor (element) {
    if (Logger.created) {
      return Logger.instance
    }
    Logger.created = true

    Logger.LOGGER_LEVEL = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
      FATAL: 4
    }
    Logger.LOGGER_TYPE = {
      VIEW: 0,
      CONSOLE: 1
    }

    this.el = document.getElementById(element || 'logger')
    this.level = Logger.LOGGER_LEVEL.DEBUG
    this.type = Logger.LOGGER_TYPE.CONSOLE
  }

  static getLogger (element) {
    if (!Logger.instance) {
      Logger.instance = new Logger(element)
    }
    return Logger.instance
  }

  debug (...logs) {
    this.log(Logger.LOGGER_LEVEL.DEBUG, ...logs)
  }

  info (...logs) {
    this.log(Logger.LOGGER_LEVEL.INFO, ...logs)
  }

  warn (...logs) {
    this.log(Logger.LOGGER_LEVEL.WARN, ...logs)
  }

  error (...logs) {
    this.log(Logger.LOGGER_LEVEL.ERROR, ...logs)
  }

  fatal (...logs) {
    this.log(Logger.LOGGER_LEVEL.FATAL, ...logs)
  }

  log (level, ...logs) {
    if (level < this.level) return
    if (this.type === Logger.LOGGER_TYPE.VIEW) {
      let text = ''
      for (let log of logs) {
        text += log + ' '
      }
      if (text !== '') text = `[${Logger.typeToName(this.level)}] ${text}`
      this.el.appendChild(document.createTextNode(text))
      this.el.appendChild(document.createElement('br'))
      this.el.scrollTop = this.el.scrollHeight
    } else {
      const format = Logger.getLogFormat(level)
      console.log(format.text, format.color, ...logs)
    }
  }

  setLevel (level) {
    this.level = level
  }

  setType (type) {
    this.type = type
  }

  static getLogFormat (level) {
    const log = '%c[' + Logger.typeToName(level) + ']\t-> '
    return { text: log, color: Logger.levelGetColor(level) }
  }

  static levelGetColor (level) {
    switch (level) {
      case Logger.LOGGER_LEVEL.DEBUG:
        return 'color: #000'
      case Logger.LOGGER_LEVEL.INFO:
        return 'color: #00FF00'
      case Logger.LOGGER_LEVEL.WARN:
        return 'color: #FFA500'
      case Logger.LOGGER_LEVEL.ERROR:
      default:
        return 'color: red'
    }
  }

  static typeToName (type) {
    let name
    for (let n in Logger.LOGGER_LEVEL) {
      if (type === Logger.LOGGER_LEVEL[n]) {
        name = n
        break
      }
    }
    return name
  }
}

export default Logger
