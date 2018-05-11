import util from './utils'
import logger from './logger'
import Icons from './icons'

const PLAY_STATUS = {
    PLAY: 'play',
    PAUSE: 'pause',
    STOP: 'stop',
    LOADING: 'loading',
    LOADED: 'loaded',
    ERROR: 'error',
}

class Controller {

    constructor (option) {
        this.player = option
        this.element = option.element
        this.video = option.video

        this.autoHideBar = 0

        this.status = PLAY_STATUS.LOADING

        this.events = [];

        this.initButton();
        this.initLoadBar();
        this.initPlayTimer();
        this.initVolumeBar();

        this.eventFunc = () => {

            for (let i = 0; i < this.events.length; i++) {
                this.events[i]()
            }
        }

    }


    initButton () {
        this.button = {}
        this.button.play = this.element.querySelector('.button-play')
        this.button.volume = this.element.querySelector('.button-volume')
        this.button.fullScreen = this.element.querySelector('.button-full-screen')

        const play = () => {
            logger.info(`Play Status: ${this.status}`)
            if (this.status === PLAY_STATUS.PLAY) {
                this.player.pause()
                this.status = PLAY_STATUS.PAUSE
                this.video.removeEventListener('timeupdate', this.eventFunc);
            } else {
                this.video.addEventListener('timeupdate', this.eventFunc);
                this.status = PLAY_STATUS.PLAY
                this.player.play()
            }
        };

        this.button.play.addEventListener('click', () => play())
        this.button.volume.addEventListener('click', () => {
            if (this.video.muted) {
                this.setVolume(this.video.volume * 100)
            } else {
                this.setVolume(0)
            }
        })

    }

    initLoadBar () {
        this.bar = {}
        this.bar.load = this.element.querySelector('.player-wrap .control-bar') // .load-bar
        this.bar.loaded = this.bar.load.querySelector(".load-bar .loaded")
        this.bar.played = this.bar.load.querySelector(".load-bar .played")
        this.bar.hover = this.bar.load.querySelector('.hover')
        this.bar.timerLabel = this.bar.load.querySelector('.seek-timer-label')

        const stopDrag = (e) => {
            this.element.removeEventListener('mousemove', proceedDrag);
            this.element.removeEventListener('mouseup', stopDrag);
        };

        const startDrag = (e) => {
            this.element.addEventListener('mousemove', proceedDrag);
            this.element.addEventListener('mouseup', stopDrag);
            e.preventDefault();
            // e.stopPropagation();
            return false;
        };

        const proceedDrag = (e) => {
            if (!this.video.duration || this.video.duration <= 0) return;

            let percentage = (e.clientX - this.bar.load.getBoundingClientRect().left) / this.bar.load.offsetWidth;
            percentage = percentage > 0 ? percentage : 0;
            percentage = percentage < 1 ? percentage : 1;
            this.bar.played.style.width = `${(percentage * 100).toFixed(2)}%`;
            this.player.seek(percentage * this.video.duration);
        };

        this.bar.played.addEventListener('mousedown', startDrag);
        this.bar.load.addEventListener('mousedown', (e) => {
            let offsetX = e.offsetX;
            let target = e.target;
            while (target !== this.bar.load) {
                offsetX += target.offsetLeft;
                target = target.parentNode;
            }
            let value = offsetX / this.bar.load.offsetWidth;
            value = value > 0 ? value : 0;
            value = value < 1 ? value : 1;
            this.bar.played.style.width = `${(value * 100).toFixed(2)}%`;
            this.player.seek(parseFloat(value) * this.video.duration);
            e.preventDefault()
            // e.stopPropagation()
            return false
        });
        this.bar.load.addEventListener('mousemove', (e) => {
            if (!this.video.duration || this.video.duration <= 0) return;
            let percentage = (e.clientX - this.bar.load.getBoundingClientRect().left) / this.bar.load.offsetWidth;
            percentage = percentage > 0 ? percentage : 0;
            percentage = percentage < 1 ? percentage : 1;
            let timer = util.formatTime(parseFloat(percentage) * this.video.duration);

            this.bar.timerLabel.style.left = `${(percentage * 100) }%`;
            this.bar.timerLabel.innerText = timer;
            this.bar.hover.style.width = `${(percentage * 100) }%`;
        });

        this.updateLoadBar = () => {
            let percent = this.video.currentTime / this.video.duration
            let percentage = this.video.buffered.length ? this.video.buffered.end(this.video.buffered.length - 1) / this.video.duration : 0
            let playedWidth = (percent * 100).toFixed(2) + "%"
            let percentageWidth = (percentage * 100).toFixed(2) + "%"

            this.bar.loaded.style.width = percentageWidth
            this.bar.played.style.width = playedWidth
        };

        this.events.push(this.updateLoadBar)
    }

    initVolumeBar () {
        this.volumeBar = {}
        this.volumeBar.bar = this.element.querySelector('.volume-bar')
        this.volumeBar.inner = this.element.querySelector('.volume-bar-inner')
        this.volumeBar.min = this.volumeBar.bar.offsetLeft
        this.volumeBar.max = this.volumeBar.min + this.volumeBar.offsetWidth

        this.setVolume = (val) => {

            val = val > 100 ? 100 : val
            val = val < 0 ? 0 : val

            val = parseInt(val)

            logger.debug('Volume change to ' + val)

            if (parseInt(val) === 0) {
                this.video.muted = true
                this.button.volume.innerHTML = Icons.mute
                this.volumeBar.inner.style.width = '0%'
            } else {
                this.video.muted = false
                this.video.volume = (val / 100).toFixed(2)

                this.volumeBar.inner.style.width = `${val}%`

                if (val > 0 && val < 30) {
                    this.button.volume.innerHTML = Icons.volume1
                } else if (val <= 60) {
                    this.button.volume.innerHTML = Icons.volume2
                } else if (val >= 60) {
                    this.button.volume.innerHTML = Icons.volume3
                }
            }

        };

        const handler = (event) => {
            let progressBarLeft = this.volumeBar.bar.getBoundingClientRect().left
            let val = ((event.clientX - progressBarLeft) / this.volumeBar.bar.offsetWidth) * 100
            // val = val > 100 ? 100 : val
            // val = val < 0 ? 0 : val

            this.setVolume(val)
        };

        const startDragAndDrop = (event) => {
            handler(event)
            this.element.addEventListener('mousemove', proceedDragAndDrop)
            this.element.addEventListener('mouseup', stopDragAndDrop)
            event.preventDefault()
            event.stopPropagation()
            return false
        };

        const proceedDragAndDrop = (event) => {
            handler(event)
        };

        const stopDragAndDrop = (event) => {
            this.element.removeEventListener('mousemove', proceedDragAndDrop)
            this.element.removeEventListener('mouseup', stopDragAndDrop)
        };

        this.volumeBar.inner.addEventListener('mousedown', startDragAndDrop)
        this.volumeBar.bar.addEventListener('mousedown', (e) => {
            handler(e)
        })
    }

    initPlayTimer () {
        this.timer = {}
        this.timer.current = this.element.querySelector('.play-time .play-current')
        this.timer.duration = this.element.querySelector('.play-time .play-duration')

        this.updateTimer = () => {
            this.timer.current.innerText = util.formatTime(this.video.currentTime)
        }
        this.events.push(this.updateTimer)
    }

}

export default Controller;