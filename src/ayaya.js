import './styles/player.scss'

import icons from './js/icons'
import handleOption from './js/options'
import blob from './js/blob'


let index = 0;

class MPlayer {

    /**
     *  player constructor func
     *
     * @param options
     */
    constructor (options) {

        console.log('Player initialize');

        this.options = {};
        this.options = handleOption(options);

        this.el = this.options.el;

        this.el.classList.add('mplayer');

        this.video = this.el.getElementsByClassName('mplayer-video')[0];

        blob.init('https://demo.loacg.com/mplayer/Shelter-OVA.mp4', this.video);

        index++;
        console.log('Ayaya..');
    }

}

export default MPlayer;