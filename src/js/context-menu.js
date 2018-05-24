
class Menu {

    constructor(option) {

        var menu = option.player.element.querySelector('.context-menu')


        var ul = menu.querySelector('ul')

        ul.innerHTML = ''

        this.init(ul, option.menus)

        option.player.element.oncontextmenu = (e) => {
            e.preventDefault()

            menu.style.left = e.offsetX + 'px'
            menu.style.top = e.offsetY + 'px'
            menu.style.display = 'block'
        }

        option.player.element.onclick = (e) => {
            menu.style.display = 'none'
        }
    }

    init(ele, menus) {

        for (let menu of menus) {
            let li = document.createElement('li')
            li.innerText = menu.name
            li.addEventListener('click', menu.func)
            ele.appendChild(li)
        }

    }

}

export default Menu;