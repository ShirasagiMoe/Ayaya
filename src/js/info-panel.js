
class InfoPanel {

    constructor(option) {
        this.element = option.element
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
    }

    open() {
        this.panel.style.display = 'block'
    }

    close() {
        this.panel.style.display = 'none'
    }

    setVolumeText(volue) {
        this.events.volume.innerText = volue;
    }

    trigger(stats) {
        this.events.droppedFrames.innerText = stats.droppedFrames
        this.events.connectionSpeed.innerText = (stats.fragparsingKbps/1024).toFixed(2) + 'Kb/s'
        this.events.viewport.innerText = this.element.offsetWidth + 'x' + this.element.offsetHeight
    }
}

export default InfoPanel;