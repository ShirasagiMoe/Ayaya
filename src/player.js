// import './styles/demo.scss'
import './styles/player.scss'

// import { MediaPlayer } from 'dashjs'
import Hls from 'hls.js'
// import flv from 'flv.js'

import PLAYER_TYPE from './js/player-type'
import Icons from './js/icons'
import logger from './js/logger'
import options from './js/options'
import template from './js/template'
import Menu from './js/context-menu'
import InfoPanel from './js/info-panel'
import Controller from './js/controller'
import FullScreen from "./js/fullscreen";
import Notice from "./js/notice";
import { formatTime, seekToSecondsText } from "./js/utils";


let index = 0;

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

        this.video = this.element.getElementsByClassName('mplayer-video')[0]
        this.video.poster = this.options.video.poster
        this.muted = false

        this.infoPanel = new InfoPanel(this);

        let that = this

        this.menu = new Menu({
            player: this,
            menus: [
                {
                    name: '复制视频网址',
                    func: function () {}
                },
                {
                    name: '复制嵌入代码',
                    func: function () {}
                },
                {
                    name: '循环播放',
                    func: function () {}
                },
                {
                    name: '无法播放反馈',
                    func: function () {}
                },
                {
                    name: '详细统计信息',
                    func: function () {
                        that.infoPanel.open()
                    }
                }
            ]
        })

        this.media = {};
        this.media.url = option.video.src
        this.media.poster = option.video.poster

        this.init(this.video, this.options.type, this.media.url)

        this.controller = new Controller(this)
        this.fullScreen = new FullScreen(this)
        this.notice = new Notice(this)
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
        var that = this;
        this.options.type = this.type = type;
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

                    that.stats = {};
                    let events = {
                        url    : source,
                        t0     : performance.now(),
                        load   : [],
                        buffer : [],
                        video  : [],
                        level  : [],
                        bitrate: []
                    };

                    hls.on(Hls.Events.MANIFEST_PARSED, function(event, data) {
                        that.stats = {
                            levelNb    : data.levels.length,
                            levelParsed: 0
                        };
                    });
                    hls.on(Hls.Events.LEVEL_LOADED, function(event, data) {
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
                        let latency = data.stats.tfirst - data.stats.trequest,
                            parsing = data.stats.tparsed - data.stats.tload,
                            process = data.stats.tbuffered - data.stats.trequest,
                            bitrate = Math.round(8 * data.stats.length / (data.stats.tbuffered - data.stats.tfirst));
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

                        const quality = element.getVideoPlaybackQuality;
                        if(quality && typeof (quality) === typeof (Function)) {
                            that.stats.droppedFrames = quality().droppedVideoFrames
                            that.stats.totalFrames = quality().totalVideoFrames
                        } else if(element.webkitDroppedFrameCount) {
                            that.stats.droppedFrames = element.webkitDroppedFrameCount
                            that.stats.totalFrames = 0
                        } else {
                            that.stats.droppedFrames = 0
                            that.stats.totalFrames = 0
                        }

                        that.infoPanel.trigger(that.stats);
                    });
                }
                break;
            case PLAYER_TYPE.HtmlMediaElement:
            default:
               break;
        }
    }

    /**
     * 播放
     */
    play () {
        this.controller.button.play.innerHTML = Icons.pause
        this.video.play()

        this.panelUpdated = setInterval(() => {
            this.infoPanel.trigger()
        }, 3000)
    }

    /**
     * 暂停
     */
    pause () {
        this.controller.button.play.innerHTML = Icons.play
        this.video.pause()

        clearInterval(this.panelUpdated)
    }

    /**
     * 停止
     */
    stop () {
        this.controller.button.play.innerHTML = Icons.play
        this.video.pause()
        // this.seek(0)
    }

    /**
     * 跳转到指定播放时间
     */
    seek (time) {
        if (time === undefined || isNaN(time)) return this.video.currentTime
        logger.debug(`Seek to ${Math.max(time, 0)}`)
        let text = seekToSecondsText(this.video.currentTime, time)
        this.notice.showAutoHide(text)
        this.video.currentTime = time
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
    }

    /**
     * 切换视频源
     */
    switchSource () {

    }

    /**
     * 播放速度
     * @param value
     */
    playbackRate (value) {
        this.video.playbackRate = value
        this.controller.settings.playSpeed.querySelector('.text').innerText = value + ' 倍'
        logger.info(`setting playback rate ${value}`)
    }

    /**
     * 播放器全屏
     * type: web | screen
     */
    screenFull (type) {

    }

    /**
     * 销毁播放器
     */
    destroy () {

    }

}

export default MPlayer;
