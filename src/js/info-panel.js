
class InfoPanel {

    constructor(player) {
        this.player = player
        this.element = player.element
        this.panel = this.element.querySelector('.info-panel')
        this.events = {}
        this.events.droppedFrames = this.panel.querySelector('.dropped-frames')
        this.events.connectionSpeed = this.panel.querySelector('.connection-speed')
        this.events.viewport = this.panel.querySelector('.viewport')
        this.events.volume = this.panel.querySelector('.volume')

        this.panel.querySelector('.close').addEventListener('click', (e) => {
            e.preventDefault()
            this.close()
        })
/*
        this.panelCid = setInterval(() => {
            this.trigger()
        }, 5000)
        */

        let cid = 0
        const resize = () => {
            clearTimeout(cid)
            cid = setTimeout( () => {
                this.trigger()
            }, 1000)
        }

        this.element.addEventListener('resize', resize)

    }

    open() {
        this.panel.style.display = 'block'
    }

    close() {
        this.panel.style.display = 'none'
    }

    setVolumeText(volume) {
        this.events.volume.innerText = volume;
    }

    trigger() {

        console.log(this.player.stats)
        if (this.player.stats) {
            this.events.droppedFrames.innerText = `${this.player.stats.droppedFrames}/${this.player.stats.totalFrames}`
            this.events.connectionSpeed.innerText = ((this.player.stats.fragMaxLatency * 1024) / 8).toFixed(2) + 'Kb/s'

        }
        this.events.viewport.innerText = this.element.offsetWidth + 'x' + this.element.offsetHeight
    }
}

export default InfoPanel;