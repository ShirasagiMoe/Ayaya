
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