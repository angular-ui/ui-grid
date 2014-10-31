(function () {
  'use strict';

  /**
   * @ngdoc overview
   * @name ui.grid.pinning
   * @description
   *
   *  # ui.grid.pinning
   * This module provides column pinning to the end user via menu options in the column header
   * <br/>
   * <br/>
   *
   * <div doc-module-components="ui.grid.pinning"></div>
   */

  var module = angular.module('ui.grid.pinning', ['ui.grid']);

  module.service('uiGridPinningService', ['gridUtil', 'GridRenderContainer', 'i18nService', function (gridUtil, GridRenderContainer, i18nService) {
    var service = {

      initializeGrid: function (grid) {
        service.defaultGridOptions(grid.options);

        // Register a column builder to add new menu items for pinning left and right
        grid.registerColumnBuilder(service.pinningColumnBuilder);
      },

      defaultGridOptions: function (gridOptions) {
        //default option to true unless it was explicitly set to false
        /**
         *  @ngdoc object
         *  @name ui.grid.pinning.api:GridOptions
         *
         *  @description GridOptions for pinning feature, these are available to be  
           *  set using the ui-grid {@link ui.grid.class:GridOptions gridOptions}
         */

        /**
         *  @ngdoc object
         *  @name enableRowSelection
         *  @propertyOf  ui.grid.pinning.api:GridOptions
         *  @description Enable pinning for the entire grid.  
         *  <br/>Defaults to true
         */
        gridOptions.enablePinning = gridOptions.enablePinning !== false;

      },

      pinningColumnBuilder: function (colDef, col, gridOptions) {
        //default to true unless gridOptions or colDef is explicitly false

        /**
         *  @ngdoc object
         *  @name ui.grid.pinning.api:ColumnDef
         *
         *  @description ColumnDef for pinning feature, these are available to be 
         *  set using the ui-grid {@link ui.grid.class:GridOptions.columnDef gridOptions.columnDefs}
         */

        /**
         *  @ngdoc object
         *  @name enablePinning
         *  @propertyOf  ui.grid.pinning.api:ColumnDef
         *  @description Enable pinning for the individual column.  
         *  <br/>Defaults to true
         */
        colDef.enablePinning = colDef.enablePinning === undefined ? gridOptions.enablePinning : colDef.enablePinning;


        /**
         *  @ngdoc object
         *  @name pinnedLeft
         *  @propertyOf  ui.grid.pinning.api:ColumnDef
         *  @description Column is pinned left when grid is rendered
         *  <br/>Defaults to false
         */

        /**
         *  @ngdoc object
         *  @name pinnedRight
         *  @propertyOf  ui.grid.pinning.api:ColumnDef
         *  @description Column is pinned right when grid is rendered
         *  <br/>Defaults to false
         */
        if (colDef.pinnedLeft) {
          if (col.width === '*') {
            // Need to refresh so the width can be calculated.
            col.grid.refresh()
                .then(function () {
                    col.renderContainer = 'left';
                    // Need to calculate the width. If col.drawnWidth is used instead then the width
                    // will be 100% if it's the first column, 50% if it's the second etc.
                    col.width = col.grid.canvasWidth / col.grid.columns.length;
                    col.grid.createLeftContainer();
            });
          }
          else {
            col.renderContainer = 'left';
            col.grid.createLeftContainer();
          }
        }
        else if (colDef.pinnedRight) {
            if (col.width === '*') {
                // Need to refresh so the width can be calculated.
                col.grid.refresh()
                    .then(function () {
                        col.renderContainer = 'right';
                        // Need to calculate the width. If col.drawnWidth is used instead then the width
                        // will be 100% if it's the first column, 50% if it's the second etc.
                        col.width = col.grid.canvasWidth / col.grid.columns.length;
                        col.grid.createRightContainer();
                    });
            }
            else {
                col.renderContainer = 'right';
                col.grid.createRightContainer();
            }
        }

        if (!colDef.enablePinning) {
          return;
        }

        var pinColumnLeftAction = {
          title: i18nService.get().pinning.pinLeft,
          icon: 'ui-grid-icon-left-open',
          shown: function () {
            return typeof(this.context.col.renderContainer) === 'undefined' || !this.context.col.renderContainer || this.context.col.renderContainer !== 'left';
          },
          action: function () {
            this.context.col.renderContainer = 'left';
            this.context.col.width = this.context.col.drawnWidth;
            this.context.col.grid.createLeftContainer();

            // Need to call refresh twice; once to move our column over to the new render container and then
            //   a second time to update the grid viewport dimensions with our adjustments
            col.grid.refresh()
              .then(function () {
                col.grid.refresh();
              });
          }
        };

        var pinColumnRightAction = {
          title: i18nService.get().pinning.pinRight,
          icon: 'ui-grid-icon-right-open',
          shown: function () {
            return typeof(this.context.col.renderContainer) === 'undefined' || !this.context.col.renderContainer || this.context.col.renderContainer !== 'right';
          },
          action: function () {
            this.context.col.renderContainer = 'right';
            this.context.col.width = this.context.col.drawnWidth;
            this.context.col.grid.createRightContainer();


            // Need to call refresh twice; once to move our column over to the new render container and then
            //   a second time to update the grid viewport dimensions with our adjustments
            col.grid.refresh()
              .then(function () {
                col.grid.refresh();
              });
          }
        };

        var removePinAction = {
          title: i18nService.get().pinning.unpin,
          icon: 'ui-grid-icon-cancel',
          shown: function () {
            return typeof(this.context.col.renderContainer) !== 'undefined' && this.context.col.renderContainer !== null && this.context.col.renderContainer !== 'body';
          },
          action: function () {
            this.context.col.renderContainer = null;

            // Need to call refresh twice; once to move our column over to the new render container and then
            //   a second time to update the grid viewport dimensions with our adjustments
            col.grid.refresh()
              .then(function () {
                col.grid.refresh();
              });
          }
        };

        col.menuItems.push(pinColumnLeftAction);
        col.menuItems.push(pinColumnRightAction);
        col.menuItems.push(removePinAction);
      }
    };

    return service;
  }]);

  module.directive('uiGridPinning', ['gridUtil', 'uiGridPinningService',
    function (gridUtil, uiGridPinningService) {
      return {
        require: 'uiGrid',
        scope: false,
        compile: function () {
          return {
            pre: function ($scope, $elm, $attrs, uiGridCtrl) {
              uiGridPinningService.initializeGrid(uiGridCtrl.grid);
            },
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
            }
          };
        }
      };
    }]);


})();