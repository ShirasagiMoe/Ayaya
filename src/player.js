import './styles/player.scss'

import { MediaPlayer } from 'dashjs'
import PLAYER_TYPE from './js/player-type'


import 'whatwg-fetch'
import logger from './js/logger'


let index = 0;

class MPlayer {

    /**
     *  player constructor func
     *
     * @param options
     */
    constructor (options) {
        logger('DEBUG', 'init');
        this.options = {};
        this.type = options.type;

        this.video = options.element;

        this.media = {};
        this.media.url = options.video.src;
        this.media.poster = options.video.poster;

        this.init(this.video, PLAYER_TYPE.NativeDash, this.media.url);

        logger('DEBUG', 'inited');
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

        logger('DEBUG', 'create player:', this.type, ' el:', element.id);

        switch (this.type) {
            case PLAYER_TYPE.NativeDash:
                MediaPlayer().create().initialize(element, source, false);
                break;
            case PLAYER_TYPE.NativeFlv:

                break;
            case PLAYER_TYPE.NativeHls:

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
        this.video.play();
    }

    /**
     * 暂停
     */
    pause () {
        this.video.pause();
    }

    /**
     * 跳转到指定播放时间
     */
    seek (time) {
        this.video.currentTime = Math.max(time, 0);
    }

    /**
     * 触发 播放/暂停
     */
    toggle () {

    }

    /**
     * 声音调整
     */
    volume (volume) {
        this.video.volume = (volume/100).toFixed(2);
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
        this.video.playbackRate = value;
        logger('DEBUG', 'setting playback rate:', value);
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