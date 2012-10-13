kg.domUtility = (new function () {
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

    this.assignGridContainers = function (rootEl, grid) {

        grid.$root = $(rootEl);

        //Headers
        grid.$topPanel = $(".kgTopPanel", grid.$root[0]);
        grid.$headerContainer = $(".kgHeaderContainer", grid.$topPanel[0]);
        grid.$headerScroller = $(".kgHeaderScroller", grid.$headerContainer[0]);
        grid.$headers = grid.$headerContainer.children();

        //Viewport
        grid.$viewport = $(".kgViewport", grid.$root[0]);

        //Canvas
        grid.$canvas = $(".kgCanvas", grid.$viewport[0]);

        //Footers
        grid.$footerPanel = $(".kgFooterPanel", grid.$root[0]);
    };

    this.measureElementMaxDims = function ($container) {
        var dims = {};

        var $test = $("<div style='height: 20000px; width: 20000px;'></div>");

        $container.append($test);

        dims.maxWidth = $container.width();
        dims.maxHeight = $container.height();


        if (!dims.maxWidth) {
            var pixelStr = $container.css("max-width");
            dims.maxWidth = parsePixelString(pixelStr);
        }

        if (!dims.maxHeight) {
            var pixelStr = $container.css("max-height");
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

    this.measureElementMinDims = function ($container) {
        var dims = {},
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

        if (!dims.minWidth) {
            var pixelStr = $testContainer.css("min-width");            
            dims.minWidth = parsePixelString(pixelStr);
        }

        if (!dims.minHeight) {
            var pixelStr = $testContainer.css("min-height");
            dims.minHeight = parsePixelString(pixelStr);
        }

        $testContainer.remove();

        return dims;
    };

    this.measureGrid = function ($container, grid, measureMins) {

        //find max sizes
        var dims = self.measureElementMaxDims($container);

        grid.elementDims.rootMaxW = dims.maxWidth;
        grid.elementDims.rootMaxH = dims.maxHeight;

        //set scroll measurements
        grid.elementDims.scrollW = kg.domUtility.scrollW;
        grid.elementDims.scrollH = kg.domUtility.scrollH;

        //find min sizes
        dims = self.measureElementMinDims($container);

        grid.elementDims.rootMinW = dims.minWidth;

        // do a little magic here to ensure we always have a decent viewport
        dims.minHeight = Math.max(dims.minHeight, (grid.config.headerRowHeight + grid.config.footerRowHeight + (3 * grid.config.rowHeight)));
        dims.minHeight = Math.min(grid.elementDims.rootMaxH, dims.minHeight);

        grid.elementDims.rootMinH = dims.minHeight;
    };

    this.measureRow = function ($canvas, grid) {
        var $row,
            $cell,
            isDummyRow,
            isDummyCell;

        $row = $canvas.children().first();
        if ($row.length === 0) {
            //add a dummy row
            $canvas.append('<div class="kgRow"></div>');
            $row = $canvas.children().first();
            isDummyRow = true;
        }

        $cell = $row.children().first();
        if ($cell.length === 0) {
            //add a dummy cell
            $row.append('<div class="kgCell col0"></div>');
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

    this.scrollH = 17; // default in IE, Chrome, & most browsers
    this.scrollW = 17; // default in IE, Chrome, & most browsers
    this.letterW = 5;

    $(function () {
        $testContainer.appendTo('body');
        // 1. Run all the following measurements on startup!

        //measure Scroll Bars
        $testContainer.height(100).width(100).css("position", "absolute").css("overflow", "scroll");
        $testContainer.append('<div style="height: 400px; width: 400px;"></div>');

        self.scrollH = ($testContainer.height() - $testContainer[0].clientHeight);
        self.scrollW = ($testContainer.width() - $testContainer[0].clientWidth);

        $testContainer.empty();

        //clear styles
        $testContainer.attr('style', '');

        //measure letter sizes using a pretty typical font size and fat font-family
        $testContainer.append('<span style="font-family: Verdana, Helvetica, Sans-Serif; font-size: 14px;"><strong>M</strong></span>');

        self.letterW = $testContainer.children().first().width();

        $testContainer.remove();
    });

} ());