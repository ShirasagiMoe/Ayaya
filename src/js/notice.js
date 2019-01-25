import PLAY_STATUS from './player-status'
import Icons from './icons'

export default class Notice {
  constructor (player) {
    this.player = player

    this.element = this.player.element.querySelector('.video-notice')
    this.element.style.display = 'none'
    this.element.style.opacity = 0

    this.textEl = this.element.querySelector('span')
    this.textEl.innerText = ''

    // stats
    this.stats = this.player.element.querySelector('.video-stats')
    // this.stats.classList.remove('show')
    this.statsIv = 0

    this.iv = 0
  }

  showAutoHide (text) {
    clearTimeout(this.iv)
    this.show(text)

    this.iv = setTimeout(() => {
      this.hide()
    }, 1500)
  }

  show (text) {
    this.textEl.innerHTML = text
    this.element.style.display = 'block'
    this.element.style.opacity = 1
  }

  hide () {
    this.element.style.display = 'block'
    this.element.style.opacity = 0
  }

  trigger () {

  }

  showStats (type) {
    clearTimeout(this.statsIv)
    switch (type) {
      case PLAY_STATUS.PAUSE:
        this.stats.innerHTML = Icons.pause
        break
      case PLAY_STATUS.PLAY:
        this.stats.innerHTML = Icons.play
        break
      case PLAY_STATUS.STOP:
        this.stats.innerHTML = Icons.pause
        break
    }

    this.stats.classList.add('show')
    this.statsIv = setTimeout(() => {
      this.stats.classList.remove('show')
    }, 460)
  }

  destroy () {
    clearTimeout(this.iv)
    clearTimeout(this.statsIv)
  }
}
