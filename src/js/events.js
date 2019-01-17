import { EventNoFoundException, EventMethodNoFoundException, EventDispatchException } from './exception/EventException'

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
        if(index === -1){
            throw new EventMethodNoFoundException(`method named "${method}" is not in event "${event}"`)
        }

        this._events[event].splice(index, 1)
        if(this._events[event].length === 0){
            delete this._events[event]
        }
    }

    dispatch (event, args = null) {
        if(this._events[event] === undefined){
            throw new EventDispatchException(`dispatch event error, the event named "${event}" is not existed!`)
        }
        this._events[event].map(method => method(args))
    }
}

export default EventManager