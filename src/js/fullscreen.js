import Logger from './logger'
import { EVENTS } from './events'

export const FULL_MODE = {
  NONE: 0,
  WEB: 1,
  SCREEN: 2
}

const logger = Logger.getLogger()

class FullScreen {
  constructor (player) {
    this.player = player

    // const supportFullScreen = document.body.requestFullscreen || document.body.mozRequestFullScreen || document.body.webkitRequestFullscreen || document.body.msRequestFullscreen

    // ['landscape-primary', 'landscape-secondary']
    this.SCREEN_DIRECTION = {
      primary: 'landscape-primary',
      secondary: 'landscape-secondary'
    }

    this.setMode(FULL_MODE.NONE)

    // init element
    this.element = {}
    this.element.name = {}
    this.element.name.web = 'player-web-full'
    this.element.name.screen = 'player-screen-full'
    this.element.fullScreen = this.player.element.querySelector('.button-full-screen')
    this.element.fullWebScreen = this.player.element.querySelector('.button-web-full-screen')

    this.element.fullScreen.addEventListener('click', () => {
      this.screenFull()
    })

    this.element.fullWebScreen.addEventListener('click', () => {
      this.webFull()
    })

    logger.debug('Player Screen Mode:' + this.isInFullScreenMode())
  }

  /**
     * 是否进入了全屏模式
     * @returns {FullScreen|*|boolean}
     */
  isInFullScreenMode () {
    return document.fullScreen || document.mozFullScreen ||
            document.webkitIsFullScreen || document.msFullscreenElement ||
            this.player.element.fullScreen || this.player.element.mozFullScreen ||
            this.player.element.webkitIsFullScreen || this.player.element.msFullscreenElement
  }

  /**
     * Full Web screen mode
     */
  webFull () {
    logger.debug('Player Screen Mode:' + this.isInFullScreenMode())

    if (this.mode !== FULL_MODE.WEB) {
      this.player.element.classList.add(this.element.name.web)
      this.player.element.classList.remove(this.element.name.screen)
      document.body.style.overflow = 'hidden'
      this.setMode(FULL_MODE.WEB)
    } else {
      this.player.element.classList.remove(this.element.name.web)
      this.player.element.classList.remove(this.element.name.screen)
      document.body.style.overflow = 'auto'
      this.setMode(FULL_MODE.NONE)
    }
    this.player.infoPanel.trigger()
    this.player.event.dispatch(EVENTS.PLAYER_FULLSCREEN, this.getMode())
  }

  /**
     * Full Screen mode
     */
  screenFull () {
    logger.debug('Player Screen Mode:' + this.isInFullScreenMode())

    this.player.element.classList.remove(this.element.name.screen)
    this.player.element.classList.remove(this.element.name.web)

    // 不是全屏模式
    if (this.mode !== FULL_MODE.SCREEN && !this.isInFullScreenMode()) {
      logger.debug('InMode' + FULL_MODE.SCREEN)

      if (this.player.element.requestFullscreen) {
        this.player.element.requestFullscreen()
      } else if (this.player.element.mozRequestFullScreen) {
        this.player.element.mozRequestFullScreen()
      } else if (this.player.element.webkitRequestFullscreen) {
        this.player.element.webkitRequestFullscreen()
      } else if (this.player.element.msRequestFullscreen) {
        this.player.element.msRequestFullscreen()
      }
      if (this.player.options.mobile) {
        window.screen.orientation.lock(this.SCREEN_DIRECTION.primary)
      }

      this.player.element.style.width = '100%'
      this.player.element.style.height = '100%'
      this.player.element.classList.add(this.element.name.screen)

      this.setMode(FULL_MODE.SCREEN)
    } else {
      logger.debug('Exit Screen Mode' + FULL_MODE.NONE)

      this.setMode(FULL_MODE.NONE)
      this.exitScreenFull()
    }
    this.player.event.dispatch(EVENTS.PLAYER_FULLSCREEN, this.getMode())
  }

  exitScreenFull () {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
    if (this.player.options.mobile) {
      window.screen.orientation.unlock()
    }

    this.player.element.style.width = ''
    this.player.element.style.height = ''
    document.body.style.overflow = 'auto'
    this.player.element.classList.remove(this.element.name.screen)

    logger.debug('Exit ScreenFull Mode')
  }

  /**
     * Get fullscreen mode
     * @return 0
     */
  getMode () {
    return this.mode
  }

  setMode (mode) {
    this.mode = mode

    if (mode !== FULL_MODE.SCREEN && this.isInFullScreenMode()) {
      this.exitScreenFull()
    }
  }

  destroy () {
    this.exitScreenFull()
  }
}

export default FullScreen
