angular.module('ngGrid.services').factory('$domUtilityService',['$utilityService', '$window', function($utils, $window) {
    var domUtilityService = {};
    var regexCache = {};
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
    domUtilityService.AssignGridContainers = function($scope, rootEl, grid) {
        grid.$root = $(rootEl);
        //Headers
        grid.$topPanel = grid.$root.find(".ngTopPanel");
        grid.$groupPanel = grid.$root.find(".ngGroupPanel");
        grid.$headerContainer = grid.$topPanel.find(".ngHeaderContainer");
        $scope.$headerContainer = grid.$headerContainer;

        grid.$headerScroller = grid.$topPanel.find(".ngHeaderScroller");
        grid.$headers = grid.$headerScroller.children();
        //Viewport
        grid.$viewport = grid.$root.find(".ngViewport");
        //Canvas
        grid.$canvas = grid.$viewport.find(".ngCanvas");
        //Footers
        grid.$footerPanel = grid.$root.find(".ngFooterPanel");

        var scopeDereg = $scope.$watch(function () {
            return grid.$viewport.scrollLeft();
        }, function (newLeft) {
            return grid.$headerContainer.scrollLeft(newLeft);
        });

        $scope.$on('$destroy', function() {
            // Remove all references to DOM elements, otherwise we get memory leaks
            if(grid.$root) {
                $(grid.$root.parent()).off('resize.nggrid');

                grid.$root = null;
                grid.$topPanel = null;
                // grid.$groupPanel = null;
                grid.$headerContainer = null;
                // grid.$headerScroller = null;
                grid.$headers = null;
                grid.$canvas = null;
                grid.$footerPanel = null;
            }

            scopeDereg();
        });

        domUtilityService.UpdateGridLayout($scope, grid);
    };
    domUtilityService.getRealWidth = function (obj) {
        var width = 0;
        var props = { visibility: "hidden", display: "block" };
        var hiddenParents = obj.parents().andSelf().not(':visible');
        $.swap(hiddenParents[0], props, function () {
            width = obj.outerWidth();
        });
        return width;
    };
    domUtilityService.UpdateGridLayout = function($scope, grid) {
        if (!grid.$root){
            return;
        }
        //catch this so we can return the viewer to their original scroll after the resize!
        var scrollTop = grid.$viewport.scrollTop();
        grid.elementDims.rootMaxW = grid.$root.width();
        if (grid.$root.is(':hidden')) {
            grid.elementDims.rootMaxW = domUtilityService.getRealWidth(grid.$root);
        }
        grid.elementDims.rootMaxH = grid.$root.height();
        //check to see if anything has changed
        grid.refreshDomSizes();
        $scope.adjustScrollTop(scrollTop, true); //ensure that the user stays scrolled where they were
    };
    domUtilityService.numberOfGrids = 0;
    domUtilityService.setStyleText = function(grid, css) {
        var style = grid.styleSheet,
            gridId = grid.gridId,
            doc = $window.document;

        if (!style) {
            style = doc.getElementById(gridId);
        }
        if (!style) {
            style = doc.createElement('style');
            style.type = 'text/css';
            style.id = gridId;
            (doc.head || doc.getElementsByTagName('head')[0]).appendChild(style);
        }

        if (style.styleSheet && !style.sheet) {
            style.styleSheet.cssText = css;
        } else {
            style.innerHTML = css;
        }
        grid.styleSheet = style;
        grid.styleText = css;
    };
    domUtilityService.BuildStyles = function($scope, grid, digest) {
        var rowHeight = grid.config.rowHeight,
            gridId = grid.gridId,
            css,
            cols = $scope.columns,
            sumWidth = 0;

        var trw = $scope.totalRowWidth();
        css = "." + gridId + " .ngCanvas { width: " + trw + "px; }" +
            "." + gridId + " .ngRow { width: " + trw + "px; }" +
            "." + gridId + " .ngCanvas { width: " + trw + "px; }" +
            "." + gridId + " .ngHeaderScroller { width: " + (trw + domUtilityService.ScrollH) + "px}";

        for (var i = 0; i < cols.length; i++) {
            var col = cols[i];
            if (col.visible !== false) {
                css += "." + gridId + " .col" + i + " { width: " + col.width + "px; left: " + sumWidth + "px; height: " + rowHeight + "px }" +
                    "." + gridId + " .colt" + i + " { width: " + col.width + "px; }";
                sumWidth += col.width;
            }
        }
        domUtilityService.setStyleText(grid, css);

        $scope.adjustScrollLeft(grid.$viewport.scrollLeft());
        if (digest) {
            domUtilityService.digest($scope);
        }
    };
    domUtilityService.setColLeft = function(col, colLeft, grid) {
        if (grid.styleText) {
            var regex = regexCache[col.index];
            if (!regex) {
                regex = regexCache[col.index] = new RegExp(".col" + col.index + " { width: [0-9]+px; left: [0-9]+px");
            }
            var css = grid.styleText.replace(regex, ".col" + col.index + " { width: " + col.width + "px; left: " + colLeft + "px");
            domUtilityService.setStyleText(grid, css);
        }
    };
    domUtilityService.setColLeft.immediate = 1;
    domUtilityService.RebuildGrid = function($scope, grid){
        domUtilityService.UpdateGridLayout($scope, grid);
        if (grid.config.maintainColumnRatios == null || grid.config.maintainColumnRatios) {
            grid.configureColumnWidths();
        }
        $scope.adjustScrollLeft(grid.$viewport.scrollLeft());
        domUtilityService.BuildStyles($scope, grid, true);
    };

    domUtilityService.digest = function($scope) {
        if (!$scope.$root.$$phase) {
            $scope.$digest();
        }
    };
    domUtilityService.ScrollH = 17; // default in IE, Chrome, & most browsers
    domUtilityService.ScrollW = 17; // default in IE, Chrome, & most browsers
    domUtilityService.LetterW = 10;
    getWidths();
    return domUtilityService;
}]);