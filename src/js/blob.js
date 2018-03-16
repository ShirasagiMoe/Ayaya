
const ajax = (options) => {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {

                console.log ('ajax request succeed:', xhr);

                let response = null;
                if (options.type === 'JSON') {
                    response = JSON.parse(xhr.responseText);
                } else {
                    response = xhr.response;
                }

                if (options.method !== 'HEAD' && response === null) {
                    return !options.error||options.error(xhr, response);
                }

                console.log('ajax succeed');
                return !options.success||options.success(xhr, response);
            }

            !options.fail||options.fail(xhr);
        }
    };

    xhr.open(!options.method && !options.data && 'GET' || options.method || options.data, options.url, true);

    if (!options.headers) {
        options.headers = [];
    }

    if (options.data) {
        options.headers.push({'Content-type': 'application/json; charset=UTF-8'});
    }

    for (const key in options.headers) {
        for (const header in options.headers[key]) {
            console.log(header);
            xhr.setRequestHeader(header, options.headers[key][header]);
        }
    }

    if (options.type !== 'JSON') {
        xhr.responseType = options.type;
    }

    xhr.send(!options.data || null || JSON.stringify(data));
};

export default {

    mimeCodec: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2',
    mediaSource: null,
    totalSegments: 5,
    bytesFetched: 0,
    segmentLength: 0,
    segmentDuration: 0,
    sourceBuffer: null,
    requestedSegments: [],
    videoObj: null,
    url: null,

    init (url, videoObj) {

        if ('MediaSource' in window && MediaSource.isTypeSupported(this.mimeCodec)) {

            var that = this;
            this.videoObj = videoObj;
            this.url = url;

            console.log(this.videoObj, this.url);

            for (var i = 0; i < this.totalSegments; ++i) this.requestedSegments[i] = false;

            this.mediaSource = new MediaSource();
            videoObj.src = URL.createObjectURL(this.mediaSource);

            console.log(this.mediaSource.readyState);

            this.mediaSource.addEventListener('sourceopen', () => {
                this.sourceBuffer = that.mediaSource.addSourceBuffer(that.mimeCodec);

                console.log('sb:', this.sourceBuffer, that.sourceBuffer);

                that.getLength(that.url, (fileLength) => {
                    console.log('media length:', (fileLength / 1024 / 1024).toFixed(2), 'MB');
                    that.segmentLength = Math.round(fileLength / that.totalSegments);
                    that.fetchRange(that.url, 0, that.segmentLength, that.appendSegment);
                    that.requestedSegments[0] = true;
                    that.videoObj.addEventListener('timeupdate', that.checkBuffer(url, this.videoObj));
                    that.videoObj.addEventListener('canplay', () => {
                        that.segmentDuration = that.videoObj.duration / this.totalSegments;
                        that.videoObj.play();
                    });
                    that.videoObj.addEventListener('seeking', this.seek());
                });
            });

        } else {

            console.error('Unsupported MIME type or codec: ', this.mimeCodec);

        }

    },

    getLength (url, callback) {
        ajax({
            url: url,
            method: 'HEAD',
            success: (xhr, response) => {
                console.log('getLength', xhr, response);
                callback(xhr.getResponseHeader('content-length'));
            }
        });
    },

    fetchRange (url, start, end, callback) {
        var that = this;
        console.log('fetchRange...');
        ajax({
            url: url,
            method: 'GET',
            type: 'arraybuffer',
            headers: [{'Range': 'bytes=' + start + '-' + end}],
            success: (xhr, response) => {
                console.log('fetched bytes:', start, end);
                that.bytesFetched += end - start + 1;
                that.sourceBuffer.appendBuffer(response);
                // callback(response);
            }
        });
    },

    appendSegment (chunk) {
        console.log('sourceBuffer:', this.sourceBuffer);
        this.sourceBuffer.appendBuffer(chunk);
    },

    checkBuffer (_, videoObj) {
        let currentSegment = this.getCurrentSegment(videoObj);
        if (currentSegment === this.totalSegments && this.haveAllSegments()) {
            console.log('last segment', this.mediaSource.readyState);
            this.mediaSource.endOfStream();
            videoObj.removeEventListener('timeupdate', this.checkBuffer);
        } else if (this.shouldFetchNextSegment(currentSegment, videoObj)) {
            this.requestedSegments[currentSegment] = true;
            console.log('time to fetch next chunk', videoObj.currentTime);
            fetchRange(_, this.bytesFetched, this.bytesFetched + this.segmentLength, appendSegment);
        }
    },

    seek (e) {

        if (this.mediaSource.readyState === 'open') {
            this.sourceBuffer.abort();
            console.log(this.mediaSource.readyState);
        } else {
            console.log('seek but not open?');
            console.log(this.mediaSource.readyState);
        }
    },

    getCurrentSegment (videoObj) {
        return ((videoObj.currentTime / this.segmentDuration) | 0) + 1;
    },

    haveAllSegments () {
        return this.requestedSegments.every((val) => { return !!val; });
    },

    shouldFetchNextSegment (currentSegment, videoObj) {
        return videoObj.currentTime > this.segmentDuration * currentSegment * 0.8 &&
            !this.requestedSegments[currentSegment];
    }
}