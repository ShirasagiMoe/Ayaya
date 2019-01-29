import PLAYER_TYPE from './player-type'
import Logger from './logger'

const logger = Logger.getLogger()

export default (options) => {
  const isMobile = /mobile/i.test(window.navigator.userAgent)

  const defaultOption = {
    element: options.element || document.getElementsByClassName('ayaya')[0],
    type: options.type || PLAYER_TYPE.HtmlMediaElement,
    preload: 'auto',
    quality: false,
    mobile: false,
    hotkey: false,
    autoplay: false,
    lightSwitch: false,
    logLevel: 0,
    loop: false,
    volume: 40
  }

  if (isMobile) {
    options.autoplay = false
    options.mobile = true
  }

  for (const defaultKey in defaultOption) {
    if (defaultOption.hasOwnProperty(defaultKey) && !options.hasOwnProperty(defaultKey)) {
      options[defaultKey] = defaultOption[defaultKey]
    }
  }

  if (!options.video) {
    options.video = {
      poster: '',
      src: ''
    }
  }

  logger.setLevel(options.logLevel)

  return options
}
