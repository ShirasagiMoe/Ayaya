import './styles/player.scss'

// import { MediaPlayer } from 'dashjs'
// import flv from 'flv.js'
// import Hls from 'hls.js'
import Clipboard from 'clipboard'


import PLAYER_TYPE from './js/player-type'
import PLAY_STATUS from './js/player-status'
import Icons from './js/icons'
import Logger from './js/logger'
import options from './js/options'
import template from './js/template'
import Menu from './js/context-menu'
import InfoPanel from './js/info-panel'
import Controller from './js/controller'
import FullScreen from "./js/fullscreen";
import Notice from "./js/notice";
import { formatTime, seekToSecondsText } from "./js/utils";
import Events from "./js/events";


let index = 0;
const logger = Logger.getLogger()

class MPlayer {

    /**
     *  player constructor func
     *
     * @param option
     */
    constructor (option) {

        this.index = index
        this.options = {}
        this.options = options(option)

        logger.setType(this.options.loggerType)
        logger.debug('Player initialize.')

        this.nowPlayer = `mplayer-index${this.index}`

        this.element = this.options.element
        this.element.classList.add('player-wrap')
        this.element.classList.add(this.nowPlayer)
        this.element.innerHTML = template.build(this.index, this.options)
        this.videoBox = this.element.getElementsByClassName('video-box')[0]

        this.video = this.element.getElementsByClassName('mplayer-video')[0]
        if (this.options.video.poster) {
            this.video.poster = this.options.video.poster
        }
        this.source2 = null
        this.nextPlayButtonEle = this.element.querySelector('.button-next')

        // button-next

        this.muted = false

        this.events = new Events();

        this.infoPanel = new InfoPanel(this);

        /*
        this.media = {};
        this.media.url = option.video.src
        this.media.poster = option.video.poster
        */
        if (this.options.video.src) {
            this.init(this.video, this.options.type, this.options.video.src)
        }

        this.notice = new Notice(this)

        this.fullScreen = new FullScreen(this)
        this.controller = new Controller(this)

        let that = this

        this.menu = new Menu({
            player: this,
            menus: [
                {
                    name: '复制视频网址',
                    class: 'copy-el1',
                    func: function () {

                    }
                },
                {
                    name: '循环播放',
                    func: function () {
                        that.controller._loop()
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
                    func: function () {
                        that.infoPanel.open()
                    }
                }
            ]
        })

        // 复制
        let clipboard = new Clipboard('.copy-el1', {
            text: () => { return window.location.href }
        });

        clipboard.on('success', (e) => {
            that.notice.showAutoHide('复制成功')
        })

        clipboard.on('error', (e) => {
            logger.error(e)
        })

        this.setVolume(this.options.volume)


        logger.debug('Player inited.')

        index++;
    }

    /**
     * @private init player
     *
     * @param element
     * @param type
     * @param source
     */
    init (element, type, source) {
        const that = this;
        this.options.type = this.type = type;
        const el = element
        if (!this.type || this.type === 'auto') {
            if (/.mpd(#|\?|\$)/i.exec(source)) {
                this.type = PLAYER_TYPE.NativeDash;
            } else if (/.flv(#|\?|\$)/i.exec(source)) {
                this.type = PLAYER_TYPE.NativeFlv;
            } else if (/.m3u8(#|\?|\$)/i.exec(source)) {
                this.type = PLAYER_TYPE.NativeHls;
            } else {
                this.type = PLAYER_TYPE.HtmlMediaElement;
            }
        }

        logger.debug(`Player Mode: ${this.type}, Element: .${this.nowPlayer}, Source: ${source}`)

        switch (this.type) {
            case PLAYER_TYPE.NativeDash:
                if (dashjs && MediaPlayer) {
                    MediaPlayer().create().initialize(element, source, false);
                }
                break;
            case PLAYER_TYPE.NativeFlv:
                if (flv && flv.isSupported()) {
                    var player = flv.createPlayer({
                        type: 'flv',
                        url: source
                    });
                    player.attachMediaElement(element);
                    player.load();
                }
                break;
            case PLAYER_TYPE.NativeHls:
                if (Hls.isSupported()) {
                    var hls = new Hls();
                    hls.loadSource(source);
                    hls.attachMedia(element);
                    const p2pEngine = hls.p2pEngine;
                    logger.debug('p2pEngine', p2pEngine)
                    that.stats = {};
                    that.stats.droppedFrames = 0
                    that.stats.totalFrames = 0
                    let events = {
                        url    : source,
                        t0     : performance.now(),
                        load   : [],
                        buffer : [],
                        video  : [],
                        level  : [],
                        bitrate: []
                    };

                    if (p2pEngine !== null && p2pEngine !== undefined) {
                        logger.debug('p2pEngine loaded')
                        p2pEngine.on('stats', function (stat) {
                            that.stats.p2pSupport = true
                            console.log(`p2pEngine.on('state')`, stat)
                            // stats.totalHTTPDownloaded: 从HTTP(CDN)下载的数据量（单位KB）
                            // stats.totalP2PDownloaded: 从P2P下载的数据量（单位KB）
                            // stats.totalP2PUploaded: P2P上传的数据量（单位KB）
                            that.stats.totalHTTPDownloaded = stat.totalHTTPDownloaded;
                            that.stats.totalP2PDownloaded = stat.totalP2PDownloaded;
                            that.stats.totalP2PUploaded = stat.totalP2PUploaded;
                        })
                    }

                    hls.on(Hls.Events.MANIFEST_PARSED, function(event, data) {
                        that.stats = {
                            levelNb    : data.levels.length,
                            levelParsed: 0
                        };
                    });
                    //  fired when we know about the codecs that we need buffers for to push into
                    hls.on(Hls.Events.BUFFER_CODECS, function (event, data) {
                        that.stats.codec = data && data.video && data.video.container + ';codecs="' + data.video.codec + '"'
                    });
                    hls.on(Hls.Events.LEVEL_LOADED, function(event, data) {
                        // 把播放时间重置为 0
                        element.currentTime = 0
                        that.events.trigger(PLAY_STATUS.LOADED)
                        var event = {
                            type    : 'level',
                            id      : data.level,
                            start   : data.details.startSN,
                            end     : data.details.endSN,
                            time    : data.stats.trequest - events.t0,
                            latency : data.stats.tfirst - data.stats.trequest,
                            load    : data.stats.tload - data.stats.tfirst,
                            parsing : data.stats.tparsed - data.stats.tload,
                            duration: data.stats.tload - data.stats.tfirst
                        };
                        const parsingDuration = data.stats.tparsed - data.stats.tload;
                        if (that.stats.levelParsed)
                        {that.sumLevelParsingMs += parsingDuration;}
                        else
                        {that.sumLevelParsingMs = parsingDuration;}

                        that.stats.levelParsed++;
                        that.stats.levelParsingUs = Math.round(1000*that.sumLevelParsingMs / that.stats.levelParsed);
                        events.load.push(event);
                    });

                    hls.on(Hls.Events.FRAG_BUFFERED, function(event, data) {
                        var event = {
                            type: data.frag.type + ' fragment',
                            id: data.frag.level,
                            id2: data.frag.sn,
                            time: data.stats.trequest - events.t0,
                            latency: data.stats.tfirst - data.stats.trequest,
                            load: data.stats.tload - data.stats.tfirst,
                            parsing: data.stats.tparsed - data.stats.tload,
                            buffer: data.stats.tbuffered - data.stats.tparsed,
                            duration: data.stats.tbuffered - data.stats.tfirst,
                            bw: Math.round(8 * data.stats.total / (data.stats.tbuffered - data.stats.trequest)),
                            size: data.stats.total
                        };
                        events.load.push(event);
                        events.bitrate.push({
                            time: performance.now() - events.t0,
                            bitrate: event.bw,
                            duration: data.frag.duration,
                            level: event.id
                        });

                        if (hls.bufferTimer === undefined) {
                            events.buffer.push({
                                time: 0,
                                buffer: 0,
                                pos: 0
                            });
                            // hls.bufferTimer = window.setInterval(checkBuffer, 100);
                        }
                        let latency = data.stats.tfirst - data.stats.trequest,
                            parsing = data.stats.tparsed - data.stats.tload,
                            process = data.stats.tbuffered - data.stats.trequest,
                            bitrate = Math.round(8 * data.stats.total / (data.stats.tbuffered - data.stats.tfirst));

                        if (that.stats.fragBuffered) {
                            that.stats.fragMinLatency = Math.min(that.stats.fragMinLatency, latency);
                            that.stats.fragMaxLatency = Math.max(that.stats.fragMaxLatency, latency);
                            that.stats.fragMinProcess = Math.min(that.stats.fragMinProcess, process);
                            that.stats.fragMaxProcess = Math.max(that.stats.fragMaxProcess, process);
                            that.stats.fragMinKbps = Math.min(that.stats.fragMinKbps, bitrate);
                            that.stats.fragMaxKbps = Math.max(that.stats.fragMaxKbps, bitrate);
                            that.stats.autoLevelCappingMin = Math.min(that.stats.autoLevelCappingMin, hls.autoLevelCapping);
                            that.stats.autoLevelCappingMax = Math.max(that.stats.autoLevelCappingMax, hls.autoLevelCapping);
                            that.stats.fragBuffered++;
                        } else {
                            that.stats.fragMinLatency = that.stats.fragMaxLatency = latency;
                            that.stats.fragMinProcess = that.stats.fragMaxProcess = process;
                            that.stats.fragMinKbps = that.stats.fragMaxKbps = bitrate;
                            that.stats.fragBuffered = 1;
                            that.stats.fragBufferedBytes = 0;
                            that.stats.autoLevelCappingMin = that.stats.autoLevelCappingMax = hls.autoLevelCapping;
                            that.sumLatency = 0;
                            that.sumKbps = 0;
                            that.sumProcess = 0;
                            that.sumParsing = 0;
                        }
                        that.stats.fraglastLatency = latency;
                        that.sumLatency += latency;
                        that.stats.fragAvgLatency = Math.round(that.sumLatency / that.stats.fragBuffered);
                        that.stats.fragLastProcess = process;
                        that.sumProcess += process;
                        that.sumParsing += parsing;
                        that.stats.fragAvgProcess = Math.round(that.sumProcess / that.stats.fragBuffered);
                        that.stats.fragLastKbps = bitrate;
                        that.sumKbps += bitrate;
                        that.stats.fragAvgKbps = Math.round(that.sumKbps / that.stats.fragBuffered);
                        that.stats.fragBufferedBytes += data.stats.total;
                        that.stats.fragparsingKbps = Math.round(8*that.stats.fragBufferedBytes / that.sumParsing);
                        that.stats.fragparsingMs = Math.round(that.sumParsing);
                        that.stats.autoLevelCappingLast = hls.autoLevelCapping;

                        // console.log(stats);
                        // this.infoPanel
                    });

                    hls.on(Hls.Events.FRAG_LOADING, (event, data) => {
                        that.infoPanel.trigger(that.stats);
                    });

                    hls.on(Hls.Events.FRAG_LOAD_PROGRESS, function (event, data) {

                        const quality = typeof el.getVideoPlaybackQuality === (Function) && el.getVideoPlaybackQuality || undefined;

                        if(quality && quality.droppedVideoFrames && quality.totalVideoFrames) {
                            that.stats.droppedFrames = quality.droppedVideoFrames
                            that.stats.totalFrames = quality.totalVideoFrames
                        } else if(el.webkitDroppedFrameCount) {
                            that.stats.droppedFrames = el.webkitDroppedFrameCount
                            that.stats.totalFrames = 0
                        } else {
                            that.stats.droppedFrames = 0
                            that.stats.totalFrames = 0
                        }
                    });
                }
                break;
            case PLAYER_TYPE.HtmlMediaElement:
            default:
                element.src = source;
               break;
        }

        this.video.currentTime = 0
    }

    /**
     * 播放
     */
    play () {
        if (this.options.video.src === '') {
            this.pause()
            console.log('播放器未初始化视频源，请调用方法 switchSource(src) 或在初始化播放器时，传入视频源地址')
            return;
        }
        this.controller.button.play.innerHTML = Icons.pause
        this.showStats(Icons.play)
        this.video.play()
        this.controller.listener()
        this.events.trigger(PLAY_STATUS.PLAY)

        // info panel load speed auto refresh
        this.panelUpdated = setInterval(() => {
            this.infoPanel.trigger()
        }, 1000)
    }

    /**
     * 暂停
     */
    pause () {
        this.controller.button.play.innerHTML = Icons.play
        this.showStats(Icons.pause)
        this.video.pause()
        this.controller.removeListener()
        this.events.trigger(PLAY_STATUS.PAUSE)

        clearInterval(this.panelUpdated)
    }

    /**
     * 停止
     */
    stop () {
        this.controller.button.play.innerHTML = Icons.play
        this.video.pause()
        this.controller.removeListener()
        this.controller.resetLoadBar()
        this.controller.status = PLAY_STATUS.STOP

        this.events.trigger(PLAY_STATUS.STOP)

        // this.seek(0)
        clearInterval(this.panelUpdated)
    }

    /**
     * 跳转到指定播放时间
     */
    seek (time) {
        if (time === undefined || isNaN(time)) return this.video.currentTime
        logger.debug(`Seek to ${Math.max(time, 0)}`)
        let text = seekToSecondsText(this.video.currentTime, time)
        logger.debug(text)
        this.notice.showAutoHide(text)
        this.video.currentTime = time

        this.events.trigger('seek', time)

        return this
    }

    /**
     * 触发 播放/暂停
     */
    toggle () {

    }

    /**
     * 声音调整
     */
    setVolume (volume) {
        this.volume = volume;
        this.controller.setVolume(this.volume)
        this.infoPanel.setVolumeText(volume);
        this.events.trigger('volume', volume);
    }

    /**
     * 切换视频源
     */
    switchSource (newSrc, nextSrc) {
        this.notice.showAutoHide('正在切换视频源')
        this.init(this.video, this.options.type, newSrc)
        this.events.trigger('switchSource', { type: this.options.type, src: this.options.video.src })
        this.options.video.src = newSrc
        // this.setNextVideo(nextSrc)
    }

    /**
     * 播放速度
     * @param value
     */
    playbackRate (value) {
        this.video.playbackRate = value
        this.controller.settings.playSpeed.querySelector('.text').innerText = value == 1 ? '正常' : value
        this.events.trigger('playbackRate', value);
        logger.info(`setting playback rate ${value}`)
    }

    /**
     * 播放器全屏
     * type: web | screen
     */
    screenFull (type) {
        if (type === 'screen') {
            this.fullScreen.screenFull()
        } else {
            this.fullScreen.webFull()
        }
    }

    showStats (type) {
        this.notice.showStats(type)
    }

    on(name, callback) {
        this.events.on(name, callback, this)
    }

    off(name, callback) {
        this.events.off(name, callback, this)
    }

    trigger(name) {
        this.events.trigger(name)
    }

    next() {
        if (this.source2 !== null) {
            this.switchSource(this.source2)
        }
    }

    /**
     * 设置下一集，如果被调用。
     * 则会在播放按钮旁边显示一个 next 按钮
     * @param source
     */
    setNextVideo(source) {
        if (source !== null && source !== undefined) {
            this.source2 = source
            this.nextPlayButtonEle.removeClass('hidden')
        } else {
            this.source2 = null
            this.nextPlayButtonEle.addClass('hidden')
        }
    }

    setVideoInfo(videoId, videoSourceCdn) {
        this.infoPanel.setVideoId(videoId);
        this.infoPanel.setSourceHost(videoSourceCdn);
    }

    /**
     * 销毁播放器
     */
    destroy () {
        this.events.trigger('destroy')
        this.controller.destroy()
        this.notice.destroy()
        clearInterval(this.panelUpdated)
        this.infoPanel = null;
        this.fullScreen = null;
        this.notice = null;
        this.menu = null
        this.element.classList = '';
        this.element.innerHTML = '';
        this.events.destroy();
        logger.debug('player destroy')
    }

}

export default MPlayer;
