# MPlayer


> A simple SRSG.MOE website media player


## Build Setup

```bash
# install dependencies
npm install
# yarn
yarn

# serve with hot reload at localhost:9000
npm run dev
# yarn
yarn run dev


# build for production with minification
npm run build
# yarn
yarn run build
```


## Docs

> use MPlayer

```javascript
var player = new MPlayer({
    element: document.getElementById('player'),
    type: 'hls',
    loggerType: 1,
    video: {
        poster: '//demo.loacg.com/poster.png',
        src: '//demo.loacg.com/mplayer/Puella_Magi_Madoka_Magica/01/01.m3u8'
    },
    volume: 10
});
```

volume 视频音量

Logger Type: `VIEW: 0`, `CONSOLE: 1`  
Logger LEVEL: ` DEBUG: 0`, `INFO: 1`, `WARN: 2`, `ERROR: 3`, `FATAL: 4`  
