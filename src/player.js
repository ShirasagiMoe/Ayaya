import './styles/demo.scss'
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


let index = 0;

class MPlayer {

    /**
     *  player constructor func
     *
     * @param option
     */
    constructor (option) {

        var that = this
        this.index = index

        logger.setType(0)
        logger.debug('Player initialize.')

        this.options = {}
        this.options = options(option)
        
        this.element = this.options.element
        this.element.classList.add('player-wrap')
        this.element.innerHTML = template.build(this.index, this.options)

        this.nowPlayer = `mplayer-index${this.index}`
        
        this.video = this.element.getElementsByClassName(this.nowPlayer)[0]
        this.video.poster = this.options.video.poster
        this.muted = false

        this.infoPanel = new InfoPanel({element: this.element});

        this.menu = new Menu({
            element: this.video,
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
        this.type = type;
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

                    let stats = {};
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
                        stats = {
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
                        if (stats.levelParsed)
                        {this.sumLevelParsingMs += parsingDuration;}
                        else
                        {this.sumLevelParsingMs = parsingDuration;}

                        stats.levelParsed++;
                        stats.levelParsingUs = Math.round(1000*this.sumLevelParsingMs / stats.levelParsed);
                        events.load.push(event);
                    });

                    hls.on(Hls.Events.FRAG_BUFFERED, function(event, data) {
                        let latency = data.stats.tfirst - data.stats.trequest,
                            parsing = data.stats.tparsed - data.stats.tload,
                            process = data.stats.tbuffered - data.stats.trequest,
                            bitrate = Math.round(8 * data.stats.length / (data.stats.tbuffered - data.stats.tfirst));
                        if (stats.fragBuffered) {
                            stats.fragMinLatency = Math.min(stats.fragMinLatency, latency);
                            stats.fragMaxLatency = Math.max(stats.fragMaxLatency, latency);
                            stats.fragMinProcess = Math.min(stats.fragMinProcess, process);
                            stats.fragMaxProcess = Math.max(stats.fragMaxProcess, process);
                            stats.fragMinKbps = Math.min(stats.fragMinKbps, bitrate);
                            stats.fragMaxKbps = Math.max(stats.fragMaxKbps, bitrate);
                            stats.autoLevelCappingMin = Math.min(stats.autoLevelCappingMin, hls.autoLevelCapping);
                            stats.autoLevelCappingMax = Math.max(stats.autoLevelCappingMax, hls.autoLevelCapping);
                            stats.fragBuffered++;
                        } else {
                            stats.fragMinLatency = stats.fragMaxLatency = latency;
                            stats.fragMinProcess = stats.fragMaxProcess = process;
                            stats.fragMinKbps = stats.fragMaxKbps = bitrate;
                            stats.fragBuffered = 1;
                            stats.fragBufferedBytes = 0;
                            stats.autoLevelCappingMin = stats.autoLevelCappingMax = hls.autoLevelCapping;
                            this.sumLatency = 0;
                            this.sumKbps = 0;
                            this.sumProcess = 0;
                            this.sumParsing = 0;
                        }
                        stats.fraglastLatency = latency;
                        this.sumLatency += latency;
                        stats.fragAvgLatency = Math.round(this.sumLatency / stats.fragBuffered);
                        stats.fragLastProcess = process;
                        this.sumProcess += process;
                        this.sumParsing += parsing;
                        stats.fragAvgProcess = Math.round(this.sumProcess / stats.fragBuffered);
                        stats.fragLastKbps = bitrate;
                        this.sumKbps += bitrate;
                        stats.fragAvgKbps = Math.round(this.sumKbps / stats.fragBuffered);
                        stats.fragBufferedBytes += data.stats.total;
                        stats.fragparsingKbps = Math.round(8*stats.fragBufferedBytes / this.sumParsing);
                        stats.fragparsingMs = Math.round(this.sumParsing);
                        stats.autoLevelCappingLast = hls.autoLevelCapping;

                        // console.log(stats);
                        // this.infoPanel
                    });


                    hls.on(Hls.Events.FRAG_LOAD_PROGRESS, function (event, data) {

                        const quality = element.getVideoPlaybackQuality;
                        if(quality && typeof (quality) === typeof (Function)) {
                            stats.droppedFrames = quality().droppedVideoFrames
                            stats.totalFrames = quality().totalVideoFrames
                        } else if(element.webkitDroppedFrameCount) {
                            stats.droppedFrames = element.webkitDroppedFrameCount
                            stats.totalFrames = 0
                        } else {
                            stats.droppedFrames = 0
                            stats.totalFrames = 0
                        }

                        that.infoPanel.trigger(stats);
                    });

                    this.hls = hls;
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
    }

    /**
     * 暂停
     */
    pause () {
        this.controller.button.play.innerHTML = Icons.play
        this.video.pause()
    }

    /**
     * 跳转到指定播放时间
     */
    seek (time) {
        if (time === undefined) return this.video.currentTime;
        logger.debug(`Seek to ${Math.max(time, 0)}`)
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
     * 弹出消息
     */
    notice () {

    }

    /**
     * 播放器全屏
     * type: web | screen
     */
    fullScreen (type) {

    }

    /**
     * 销毁播放器
     */
    destroy () {

    }

}

export default MPlayer;
