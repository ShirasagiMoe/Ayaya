import Logger from "./logger";
import {uniqueId} from "./utils";

const eventSplitter = /\s+/

const eventsApi = (obj, action, name, rest) => {
    if (!name) return true

    // handle event maps
    if (typeof name === 'object') {
        for (const key in name) {
            obj[action].apply(obj, [key, name[key]].concat(rest))
        }
        return false
    }

    if (eventSplitter.test(name)) {
        const names = name.split(eventSplitter)
        for (let i = 0; i < name.length; i++) {
            obj[action].apply(obj, [names[i]].concat(rest))
        }
        return false
    }
    return true
}

const triggerEvents = (events, args, clazz, name) => {
    let ev, i = -1
    const l = events.length, a1 = args[0], a2 = args[1], a3 = args[2]

    const run = () => {
        try {
            switch (args.length) {
                case 0: while (++i < l) { (ev = events[i]).callback.call(ev.ctx) } return
                case 1: while (++i < l) { (ev = events[i]).callback.call(ev.ctx, a1) } return
                case 2: while (++i < l) { (ev = events[i]).callback.call(ev.ctx, a1, a2) } return
                case 3: while (++i < l) { (ev = events[i]).callback.call(ev.ctx, a1, a2, a3) } return
                default: while (++i < l) { (ev = events[i]).callback.call(ev.ctx, args)} return
            }
        } catch (e) {
            logger.error(clazz, 'error on event', name, 'trigger', '-', e)
            run()
        }
    }

    run()
}

const methods = { on: 'on', once: 'once'}

const logger = Logger.getLogger()

export default class Events {

    constructor(player) {
        this.player = player

        Object.keys(methods).forEach((method) => {

            Events.prototype[method] = (obj, name, callback) => {
                const listeningTo = this._to || (this._to = {})
                const id = obj._id || (obj._id = uniqueId('l'))
                listeningTo[id] = obj
                if (!callback && typeof name === 'object') callback = this
                obj[methods[method]](name, callback, this)
                return this
            }

            // logger.debug('Events:', Events.prototype[method])
        })

        logger.debug('Event inited')
    }

    /**
     * listen to an event indefinitely, if you want to stop you need to call `off`
     * @param name
     * @param callback
     * @param context
     * @returns {Events}
     */
    on(name, callback, context) {
        if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this
        this._events || (this._events = {})
        const events = this._events[name] || (this._events[name] = [])
        events.push({ callback: callback, context: context, ctx: context || this })
        return this
    }

    /**
     * listen to an event only once
     * @param name
     * @param callback
     * @param context
     * @returns {*}
     */
    once(name, callback, context) {
        let once
        if (eventsApi(this, 'once', name, [callback, context]) || !callback) return this
        const off = () => this.off(name, once)
        once = () => {
            off(name, once)
            callback.apply(this, arguments)
        }
        return this.on(name, once, context)
    }

    off(name, callback, context) {

    }

    trigger(name) {

    }

    offListening(obj, name, callback) {

    }

    static register(name) {
        Events.Custom || (Events.Custom = {})
        let property = typeof name === 'string' && name.toUpperCase().trim()

        if (property && !Events.Custom[property]) {
            Events.Custom[property] = property.toLowerCase().split('_').map(
                (value, index) => index === 0 ? value : value = (value[0].toUpperCase() + value.slice(1))
            ).join('')
        } else {
            logger.error('Events', 'Error when register event: ' + name)
        }
    }

    static listAvailableCustomEvents() {
        Events.Custom || (Events.Custom = {})
        return Object.keys(Events.Custom).filter((property) => typeof Events.Custom[property] === 'string')
    }
}

// Events...
// Player
Events.PLAYER_READY = 'ready'

Events.PLAYER_RESIZE = 'resize'

Events.PLAYER_FULLSCREEN = 'fullscreen'

Events.PLAYER_PLAY = 'play'

Events.PLAYER_PAUSE = 'pause'

Events.PLAYER_STOP = 'stop'

Events.PLAYER_ENDED = 'ended'

Events.PLAYER_SEEK = 'seek'

Events.PLAYER_ERROR = 'playererror'

Events.ERROR = 'error'

Events.PLAYER_TIMEUPDATE = 'timeupdate'

Events.PLAYER_VOLUMEUPDATE = 'volumeupdate'

Events.PLAYER_SUBTITLE_AVAILABLE = 'subtitleavailable'
