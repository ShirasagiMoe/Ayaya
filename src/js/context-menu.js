
class Menu {
  constructor (option) {
    this.isShow = false

    let menu = option.element.querySelector('.context-menu')

    this.ul = menu.querySelector('ul')

    this.ul.innerHTML = ''

    this.init(this.ul, option.menus)

    option.element.oncontextmenu = (e) => {
      e.preventDefault()

      menu.style.left = e.offsetX + 'px'
      menu.style.top = e.offsetY + 'px'
      menu.style.display = 'block'
      this.isShow = true
    }

    option.element.onclick = (e) => {
      menu.style.display = 'none'
      this.isShow = false
    }
  }

  init (ele, menus) {
    for (let menu of menus) {
      const liDom = document.createElement('li')
      liDom.innerText = menu.name
      menu.class && liDom.classList.add(menu.class)
      liDom.addEventListener('click', menu.func)
      ele.appendChild(liDom)
    }
  }

  destroy () {
    this.ul = null
  }
}

export default Menu
