# Ayaya


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

> 初始化播放器 1方式

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

>初始化播放器 2 方式

```javascript
// 先初始化播放器
var player = new MPlayer({
    element: document.getElementById('player'),
    loggerType: 1,
    volume: 10
});

// 后设置要播放器的视屏源
player.switchSource('//demo.loacg.com/assets/video/WakabaGirl.mp4');
```



> 播放器事件：

| 事件名       | 回调参数                             | 说明                                                         |
| ------------ | ------------------------------------ | ------------------------------------------------------------ |
| play         | function() {}                        | 播放视频时  无参                                             |
| pause        | function() {}                        | 暂停播放时  无参                                             |
| stop         | function() {}                        | 停止播放时(播放结束)                                         |
| seek         | function(int) {}                     | 点击播放进度跳转时间轴时<br />跳过时间轴的秒数               |
| volume       | function(int) {}                     | 修改播放器音量时触发 <br />参数 修改的音量大小               |
| switchSource | function({type: 'xx', src: 'xx'}) {} | 切换播放源<br />参数 type: 播放器类型(hls, html5, dash, flv)<br />src: 切换前的视频源 |
| playbackRate | function(rate) {}                    | 播放器当前播放速度<br />参数 rate: int                       |
| screen       | function(modeType)                   | 播放器屏幕显示模式<br />参数 modeType: <br />0 - 正常<br />1 - web 全屏<br />2 - 屏幕全屏 |
| destory      | function() {}                        | 播放器被销毁时  无参                                         |



> 日志记录

| #           | 值                   | 说明                                                      |
| ----------- | -------------------- | --------------------------------------------------------- |
| loggerType  | 0 \| 1               | 0 在页面输出<br />1 在浏览器 console 输出                 |
| loggerLevel | 0 \| 1 \| 2 \| 3\| 4 | 0 DEBUG<br />1 INFO<br />2 WARN<br />3 ERROR<br />4 FATAL |



