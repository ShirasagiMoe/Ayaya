import Logger from './logger'

const logger = Logger.getLogger()

class InfoPanel {
  constructor (player) {
    const { element, options: { type } } = player
    this.element = element
    this.panel = element.querySelector('.info-panel')
    this.events = {}
    this.events.droppedFrames = this.panel.querySelector('.dropped-frames')
    this.events.connectionSpeed = this.panel.querySelector('.connection-speed')
    this.events.p2pSpeed = this.panel.querySelector('.p2p-speed')
    this.events.viewport = this.panel.querySelector('.viewport')
    this.events.volume = this.panel.querySelector('.volume')
    this.events.videoId = this.panel.querySelector('.vid')
    this.events.host = this.panel.querySelector('.host')
    this.events.playerMode = this.panel.querySelector('.player-mode')
    this.events.codecs = this.panel.querySelector('.codecs')
    this.stats = {
      p2pDown: 0,
      p2pUp: 0
    }
    this.isShow = false

    this.panel.querySelector('.close').addEventListener('click', (e) => {
      e.preventDefault()
      this.close()
    })

    this.events.playerMode.innerText = type

    this.dict = [
      { x: 0, y: 14 },
      { x: 180, y: 14 }
    ]
  }

  open () {
    this.isShow = true
    this.panel.style.display = 'block'
  }

  close () {
    this.isShow = false
    this.panel.style.display = 'none'
  }

  setVolumeText (volume) {
    this.events.volume.innerText = volume
  }

  setVideoId (val) {
    this.events.videoId.innerText = val
  }

  setSourceHost (val) {
    this.events.host.innerText = val
  }

  trigger (stats) {
    const { element, events } = this
    logger.debug('stats', stats)
    if (stats) {
      events.droppedFrames.innerText = `${stats.droppedFrames}/${stats.totalFrames}`
      events.connectionSpeed.innerText = (stats.fragLastKbps / 8).toFixed(2) + 'Kb/s'
      events.codecs.innerText = stats.codec
    }
    events.viewport.innerText = element.offsetWidth + 'x' + element.offsetHeight
  }

  triggerP2P (stat) {
    const { events, stats } = this
    logger.debug('p2p stats', stat)
    if (stat.p2pSupport) {
      const down = stat.totalP2PDownloaded || 0
      const up = stat.totalP2PUploaded || 0
      stats.p2pDown += down
      stats.p2pUp += up
      events.p2pSpeed.innerText = `Down:${stats.p2pDown + 'KB'} / UP:${stats.p2pUp + 'KB'}`
    } else {
      events.p2pSpeed.innerText = `DISABLED`
    }
  }

  connectionSpeedLine () {

  }

  destroy () {
    this.events = null
    this.panel = null
    this.isShow = null
  }
}

export default InfoPanel
