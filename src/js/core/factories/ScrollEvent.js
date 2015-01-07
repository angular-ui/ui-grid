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
       * @param {number} source the source of the event - from uiGridConstants.scrollEventSources
       */
      function ScrollEvent(grid, sourceRowContainer, sourceColContainer, source) {

        if (!grid) {
          throw new Error("grid argument is required");
        }

        /**
         *  @ngdoc object
         *  @name grid
         *  @propertyOf  ui.grid.class:GridRow
         *  @description A reference back to the grid
         */
         this.grid = grid;



        /**
         *  @ngdoc object
         *  @name entity
         *  @propertyOf  ui.grid.class:GridRow
         *  @description the source of the scroll event. limited to values from uiGridConstants.scrollEventSources
         */
        this.source = source;

        this.sourceRowContainer = sourceRowContainer;
        this.sourceColContainer = sourceColContainer;

        this.newScrollLeft = null;
        this.newScrollTop = null;
        this.x = null;
        this.y = null;

      }

      ScrollEvent.prototype.fireScrollingEvent = function() {
        this.grid.api.core.raise.scrollEvent(this);
      };

      //ScrollEvent.prototype.fireThrottledScrollingEvent = gridUtil.throttle(function(args) {
      //  this.grid.gridApi.core.raise.scrollEvent(args);
      //}, this.grid.options.scrollThrottle, {trailing: true});


      ScrollEvent.Sources = {
        ViewPortScroll: 0,
        RenderContainerMouseWheel:1,
        RenderContainerTouchMove: 2,
        Other: 99
      };

      return ScrollEvent;
    }]);



})();