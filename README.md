Ayaya
====

> A simple website media player



Build Setup
----

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



Docs
----

#### 初始化播放器 1方式

```javascript
var player = new Ayaya({
    element: document.getElementById('player'),
    type: 'hls',
    logLevel: 0,
    video: {
        poster: '//demo.loacg.com/poster.png',
        src: '//demo.loacg.com/mplayer/Puella_Magi_Madoka_Magica/01/01.m3u8'
    },
    volume: 10
});
```

#### 初始化播放器 2 方式

```javascript
// 先初始化播放器
var player = new Ayaya({
    element: document.getElementById('player'),
    logLevel: 1,
    volume: 10
});

// 后设置要播放器的视屏源
player.switchSource('//demo.loacg.com/assets/video/WakabaGirl.mp4');
```

#### 播放器参数


| 参数       | 说明                                                   | 类型       | 默认值      |
| ---------- | ------------------------------------------------------ | ---------- | ----------- |
| element    | 要初始化播放器的 dom 元素                              | DomElement | .mplayer[0] |
| type       | 播放器类型<br />'html5', 'hls', 'dash', 'flv'          | String     | 'html5'     |
| preload    | 预加载                                                 | String     | 'auto'      |
| quality    | 是否支持清晰度切换                                     | Boolean    | false       |
| hotkey     | 是否开启热键支持                                       | Boolean    | false       |
| autoplay   | 打开页面时自动播放                                     | Boolean    | false       |
| loop       | 循环播放                                               | Boolean    | false       |
| blob       | 是否采用 html5 BLOB 包装视频源                         | Boolean    | false       |
| volume     | 当前播放器声音大小，范围 0-100                         | Number     | 40          |
| loggerType | 日志类型<br />0 在页面输出<br />1在浏览器 console 输出 | Number     | 1           |
| logLevel   | 0 DEBUG, 1INFO, 2 WARN, 3 ERROR                        | Number     | 0           |



#### 播放器事件


| 事件名       | 回调参数           | 说明                                                         |
| ------------ | ------------------ | ------------------------------------------------------------ |
| play         | function() {}      | 播放视频时  无参                                             |
| pause        | function() {}      | 暂停播放时  无参                                             |
| played       | function() {}      | 播放结束时  无参                                             |
| ready        | function() {}      | 当视频元信息加载完毕时触发，此时可以开始调用播放             |
| stop         | function() {}      | 停止播放时(播放结束)                                         |
| ended        | function() {}      | 当播放结束时                                                 |
| seek         | function(int) {}   | 点击播放进度跳转时间轴时<br />跳过时间轴的秒数               |
| volume       | function(int) {}   | 修改播放器音量时触发 <br />参数 修改的音量大小               |
| playbackRate | function(rate) {}  | 播放器当前播放速度<br />参数 rate: int                       |
| fullscreen   | function(modeType) | 播放器屏幕显示模式<br />参数 modeType: <br />0 - 正常<br />1 - web 全屏<br />2 - 屏幕全屏 |
| destroy      | function() {}      | 播放器被销毁时  无参                                         |

#### 事件绑定例子
```javascript

// 初始化播放器
var player = new Ayaya({
    element: document.getElementById('player'),
    type: 'hls',
    loggerType: 1,
    video: {
        poster: '//demo.loacg.com/poster.png',
        src: '//demo.loacg.com/mplayer/Puella_Magi_Madoka_Magica/01/01.m3u8'
    },
    volume: 10
});

// 1. 无参事件
function playEvent() {
    console.log('player playing');
}

// 监听事件
player.on(Ayaya.EVENTS.PLAY, playEvent);

// 取消监听事件
player.off(Ayaya.EVENTS.PLAY, playEvent);


// 2. 有参监听
function light(parameter) {
    console.log(parameter); // true / false

    console.log('now turn light:', parameter);
}
player.on(Ayaya.EVENTS.PLAYER_LIGHT, light); // 监听
player.off(Ayaya.EVENTS.PLAYER_LIGHT, light); // 取消监听
player.once(Ayaya.EVENTS.PLAYER_LIGHT, light); // 只监听一次，之后都不在触发
```


#### 日志记录


| #          | 值        | 说明                                                      |
| ---------- | --------- | --------------------------------------------------------- |
| loggerType | 0, 1      | 0 在页面输出<br />1 在浏览器 console 输出                 |
| logLevel   | 0,1,2,3,4 | 0 DEBUG<br />1 INFO<br />2 WARN<br />3 ERROR<br />4 FATAL |

