import Icons from './icons'

const template = {
    build: (index, option) => {
        let html = `
            <div class="video-box">
                <video class="mplayer-video mplayer-index${index}" src=""></video>
            </div>
            <!--
            <div class="video-mask">
                <div class="icon">${Icons.play}</div>
            </div>
            -->
            <div class="video-play-status-mask">
                <div class="icon play-status">${Icons.play}</div>
            </div>
            
            
            <div class="video-message">
                <span>10%</span>
            </div>
            <div class="video-notice">
                ${Icons.play}
            </div>
            
            <div class="control-mask"></div>
            <div class="controls">
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
                    <input type="checkbox" id="mplayer-chk${index}" class="button-settings-checkbox hidden"/>
                    <label for="mplayer-chk${index}" class="icon button-settings">
                        ${Icons.setting}
                    </label>
                    <div class="control-settings">
                        <ul class="setting-group">
                            <li class="play-speed">播放速度：<span class="text">1 倍</span></li>
                            <li class="mirror">镜像模式：<span class="text">关</span></li>
                            <li class="hotkey">方向热键：<span class="text">开启</span></li>
                            <li class="loop">洗脑循环：<span class="text">关闭</span></li>                    
                        </ul>
                        <ul class="play-speed-box hidden">
                            <li data-spd="0.5">0.50 倍</li>
                            <li data-spd="0.75">0.75 倍</li>
                            <li data-spd="1" class="active">默认</li>
                            <li data-spd="1.25">1.25 倍</li>
                            <li data-spd="1.5">1.50 倍</li>
                            <li data-spd="2">2 倍</li>                           
                        </ul>                
                    </div>
                    <div class="full-screen-group">
                        <button class="icon button-web-full-screen">
                            ${Icons.fullExit}    
                        </button>  
                        <button class="icon button-full-screen">${Icons.full}</button>
                                          
                    </div>
                    
                </div>
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
            </div>
            `;
        return html;
    }
}

export default template;