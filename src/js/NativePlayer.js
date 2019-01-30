/* eslint-disable */
import TYPE from './player-type'

// import { MediaPlayer, dashjs } from 'dashjs'
// import flv from 'flv.js'
// import Hls from 'hls.js'
import { EVENTS } from './events'
import { performance } from './utils'
import Logger from './logger'

const logger = Logger.getLogger()

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

const hlsInit = (hls, event) => {
  const p2pEngine = hls.p2pEngine || null
  logger.debug('p2pEngine', p2pEngine)

  // media stats
  const stats = {}

  stats.droppedFrames = 0
  stats.totalFrames = 0
  stats.p2pSupport = false

  const hlsEvent = {
    url: '',
    t0: performance(),
    load: [],
    buffer: [],
    video: [],
    level: [],
    bitrate: []
  }

  let sumLatency = 0
  let sumKbps = 0
  let sumProcess = 0
  let sumParsing = 0

  if (p2pEngine !== null && p2pEngine !== undefined) {
    logger.debug('p2pEngine loaded')
    p2pEngine.on('stats', (stat) => {
      stats.p2pSupport = true
      logger.debug('p2pEngine.on(\'stats\')', stat)
      stats.totalHTTPDownloaded = stat.totalHTTPDownloaded // 从HTTP(CDN)下载的数据量（单位KB）
      stats.totalP2PDownloaded = stat.totalP2PDownloaded // 从P2P下载的数据量（单位KB）
      stats.totalP2PUploaded = stat.totalP2PUploaded // P2P上传的数据量（单位KB）
      event.dispatch(EVENTS.P2P_STATS, stats)
    })
  }

  hls.on(Hls.Events.MANIFEST_PARSED, (e, data) => {
    logger.debug(`manifest loaded, found ${data.levels.length} quality level`)

    stats.levelNb = data.levels.length
    stats.levelParsed = 0
    // trigger event ready
    event.dispatch(EVENTS.READY)
  })
  // fired when we know about the codecs that we need buffers for to push into
  hls.on(Hls.Events.BUFFER_CODECS, (t, data) => {
    stats.codec = data && data.video.container + ';codecs=' + data.video.codec + '"'
  })
/*
  hls.once(Hls.Events.LEVEL_LOADED, (e, data) => {

  })
*/

  hls.on(Hls.Events.LEVEL_LOADED, (e, data) => {
    const info = {
      type: 'level',
      id: data.level,
      start: data.details.startSN,
      end: data.details.endSN,
      time: data.stats.trequest - hlsEvent.t0,
      latency: data.stats.tfirst - data.stats.trequest,
      load: data.stats.tload - data.stats.tfirst,
      parsing: data.stats.tparsed - data.stats.tload,
      duration: data.stats.tload - data.stats.tfirst
    }
    const parsingDuration = data.stats.tparsed - data.stats.tload
    stats.sumLevelParsingMs = stats.levelParsed ? (stats.sumLevelParsingMs + parsingDuration) : parsingDuration
    stats.levelParsed++
    stats.levelParsingUs = Math.round(1000 * stats.sumLevelParsingMs / stats.levelParsed)
    hlsEvent.load.push(info)
  })

  hls.on(Hls.Events.FRAG_BUFFERED, (e, data) => {
    const info = {
      type: data.frag.type + ' fragment',
      id: data.frag.level,
      id2: data.frag.sn,
      time: data.stats.trequest - hlsEvent.t0,
      latency: data.stats.tfirst - data.stats.trequest,
      load: data.stats.tload - data.stats.tfirst,
      parsing: data.stats.tparsed - data.stats.tload,
      buffer: data.stats.tbuffered - data.stats.tparsed,
      duration: data.stats.tbuffered - data.stats.tfirst,
      bw: Math.round(8 * data.stats.total / (data.stats.tbuffered - data.stats.trequest)),
      size: data.stats.total
    }
    hlsEvent.load.push(info)
    hlsEvent.bitrate.push({
      time: window.performance.now() - hlsEvent.t0,
      bitrate: e.bw,
      duration: data.frag.duration,
      level: e.id
    })

    if (hls.bufferTimer === undefined) {
      hlsEvent.buffer.push({
        time: 0,
        buffer: 0,
        pos: 0
      })
      // hls.bufferTimer = window.setInterval(checkBuffer, 100)
    }

    const latency = data.stats.tfirst - data.stats.trequest
    const parsing = data.stats.tparsed - data.stats.tload
    const process = data.stats.tbuffered - data.stats.trequest
    const bitrate = Math.round(8 * data.stats.total / (data.stats.tbuffered - data.stats.tfirst))

    if (stats.fragBuffered) {
      stats.fragMinLatency = Math.min(stats.fragMinLatency, latency)
      stats.fragMaxLatency = Math.max(stats.fragMaxLatency, latency)
      stats.fragMinProcess = Math.min(stats.fragMinProcess, process)
      stats.fragMaxProcess = Math.max(stats.fragMaxProcess, process)
      stats.fragMinKbps = Math.min(stats.fragMinKbps, bitrate)
      stats.fragMaxKbps = Math.max(stats.fragMaxKbps, bitrate)
      stats.autoLevelCappingMin = Math.min(stats.autoLevelCappingMin, hls.autoLevelCapping)
      stats.autoLevelCappingMax = Math.max(stats.autoLevelCappingMax, hls.autoLevelCapping)
      stats.fragBuffered++
    } else {
      stats.fragMinLatency = stats.fragMaxLatency = latency
      stats.fragMinProcess = stats.fragMaxProcess = process
      stats.fragMinKbps = stats.fragMaxKbps = bitrate
      stats.fragBuffered = 1
      stats.fragBufferedBytes = 0
      stats.autoLevelCappingMin = stats.autoLevelCappingMax = hls.autoLevelCapping
      sumLatency = 0
      sumKbps = 0
      sumProcess = 0
      sumParsing = 0
    }
    stats.fraglastLatency = latency
    sumLatency += latency
    stats.fragAvgLatency = Math.round(sumLatency / stats.fragBuffered)
    stats.fragLastProcess = process
    sumProcess += process
    sumParsing += parsing
    stats.fragAvgProcess = Math.round(sumProcess / stats.fragBuffered)
    stats.fragLastKbps = bitrate
    sumKbps += bitrate
    stats.fragAvgKbps = Math.round(sumKbps / stats.fragBuffered)
    stats.fragBufferedBytes += data.stats.total
    stats.fragparsingKbps = Math.round(8 * stats.fragBufferedBytes / sumParsing)
    stats.fragparsingMs = Math.round(sumParsing)
    stats.autoLevelCappingLast = hls.autoLevelCapping
  })

  hls.on(Hls.Events.FRAG_LOADING, (e, data) => {
    logger.debug(`Hls Event "${e}"`, data)
    // event.dispatch(EVENTS.STATS, stats)
  })

  hls.on(Hls.Events.FRAG_PARSED, (e, data) => {
    logger.debug('FRAG_PARSED', data)
    stats.droppedFrames += data.frag.dropped
    stats.totalFrames += parseInt(parseFloat(data.frag.duration) * 24)
    event.dispatch(EVENTS.STATS, stats)
    event.dispatch(EVENTS.P2P_STATS, { p2pSupport: stats.p2pSupport })
  })
}

/* eslint-disable */
export const initMediaSource = (element, type, source, events) => {
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

        hlsInit(hls, events)
      }
      break;
    case TYPE.HtmlMediaElement:
    default:
      element.src = source
      break;
  }
  // set video timeline to zero
  element.currentTime = 0

  logger.debug('init media type', type)
  return true
}
