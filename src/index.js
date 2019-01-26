import './styles/demo.scss'

import Ayaya from './Ayaya'
import { EVENTS } from './js/events'

/* global AYAYA_VERSION GIT_HASH */
console.log(`Ayaya@${AYAYA_VERSION}-${GIT_HASH}`)

const option = {
  element: document.getElementById('player'),
  type: 'hls',
  loggerType: 0,
  video: {
    poster: '',
    src: '/build/WakabaGirl.m3u8'
  },
  volume: 60
}

const player = new Ayaya(option)
const { event } = player

event.dispatch(EVENTS.PLAY, { message: '播放器触发了开始播放' })

event.register(EVENTS.READY, () => {
  player.play()
})
