$(document).ready(function () {
  $("#owl-example").owlCarousel({
    items: 5, // 10 items above 1000px browser width
    responsive: {
      1600: { items: 4 }, // 4 items between 1600px and 1000px
      900: { items: 4 },  // 4 items between 900px and 600px
      600: { items: 2 }   // 2 items between 600px and 0
    },
    lazyLoad: true,
    nav: false,  // "nav" is used instead of "navigation" in newer versions
  });

  $(".nav > li > a").on("click", function (e) {
    e.preventDefault();
    $.scrollTo($(this).attr("href"), 400, {
      offset: -$("#top").height(),
      axis: "y",
    });
  });

  (function ($) {
    $.scrollTo = function (target, duration, options) {
      $(window).scrollTo(target, duration, options);
    };

    $.scrollTo.defaults = {
      axis: "xy",
      duration: parseFloat($.fn.jquery) >= 1.3 ? 0 : 1,
      limit: true,
    };

    $.fn._scrollable = function () {
      return this.map(function () {
        var elem = this,
          isWin = !elem.nodeName || $.inArray(elem.nodeName.toLowerCase(), [
            "iframe", "#document", "html", "body"
          ]) !== -1;
        if (!isWin) return elem;

        var doc = (elem.contentWindow || elem).document || elem.ownerDocument || elem;
        return /webkit/i.test(navigator.userAgent) || doc.compatMode === "BackCompat"
          ? doc.body
          : doc.documentElement;
      });
    };

    $.fn.scrollTo = function (target, duration, options) {
      if (typeof duration === "object") {
        options = duration;
        duration = 0;
      }
      if (typeof options === "function") options = { onAfter: options };
      if (target === "max") target = 9e9;

      options = $.extend({}, $.scrollTo.defaults, options);
      duration = duration || options.duration;
      options.queue = options.queue && options.axis.length > 1;

      if (options.queue) duration /= 2;

      options.offset = normalizeOption(options.offset);
      options.over = normalizeOption(options.over);

      return this._scrollable().each(function () {
        var elem = this, $elem = $(elem),
          targ = target, toff, attr = {}, win = $elem.is("html,body");

        if (typeof targ === "number" || typeof targ === "string") {
          if (/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ)) {
            targ = normalizeOption(targ);
          } else {
            targ = $(targ, this);
            if (!targ.length) return;
          }
        }

        if (typeof targ === "object" && (targ.is || targ.style)) {
          toff = targ.offset();
        }

        $.each(options.axis.split(""), function (i, axis) {
          var prop = axis === "x" ? "Left" : "Top",
            pos = prop.toLowerCase(),
            key = "scroll" + prop,
            old = elem[key],
            max = $.scrollTo.max(elem, axis);

          if (toff) {
            attr[key] = toff[pos] + (win ? 0 : old - $elem.offset()[pos]);
            if (options.margin) {
              attr[key] -= parseInt(targ.css("margin" + prop)) || 0;
              attr[key] -= parseInt(targ.css("border" + prop + "Width")) || 0;
            }
            attr[key] += options.offset[pos] || 0;
            if (options.over[pos]) {
              attr[key] += targ[axis === "x" ? "width" : "height"]() * options.over[pos];
            }
          } else {
            var offset = targ[pos];
            attr[key] = offset.slice && offset.slice(-1) === "%" ?
              (parseFloat(offset) / 100) * max : offset;
          }

          if (options.limit && /^\d+$/.test(attr[key])) {
            attr[key] = Math.min(Math.max(attr[key], 0), max);
          }

          if (!i && options.queue) {
            if (old !== attr[key]) animateScroll(options.onAfterFirst);
            delete attr[key];
          }
        });

        animateScroll(options.onAfter);

        function animateScroll(callback) {
          $elem.animate(attr, duration, options.easing, callback && function () {
            callback.call(this, targ, options);
          });
        }
      }).end();
    };

    $.scrollTo.max = function (elem, axis) {
      var dim = axis === "x" ? "Width" : "Height",
        scroll = "scroll" + dim;

      if (!$(elem).is("html,body")) {
        return elem[scroll] - $(elem)[dim.toLowerCase()]();
      }

      var client = "client" + dim,
        html = elem.ownerDocument.documentElement,
        body = elem.ownerDocument.body;

      return Math.max(html[scroll], body[scroll]) -
        Math.min(html[client], body[client]);
    };

    function normalizeOption(option) {
      return typeof option === "object" ? option : { top: option, left: option };
    }
  })(jQuery);
});
