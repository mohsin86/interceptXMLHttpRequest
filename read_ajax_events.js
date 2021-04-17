(function() {
    var xhrOpen = window.XMLHttpRequest.prototype.open;
    var xhrSend = window.XMLHttpRequest.prototype.send;
    window.XMLHttpRequest.prototype.open = function() {
        console.log('augmentData',arguments);
        this.method = arguments[0];
        this.url = arguments[1];
        return xhrOpen.apply(this, [].slice.call(arguments));
    };
    window.XMLHttpRequest.prototype.send = function() {
        var xhr = this;
        var xhrData = arguments[0];
        console.log('data=',xhrData);
        var intervalId = window.setInterval(function() {
            if(xhr.readyState != 4) {
                return;
            }
            dataLayer.push({
                'event': 'ajaxSuccess',
                'eventCategory': 'AJAX ' + xhr.method,
                'eventAction': xhr.url + (xhr.method == 'POST' && xhrData ? ';' + xhrData : ''),
                'eventLabel': xhr.responseText
            });
            clearInterval(intervalId);
        }, 1);
        return xhrSend.apply(this, [].slice.call(arguments));
    };
})();