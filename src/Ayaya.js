import './styles/player.scss'

import icons from './js/icons'
import tpl from './template/player.hbs'



let playerId = 0

const data = {
    index: playerId,
    version: AYAYA_VERSION,
    gitHash: GIT_HASH,
    currentUrl: window.location.href,
    Icons: icons
}

console.log(data)

const html = tpl(data)

const playerElement = document.getElementById('player')
playerElement.classList.add('player-wrapper')
playerElement.innerHTML = html