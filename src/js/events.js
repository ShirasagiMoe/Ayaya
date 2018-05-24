import logger from "./logger";
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

Object.keys(methods).forEach((method) => {
    Events.prototype[method] = (obj, name, callback) => {
        const listeningTo = this._to || (this._to = {})
        const id = obj._id || (obj._id = uniqueId('l'))
        listeningTo[id] = obj
        if (!callback && typeof name === 'object') callback = this
        obj[methods[method]](name, callback, this)
        return this
    }
})

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

// Playback
Events.PLAYBACK_PROGRESS = 'playback:progress'

Events.PLAYBACK_TIMEUPDATE = 'playback:timeupdate'

Events.PLAYBACK_READY = 'playback:ready'

Events.PLAYBACK_BUFFERING = 'playback:buffering'

Events.PLAYBACK_BUFFERFULL = 'playback:bufferfull'

Events.PLAYBACK_SETTINGSUPDATE = 'playback:settingsupdate'

Events.PLAYBACK_LOADEDMETADATA = 'playback:loadedmetadata'

Events.PLAYBACK_HIGHDEFINITIONUPDATE = 'playback:highdefinitionupdate'

Events.PLAYBACK_BITRATE = 'playback:bitrate'

Events.PLAYBACK_LEVELS_AVAILABLE = 'playback:levels:available'

Events.PLAYBACK_LEVEL_SWITCH_START = 'playback:levels:switch:start'

Events.PLAYBACK_LEVEL_SWITCH_END = 'playback:levels:switch:end'

Events.PLAYBACK_PLAYBACKSTATE = 'playback:playbackstate'

Events.PLAYBACK_MEDIACONTROL_DISABLE = 'playback:mediacontrol:disable'

Events.PLAYBACK_MEDIACONTROL_ENABLE = 'playback:mediacontrol:enable'

Events.PLAYBACK_ENDED = 'playback:ended'

Events.PLAYBACK_PLAY_INTENT = 'playback:play:intent'

Events.PLAYBACK_PLAY = 'playback:play'

Events.PLAYBACK_PAUSE = 'playback:pause'

Events.PLAYBACK_SEEK = 'playback:seek'

Events.PLAYBACK_SEEKED = 'playback:seeked'

Events.PLAYBACK_STOP = 'playback:stop'

Events.PLAYBACK_ERROR = 'playback:error'

Events.PLAYBACK_STATS_ADD = 'playback:stats:add'

Events.PLAYBACK_FRAGMENT_LOADED = 'playback:fragment:loaded'

Events.PLAYBACK_LEVEL_SWITCH = 'playback:level:switch'

Events.PLAYBACK_SUBTITLE_AVAILABLE = 'playback:subtitle:available'

// Core
Events.CORE_CONTAINERS_CREATED = 'core:containers:created'

Events.CORE_OPTIONS_CHANGE = 'core:options:change'

Events.CORE_READY = 'core:ready'

Events.CORE_FULLSCREEN = 'core:fullscreen'

Events.CORE_SCREEN_ORIENTATION_CHANGED = 'core:screen:orientation:changed'

// CONTAINER
Events.CONTAINER_PLAYBACKSTATE = 'container:playbackstate'

Events.CONTAINER_PLAYBACKDVRSTATECHANGED = 'container:dvr'

Events.CONTAINER_BITRATE = 'container:bitrate'

Events.CONTAINER_STATS_REPORT = 'container:stats:report'

Events.CONTAINER_DESTROYED = 'container:destroyed'

Events.CONTAINER_READY = 'container:ready'

Events.CONTAINER_ERROR = 'container:error'

Events.CONTAINER_LOADEDMETADATA = 'container:loadedmetadata'

Events.CONTAINER_SUBTITLE_AVAILABLE = 'container:subtitle:available'

Events.CONTAINER_SUBTITLE_CHANGED = 'container:subtitle:changed'

Events.CONTAINER_TIMEUPDATE = 'container:timeupdate'

Events.CONTAINER_PROGRESS = 'container:progress'

Events.CONTAINER_PLAY = 'container:play'

Events.CONTAINER_STOP = 'container:stop'

Events.CONTAINER_PAUSE = 'container:pause'

Events.CONTAINER_ENDED = 'container:ended'

Events.CONTAINER_CLICK = 'container:click'

Events.CONTAINER_DBLCLICK = 'container:dblclick'

Events.CONTAINER_CONTEXTMENU = 'container:contextmenu'

Events.CONTAINER_MOUSE_ENTER = 'container:mouseenter'

Events.CONTAINER_MOUSE_LEAVE = 'container:mouseleave'

Events.CONTAINER_SEEK = 'container:seek'

Events.CONTAINER_SEEKED = 'container:seeked'

Events.CONTAINER_VOLUME = 'container:volume'

Events.CONTAINER_FULLSCREEN = 'container:fullscreen'

Events.CONTAINER_STATE_BUFFERING = 'container:state:buffering'

Events.CONTAINER_STATE_BUFFERFULL = 'container:state:bufferfull'

Events.CONTAINER_SETTINGSUPDATE = 'container:settingsupdate'

Events.CONTAINER_HIGHDEFINITIONUPDATE = 'container:highdefinitionupdate'

Events.CONTAINER_MEDIACONTROL_SHOW = 'container:mediacontrol:show'

Events.CONTAINER_MEDIACONTROL_HIDE = 'container:mediacontrol:hide'

Events.CONTAINER_MEDIACONTROL_DISABLE = 'container:mediacontrol:disable'

Events.CONTAINER_MEDIACONTROL_ENABLE = 'container:mediacontrol:enable'

Events.CONTAINER_STATS_ADD = 'container:stats:add'

Events.CONTAINER_OPTIONS_CHANGE = 'container:options:change'

// Media Control
Events.MEDIACONTROL_RENDERED = 'mediacontrol:rendered'

Events.MEDIACONTROL_FULLSCREEN = 'mediacontrol:fullscreen'

Events.MEDIACONTROL_SHOW = 'mediacontrol:show'

Events.MEDIACONTROL_HIDE = 'mediacontrol:hide'

Events.MEDIACONTROL_MOUSEMOVE_SEEKBAR = 'mediacontrol:mousemove:seekbar'

Events.MEDIACONTROL_MOUSELEAVE_SEEKBAR = 'mediacontrol:mouseleave:seekbar'

Events.MEDIACONTROL_PLAYING = 'mediacontrol:playing'

Events.MEDIACONTROL_NOTPLAYING = 'mediacontrol:notplaying'

Events.MEDIACONTROL_CONTAINERCHANGED = 'mediacontrol:containerchanged'

Events.MEDIACONTROL_OPTIONS_CHANGE = 'mediacontrol:options:change'


export default class Events {

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