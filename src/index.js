import './styles/demo.scss'

// import MPlayer from './player'
import Event from './js/events'

const event = new Event()

event.register('haha', (arg) => {
    console.log('call ', arg)
})

event.dispatch('haha', '我是触发消息的内容')

console.log('use Ayaya')