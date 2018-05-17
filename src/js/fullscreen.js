
const FULL_MODE = {
    NONE: 0,
    WEB: 1,
    SCREEN: 2
}

class FullScreen {

    constructor (player) {

        this.player = player

        const supportFullScreen = document.body.requestFullscreen || document.body.mozRequestFullScreen || document.body.webkitRequestFullscreen || document.body.msRequestFullscreen;

        // ['landscape-primary', 'landscape-secondary']
        this.SCREEN_DIRECTION = {
            primary: 'landscape-primary',
            secondary: 'landscape-secondary'
        }


        this.mode = FULL_MODE.NONE

        // init element
        this.element = {}
        this.element.name = {}
        this.element.name.web = 'player-web-full'
        this.element.name.screen = 'player-screen-full'
        this.element.fullScreen = this.player.element.querySelector('.button-full-screen')
        this.element.fullWebScreen = this.player.element.querySelector('.button-web-full-screen')

        this.element.fullScreen.addEventListener('click', () => {
            this.screenFull()
        })

        this.element.fullWebScreen.addEventListener('click', () => {
            this.webFull()
        })
    }

    /**
     * Full Web screen mode
     */
    webFull () {

        if (this.mode !== FULL_MODE.WEB) {
            this.player.element.classList.add(this.element.name.web)
            this.player.element.classList.remove(this.element.name.screen)
            document.body.style.overflow = 'hidden';
            this.setMode(FULL_MODE.WEB)
        } else {
            this.player.element.classList.remove(this.element.name.web)
            this.player.element.classList.remove(this.element.name.screen)
            document.body.style.overflow = '';
            this.setMode(FULL_MODE.NONE)
        }
        this.player.infoPanel.trigger()
    }

    /**
     * Full Screen mode
     */
    screenFull () {
        this.player.element.classList.remove(this.element.name.screen)
        this.player.element.classList.remove(this.element.name.web)

        const isInFullScreenMode = function(){
            return document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen || document.msFullscreenElement;
        }
        isInFullScreenMode()

        // 不是全屏模式
        if (this.mode !== FULL_MODE.SCREEN) {
            if (this.player.element.requestFullscreen) {
                this.player.element.requestFullscreen()
            } else if (this.player.element.mozRequestFullScreen) {
                this.player.element.mozRequestFullScreen();
            } else if (this.player.element.webkitRequestFullscreen) {
                this.player.element.webkitRequestFullscreen();
            } else if (this.player.element.msRequestFullscreen) {
                this.player.element.msRequestFullscreen();
            }
            screen.orientation.lock(this.SCREEN_DIRECTION.primary)
            this.player.element.style.width = '100%'
            this.player.element.style.height = '100%'

            this.setMode(FULL_MODE.SCREEN)
        } else {
            if(document.exitFullscreen) {
                document.exitFullscreen()
            } else if(document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if(document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if(document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            screen.orientation.unlock()
            this.player.element.style.width = ''
            this.player.element.style.height = ''

            this.setMode(FULL_MODE.NONE)
        }
    }

    /**
     * Get fullscreen mode
     * @return 0
     */
    getMode () {
        return this.mode
    }

    setMode (mode) {
        this.mode = mode
    }


}

export default FullScreen;