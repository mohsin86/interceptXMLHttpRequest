(function() {

    function parse_query_string(query) {
        var vars = query.split("&");
        var query_string = {};
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            var key = decodeURIComponent(pair[0]);
            var value = decodeURIComponent(pair[1]);
            console.log(pair);
            query_string[key] = value;
        }
        return query_string;
    }

    // tracing when add to cart
    function addToCart(xhr,xhrDataString) {
        var xhrData = xhrDataString ?  parse_query_string(xhrDataString):'';
        var productId = xhrData.product_id!=null || xhrData.product_id!= undefined ? xhrData.product_id:'not set';
        var productQuantity = xhrData.quantity!=null || xhrData.quantity!= undefined ? xhrData.quantity:'not set';
        var productSku = xhrData.product_sku!=null || xhrData.product_sku!= undefined ? xhrData.product_sku:'not set';
        dataLayer.push({
            'event': 'Add to Cart',
            'eventCategory': 'AJAX ' + xhr.method,
            'eventAction': xhr.url,
            'eventResponseUrl':xhr.responseURL,
            'eventLabel': xhr.responseText,
            'eventAddtoCartProductId': productId,
            'eventAddtoCartQuantity': productQuantity,
            'eventAddtocartsku': productSku,
        });
    }

    // Network request Reading
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

        var intervalId = window.setInterval(function() {
            if(xhr.readyState != 4) {
                return;
            }
            if(xhr.url=='/?wc-ajax=add_to_cart'){
                addToCart(xhr,xhrData);
            }

            if(xhr.url=='?wc-ajax=checkout'){
                var status;
                var parsResponse = JSON.parse(xhr.responseText);
                if(parsResponse.result!=null || parsResponse.result!=undefined){
                     status =    parsResponse.result;
                }

                dataLayer.push({
                    'event': 'Place order',
                    'eventCategory': 'AJAX ' + xhr.method,
                    'eventAction': xhr.url,
                    'eventResponseUrl':xhr.responseURL,
                    'eventResponseStatus':status,
                    'eventLabel': xhr.responseText
                });
            }
            clearInterval(intervalId);
        }, 1);
        return xhrSend.apply(this, [].slice.call(arguments));
    };
})();