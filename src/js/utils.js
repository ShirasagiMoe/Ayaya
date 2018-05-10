export default {
    formatTime: (time) => {
        var min, sec
        min = Math.floor(time / 60)
        if (min < 10) min = '0' + min
        sec = Math.floor(time % 60)
        if (sec < 10) sec = '0' + sec;
        return `${min}:${sec}`
    }
}