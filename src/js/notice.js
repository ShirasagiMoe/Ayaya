
export default class Notice {

    constructor(player) {
        this.player = player

        this.element = this.player.element.querySelector('.video-notice')
        this.element.style.display = 'none'
        this.element.style.opacity = 0

        this.textEl = this.element.getElementsByTagName('span')
        this.textEl.innerText = ''

        this.iv = 0
    }

    showAutoHide(text) {
        clearTimeout(this.iv)
        this.show(text)

        this.iv = setTimeout(() => {
            this.hide()
        }, 1500)
    }

    show(text) {
        this.textEl.innerHTML = text
        this.element.style.display = 'block'
        this.element.style.opacity = 1
    }

    hide() {
        this.element.style.display = 'block'
        this.element.style.opacity = 0
    }

    trigger() {

    }
}