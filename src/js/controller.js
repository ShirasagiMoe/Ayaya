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

        this.autoHideControls = 0

        this.status = PLAY_STATUS.LOADING
        this.speed = 1
        this.mirror = false
        this.hotkey = false

        this.events = [];

        this.initButton();
        this.initLoadBar();
        this.initPlayTimer();
        this.initVolumeBar();
        this.initSettingGroup();
        this.initWatingWarp();

        this.eventFunc = () => {

            for (let i = 0; i < this.events.length; i++) {
                this.events[i]()
            }
        }

        this.element.addEventListener('mousemove', () => {
            this.autoHide()
        })

    }

    initButton () {
        this.button = {}
        this.button.play = this.element.querySelector('.button-play')
        this.button.volume = this.element.querySelector('.button-volume')
        this.button.fullScreen = this.element.querySelector('.button-full-screen')
        this.button.setting = this.element.querySelector('.button-settings-checkbox')

        this.play = () => {
            logger.info(`Play Status: ${this.status}`)
            if (this.status === PLAY_STATUS.PLAY) {
                this.player.pause()
                this.status = PLAY_STATUS.PAUSE
                this.video.removeEventListener('timeupdate', this.eventFunc);
            } else {
                this.video.addEventListener('timeupdate', this.eventFunc);
                this.status = PLAY_STATUS.PLAY
                this.player.play()
                this.autoHide()
            }
        };

        this.button.play.addEventListener('click', () => this.play())
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
            this.player.infoPanel.setVolumeText(val);
        };

        this.getVolume = () => {
            return this.video.volume
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

        // this.timer.duration.innerText = util.formatTime(this.video.duration)

        this.updateTimer = () => {
            this.timer.current.innerText = util.formatTime(this.video.currentTime)
            this.timer.duration.innerText = util.formatTime(this.video.duration)
        }
        this.events.push(this.updateTimer)
    }

    initSettingGroup () {
        this.settings = {}
        let settingGroup = this.element.querySelector('.setting-group')
        this.playSpeedBox = this.element.querySelector('.play-speed-box')
        this.settings.playSpeed = settingGroup.querySelector('.play-speed')
        this.settings.mirror = settingGroup.querySelector('.mirror')
        this.settings.hotkey = settingGroup.querySelector('.hotkey')
        this.settings.loop = settingGroup.querySelector('.loop')


        const activeElement = (el) => {
            let li = el.getElementsByTagName('li')
            for (let i = 0; i < li.length; i++) {
                li[i].classList.remove('active')
            }
        };

        this.settings.playSpeed.addEventListener('click', (e) => {
            settingGroup.classList.add('hidden');
            this.playSpeedBox.classList.remove('hidden');
        });

        this.playSpeedBox.addEventListener('click', (event) => {
            let target = event.target || event.srcElement
            if (target.tagName.toLowerCase() === 'li') {
                this.player.playbackRate(target.dataset.spd)
                activeElement(this.playSpeedBox)
                target.classList.add('active')
            }
            this.playSpeedBox.classList.add('hidden')
            settingGroup.classList.remove('hidden')
        });

        this.settings.mirror.addEventListener('click', (e) => {
            if (this.mirror) {
                this.video.style.transform = 'scaleX(1)'
                this.settings.mirror.querySelector('.text').innerText = '关'
            } else {
                this.video.style.transform = 'scaleX(-1)'
                this.settings.mirror.querySelector('.text').innerText = '开'
            }
            this.mirror = !this.mirror
        });

        this.settings.loop.addEventListener('click', (e) => {
            if (this.video.loop) {
                this.video.loop = false
                this.settings.loop.querySelector('.text').innerText = '关闭'
            } else {
                this.video.loop = true
                this.settings.loop.querySelector('.text').innerText = '开启'
            }
        });

        const hotKey = () => {
            if (this.hotkey) {
                this.settings.hotkey.querySelector('.text').innerText = '关闭'
                window.removeEventListener('keyup', bindHotKey)
            } else {
                this.settings.hotkey.querySelector('.text').innerText = '开启'
                window.addEventListener('keyup', bindHotKey)
            }
            this.hotkey = !this.hotkey
        };

        const bindHotKey = (event) => {
            switch (event.keyCode) {
                case 37: // 键盘左键
                case 74: // J 快退
                    this.player.seek( this.player.seek() -5);
                    break;
                case 39: // 键盘右键
                case 76: // L 快退
                    this.player.seek( this.player.seek() +5);
                    break;
                case 38: // 上键
                    this.player.setVolume(this.player.volume +5)
                    break;
                case 40: // 下键
                    this.player.setVolume(this.player.volume -5)
                    break;
                case 75:
                    this.play();
                    break;
            }
        };

        this.settings.hotkey.addEventListener('click', (e) => {
            hotKey()
        });


        hotKey()
    }

    initWatingWarp () {

        this.video.addEventListener('waiting', () => {
            this.player.element.classList.add('player-waiting')
        })

        this.video.addEventListener('canplay', () => {
            this.player.element.classList.remove('player-waiting')
        })
    }

    /**
     * Auto hide controls
     */
    autoHide () {
        this.show()
        clearTimeout(this.autoHideControls)
        this.autoHideControls = setTimeout(() => {
            if (this.video.played.length && this.status != PLAY_STATUS.PAUSE) {
                this.hide()
            }
        }, 3000)
    }

    show () {
        this.player.element.classList.remove('player-hide-control')
    }

    hide () {
        this.player.element.classList.add('player-hide-control')
        this.button.setting.checked = false
    }
}

export default Controller;