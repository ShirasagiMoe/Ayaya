import Icons from './icons'

const template = {
    build: (index, option) => {
        let html = `
            <div class="video-box">
                <video class="mplayer-video mplayer-video-index${index}" src=""></video>
            </div>
            <div class="info-panel">
                <a class="close" title="关闭">[x]</a>
                <ul class="items">
                    <li>
                        <span class="name">Player:</span>
                        <span class="v">MPlayer @build.20180801-r1</span>
                    </li>
                    <li>
                        <span class="name">Support Mode:</span>
                        <span class="v">Html5, Flv, Hls, M(PEG)-Dash</span>
                    </li>
                    <li>
                        <span class="name">Current Mode:</span>
                        <span class="v player-mode">default</span>
                    </li>
                    <li>
                        <span class="name">Video ID:</span>
                        <span class="v vid">v10001</span>
                    </li>
                    <li>
                        <span class="name">Viewport:</span>
                        <span class="v viewport">900x506</span>
                    </li>
                    <li>
                        <span class="name">Volume:</span>
                        <span class="v volume">40</span>
                    </li>
                    <li>
                        <span class="name">Codecs:</span>
                        <span class="v codecs">video/mp4;codecs="avc1.640028"</span>
                    </li>
                    <li>
                        <span class="name">Host:</span>
                        <span class="v host"></span>
                    </li>
                    <li>
                        <span class="name">Connection Speed:</span>
                        <span class="v right connection-speed">- Kb/s</span>
                    </li>
                    <li>
                        <span class="name">Dropped frames:</span>
                        <span class="v dropped-frames">0</span>
                    </li>
                </ul>
            </div>
            <div class="hidden">
                <div class="copy-location">${window.location.href}</div>
            </div>
            <div class="context-menu">
                <ul>         
                </ul>            
            </div>
            <div class="video-play-status-mask">
                <div class="icon play-status">${Icons.play}</div>
            </div>
            
            <div class="video-notice">
                <span>10%</span>
            </div>
            <div class="video-stats">
                ${Icons.play}
            </div>
            <div class="video-waiting">
                ${Icons.loading}
            </div>
            
            <div class="control-mask"></div>
            <div class="controls">
            <div class="control-bar">
                <div class="seek-timer-label">00:00</div>
                    <div class="bar-player-time hidden">00:00</div>
                    <div class="load-bar">
                        <div class="loaded" style="width: 0"></div>
                        <div class="played" style="width: 0">
                            <span class="after"></span>                        
                        </div>
                        <div class="hover" style="width: 0"></div>
                    </div>
                </div>
                <div class="control left">
                    <button class="icon button-play">
                        ${Icons.play}
                    </button>
                    <div class="volume-box">
                        <button class="icon button-volume">
                            ${Icons.volume1}
                        </button>
                        <div class="volume-bar-box">
                            <div class="volume-bar">
                                <div class="volume-bar-inner" style="width: 45%"></div>
                            </div>
                        </div>

                    </div>
                    <div class="play-time">
                        <span class="play-current">00:00</span> / <span class="play-duration">00:00</span>
                    </div>
                </div>
                <div class="control right">
                    <button class="icon button-disorder hidden">
                        
                    </button>
                    <button class="icon">720P</button>
                    <div class="video-quality hidden">
                        <ul>
                            <li>1080P</li>
                            <li>720P</li>
                            <li>360P</li>                           
                        </ul>                    
                    </div>    
                    <input type="checkbox" id="mplayer-chk${index}" class="button-settings-checkbox hidden"/>
                    <label for="mplayer-chk${index}" class="icon button-settings">
                        ${Icons.setting}
                    </label>
                    <div class="control-settings">
                        <ul class="setting-group">
                            <li class="play-speed">播放速度：<span class="text">正常</span>${Icons.back}</li>
                            <li class="mirror">镜像模式：<span class="text">关</span></li>
                            <li class="hotkey">方向热键：<span class="text">开启</span></li>
                            <li class="loop">洗脑循环：<span class="text">关闭</span></li>                    
                        </ul>
                        <ul class="play-speed-box hidden">
                            <li class="line">${Icons.back} 速度</li>
                            <li data-spd="0.5">0.50</li>
                            <li data-spd="0.75">0.75</li>
                            <li data-spd="1" class="active">正常</li>
                            <li data-spd="1.25">1.25</li>
                            <li data-spd="1.5">1.50</li>
                            <li data-spd="2">2</li>                           
                        </ul>                
                    </div>
                    <div class="full-screen-group">
                        <button class="icon button-web-full-screen">${Icons.fullWeb}</button>  
                        <button class="icon button-full-screen">${Icons.full}</button>           
                    </div>
                    
                </div>
            </div>

            `;
        return html;
    }
}

export default template;