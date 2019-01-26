import { EventNoFoundException, EventMethodNoFoundException } from './exception/EventException'

class EventManager {
  constructor () {
    this._events = {}
  }

  register (event, method) {
    if (this._events[event] === undefined) {
      this._events[event] = []
    }
    this._events[event].push(method)
  }

  unregister (event, method) {
    if (this._events[event] === undefined) {
      throw new EventNoFoundException(`event named "${event}"  not unregister method`)
    }

    const index = this._events[event].indexOf(method)
    if (index === -1) {
      throw new EventMethodNoFoundException(`method named "${method}" is not in event "${event}"`)
    }

    this._events[event].splice(index, 1)
    if (this._events[event].length === 0) {
      delete this._events[event]
    }
  }

  dispatch (event, args = null) {
    if (this._events[event] === undefined) {
      // throw new EventDispatchException(`dispatch event error, the event named "${event}" is not existed!`)
      return
    }
    this._events[event].map(method => method(args))
  }

  destroy () {
    this._events = null
  }
}

export const EVENTS = {
  PLAY: 'play',
  PLAYED: 'played',
  PAUSE: 'pause',
  STOP: 'stop',
  ENDED: 'ended',
  SEEK: 'seek',
  ERROR: 'error',
  READY: 'ready',
  DESTROY: 'destroy',
  PLAYER_PLAYBACK_RATE: 'playbackRate',
  PLAYER_FULLSCREEN: 'fullscreen',
  PLAYER_TIMEUPDATE: 'timeupdate',
  PLAYER_VOLUME_UPDATE: 'volumeupdate',
  PLAYER_SUBTITLE_AVAILABLE: 'subtitleavailable',
  INITED: 'inited',
  P2P_STATS: 'p2pstats'
}

export default EventManager
