(function() {
  'use strict';
  /**
   *  @ngdoc overview
   *  @name ui.grid.columnsFilters
   *
   *  @description
   *
   *  #ui.grid.columnsFilters
   *
   *  <div class="alert alert-warning" role="alert"><strong>Beta</strong> This feature is ready for testing, but it either hasn't seen a lot of use or has some known bugs.</div>
   *
   *  This module provides column filter in popup from the filter header cells.
   */
  var module = angular.module('ui.grid.columnsFilters', ['ui.grid']);

  /**
   *  @ngdoc object
   *  @name ui.grid.columnsFilters.constant:uiGridColumnsFiltersConstants
   *
   *  @description constants available in columnsFilters module.
   * 
   *  @property {string} featureName               - The name of the feature.
   *  @property {object} filterType                - {
      STRING: 'string',
      NUMBER: 'number',
      DATE: 'date',
      SELECT: 'select'
    }
    * @property {object} dateType                - {
      DATE: 'date',
      TIME: 'time',
      DATETIME: 'datetime-local',
      DATETIMELOCALE: 'datetime-locale'
    }
   *  @property {object} numberOperators                - {
      8: 'Exact',
      512: 'Not Equal',
      128: 'Less than',
      256: 'Less than or equal',
      32: 'More than',
      64: 'More than or equal'
    }
   * @property {object} dateOperators                - {
      8: 'Exact',
      512: 'Not Equal',
      128: 'Before',
      256: 'Before or equal',
      32: 'Later',
      64: 'Later or equal'
    }
   * @property {object} stringOperators                - {
      16: 'Contains',
      4: 'Ends With',
      8: 'Exact',
      512: 'Not Equal',
      2: 'Starts With'
    }
   * @property {object} selectOperators                - {
      16: 'Contains',
      4: 'Ends With',
      8: 'Exact',
      512: 'Not Equal',
      2: 'Starts With'
    }
   * @property {object} logics                - {
      "OR": 'Or',
      "AND": 'And'
    }
   * 
   */ 

  module.constant('uiGridColumnsFiltersConstants', {
    featureName: "columnsFilters",
    filterType: {
      STRING: 'string',
      NUMBER: 'number',
      DATE: 'date',
      SELECT: 'select'
    },
    dateTypes: {
      DATE: 'date',
      TIME: 'time',
      DATETIME: 'datetime-locale',
      DATETIMELOCALE: 'datetime-locale'
    },
    numberOperators: {
      8: 'Exact',
      512: 'Not Equal',
      128: 'Less than',
      256: 'Less than or equal',
      32: 'More than',
      64: 'More than or equal'
    },
    dateOperators: {
      8: 'Exact',
      512: 'Not Equal',
      128: 'Before',
      256: 'Before or equal',
      32: 'Later',
      64: 'Later or equal'
    },
    stringOperators: {
      16: 'Contains',
      4: 'Ends With',
      8: 'Exact',
      512: 'Not Equal',
      2: 'Starts With'
    },
    selectOperators: {
      16: 'Contains',
      4: 'Ends With',
      8: 'Exact',
      512: 'Not Equal',
      2: 'Starts With'
    },
    logics: {
      "OR": 'Or',
      "AND": 'And'
    }
  });

  /**
   *  @ngdoc service
   *  @name ui.grid.columnsFilters.service:uiGridColumnsFiltersService
   *
   *  @description Services for columnsFilters feature
   */
  /**
   *  @ngdoc object
   *  @name ui.grid.columnsFilters.api:ColumnDef
   *
   *  @description ColumnDef for column filter feature, these are available to be
   *  set using the ui-grid {@link ui.grid.class:GridOptions.columnDef gridOptions.columnDefs}
   * 
   * @property {object} columnFilter - Specific column columnsFilters definitions
   * @property {string} columnFilter.type  - can be: 'date', 'select', 'string', 'number'
   * @property {string} columnFilter.type  - can be: 'date', 'select', 'string', 'number'
   * @property {boolean} columnFilter.multiple   - Boolean stating is a select filter would show as multiple or singular choice
   * @property {object} columnFilter.selectOptions   - states the values of a select option (if needed)
   * @property {object} columnFilter.terms   - holds the search terms for every filter form
   * @property {object} columnFilter.logics  - holds the logics (and/or) for every filter form
   * @property {object} columnFilter.operators   - holds the operators (bigger than, smaller than etc.) for every filter form
   */
 
  module.service('uiGridColumnsFiltersService', ['$q', 'uiGridColumnsFiltersConstants', 'rowSearcher', 'GridRow', 'gridClassFactory', 'i18nService', 'uiGridConstants', 'rowSorter', '$templateCache',
    function ($q, uiGridColumnsFiltersConstants, rowSearcher, GridRow, gridClassFactory, i18nService, uiGridConstants, rowSorter, $templateCache) {
       
       var runColumnFilter = rowSearcher.runColumnFilter;
       
       function columnFilter(searchTerm, cellValue, row, column){
          var conditions = column.colDef.columnFilter.operators;
          var logics = column.colDef.columnFilter.logics;
          var filterPass = true;
          
          for (var i = 0; i < searchTerm.length; i++){
              var term = searchTerm[i];
              var newFilter = rowSearcher.setupFilters([{
                term: term, 
                condition: Number( conditions[i] ? conditions[i] : conditions[0] ),
                flags: {
                  caseSensitive: false
                }
              }])[0];
              // if we are on the second run check for "OR"
              if (i){
                  if ( angular.isDefined(logics) && logics[i-1] === 'OR' ){
                    return filterPass || runColumnFilter(row.grid, row, column, newFilter);
                  }
                  else {
                    return filterPass && runColumnFilter(row.grid, row, column, newFilter);
                  }
              }
              // TODO::check for the "select" condition in order to make sure we check for mulitple select
              filterPass = rowSearcher.runColumnFilter(row.grid, row, column, newFilter);
          }
          
          return filterPass;
       }
       
      var service = {
        initializeGrid: function (grid, $scope) {
         //add feature namespace and any properties to grid for needed
          /**
           *  @ngdoc object
           *  @name columnsFilters
           *  @name ui.grid.columnsFilters.api:Grid
           *
           *  @description Grid properties and functions added for columnsFilters
           *  
           *  @property {object} columnsFilters - object that holds global definitions
           */
          grid.columnsFilters = {
            currentColumn: undefined
          };

          angular.forEach(grid.options.columnDefs, function(colDef){
            if (colDef.enableFiltering !== false){
              var columnFilter = {
                  terms: [],
                  operators: [],
                  logics: []
              };
              
              if (angular.isUndefined(colDef.columnFilter)){
                colDef.columnFilter = columnFilter;
              }
              else {
                colDef.columnFilter = angular.merge({}, columnFilter, colDef.columnFilter);
              }
              colDef.filterHeaderTemplate = $templateCache.get('ui-grid/filterButton');
            }
            else {
              colDef.filterHeaderTemplate = '<span ng-if="::false"></span>';
            }
          });
        },
        /**
         * @ngdoc method
         * @methodOf ui.grid.columnsFilters.service:uiGridColumnsFiltersService
         * @name filterPopupStyle
         * @description Calculates the column filter's popup absolute position
         * @param {event} $event the event from the click event
         * @returns {object} and object with top and left styling expressions
         */
        filterPopupStyle: function($event){
          var rect = $event.target.parentElement.getClientRects()[0];
          return {
            top: document.body.scrollTop + (rect.height + rect.top) + 'px',
            left: rect.left + 'px'
          };
        },
        /**
         * @ngdoc method
         * @methodOf ui.grid.columnsFilters.service:uiGridColumnsFiltersService
         * @name filter
         * @description Sets the filter parameters of the column
         * @param {column} col - the column that is now being filtered
         */
        filter: function(col){
          var terms = col.colDef.columnFilter.terms;
          
          var logics = col.colDef.columnFilter.logics;
          
          // add the data into the filter object of the column
          // the terms array is the "term"
          col.filters[0].term = terms;
          
          // set condition as our filter function
          col.filters[0].condition = columnFilter;
                    
          // logic is new, so we will add it, and handle it in our override function
          col.filters[0].logic = logics;
          col.grid.api.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
        },
        /**
         * @ngdoc method
         * @methodOf ui.grid.columnsFilters.service:uiGridColumnsFiltersService
         * @name clear
         * @description Clears the filter parameters of the column
         * @param {column} col -  the column that is now being filtered
         */
        clear: function(col){
          col.filters[0].term.length = 0;
          col.filters[0].condition = undefined;
          col.grid.api.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );          
        }
      };
      
      return service;
  }]);
  
  module.directive('uiGridColumnsFiltersDirective', ['$compile', 'gridUtil', 'uiGridColumnsFiltersService', 'uiGridColumnsFiltersConstants', '$templateCache', '$document',
    function ($compile, gridUtil, uiGridColumnsFiltersService, uiGridColumnsFiltersConstants, $templateCache, $document) {
    return {
      require: 'uiGrid',
      scope: false,
      link: function ($scope, $elm, $attrs, uiGridCtrl) {
        uiGridColumnsFiltersService.initializeGrid(uiGridCtrl.grid, $scope);
      }
    };
    
    /**
    *  @ngdoc directive
    *  @name ui.grid.columnsFilters.directive:uiGridColumnFiltersDirective
    *
    *  @description directive for columnsFilters button in column header
    */
    
  }]);
  
  
  /**
    *  @ngdoc directive
    *  @name ui.grid.columnsFilters.directive.api:uiGridFilter
    *
    *  @description Extanding the uiGridFilter directive to prepare the column filter
    */
  module.directive('uiGridFilter', ['uiGridColumnsFiltersService', 'uiGridColumnsFiltersConstants', '$templateCache', '$compile',
      function(uiGridColumnsFiltersService, uiGridColumnsFiltersConstants, $templateCache, $compile){
      return {
        priority: 500,
        scope: false,
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          //TODO::need to decide if we work with the filter API when it is sufficient and only expand it...
          var currentColumn = $scope.col; // cache current column
          
          // if we're not supposed to filter this column, no need to activate filter for it...
          if (angular.isDefined(currentColumn.colDef.enableFiltering) && !currentColumn.colDef.enableFiltering) {
            return;
          }
          
          // get the filter type (default is string)
          var filterType = 'string';
          if (angular.isDefined(currentColumn.colDef.columnFilter) && angular.isDefined(currentColumn.colDef.columnFilter.type)){
            filterType = currentColumn.colDef.columnFilter.type;
          }
          else if (angular.isDefined(currentColumn.colDef.filter) && angular.isDefined(currentColumn.colDef.filter.type)){
            filterType = currentColumn.colDef.filter.type;
          }
          
          // get the filter popup template
          var thisFilterTemplate = 'ui-grid/filters/%%^^ColumnFilter'.replace('%%^^', filterType); // get the filter type template name
          var formElementsTemplate = $templateCache.get(thisFilterTemplate); 
          var popupTemplate = $templateCache.get('ui-grid/filterPopup').replace('<!-- content -->', formElementsTemplate); // get the full popup template
          
          // get the selection options if needed
          if (filterType === 'select'){
            currentColumn.colDef.columnFilter.logics = ["OR"];
            if (angular.isDefined(currentColumn.colDef.columnFilter) && angular.isDefined(currentColumn.colDef.columnFilter.selectOptions)){
              $scope.selectOptions = currentColumn.colDef.columnFilter.selectOptions;
            }
            else if (angular.isDefined(currentColumn.colDef.filter) && angular.isDefined(currentColumn.colDef.filter.selectOptions)){
              $scope.selectOptions = currentColumn.colDef.filter.selectOptions;
            }
            
            // remove multiple selection if needed - can be defined only in th e columnFilter right now
            if (angular.isDefined(currentColumn.colDef.columnFilter) && !currentColumn.colDef.columnFilter.multiple){
              popupTemplate = popupTemplate.replace('multiple', '');
              popupTemplate = popupTemplate.replace('.terms', '.terms[0]');
            }
          }
          
          $scope.filter = uiGridColumnsFiltersService.filter; // set the filtering function in the scope
          $scope.clear = uiGridColumnsFiltersService.clear; // set the clear filter function in the scope
          $scope.operators = uiGridColumnsFiltersConstants[filterType + 'Operators']; // set the operators in the scope
          $scope.logics = uiGridColumnsFiltersConstants.logics; // set the logics in the scope
          
          // toggle filter popup
          $scope.toggleFilter = function(){
            event.stopPropagation();
            event.preventDefault();
            
            if (currentColumn.grid.columnsFilters.currentColumn){
              // if we have an open filter
              angular.element(document.getElementById('uiGridFilterPopup')).remove(); //remove it
              if (angular.equals(currentColumn.grid.columnsFilters.currentColumn, currentColumn)){
                // if the same column that its filter shown is clicked, close it
                currentColumn.grid.columnsFilters.currentColumn = undefined; //clear the current open column popup                
                return;
              }
            }
            
            // open a popup
            currentColumn.grid.columnsFilters.currentColumn = currentColumn; // set the current opened columnFilter
            $scope.filterPopupStyle = uiGridColumnsFiltersService.filterPopupStyle(event); //set the style in the scope
            var popupElement = $compile(popupTemplate)($scope); // compile it
            angular.element(document.body).append(popupElement); // append to body
            
            angular.element(document.body).on('click', $scope.toggleFilter); // make sure the popup closes when clicking outside
            
            // make sure popup is not closing when clicking inside
            popupElement.on('click', function(){
              event.preventDefault();
              event.stopPropagation();
            });
            
            // remove the click events on destroy
            popupElement.on('$destroy', function(){
              popupElement.off('click');
              angular.element(document.body).off('click', $scope.toggleFilter);
            });
          };
        }
      };
    }]);
})();
