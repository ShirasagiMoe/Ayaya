import './styles/player.scss'

import Event, { EVENTS } from './js/events'
import options from './js/options'
import render from './js/template'
import { initMediaSource, nativeType } from './js/NativePlayer'
import { computeVolume, seekToSecondsText } from './js/utils'
import Controller from './js/controller'
import Notice from './js/notice'
import FullScreen from './js/fullscreen'
import InfoPanel from './js/info-panel'
import Menu from './js/context-menu'

let playerId = 0

class Ayaya {
  constructor (option) {
    const ayayaId = playerId

    this.options = {}
    this.options = options(option)
    this.options.ayayaId = ayayaId
    this.inited = false

    this.element = render(this.options)

    this.video = this.element.getElementsByClassName('ayaya-video')[0]
    this.volume = this.options.volume

    // First: initialize events
    this.event = new Event()

    this.init()
  }

  initEvent () {
    const { event, infoPanel } = this
    event.register(EVENTS.STATS, (stats) => {
      infoPanel.trigger(stats)
    })
    event.register(EVENTS.P2P_STATS, (stats) => {
      infoPanel.triggerP2P(stats)
    })
  }

  init () {
    const { video, event, options } = this
    const source = options.video.src
    if (options.type && options.type === 'auto') {
      options.type = nativeType(source)
    }

    // init media source
    this.inited = initMediaSource(video, options.type, source, event)
    // set default volume
    video.volume = computeVolume(options.volume).fix

    this.infoPanel = new InfoPanel(this)

    this.initEvent()
    // init notice
    this.notice = new Notice(this)

    this.screen = new FullScreen(this)

    // init controller
    this.controller = new Controller(this)

    this.menu = new Menu({
      element: this.element,
      menus: [
        {
          name: '复制视频网址',
          class: 'copy-el1',
          func: () => {}
        },
        {
          name: '循环播放',
          func: () => {
            this.controller._loop()
          }
        },
        {
          name: '无法播放反馈',
          func: function () {
            window.location.href = 'http://www.srsg.moe/feedback/player/error_reply?backurl=' + window.location.href
          }
        },
        {
          name: '详细统计信息',
          func: () => {
            this.infoPanel.open()
          }
        }
      ]
    })
  }

  play () {
    const { video, event, inited } = this
    if (!inited) {
      console.warn('Ayaya not initialize media source!! Please set the media information in video.src ')
    }

    video.play()
    this.controller.listener()

    // this.panelUpdateIv = setInterval(() => {
    //   this.infoPanel.trigger(this.stats || null)
    // }, 1000)

    // trigger event
    event.dispatch(EVENTS.PLAY)
  }

  pause () {
    const { video, event, controller } = this

    video.pause()
    controller.removeListener()

    clearInterval(this.panelUpdateIv)
    // trigger event
    event.dispatch(EVENTS.PAUSE)
  }

  stop () {
    const { video, event, controller } = this

    video.stop()
    controller.removeListener()
    controller.resetLoadBar()

    clearInterval(this.panelUpdateIv)
    // trigger event
    event.dispatch(EVENTS.STOP)
  }

  seek (time) {
    const { video, event, notice } = this

    const currentTime = video.currentTime
    if (time === undefined || isNaN(time)) return currentTime
    const text = seekToSecondsText(currentTime, time)
    notice.showAutoHide(text)
    video.currentTime = time
    event.dispatch(EVENTS.SEEK, time)
    return this
  }

  playbackRate (rate) {
    const { video, controller: { settings }, event } = this

    video.playbackRate = rate
    settings.playSpeedText.innerText = (rate === 1 ? '正常' : rate)
    event.dispatch(EVENTS.PLAYER_PLAYBACK_RATE, rate)
  }

  setVolume (volume) {
    const { controller, infoPanel, event } = this
    infoPanel.setVolumeText(volume)
    event.dispatch(EVENTS.PLAYER_VOLUME_UPDATE, volume)
    controller.setVolume(volume)
  }

  setInfoPanel (videoId, videoSourceCdn) {
    this.infoPanel.setVideoId(videoId)
    this.infoPanel.setSourceHost(videoSourceCdn)
  }

  showStats (type) {
    this.notice.showStats(type)
  }

  /**
   * 播放器全屏
   * type: web | screen
   */
  screenFull (type) {
    const { screen } = this
    if (type === 'screen') {
      screen.screenFull()
    } else {
      screen.webFull()
    }
  }

  /**
   * 注册事件监听
   * 必须传递监听事件回调方法
   *
   * @param eventName
   * @param method
   */
  on (eventName, method) {
    const { event } = this
    if (typeof method === 'function') {
      event.register(eventName, method)
    }
  }

  /**
   * 取消事件监听
   * 必须传递被监听事件回调方法
   *
   * @param eventName
   * @param method
   */
  off (eventName, method = null) {
    const { event } = this
    event.unregister(eventName, method)
  }

  /**
   * 播放器销毁
   */
  destroy () {
    this.event.dispatch(EVENTS.DESTROY)

    clearInterval(this.panelUpdateIv)
    this.controller.destroy()
    this.notice.destroy()
    this.infoPanel.destroy()
    this.screen.destroy()
    this.menu.destroy()
    this.event.destroy()
    this.element.classList.remove('ayaya-wrapper')
    this.element.innerHTML = ''
    this.options = null
  }
}

export default Ayaya
