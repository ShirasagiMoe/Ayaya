import tpl from '../template/player.hbs'
import icons from './icons'

export default (options) => {
  const el = options.element

  /* global AYAYA_VERSION GIT_HASH */
  const data = {
    index: options.ayayaId,
    version: AYAYA_VERSION,
    gitHash: GIT_HASH,
    currentUrl: window.location.href,
    Icons: icons,
    src: options.video.src,
    poster: options.video.poster
  }

  const hbsHtml = tpl(data)

  el.classList.add('ayaya-wrapper')
  el.innerHTML = hbsHtml

  return el
}
