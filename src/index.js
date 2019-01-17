import './styles/demo.scss'

console.log(`Ayaya@${AYAYA_VERSION}-${GIT_HASH}`)

// import MPlayer from './player'
import Event from './js/events'
import './Ayaya'

const event = new Event()

event.register('haha', (arg) => {
    console.log('callback ', arg)
})

event.dispatch('haha', { message: 'test' })




console.log('use Ayaya')