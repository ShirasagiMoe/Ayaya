export default (options) => {

    const isMobile = /mobile/i.test(window.navigator.userAgent);

    const defaultOption = {
        element: options.element || document.getElementsByClassName('mplayer')[0],
        type: options.type || 'html5',
        preload: 'auto',
        quality: false,
        mobile: false,
        hotkey: false,
        autoplay: false,
        loop: false,
        blob: false,
        volume: 40,
        loggerType: options.loggerType || 1,
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

    if (!options.video) {
        options.video = {
            poster: '',
            src: ''
        }
    }

    return options;
}