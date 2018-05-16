const LOGGER_LEVEL = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    FATAL: 4,
}
const LOGGER_TYPE = {
    VIEW: 0,
    CONSOLE: 1,
}

class Logger {
    
    constructor(element) {
        this.el = document.getElementById(element || 'logger')
        this.level = LOGGER_LEVEL.DEBUG
        this.type = LOGGER_TYPE.VIEW
    }

    debug(...logs) {
        this.print(LOGGER_LEVEL.DEBUG, ...logs);
    }

    info(...logs) {
        this.print(LOGGER_LEVEL.INFO, ...logs);
    }

    warn(...logs) {
        this.print(LOGGER_LEVEL.WARN, ...logs);
    }

    error(...logs) {
        this.print(LOGGER_LEVEL.ERROR, ...logs);
    }

    fatal(...logs) {
        this.print(LOGGER_LEVEL.FATAL, ...logs);
    }

    print(level, ...strs) {

        if (level < this.level) return
        if (this.type == LOGGER_TYPE.VIEW) {
            let text = ''
            for (let str of strs) {
                text += str + ' '
            }
            if (text != '') text = `[${this.typeToName(this.level)}] ${text}`
            this.el.appendChild(document.createTextNode(text))
            this.el.appendChild(document.createElement("br"))
            this.el.scrollTop = this.el.scrollHeight
        } else {
            console.log(strs)
        }
    }

    setLevel(level) {
        this.level = level
    }

    setType(type) {
        this.type = type
    }

    typeToName(type) {
        var name;
        for (let n in LOGGER_LEVEL) {
            if (type == LOGGER_LEVEL[n]) {
                name = n;
                break;
            }
        }
        return name;
    }
}

export default new Logger('logger');