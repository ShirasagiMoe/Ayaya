class InfoPanel {

    constructor(player) {
        this.player = player
        this.element = player.element
        this.panel = this.element.querySelector('.info-panel')
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

        this.isShow = false

        this.panel.querySelector('.close').addEventListener('click', (e) => {
            e.preventDefault()
            this.close()
        })

        this.events.playerMode.innerText = this.player.options.type

/*        let cid = 0
        const resize = () => {
            clearTimeout(cid)
            cid = setTimeout( () => {
                this.trigger()
            }, 1000)
        }

        this.element.addEventListener('resize', resize)*/

        this.dict = [
            {x: 0, y: 14},
            {x: 180, y: 14},
        ];
    }

    open() {
        this.isShow = true
        this.panel.style.display = 'block'
    }

    close() {
        this.isShow = false
        this.panel.style.display = 'none'
    }

    setVolumeText(volume) {
        this.events.volume.innerText = volume;
    }

    setVideoId(val) {
        this.events.videoId.innerText = val;
    }

    setSourceHost(val) {
        this.events.host.innerText = val;
    }

    trigger() {
        if (this.player.stats) {
            this.events.droppedFrames.innerText = `${this.player.stats.droppedFrames}/${this.player.stats.totalFrames}`
            this.events.connectionSpeed.innerText = (this.player.stats.fragLastKbps / 8).toFixed(2) + 'Kb/s'
            this.events.codecs.innerText = this.player.stats.codec
            console.log('p2pSupport', this.player.stats.p2pSupport)
            if (this.player.stats.p2pSupport) {

                const down = this.player.stats.totalP2PDownloaded || 0
                const up = this.player.stats.totalP2PUploaded || 0
                this.events.p2pSpeed.innerText = `Down:${down + 'KB/s'} / UP:${up + 'KB/s'}`
            }
        }
        this.events.viewport.innerText = this.element.offsetWidth + 'x' + this.element.offsetHeight
    }

    connectionSpeedLine() {

    }
}

export default InfoPanel;
