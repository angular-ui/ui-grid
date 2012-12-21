/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js" />
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js" />
/// <reference path="../utils.js" />
/// <reference path="../classes/range.js" />
ngGridServices.factory('DomUtilityService', function() {
    var domUtilityService = {};
    var getWidths = function() {
        var $testContainer = $('<div></div>');
        $testContainer.appendTo('body');
        // 1. Run all the following measurements on startup!
        //measure Scroll Bars
        $testContainer.height(100).width(100).css("position", "absolute").css("overflow", "scroll");
        $testContainer.append('<div style="height: 400px; width: 400px;"></div>');
        domUtilityService.ScrollH = ($testContainer.height() - $testContainer[0].clientHeight);
        domUtilityService.ScrollW = ($testContainer.width() - $testContainer[0].clientWidth);
        $testContainer.empty();
        //clear styles
        $testContainer.attr('style', '');
        //measure letter sizes using a pretty typical font size and fat font-family
        $testContainer.append('<span style="font-family: Verdana, Helvetica, Sans-Serif; font-size: 14px;"><strong>M</strong></span>');
        domUtilityService.LetterW = $testContainer.children().first().width();
        $testContainer.remove();
    };
    domUtilityService.eventStorage = {};
    domUtilityService.AssignGridContainers = function(rootEl, grid) {
        grid.$root = $(rootEl);
        //Headers
        grid.$topPanel = grid.$root.find(".ngTopPanel");
        grid.$groupPanel = grid.$root.find(".ngGroupPanel");
        grid.$headerContainer = grid.$topPanel.find(".ngHeaderContainer");
        grid.$headerScroller = grid.$topPanel.find(".ngHeaderScroller");
        grid.$headers = grid.$headerScroller.children();
        //Viewport
        grid.$viewport = grid.$root.find(".ngViewport");
        //Canvas
        grid.$canvas = grid.$viewport.find(".ngCanvas");
        //Footers
        grid.$footerPanel = grid.$root.find(".ngFooterPanel");
        domUtilityService.UpdateGridLayout(grid);
    };
    domUtilityService.UpdateGridLayout = function(grid) {
        //catch this so we can return the viewer to their original scroll after the resize!
        var scrollTop = grid.$viewport.scrollTop();
        grid.elementDims.rootMaxW = grid.$root.width();
        grid.elementDims.rootMaxH = grid.$root.height();
        //check to see if anything has changed
        grid.refreshDomSizes();
        grid.adjustScrollTop(scrollTop, true); //ensure that the user stays scrolled where they were
    };
    domUtilityService.numberOfGrids = 0;
    domUtilityService.BuildStyles = function($scope, grid, digest) {
        var rowHeight = grid.config.rowHeight,
            $style = grid.$styleSheet,
            gridId = grid.gridId,
            css,
            cols = $scope.visibleColumns(),
            sumWidth = 0;

        if (!$style) {
            $style = $('#' + gridId);
            if (!$style[0]) {
                $style = $("<style id='" + gridId + "' type='text/css' rel='stylesheet' />").appendTo(grid.$root);
            }
        }
        $style.empty();
        var trw = $scope.totalRowWidth();
        css = "." + gridId + " .ngCanvas { width: " + trw + "px; }" +
            "." + gridId + " .ngRow { width: " + trw + "px; }" +
            "." + gridId + " .ngCanvas { width: " + trw + "px; }" +
            "." + gridId + " .ngHeaderScroller { width: " + (trw + domUtilityService.scrollH + 2) + "px}";
        angular.forEach(cols, function(col, i) {
            css += "." + gridId + " .col" + i + " { width: " + col.width + "px; left: " + sumWidth + "px; right: " + (trw - sumWidth - col.width) + "px; height: " + rowHeight + "px }" +
                "." + gridId + " .colt" + i + " { width: " + col.width + "px; }";
            sumWidth += col.width;
        });
        if (ng.utils.isIe) { // IE
            $style[0].styleSheet.cssText = css;
        } else {
            $style[0].appendChild(document.createTextNode(css));
        }
        grid.$styleSheet = $style;
        if (digest) {
            domUtilityService.digest($scope);
        }
    };

    domUtilityService.digest = function($scope) {
        if (!$scope.$$phase) {
            $scope.$digest();
        }
    };
    domUtilityService.ScrollH = 17; // default in IE, Chrome, & most browsers
    domUtilityService.ScrollW = 17; // default in IE, Chrome, & most browsers
    domUtilityService.LetterW = 10;
    getWidths();
    return domUtilityService;
});