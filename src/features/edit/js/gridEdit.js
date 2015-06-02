(function () {
  'use strict';

  /**
   * @ngdoc overview
   * @name ui.grid.edit
   * @description
   *
   *  # ui.grid.edit
   * This module provides cell editing capability to ui.grid. The goal was to emulate keying data in a spreadsheet via
   * a keyboard.
   * <br/>
   * <br/>
   * To really get the full spreadsheet-like data entry, the ui.grid.cellNav module should be used. This will allow the
   * user to key data and then tab, arrow, or enter to the cells beside or below.
   *
   * <div doc-module-components="ui.grid.edit"></div>
   */

  var module = angular.module('ui.grid.edit', ['ui.grid']);

  /**
   *  @ngdoc object
   *  @name ui.grid.edit.constant:uiGridEditConstants
   *
   *  @description constants available in edit module
   */
  module.constant('uiGridEditConstants', {
    EDITABLE_CELL_TEMPLATE: /EDITABLE_CELL_TEMPLATE/g,
    //must be lowercase because template bulder converts to lower
    EDITABLE_CELL_DIRECTIVE: /editable_cell_directive/g,
    events: {
      BEGIN_CELL_EDIT: 'uiGridEventBeginCellEdit',
      END_CELL_EDIT: 'uiGridEventEndCellEdit',
      CANCEL_CELL_EDIT: 'uiGridEventCancelCellEdit'
    }
  });

  /**
   *  @ngdoc service
   *  @name ui.grid.edit.service:uiGridEditService
   *
   *  @description Services for editing features
   */
  module.service('uiGridEditService', ['$q', 'uiGridConstants', 'gridUtil',
    function ($q, uiGridConstants, gridUtil) {

      var service = {

        initializeGrid: function (grid) {

          service.defaultGridOptions(grid.options);

          grid.registerColumnBuilder(service.editColumnBuilder);
          grid.edit = {};

          /**
           *  @ngdoc object
           *  @name ui.grid.edit.api:PublicApi
           *
           *  @description Public Api for edit feature
           */
          var publicApi = {
            events: {
              edit: {
                /**
                 * @ngdoc event
                 * @name afterCellEdit
                 * @eventOf  ui.grid.edit.api:PublicApi
                 * @description raised when cell editing is complete
                 * <pre>
                 *      gridApi.edit.on.afterCellEdit(scope,function(rowEntity, colDef){})
                 * </pre>
                 * @param {object} rowEntity the options.data element that was edited
                 * @param {object} colDef the column that was edited
                 * @param {object} newValue new value
                 * @param {object} oldValue old value
                 */
                afterCellEdit: function (rowEntity, colDef, newValue, oldValue) {
                },
                /**
                 * @ngdoc event
                 * @name beginCellEdit
                 * @eventOf  ui.grid.edit.api:PublicApi
                 * @description raised when cell editing starts on a cell
                 * <pre>
                 *      gridApi.edit.on.beginCellEdit(scope,function(rowEntity, colDef){})
                 * </pre>
                 * @param {object} rowEntity the options.data element that was edited
                 * @param {object} colDef the column that was edited
                 */
                beginCellEdit: function (rowEntity, colDef) {
                },
                /**
                 * @ngdoc event
                 * @name cancelCellEdit
                 * @eventOf  ui.grid.edit.api:PublicApi
                 * @description raised when cell editing is cancelled on a cell
                 * <pre>
                 *      gridApi.edit.on.cancelCellEdit(scope,function(rowEntity, colDef){})
                 * </pre>
                 * @param {object} rowEntity the options.data element that was edited
                 * @param {object} colDef the column that was edited
                 */
                cancelCellEdit: function (rowEntity, colDef) {
                }
              }
            },
            methods: {
              edit: { }
            }
          };

          grid.api.registerEventsFromObject(publicApi.events);
          //grid.api.registerMethodsFromObject(publicApi.methods);

        },

        defaultGridOptions: function (gridOptions) {

          /**
           *  @ngdoc object
           *  @name ui.grid.edit.api:GridOptions
           *
           *  @description Options for configuring the edit feature, these are available to be
           *  set using the ui-grid {@link ui.grid.class:GridOptions gridOptions}
           */

          /**
           *  @ngdoc object
           *  @name enableCellEdit
           *  @propertyOf  ui.grid.edit.api:GridOptions
           *  @description If defined, sets the default value for the editable flag on each individual colDefs
           *  if their individual enableCellEdit configuration is not defined. Defaults to undefined.
           */

          /**
           *  @ngdoc object
           *  @name cellEditableCondition
           *  @propertyOf  ui.grid.edit.api:GridOptions
           *  @description If specified, either a value or function to be used by all columns before editing.
           *  If falsy, then editing of cell is not allowed.
           *  @example
           *  <pre>
           *  function($scope){
           *    //use $scope.row.entity and $scope.col.colDef to determine if editing is allowed
           *    return true;
           *  }
           *  </pre>
           */
          gridOptions.cellEditableCondition = gridOptions.cellEditableCondition === undefined ? true : gridOptions.cellEditableCondition;

          /**
           *  @ngdoc object
           *  @name editableCellTemplate
           *  @propertyOf  ui.grid.edit.api:GridOptions
           *  @description If specified, cellTemplate to use as the editor for all columns.
           *  <br/> defaults to 'ui-grid/cellTextEditor'
           */

          /**
           *  @ngdoc object
           *  @name enableCellEditOnFocus
           *  @propertyOf  ui.grid.edit.api:GridOptions
           *  @description If true, then editor is invoked as soon as cell receives focus. Default false.
           *  <br/>_requires cellNav feature and the edit feature to be enabled_
           */
            //enableCellEditOnFocus can only be used if cellnav module is used
          gridOptions.enableCellEditOnFocus = gridOptions.enableCellEditOnFocus === undefined ? false : gridOptions.enableCellEditOnFocus;
        },

        /**
         * @ngdoc service
         * @name editColumnBuilder
         * @methodOf ui.grid.edit.service:uiGridEditService
         * @description columnBuilder function that adds edit properties to grid column
         * @returns {promise} promise that will load any needed templates when resolved
         */
        editColumnBuilder: function (colDef, col, gridOptions) {

          var promises = [];

          /**
           *  @ngdoc object
           *  @name ui.grid.edit.api:ColumnDef
           *
           *  @description Column Definition for edit feature, these are available to be
           *  set using the ui-grid {@link ui.grid.class:GridOptions.columnDef gridOptions.columnDefs}
           */

          /**
           *  @ngdoc object
           *  @name enableCellEdit
           *  @propertyOf  ui.grid.edit.api:ColumnDef
           *  @description enable editing on column
           */
          colDef.enableCellEdit = colDef.enableCellEdit === undefined ? (gridOptions.enableCellEdit === undefined ?
            (colDef.type !== 'object') : gridOptions.enableCellEdit) : colDef.enableCellEdit;

          /**
           *  @ngdoc object
           *  @name cellEditableCondition
           *  @propertyOf  ui.grid.edit.api:ColumnDef
           *  @description If specified, either a value or function evaluated before editing cell.  If falsy, then editing of cell is not allowed.
           *  @example
           *  <pre>
           *  function($scope){
           *    //use $scope.row.entity and $scope.col.colDef to determine if editing is allowed
           *    return true;
           *  }
           *  </pre>
           */
          colDef.cellEditableCondition = colDef.cellEditableCondition === undefined ? gridOptions.cellEditableCondition :  colDef.cellEditableCondition;

          /**
           *  @ngdoc object
           *  @name editableCellTemplate
           *  @propertyOf  ui.grid.edit.api:ColumnDef
           *  @description cell template to be used when editing this column. Can be Url or text template
           *  <br/>Defaults to gridOptions.editableCellTemplate
           */
          if (colDef.enableCellEdit) {
            colDef.editableCellTemplate = colDef.editableCellTemplate || gridOptions.editableCellTemplate || 'ui-grid/cellEditor';

            promises.push(gridUtil.getTemplate(colDef.editableCellTemplate)
              .then(
              function (template) {
                col.editableCellTemplate = template;
              },
              function (res) {
                // Todo handle response error here?
                throw new Error("Couldn't fetch/use colDef.editableCellTemplate '" + colDef.editableCellTemplate + "'");
              }));
          }

          /**
           *  @ngdoc object
           *  @name enableCellEditOnFocus
           *  @propertyOf  ui.grid.edit.api:ColumnDef
           *  @requires ui.grid.cellNav
           *  @description If true, then editor is invoked as soon as cell receives focus. Default false.
           *  <br>_requires both the cellNav feature and the edit feature to be enabled_
           */
            //enableCellEditOnFocus can only be used if cellnav module is used
          colDef.enableCellEditOnFocus = colDef.enableCellEditOnFocus === undefined ? gridOptions.enableCellEditOnFocus : colDef.enableCellEditOnFocus;

          return $q.all(promises);
        },

        /**
         * @ngdoc service
         * @name isStartEditKey
         * @methodOf ui.grid.edit.service:uiGridEditService
         * @description  Determines if a keypress should start editing.  Decorate this service to override with your
         * own key events.  See service decorator in angular docs.
         * @param {Event} evt keydown event
         * @returns {boolean} true if an edit should start
         */
        isStartEditKey: function (evt) {
          if (evt.keyCode === uiGridConstants.keymap.LEFT ||
            (evt.keyCode === uiGridConstants.keymap.TAB && evt.shiftKey) ||

            evt.keyCode === uiGridConstants.keymap.RIGHT ||
            evt.keyCode === uiGridConstants.keymap.TAB ||

            evt.keyCode === uiGridConstants.keymap.UP ||
            (evt.keyCode === uiGridConstants.keymap.ENTER && evt.shiftKey) ||

            evt.keyCode === uiGridConstants.keymap.DOWN ||
            evt.keyCode === uiGridConstants.keymap.ENTER) {
            return false;

          }
          return true;
        }


      };

      return service;

    }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.edit.directive:uiGridEdit
   *  @element div
   *  @restrict A
   *
   *  @description Adds editing features to the ui-grid directive.
   *
   *  @example
   <example module="app">
   <file name="app.js">
   var app = angular.module('app', ['ui.grid', 'ui.grid.edit']);

   app.controller('MainCtrl', ['$scope', function ($scope) {
      $scope.data = [
        { name: 'Bob', title: 'CEO' },
            { name: 'Frank', title: 'Lowly Developer' }
      ];

      $scope.columnDefs = [
        {name: 'name', enableCellEdit: true},
        {name: 'title', enableCellEdit: true}
      ];
    }]);
   </file>
   <file name="index.html">
   <div ng-controller="MainCtrl">
   <div ui-grid="{ data: data, columnDefs: columnDefs }" ui-grid-edit></div>
   </div>
   </file>
   </example>
   */
  module.directive('uiGridEdit', ['gridUtil', 'uiGridEditService', function (gridUtil, uiGridEditService) {
    return {
      replace: true,
      priority: 0,
      require: '^uiGrid',
      scope: false,
      compile: function () {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl) {
            uiGridEditService.initializeGrid(uiGridCtrl.grid);
          },
          post: function ($scope, $elm, $attrs, uiGridCtrl) {
          }
        };
      }
    };
  }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.edit.directive:uiGridRenderContainer
   *  @element div
   *  @restrict A
   *
   *  @description Adds keydown listeners to renderContainer element so we can capture when to begin edits
   *
   */
  module.directive('uiGridViewport', [ 'uiGridEditConstants',
    function ( uiGridEditConstants) {
      return {
        replace: true,
        priority: -99998, //run before cellNav
        require: ['^uiGrid', '^uiGridRenderContainer'],
        scope: false,
        compile: function () {
          return {
            post: function ($scope, $elm, $attrs, controllers) {
              var uiGridCtrl = controllers[0];

              // Skip attaching if edit and cellNav is not enabled
              if (!uiGridCtrl.grid.api.edit || !uiGridCtrl.grid.api.cellNav) { return; }

              $scope.$on(uiGridEditConstants.events.CANCEL_CELL_EDIT, function () {
                $elm[0].focus();
              });
              $scope.$on(uiGridEditConstants.events.END_CELL_EDIT, function () {
                $elm[0].focus();
              });

            }
          };
        }
      };
    }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.edit.directive:uiGridCell
   *  @element div
   *  @restrict A
   *
   *  @description Stacks on top of ui.grid.uiGridCell to provide in-line editing capabilities to the cell
   *  Editing Actions.
   *
   *  Binds edit start events to the uiGridCell element.  When the events fire, the gridCell element is appended
   *  with the columnDef.editableCellTemplate element ('cellEditor.html' by default).
   *
   *  The editableCellTemplate should respond to uiGridEditConstants.events.BEGIN\_CELL\_EDIT angular event
   *  and do the initial steps needed to edit the cell (setfocus on input element, etc).
   *
   *  When the editableCellTemplate recognizes that the editing is ended (blur event, Enter key, etc.)
   *  it should emit the uiGridEditConstants.events.END\_CELL\_EDIT event.
   *
   *  If editableCellTemplate recognizes that the editing has been cancelled (esc key)
   *  it should emit the uiGridEditConstants.events.CANCEL\_CELL\_EDIT event.  The original value
   *  will be set back on the model by the uiGridCell directive.
   *
   *  Events that invoke editing:
   *    - dblclick
   *    - F2 keydown (when using cell selection)
   *
   *  Events that end editing:
   *    - Dependent on the specific editableCellTemplate
   *    - Standards should be blur and enter keydown
   *
   *  Events that cancel editing:
   *    - Dependent on the specific editableCellTemplate
   *    - Standards should be Esc keydown
   *
   *  Grid Events that end editing:
   *    - uiGridConstants.events.GRID_SCROLL
   *
   */

  /**
   *  @ngdoc object
   *  @name ui.grid.edit.api:GridRow
   *
   *  @description GridRow options for edit feature, these are available to be
   *  set internally only, by other features
   */

  /**
   *  @ngdoc object
   *  @name enableCellEdit
   *  @propertyOf  ui.grid.edit.api:GridRow
   *  @description enable editing on row, grouping for example might disable editing on group header rows
   */

  module.directive('uiGridCell',
    ['$compile', '$injector', '$timeout', 'uiGridConstants', 'uiGridEditConstants', 'gridUtil', '$parse', 'uiGridEditService', '$rootScope',
      function ($compile, $injector, $timeout, uiGridConstants, uiGridEditConstants, gridUtil, $parse, uiGridEditService, $rootScope) {
        var touchstartTimeout = 500;
        if ($injector.has('uiGridCellNavService')) {
          var uiGridCellNavService = $injector.get('uiGridCellNavService');
        }

        return {
          priority: -100, // run after default uiGridCell directive
          restrict: 'A',
          scope: false,
          require: '?^uiGrid',
          link: function ($scope, $elm, $attrs, uiGridCtrl) {
            if (!$scope.col.colDef.enableCellEdit || $scope.row.enableCellEdit === false) {
              return;
            }

            var html;
            var origCellValue;
            var inEdit = false;
            var cellModel;
            var cancelTouchstartTimeout;

            var editCellScope;
            var cellNavNavigateDereg = function() {};

            // Bind to keydown events in the render container
            if (uiGridCtrl && uiGridCtrl.grid.api.cellNav) {

              uiGridCtrl.grid.api.cellNav.on.viewPortKeyDown($scope, function (evt, rowCol) {
                if (rowCol === null) {
                  return;
                }

                if (rowCol.row === $scope.row && rowCol.col === $scope.col && !$scope.col.colDef.enableCellEditOnFocus) {
                  //important to do this before scrollToIfNecessary
                  beginEditKeyDown(evt);
                  uiGridCtrl.grid.api.core.scrollToIfNecessary(rowCol.row, rowCol.col);
                }

              });
            }


            registerBeginEditEvents();

            function registerBeginEditEvents() {
              $elm.on('dblclick', beginEdit);

              // Add touchstart handling. If the users starts a touch and it doesn't end after X milliseconds, then start the edit
              $elm.on('touchstart', touchStart);

              if (uiGridCtrl && uiGridCtrl.grid.api.cellNav) {
                cellNavNavigateDereg = uiGridCtrl.grid.api.cellNav.on.navigate($scope, function (newRowCol, oldRowCol) {
                  if ($scope.col.colDef.enableCellEditOnFocus) {
                    if (newRowCol.row === $scope.row && newRowCol.col === $scope.col) {
                      $timeout(function () {
                        beginEdit();
                      });
                    }
                  }
                });
              }



            }

            function touchStart(event) {
              // jQuery masks events
              if (typeof(event.originalEvent) !== 'undefined' && event.originalEvent !== undefined) {
                event = event.originalEvent;
              }

              // Bind touchend handler
              $elm.on('touchend', touchEnd);

              // Start a timeout
              cancelTouchstartTimeout = $timeout(function() { }, touchstartTimeout);

              // Timeout's done! Start the edit
              cancelTouchstartTimeout.then(function () {
                // Use setTimeout to start the edit because beginEdit expects to be outside of $digest
                setTimeout(beginEdit, 0);

                // Undbind the touchend handler, we don't need it anymore
                $elm.off('touchend', touchEnd);
              });
            }

            // Cancel any touchstart timeout
            function touchEnd(event) {
              $timeout.cancel(cancelTouchstartTimeout);
              $elm.off('touchend', touchEnd);
            }

            function cancelBeginEditEvents() {
              $elm.off('dblclick', beginEdit);
              $elm.off('keydown', beginEditKeyDown);
              $elm.off('touchstart', touchStart);
              cellNavNavigateDereg();
            }

            function beginEditKeyDown(evt) {
              if (uiGridEditService.isStartEditKey(evt)) {
                beginEdit();
              }
            }

            function shouldEdit(col, row) {
              return !row.isSaving &&
                ( angular.isFunction(col.colDef.cellEditableCondition) ?
                    col.colDef.cellEditableCondition($scope) :
                    col.colDef.cellEditableCondition );
            }


            /**
             *  @ngdoc property
             *  @name editDropdownOptionsArray
             *  @propertyOf ui.grid.edit.api:ColumnDef
             *  @description an array of values in the format
             *  [ {id: xxx, value: xxx} ], which is populated
             *  into the edit dropdown
             *
             */
            /**
             *  @ngdoc property
             *  @name editDropdownIdLabel
             *  @propertyOf ui.grid.edit.api:ColumnDef
             *  @description the label for the "id" field
             *  in the editDropdownOptionsArray.  Defaults
             *  to 'id'
             *  @example
             *  <pre>
             *    $scope.gridOptions = {
             *      columnDefs: [
             *        {name: 'status', editableCellTemplate: 'ui-grid/dropdownEditor',
             *          editDropdownOptionsArray: [{code: 1, status: 'active'}, {code: 2, status: 'inactive'}],
             *          editDropdownIdLabel: 'code', editDropdownValueLabel: 'status' }
             *      ],
             *  </pre>
             *
             */
            /**
             *  @ngdoc property
             *  @name editDropdownRowEntityOptionsArrayPath
             *  @propertyOf ui.grid.edit.api:ColumnDef
             *  @description a path to a property on row.entity containing an
             *  array of values in the format
             *  [ {id: xxx, value: xxx} ], which will be used to populate
             *  the edit dropdown.  This can be used when the dropdown values are dependent on
             *  the backing row entity.
             *  If this property is set then editDropdownOptionsArray will be ignored.
             *  @example
             *  <pre>
             *    $scope.gridOptions = {
             *      columnDefs: [
             *        {name: 'status', editableCellTemplate: 'ui-grid/dropdownEditor',
             *          editDropdownRowEntityOptionsArrayPath: 'foo.bars[0].baz',
             *          editDropdownIdLabel: 'code', editDropdownValueLabel: 'status' }
             *      ],
             *  </pre>
             *
             */
            /**
             *  @ngdoc property
             *  @name editDropdownValueLabel
             *  @propertyOf ui.grid.edit.api:ColumnDef
             *  @description the label for the "value" field
             *  in the editDropdownOptionsArray.  Defaults
             *  to 'value'
             *  @example
             *  <pre>
             *    $scope.gridOptions = {
             *      columnDefs: [
             *        {name: 'status', editableCellTemplate: 'ui-grid/dropdownEditor',
             *          editDropdownOptionsArray: [{code: 1, status: 'active'}, {code: 2, status: 'inactive'}],
             *          editDropdownIdLabel: 'code', editDropdownValueLabel: 'status' }
             *      ],
             *  </pre>
             *
             */
            /**
             *  @ngdoc property
             *  @name editDropdownFilter
             *  @propertyOf ui.grid.edit.api:ColumnDef
             *  @description A filter that you would like to apply to the values in the options list
             *  of the dropdown.  For example if you were using angular-translate you might set this
             *  to `'translate'`
             *  @example
             *  <pre>
             *    $scope.gridOptions = {
             *      columnDefs: [
             *        {name: 'status', editableCellTemplate: 'ui-grid/dropdownEditor',
             *          editDropdownOptionsArray: [{code: 1, status: 'active'}, {code: 2, status: 'inactive'}],
             *          editDropdownIdLabel: 'code', editDropdownValueLabel: 'status', editDropdownFilter: 'translate' }
             *      ],
             *  </pre>
             *
             */
            function beginEdit() {
              // If we are already editing, then just skip this so we don't try editing twice...
              if (inEdit) {
                return;
              }

              if (!shouldEdit($scope.col, $scope.row)) {
                return;
              }


              cellModel = $parse($scope.row.getQualifiedColField($scope.col));
              //get original value from the cell
              origCellValue = cellModel($scope);

              html = $scope.col.editableCellTemplate;
              html = html.replace(uiGridConstants.MODEL_COL_FIELD, $scope.row.getQualifiedColField($scope.col));

              var optionFilter = $scope.col.colDef.editDropdownFilter ? '|' + $scope.col.colDef.editDropdownFilter : '';
              html = html.replace(uiGridConstants.CUSTOM_FILTERS, optionFilter);

              var inputType = 'text';
              switch ($scope.col.colDef.type){
                case 'boolean':
                  inputType = 'checkbox';
                  break;
                case 'number':
                  inputType = 'number';
                  break;
                case 'date':
                  inputType = 'date';
                  break;
              }
              html = html.replace('INPUT_TYPE', inputType);

              var editDropdownRowEntityOptionsArrayPath = $scope.col.colDef.editDropdownRowEntityOptionsArrayPath;
              if (editDropdownRowEntityOptionsArrayPath) {
                $scope.editDropdownOptionsArray =  resolveObjectFromPath($scope.row.entity, editDropdownRowEntityOptionsArrayPath);
              }
              else {
                $scope.editDropdownOptionsArray = $scope.col.colDef.editDropdownOptionsArray;
              }
              $scope.editDropdownIdLabel = $scope.col.colDef.editDropdownIdLabel ? $scope.col.colDef.editDropdownIdLabel : 'id';
              $scope.editDropdownValueLabel = $scope.col.colDef.editDropdownValueLabel ? $scope.col.colDef.editDropdownValueLabel : 'value';

              var cellElement;
              var createEditor = function(){
                inEdit = true;
                cancelBeginEditEvents();
                var cellElement = angular.element(html);
                $elm.append(cellElement);
                editCellScope = $scope.$new();
                $compile(cellElement)(editCellScope);
                var gridCellContentsEl = angular.element($elm.children()[0]);
                gridCellContentsEl.addClass('ui-grid-cell-contents-hidden');
              };
              if (!$rootScope.$$phase) {
                $scope.$apply(createEditor);
              } else {
                createEditor();
              }

              //stop editing when grid is scrolled
              var deregOnGridScroll = $scope.col.grid.api.core.on.scrollBegin($scope, function () {
                endEdit(true);
                $scope.grid.api.edit.raise.afterCellEdit($scope.row.entity, $scope.col.colDef, cellModel($scope), origCellValue);
                deregOnGridScroll();
                deregOnEndCellEdit();
                deregOnCancelCellEdit();
              });

              //end editing
              var deregOnEndCellEdit = $scope.$on(uiGridEditConstants.events.END_CELL_EDIT, function (evt, retainFocus) {
                endEdit(retainFocus);
                $scope.grid.api.edit.raise.afterCellEdit($scope.row.entity, $scope.col.colDef, cellModel($scope), origCellValue);
                deregOnEndCellEdit();
                deregOnGridScroll();
                deregOnCancelCellEdit();
              });

              //cancel editing
              var deregOnCancelCellEdit = $scope.$on(uiGridEditConstants.events.CANCEL_CELL_EDIT, function () {
                cancelEdit();
                deregOnCancelCellEdit();
                deregOnGridScroll();
                deregOnEndCellEdit();
              });

              $scope.$broadcast(uiGridEditConstants.events.BEGIN_CELL_EDIT);
              $scope.grid.api.edit.raise.beginCellEdit($scope.row.entity, $scope.col.colDef);
            }

            function endEdit(retainFocus) {
              if (!inEdit) {
                return;
              }
              var gridCellContentsEl = angular.element($elm.children()[0]);
              //remove edit element
              editCellScope.$destroy();
              angular.element($elm.children()[1]).remove();
              gridCellContentsEl.removeClass('ui-grid-cell-contents-hidden');
              inEdit = false;
              registerBeginEditEvents();
              $scope.grid.api.core.notifyDataChange( uiGridConstants.dataChange.EDIT );
            }

            function cancelEdit() {
              if (!inEdit) {
                return;
              }
              cellModel.assign($scope, origCellValue);
              $scope.$apply();

              $scope.grid.api.edit.raise.cancelCellEdit($scope.row.entity, $scope.col.colDef);
              endEdit(true);
            }

            // resolves a string path against the given object
            // shamelessly borrowed from
            // http://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
            function resolveObjectFromPath(object, path) {
              path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
              path = path.replace(/^\./, '');           // strip a leading dot
              var a = path.split('.');
              while (a.length) {
                  var n = a.shift();
                  if (n in object) {
                      object = object[n];
                  } else {
                      return;
                  }
              }
              return object;
            }

          }
        };
      }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.edit.directive:uiGridEditor
   *  @element div
   *  @restrict A
   *
   *  @description input editor directive for editable fields.
   *  Provides EndEdit and CancelEdit events
   *
   *  Events that end editing:
   *     blur and enter keydown
   *
   *  Events that cancel editing:
   *    - Esc keydown
   *
   */
  module.directive('uiGridEditor',
    ['gridUtil', 'uiGridConstants', 'uiGridEditConstants','$timeout',
      function (gridUtil, uiGridConstants, uiGridEditConstants, $timeout) {
        return {
          scope: true,
          require: ['?^uiGrid', '?^uiGridRenderContainer'],
          compile: function () {
            return {
              pre: function ($scope, $elm, $attrs) {

              },
              post: function ($scope, $elm, $attrs, controllers) {
                var uiGridCtrl, renderContainerCtrl;
                if (controllers[0]) { uiGridCtrl = controllers[0]; }
                if (controllers[1]) { renderContainerCtrl = controllers[1]; }

                //set focus at start of edit
                $scope.$on(uiGridEditConstants.events.BEGIN_CELL_EDIT, function () {
                  $elm[0].focus();
                  $elm[0].select();

                  $elm.on('blur', function (evt) {
                    $scope.stopEdit(evt);
                  });
                });


                $scope.deepEdit = false;

                $scope.stopEdit = function (evt) {
                  if ($scope.inputForm && !$scope.inputForm.$valid) {
                    evt.stopPropagation();
                    $scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
                  }
                  else {
                    $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                  }
                  $scope.deepEdit = false;
                };

                $elm.on('click', function (evt) {
                  $scope.deepEdit = true;
                });

                $elm.on('keydown', function (evt) {
                  switch (evt.keyCode) {
                    case uiGridConstants.keymap.ESC:
                      evt.stopPropagation();
                      $scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
                      break;
                    case uiGridConstants.keymap.ENTER: // Enter (Leave Field)
                      $scope.stopEdit(evt);
                      break;
                    case uiGridConstants.keymap.TAB:
                      $scope.stopEdit(evt);
                      break;
                  }

                  if ($scope.deepEdit) {
                    switch (evt.keyCode) {
                      case uiGridConstants.keymap.LEFT:
                        evt.stopPropagation();
                        break;
                      case uiGridConstants.keymap.RIGHT:
                        evt.stopPropagation();
                        break;
                      case uiGridConstants.keymap.UP:
                        evt.stopPropagation();
                        break;
                      case uiGridConstants.keymap.DOWN:
                        evt.stopPropagation();
                        break;
                    }
                  }
                  // Pass the keydown event off to the cellNav service, if it exists
                  else if (uiGridCtrl && uiGridCtrl.grid.api.cellNav) {
                    evt.uiGridTargetRenderContainerId = renderContainerCtrl.containerId;
                    if (uiGridCtrl.cellNav.handleKeyDown(evt) !== null) {
                      $scope.stopEdit(evt);
                    }
                  }

                  return true;
                });
              }
            };
          }
        };
      }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.edit.directive:input
   *  @element input
   *  @restrict E
   *
   *  @description directive to provide binding between input[date] value and ng-model for angular 1.2
   *  It is similar to input[date] directive of angular 1.3
   *
   *  Supported date format for input is 'yyyy-MM-dd'
   *  The directive will set the $valid property of input element and the enclosing form to false if
   *  model is invalid date or value of input is entered wrong.
   *
   */
    module.directive('uiGridEditor', ['$filter', function ($filter) {
      function parseDateString(dateString) {
        if (typeof(dateString) === 'undefined' || dateString === '') {
          return null;
        }
        var parts = dateString.split('-');
        if (parts.length !== 3) {
          return null;
        }
        var year = parseInt(parts[0], 10);
        var month = parseInt(parts[1], 10);
        var day = parseInt(parts[2], 10);

        if (month < 1 || year < 1 || day < 1) {
          return null;
        }
        return new Date(year, (month - 1), day);
      }
      return {
        priority: -100, // run after default uiGridEditor directive
        require: '?ngModel',
        link: function (scope, element, attrs, ngModel) {

          if (angular.version.minor === 2 && attrs.type && attrs.type === 'date' && ngModel) {

            ngModel.$formatters.push(function (modelValue) {
              ngModel.$setValidity(null,(!modelValue || !isNaN(modelValue.getTime())));
              return $filter('date')(modelValue, 'yyyy-MM-dd');
            });

            ngModel.$parsers.push(function (viewValue) {
              if (viewValue && viewValue.length > 0) {
                var dateValue = parseDateString(viewValue);
                ngModel.$setValidity(null, (dateValue && !isNaN(dateValue.getTime())));
                return dateValue;
              }
              else {
                ngModel.$setValidity(null, true);
                return null;
              }
            });
          }
        }
      };
    }]);


  /**
   *  @ngdoc directive
   *  @name ui.grid.edit.directive:uiGridEditDropdown
   *  @element div
   *  @restrict A
   *
   *  @description dropdown editor for editable fields.
   *  Provides EndEdit and CancelEdit events
   *
   *  Events that end editing:
   *     blur and enter keydown, and any left/right nav
   *
   *  Events that cancel editing:
   *    - Esc keydown
   *
   */
  module.directive('uiGridEditDropdown',
    ['uiGridConstants', 'uiGridEditConstants',
      function (uiGridConstants, uiGridEditConstants) {
        return {
          scope: true,
          compile: function () {
            return {
              pre: function ($scope, $elm, $attrs) {

              },
              post: function ($scope, $elm, $attrs) {

                //set focus at start of edit
                $scope.$on(uiGridEditConstants.events.BEGIN_CELL_EDIT, function () {
                  $elm[0].focus();
                  $elm[0].style.width = ($elm[0].parentElement.offsetWidth - 1) + 'px';
                  $elm.on('blur', function (evt) {
                    $scope.stopEdit(evt);
                  });
                });


                $scope.stopEdit = function (evt) {
                  // no need to validate a dropdown - invalid values shouldn't be
                  // available in the list
                  $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                };

                $elm.on('keydown', function (evt) {
                  switch (evt.keyCode) {
                    case uiGridConstants.keymap.ESC:
                      evt.stopPropagation();
                      $scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
                      break;
                    case uiGridConstants.keymap.ENTER: // Enter (Leave Field)
                      $scope.stopEdit(evt);
                      break;
                    case uiGridConstants.keymap.LEFT:
                      $scope.stopEdit(evt);
                      break;
                    case uiGridConstants.keymap.RIGHT:
                      $scope.stopEdit(evt);
                      break;
                    case uiGridConstants.keymap.UP:
                      evt.stopPropagation();
                      break;
                    case uiGridConstants.keymap.DOWN:
                      evt.stopPropagation();
                      break;
                    case uiGridConstants.keymap.TAB:
                      $scope.stopEdit(evt);
                      break;
                  }
                  return true;
                });
              }
            };
          }
        };
      }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.edit.directive:uiGridEditor
   *  @element div
   *  @restrict A
   *
   *  @description input editor directive for editable fields.
   *  Provides EndEdit and CancelEdit events
   *
   *  Events that end editing:
   *     blur and enter keydown
   *
   *  Events that cancel editing:
   *    - Esc keydown
   *
   */
  module.directive('uiGridEditFileChooser',
    ['gridUtil', 'uiGridConstants', 'uiGridEditConstants','$timeout',
      function (gridUtil, uiGridConstants, uiGridEditConstants, $timeout) {
        return {
          scope: true,
          require: ['?^uiGrid', '?^uiGridRenderContainer'],
          compile: function () {
            return {
              pre: function ($scope, $elm, $attrs) {

              },
              post: function ($scope, $elm, $attrs, controllers) {
                var uiGridCtrl, renderContainerCtrl;
                if (controllers[0]) { uiGridCtrl = controllers[0]; }
                if (controllers[1]) { renderContainerCtrl = controllers[1]; }
                var grid = uiGridCtrl.grid;

                var handleFileSelect = function( event ){
                  var target = event.srcElement || event.target;
                  
                  if (target && target.files && target.files.length > 0) {
                    /**
                     *  @ngdoc property
                     *  @name editFileChooserCallback
                     *  @propertyOf  ui.grid.edit.api:ColumnDef
                     *  @description A function that should be called when any files have been chosen
                     *  by the user.  You should use this to process the files appropriately for your
                     *  application.
                     * 
                     *  It passes the gridCol, the gridRow (from which you can get gridRow.entity), 
                     *  and the files.  The files are in the format as returned from the file chooser,
                     *  an array of files, with each having useful information such as:
                     *  - `files[0].lastModifiedDate`
                     *  - `files[0].name`
                     *  - `files[0].size`  (appears to be in bytes)
                     *  - `files[0].type`  (MIME type by the looks)
                     * 
                     *  Typically you would do something with these files - most commonly you would 
                     *  use the filename or read the file itself in.  The example function does both.
                     *  
                     *  @example
                     *  <pre>
                     *  editFileChooserCallBack: function(gridRow, gridCol, files ){
                     *    // ignore all but the first file, it can only choose one anyway
                     *    // set the filename into this column
                     *    gridRow.entity.filename = file[0].name;
                     *    
                     *    // read the file and set it into a hidden column, which we may do stuff with later
                     *    var setFile = function(fileContent){
                     *      gridRow.entity.file = fileContent.currentTarget.result;
                     *    };
                     *    var reader = new FileReader();
                     *    reader.onload = setFile;
                     *    reader.readAsText( files[0] );
                     *  }
                     *  </pre>
                     */
                    if ( typeof($scope.col.colDef.editFileChooserCallback) === 'function' ) {
                      $scope.col.colDef.editFileChooserCallback($scope.row, $scope.col, target.files);
                    } else {
                      gridUtil.logError('You need to set colDef.editFileChooserCallback to use the file chooser');
                    }
                    
                    target.form.reset();
                    $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                  } else {
                    $scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
                  }
                };
      
                $elm[0].addEventListener('change', handleFileSelect, false);  // TODO: why the false on the end?  Google
                
                $scope.$on(uiGridEditConstants.events.BEGIN_CELL_EDIT, function () {
                  $elm[0].focus();
                  $elm[0].select();

                  $elm.on('blur', function (evt) {
                    $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                  });
                });
              }
            };
          }
        };
      }]);


})();
