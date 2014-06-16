angular.module('ngGrid.services').factory('$rtlUtilityService',[function() {
    var rtlUtilityService = {};

    rtlUtilityService.init = function(element) {
        // find the closest dir attribute and see if we're in RTL mode
        rtlUtilityService.isRtl = (element.closest("*[dir]").attr('dir') || '').toLowerCase() === 'rtl';

        // if we're in RTL mode, figure out if the X axis flips
        // in chrome the left side 0 and X increases as you move right (just like in LTR)
        // in FF the right side is 0 and X decreases as you move left
        // in IE the right side is 0 and X increases as you move left
        if(rtlUtilityService.isRtl) {
            var $testContainer = $('<div dir="rtl"></div>');
            $testContainer.height(100).width(100).css("position", "absolute").css("overflow", "scroll");
            $testContainer.appendTo('body');
            var $content = $('<div id="content" style="width: 400px; height: 400px; position: relative"></div>');
            var $topLeft = $('<div id="left" style="width: 1px; height: 1px; left: 0px; top: 0px; position: absolute;"></div>');
            var $topRight = $('<div id="right" style="width: 1px; height: 1px; right: 0px; top: 0px; position: absolute;"></div>');
            $content.append($topLeft);
            $content.append($topRight);
            $testContainer.append($content);
            $('#left')[0].scrollIntoView(true);
            var leftX = Math.abs($testContainer.scrollLeft());
            $('#right')[0].scrollIntoView(true);
            var rightX = Math.abs($testContainer.scrollLeft());
            rtlUtilityService.isAxisFlipped = (leftX > rightX);
            $testContainer.remove();
        }
    };

    rtlUtilityService.normalizeScrollLeft = function(realScrollLeft, viewport) {
        var normalizedScrollLeft = realScrollLeft;
        if(rtlUtilityService.isRtl) {
            if(rtlUtilityService.isAxisFlipped) {
                normalizedScrollLeft = Math.abs(realScrollLeft);
            } else {
                normalizedScrollLeft = viewport[0].scrollWidth - viewport[0].clientWidth - realScrollLeft;
            }
        }
        return normalizedScrollLeft;
    };

    return rtlUtilityService;
}]);
