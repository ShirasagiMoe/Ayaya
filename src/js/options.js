export default (options) => {

    const isMobile = /mobile/i.test(window.navigator.userAgent);

    const defaultOption = {
        el: options.el || document.getElementsByClassName('mplayer')[0],
        preload: 'auto',
        mobile: false,
        hotkey: false,
        autoplay: false,
        loop: false,
        blob: false,
        volume: 70
    }

    if (isMobile) {
        options.autoplay = false;
        options.mobile = true;
    }

    for (const defaultKey in defaultOption) {
        if (defaultOption.hasOwnProperty(defaultKey) && !options.hasOwnProperty(defaultKey)) {
            options[defaultKey] = defaultOption[defaultKey];
        }
    }

    return options;
}