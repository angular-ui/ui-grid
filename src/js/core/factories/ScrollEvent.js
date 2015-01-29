(function () {
  angular.module('ui.grid')
    .factory('ScrollEvent', ['gridUtil', function (gridUtil) {

      /**
       * @ngdoc function
       * @name ui.grid.class:ScrollEvent
       * @description Model for all scrollEvents
       * @param {Grid} grid that owns the scroll event
       * @param {GridRenderContainer} sourceRowContainer that owns the scroll event. Can be null
       * @param {GridRenderContainer} sourceColContainer that owns the scroll event. Can be null
       * @param {string} source the source of the event - from uiGridConstants.scrollEventSources or a string value of directive/service/factory.functionName
       */
      function ScrollEvent(grid, sourceRowContainer, sourceColContainer, source) {
        var self = this;
        if (!grid) {
          throw new Error("grid argument is required");
        }

        /**
         *  @ngdoc object
         *  @name grid
         *  @propertyOf  ui.grid.class:ScrollEvent
         *  @description A reference back to the grid
         */
         self.grid = grid;



        /**
         *  @ngdoc object
         *  @name entity
         *  @propertyOf  ui.grid.class:ScrollEvent
         *  @description the source of the scroll event. limited to values from uiGridConstants.scrollEventSources
         */
        self.source = source;

        self.sourceRowContainer = sourceRowContainer;
        self.sourceColContainer = sourceColContainer;

        self.newScrollLeft = null;
        self.newScrollTop = null;
        self.x = null;
        self.y = null;


        /**
         *  @ngdoc function
         *  @name fireThrottledScrollingEvent
         *  @methodOf  ui.grid.class:ScrollEvent
         *  @description fires a throttled event using grid.api.core.raise.scrollEvent
         */
        self.fireThrottledScrollingEvent = gridUtil.throttle(function() {
          self.grid.api.core.raise.scrollEvent(self);
        }, self.grid.options.scrollThrottle, {trailing: true});

      }

      /**
       *  @ngdoc function
       *  @name fireScrollingEvent
       *  @methodOf  ui.grid.class:ScrollEvent
       *  @description fires an event using grid.api.core.raise.scrollEvent
       */
      ScrollEvent.prototype.fireScrollingEvent = function() {
        this.grid.api.core.raise.scrollEvent(this);
      };


      /**
       *  @ngdoc function
       *  @name getNewScrollLeft
       *  @methodOf  ui.grid.class:ScrollEvent
       *  @description returns newScrollLeft property if available; calculates a new value if it isn't
       */
      ScrollEvent.prototype.getNewScrollLeft = function(colContainer, viewport){
        var self = this;

        if (!self.newScrollLeft){
          var scrollWidth = (colContainer.getCanvasWidth() - colContainer.getViewportWidth());

          var oldScrollLeft = gridUtil.normalizeScrollLeft(viewport);

          var scrollXPercentage;
          if (typeof(self.x.percentage) !== 'undefined' && self.x.percentage !== undefined) {
            scrollXPercentage = self.x.percentage;
          }
          else if (typeof(self.x.pixels) !== 'undefined' && self.x.pixels !== undefined) {
            scrollXPercentage = self.x.percentage = (oldScrollLeft + self.x.pixels) / scrollWidth;
          }
          else {
            throw new Error("No percentage or pixel value provided for scroll event X axis");
          }

          return Math.max(0, scrollXPercentage * scrollWidth);
        }

        return self.newScrollLeft;
      };


      /**
       *  @ngdoc function
       *  @name getNewScrollTop
       *  @methodOf  ui.grid.class:ScrollEvent
       *  @description returns newScrollTop property if available; calculates a new value if it isn't
       */
      ScrollEvent.prototype.getNewScrollTop = function(rowContainer, viewport){
        var self = this;


        if (!self.newScrollTop){
          var scrollLength = rowContainer.getVerticalScrollLength();

          var oldScrollTop = viewport[0].scrollTop;

          var scrollYPercentage;
          if (typeof(self.y.percentage) !== 'undefined' && self.y.percentage !== undefined) {
            scrollYPercentage = self.y.percentage;
          }
          else if (typeof(self.y.pixels) !== 'undefined' && self.y.pixels !== undefined) {
            scrollYPercentage = self.y.percentage = (oldScrollTop + self.y.pixels) / scrollLength;
          }
          else {
            throw new Error("No percentage or pixel value provided for scroll event Y axis");
          }

          return Math.max(0, scrollYPercentage * scrollLength);
        }

        return self.newScrollTop;
      };


      ScrollEvent.Sources = {
        ViewPortScroll: 'ViewPortScroll',
        RenderContainerMouseWheel: 'RenderContainerMouseWheel',
        RenderContainerTouchMove: 'RenderContainerTouchMove',
        Other: 99
      };

      return ScrollEvent;
    }]);



})();