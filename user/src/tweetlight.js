/*---------------
* Tweetlight
* Display your latest tweets with pure JavaScript and PHP OAuth Library
* Example and documentation at: https://github.com/pinceladasdaweb/tweetlight
* Copyright (c) 2013
* Version: 3.0.0 (17-DEZ-2013)
* Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
* Requires: Twitter API Authentication
---------------*/
var Browser = (function () {
    var agent = navigator.userAgent;
    return {
        ie: agent.match(/MSIE\s([^;]*)/)
    };
}());

var Tweetlight = {
    init: function (config) {
        this.url = './tweets.php?username=' + config.username + '&count=' + config.count;
        this.container = config.container;
        this.onComplete = config.onComplete || function () {};
        this.fetch();
    },
    xhr: function () {
        return new XMLHttpRequest();
    },
    getJSON: function (options, callback) {
        var self = this;

        var xhttp    = self.xhr();
        options.url  = options.url || location.href;
        options.data = options.data || null;
        callback     = callback || function () {};
        xhttp.open('GET', options.url, true);
        xhttp.onreadystatechange = function () {
            if (xhttp.status === 200 && xhttp.readyState === 4) {
                callback(xhttp.responseText);
            }
        }
        xhttp.send(options.data);
    },
    loop: function (els, callback) {
        var i = 0, max = els.length;

        while (i < max) {
            callback(els[i], i);
            i += 1;
        }
    },
    fetch: function () {
        var self = this;

        self.getJSON({url: self.url}, function (data) {
            var tweets   = JSON.parse(data),
                timeline = document.querySelector(self.container),
                content  = '';

            if (!tweets[0].created) {
                timeline.innerHTML = '<li class="error">Houston, we have a problem...</li>';
                return
            }

            self.loop(tweets, function (tweet) {
                content += '<li><span class="tweet">'+self.twitterLinks(tweet.text)+'</span><span class="created">'+self.prettyDate(tweet.created)+'</span></li>';
            });

            timeline.innerHTML = content;

            self.onComplete();
        });

    },
    prettyDate: function (a) {
        var b = new Date();
        var c = new Date(a);
        if (Browser.ie) {
            c = Date.parse(a.replace(/( \+)/, ' UTC$1'))
        }
        var d = b - c;
        var e = 1000,
            minute = e * 60,
            hour = minute * 60,
            day = hour * 24,
            week = day * 7;
        if (isNaN(d) || d < 0) {
            return ""
        }
        if (d < e * 7) {
            return "agora"
        }
        if (d < minute) {
            return Math.floor(d / e) + " segundos atrás"
        }
        if (d < minute * 2) {
            return "1 minuto atrás"
        }
        if (d < hour) {
            return Math.floor(d / minute) + " minutos atrás"
        }
        if (d < hour * 2) {
            return "1 hora atrás"
        }
        if (d < day) {
            return Math.floor(d / hour) + " horas atrás"
        }
        if (d > day && d < day * 2) {
            return "ontem"
        }
        if (d < day * 365) {
            return Math.floor(d / day) + " dias atrás"
        } else {
            return "mais de um ano"
        }
    },
    twitterLinks: function (text) {
        text = text.replace(/(https?:\/\/)([\w\-:;?&=+.%#\/]+)/gi, '<a href="$1$2">$2</a>')
        .replace(/(^|\W)@(\w+)/g, '$1<a href="https://twitter.com/$2">@$2</a>')
        .replace(/(^|\W)#(\w+)/g, '$1<a href="https://twitter.com/search?q=%23$2">#$2</a>');
        return text
    }
}