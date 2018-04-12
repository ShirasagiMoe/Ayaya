const logEl = document.getElementById('logger');

export default (type = 'DEBUG', ...logs) => {
    let text = '';
    for (let log of logs) {
        text += log + ' ';
    }
    logEl.append(' [' + type + '] ' + text.substring(0, text.length - 1) + '\n');
    logEl.scrollTop = logEl.scrollHeight;
}