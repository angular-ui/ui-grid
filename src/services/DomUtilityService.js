/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>
/// <reference path="../classes/range.js"/>

ngGridServices.factory('DomUtilityService', function () {
    var domUtilityService = {};
    var $testContainer = $('<div></div>'),
        self = this;
    var parsePixelString = function(pixelStr){
        if(!pixelStr){
            return 0;
        }
        var numStr = pixelStr.replace("/px/gi", "");
        var num = parseInt(numStr, 10);
        return isNaN(num) ? 0 : num;
    };
    domUtilityService.AssignGridContainers = function (rootEl, grid) {
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
    };
    domUtilityService.MeasureElementMaxDims = function ($container) {
        var dims = {};
        var $test = $("<div style='height: 20000px; width: 20000px;'></div>");
        $container.append($test);
        dims.maxWidth = $container.width();
        dims.maxHeight = $container.height();
        var pixelStr;
        if (!dims.maxWidth) {
            pixelStr = $container.css("max-width");
            dims.maxWidth = parsePixelString(pixelStr);
        }
        if (!dims.maxHeight) {
            pixelStr = $container.css("max-height");
            dims.maxHeight = parsePixelString(pixelStr);
        }
        //if they are zero, see what the parent's size is
        if (dims.maxWidth === 0) {
            dims.maxWidth = $container.parent().width();
        }
        if (dims.maxHeight === 0) {
            dims.maxHeight = $container.parent().height();
        }
        $test.remove();
        return dims;
    };

    domUtilityService.MeasureElementMinDims = function ($container) {
        var dims = { };
        $testContainer = $container.clone();
        $testContainer.appendTo($container.parent().first());
        dims.minWidth = 0;
        dims.minHeight = 0;
        //since its cloned... empty it out
        $testContainer.empty();
        var $test = $("<div style='height: 0x; width: 0px;'></div>");
        $testContainer.append($test);
        //$testContainer.wrap("<div style='width: 1px; height: 1px;'></div>");
        dims.minWidth = $testContainer.width();
        dims.minHeight = $testContainer.height();
        var pixelStr;
        if (!dims.minWidth) {
            pixelStr = $testContainer.css("min-width");
            dims.minWidth = parsePixelString(pixelStr);
        }
        if (!dims.minHeight) {
            pixelStr = $testContainer.css("min-height");
            dims.minHeight = parsePixelString(pixelStr);
        }
        $testContainer.remove();
        return dims;
    };

    domUtilityService.MeasureGrid = function ($container, grid) {
        //find max sizes
        var dims = domUtilityService.MeasureElementMaxDims($container);
        grid.elementDims.rootMaxW = dims.maxWidth;
        grid.elementDims.rootMaxH = dims.maxHeight;
        //set scroll measurements
        grid.elementDims.scrollW = domUtilityService.ScrollW;
        grid.elementDims.scrollH = domUtilityService.ScrollH;
        //find min sizes
        dims = domUtilityService.MeasureElementMinDims($container);
        grid.elementDims.rootMinW = dims.minWidth;
        // do a little magic here to ensure we always have a decent viewport
        dims.minHeight = Math.max(grid.elementDims.rootMaxH, dims.minHeight);
        grid.elementDims.rootMinH = dims.minHeight;
    };

    domUtilityService.MeasureRow = function ($canvas, grid) {
        var $row,
            $cell,
            isDummyRow,
            isDummyCell;
        $row = $canvas.children().first();
        if ($row.length === 0) {
            //add a dummy row
            $canvas.append('<div class="ngRow"></div>');
            $row = $canvas.children().first();
            isDummyRow = true;
        }
        $cell = $row.children().first();
        if ($cell.length === 0) {
            //add a dummy cell
            $row.append('<div class="ngCell col0"></div>');
            $cell = $row.children().first();
            isDummyCell = true;
        }
        grid.elementDims.rowWdiff = $row.outerWidth() - $row.width();
        grid.elementDims.rowHdiff = $row.outerHeight() - $row.height();
        grid.elementDims.cellWdiff = $cell.outerWidth() - $cell.width();
        grid.elementDims.cellHdiff = $cell.outerHeight() - $cell.height();
        grid.elementsNeedMeasuring = false;
        if (isDummyRow) {
            $row.remove();
        } else if (isDummyCell) {
            $cell.remove();
        }
    };
	
	domUtilityService.UpdateGridLayout = function(grid) {
		// first check to see if the grid is hidden... if it is, we will screw a bunch of things up by re-sizing
		if (grid.$root.parents(":hidden").length > 0) {
			return;
		}
		var prevSizes = {
			rootMaxH: grid.elementDims.rootMaxH,
			rootMaxW: grid.elementDims.rootMaxW,
			rootMinH: grid.elementDims.rootMinH,
			rootMinW: grid.elementDims.rootMinW
		};
		//catch this so we can return the viewer to their original scroll after the resize!
		var scrollTop = grid.$viewport.scrollTop();
		domUtilityService.MeasureGrid(grid.$root, grid);
		//check to see if anything has changed
		if ((prevSizes.rootMaxH !== grid.elementDims.rootMaxH && grid.elementDims.rootMaxH !== 0) ||  // if display: none is set, then these come back as zeros
			(prevSizes.rootMaxW !== grid.elementDims.rootMaxW && grid.elementDims.rootMaxW !== 0) || 
			 prevSizes.rootMinH !== grid.elementDims.rootMinH ||
			 prevSizes.rootMinW !== grid.elementDims.rootMinW) {
			grid.refreshDomSizes();
			grid.adjustScrollTop(scrollTop, true); //ensure that the user stays scrolled where they were
		} else {
			return;
		}
	};
	
	
    domUtilityService.BuildStyles = function($scope,grid,apply) {
        var rowHeight = (grid.config.rowHeight - grid.elementDims.rowHdiff),
            headerRowHeight = grid.config.headerRowHeight,
            $style = grid.$styleSheet,
            gridId = grid.gridId,
            css,
            cols = $scope.visibleColumns(),
            sumWidth = 0;
        
        if (!$style) $style = $("<style type='text/css' rel='stylesheet' />").appendTo($('html'));
        $style.empty();
        var trw = $scope.totalRowWidth();
        css = "." + gridId + " .ngCanvas { width: " + trw + "px; }"+
              "." + gridId + " .ngRow { width: " + trw + "px; }" +
              "." + gridId + " .ngCell { height: " + rowHeight + "px; }"+
              "." + gridId + " .ngCanvas { width: " + trw + "px; }" +
              "." + gridId + " .ngHeaderCell { top: 0; bottom: 0; }" + 
              "." + gridId + " .ngHeaderScroller { line-height: " + headerRowHeight + "px; width: " + (trw + domUtilityService.scrollH + 2) + "px}";
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
        if (apply) domUtilityService.apply($scope);
    };
	
    domUtilityService.apply = function($scope) {
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };
	
    domUtilityService.ScrollH = 17; // default in IE, Chrome, & most browsers
    domUtilityService.ScrollW = 17; // default in IE, Chrome, & most browsers
    domUtilityService.LetterW = 10;
    $(function () {
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
    });
	return domUtilityService;
});