import TYPE from './player-type'

import { MediaPlayer, dashjs } from 'dashjs'
import flv from 'flv.js'
import Hls from 'hls.js'

export const nativeType = (source) => {
  if (/.mpd([#?$])/i.exec(source)) {
    return TYPE.NativeDash
  } else if (/.flv([#?$])/i.exec(source)) {
    return TYPE.NativeFlv
  } else if (/.m3u8([#?$])/i.exec(source)) {
    return TYPE.NativeHls
  } else {
    return TYPE.HtmlMediaElement
  }
}

const hlsInit = (source, event) => {

}

/* eslint-disable */
export const initMediaSource = (element, type, source) => {
  if (source === null || source === undefined || source === '') {
    return false
  }
  switch (type) {
    case TYPE.NativeDash:
      if (dashjs && MediaPlayer) {
        MediaPlayer().initialize(element, source, false)
      }
      break;
    case TYPE.NativeFlv:
      if (flv && flv.isSupported()) {
        const flvPlayer = flv.createPlayer({
          type: 'flv',
          url: source
        })
        flvPlayer.attachMediaElement(element)
        flvPlayer.load()
      }
      break;
    case TYPE.NativeHls:
      if (Hls && Hls.isSupported()) {
        const hls = new Hls()
        hls.loadSource(source)
        hls.attachMedia(element)

        hlsInit(source, {})
      }
      break;
    case TYPE.HtmlMediaElement:
    default:
      element.src = source
      break;
  }
  // set video timeline to zero
  element.currentTime = 0

  console.log('init media source: type', type)
  return true
}
