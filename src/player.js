import './styles/player.scss'

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
        this.options.totalSegments = 20;
        this.options.segmentLength = 0;
        this.options.segmentDuration = 0;
        this.options.bytesFetched = 0;
        this.options.requestedSegments = [];

        this.status = document.querySelector('.btn-buffer-check');

        this.video = options.el;

        this.media = {};
        this.media.url = options.video.src;
        this.media.poster = options.video.poster;
        this.media.mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
        this.media.source = null;
        this.media.buffer = null;
        this.media.bufferQueue = null;


        this.loading = false;

        for (let i = 0; i < this.options.totalSegments; ++i) {
            this.options.requestedSegments[i] = false;
        }

        if ('MediaSource' in window && MediaSource.isTypeSupported(this.media.mimeCodec)) {
            this.media.source = new MediaSource();
            this.video.src = URL.createObjectURL(this.media.source);
            // URL.revokeObjectURL(this.video.src)
            logger('DEBUG', 'Media Source: ', this.video.src);
            this.media.source.addEventListener('sourceopen', this.sourceOpen.bind(this));
        } else {
            logger('ERROR', 'Unsupported MIME type or codec: ', this.media.mimeCodec);
            return null;
        }

        this.btnsListener();

        logger('DEBUG', 'inited');
        index++;
    }

    btnsListener () {
        var btn2x = document.querySelector('.btn-2x-speed');
        var btn1x = document.querySelector('.btn-2x-speed');
        var btnSeek = document.querySelector('.btn-Seek');

        var that = this;
        btn2x.addEventListener('click', (that) => {
            that.video.playbackRate = 2;
        });
        btn1x.addEventListener('click', (that) => {
            that.video.playbackRate = 1;
        });
        btnSeek.addEventListener('click', (that) => {
            var value = document.getElementById('seek').value;
            if (value != null && value > 0) {
                // this.video.currentTime = value;
                logger('ERROR', '暂不可用');
            }
        })
    }

    sourceOpen () {
        logger('DEBUG', 'source open.');
        this.media.buffer = this.media.source.addSourceBuffer(this.media.mimeCodec);

        this.getMediaLength(this.media.url).then(res => {
            let len = res.headers.get('Content-Length');

            logger('DEBUG', 'Media size:', len);

            this.options.segmentLength = Math.round(len / this.options.totalSegments);

            logger('DEBUG', 'Media block length:', this.options.segmentLength);

            this.fetchRange(this.media.url, 0, this.options.segmentLength, this.appendBuffer.bind(this));
            this.options.requestedSegments[0] = true;
            this.video.addEventListener('timeupdate', this.checkBuffer.bind(this));
            this.video.addEventListener('canplay', () => {
                this.video.play();
            });
        });

    }

    getMediaLength (url) {
        return fetch(url, {
            method: 'HEAD'
        });
    }

    fetchRange (url, start, end, callback) {
        return fetch(url, {
            method: 'GET',
            headers: {
                range: 'bytes=' + start + '-' + end
            }
        })
        .then(response => response.arrayBuffer())
        .then(res => {
            this.options.bytesFetched += end - start + 1;
            logger('DEBUG', 'fetched bytes:', start, '-', end);
            this.loading = false;
            callback(res);
        });
    }

    appendBuffer (chunk) {
        logger('DEBUG', 'Buffer append');
        // if buffer appending , chunk append to queue
        let buffer = new Uint8Array(chunk);
        if (this.media.buffer.updating) {
            // this.media.bufferQueue.push(buffer);
        }

        this.media.buffer.appendBuffer(buffer);
        this.status.innerHTML = 'Buffer appended';
        console.info(this.media.source);
    }

    checkBuffer () {
        // logger('DEBUG', 'Checking buffer');
        this.status.innerHTML = 'Checking buffer';

        let percentage = this.video.buffered.length ? this.video.buffered.end(this.video.buffered.length - 1) / this.video.duration : 0;
        let loadTime = percentage * this.video.duration;
        let playedTime = this.video.currentTime + 20;
        logger('DEBUG', 'percentage:', (percentage * 100).toFixed(2) + "%", 'loadTime:', loadTime, 'playedTime:', playedTime);

        if (playedTime >= loadTime && !this.loading) {
            this.loading = true;
            this.fetchRange(this.media.url, this.options.bytesFetched, this.options.bytesFetched + this.options.segmentLength, this.appendBuffer.bind(this));
        }
    }




}

export default MPlayer;