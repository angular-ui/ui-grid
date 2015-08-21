(function () {
  'use strict';

  var module = angular.module('ui.grid.odata', ['ui.grid']);

    /**
     *  @ngdoc filter
     *  @name ui.grid.odata.filter:EdmGeographyPoint
     *  @description Example filter for odata feature. It is used for Edm.GeographyPoint odata type.
     */
    module.filter('EdmGeographyPoint', function () {
        return function (input, coord) {
            if (input.coordinates && input.coordinates.length > 0) {
                return coord === 'x' ? 'x:' + input.coordinates[0].toFixed(2): 'y:' + input.coordinates[1].toFixed(2);
            }

            return input;
        };
    });

    /**
     *  @ngdoc service
     *  @name ui.grid.odata.service:uiGridODataService
     *  @description Service for odata feature.
     */
    module.service('uiGridODataService', ['$http', '$injector', '$templateCache', function ($http, $injector, $templateCache) {
        function format (text) {
            var args = arguments;
            if (!text) {
                return undefined;
            }
            return text.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {
                if (m === "{{") {
                    return "{";
                }
                if (m === "}}") {
                    return "}";
                }
                return args[parseInt(n, 10) + 1];
            });
        };

        function concat () {
            var i, j, res = [];
            for (i = 0; i < arguments.length; i++) {
                if (arguments[i]) {
                    for (j = 0; j < arguments[i].length; j++) {
                        if (arguments[i][j]) {
                            res.push(arguments[i][j]);
                        }
                    }
                }
            }
            return res;
        };

        function onRegisterApi (registerApiOrig, gridscope) {
            return function (gridApi) {
                if(!gridApi.odata) {
                    gridApi.registerEventsFromObject(publicApi.events);
                    gridApi.registerMethodsFromObject(publicApi.methods);
                }

                if (angular.isFunction(registerApiOrig)) {
                    registerApiOrig(gridApi);
                }

                gridApi.expandable.on.rowExpandedStateChanged(gridscope, function(row) {
                    var col = row.grid.options.columnDefs.filter(function (itm) {return itm.odata.expand === 'subgrid';})[0];
                    if (col) {
                        row.grid.options.odata.expandRow(row, col);
                    }
                });
            };
        };

        /**
         * @ngdoc method
         * @methodOf ui.grid.api.odata
         * @name expandRow
         * @description  Builds column definitions and data for subgrid (requires ui-grid-expandable directive).
         * @example
         * <pre>
         *     <div class="ui-grid-cell-contents"><a style="cursor:pointer" class="SubgridTemplate" ng-click="grid.options.odata.expandRow(row, col, rowRenderIndex, $event)">{{col.displayName}}</a></div>
         * </pre>
         * @param {row} grid row object
         * @param {col} grid col object (if missing, the first column references NavigationProperty or ComplexType is used)
         * @param {rowRenderIndex} grid row $index
         * @param {$event} grid $event
         */
        function expandRow (row, col, rowRenderIndex, $event) {
            var grid = row.grid;
            var colodata = col.colDef && col.colDef.odata || col.odata;

            if(row.entity.$$afterExpandRow) {
                row.entity.$$afterExpandRow = null;
                return;
            }

            var dataurl;
            var row_id = grid.options.odata.key ? row.entity[grid.options.odata.key] : rowRenderIndex;
            if (grid.options.odata.iscollection) {
                dataurl = format('{0}({1})/{2}', grid.options.odata.dataurl, row_id, col.name);
            }
            else {
                dataurl = format('{0}/{1}', grid.options.odata.dataurl, col.name);
            }

            var keyColumn = grid.options.odata.subgridCols[col.name].filter(function (itm) {return itm.odata.iskey;})[0];
            if (keyColumn) {
                keyColumn = keyColumn.name;
            }

            row.entity.subGridOptions = angular.merge({}, grid.options, {columnDefs: null, data: null});
            angular.merge(row.entity.subGridOptions, {
                columnDefs: grid.options.odata.subgridCols[col.name],
                odata: angular.merge({}, colodata, {
                    dataurl: dataurl,
                    entitySet: col.name,
                    key: keyColumn
                }),
                onRegisterApi: onRegisterApi(grid.options.onRegisterApi, grid.appScope)
            });

            row.entity.subGridOptions.enableExpandable =
                    row.entity.subGridOptions.odata.expandable === 'subgrid' &&
                    row.entity.subGridOptions.columnDefs.some(function (itm) {return itm.odata.expand === 'subgrid';})

            $http.get(row.entity.subGridOptions.odata.dataurl, {dataType: 'json'})
                .success(function (data) {
                    if (colodata.iscollection && !data.value) {
                        alert('data is empty');
                    }

                    row.entity.subGridOptions.data = data.value || [data];
                    row.entity.$$afterExpandRow = true;
                    if($event) {grid.api.expandable.toggleRowExpansion(row.entity);}
                });
        };

        var publicApi = {
            events: {
                odata: {
                    success: function(grid) {},
                    error: function (data, message) {}
                }
            },
            methods: {
                odata: {
                    parseMetadata: function (data, expandable) { return service.parseMetadata(data, expandable); },
                    genColumnDefs: function(grid, hasExpandable) { return service.genColumnDefs(grid, hasExpandable); }
                }
            }
        };

        var service = {
            /**
             * @ngdoc method
             * @methodOf ui.grid.odata.service:uiGridODataService
             * @name parseMetadata
             * @description  Parses odata $metadata in xml format to the plain javascript object.
             * <pre>
             *  $http.get('http://services.odata.org/V4/OData/OData.svc/$metadata', {dataType: 'xml'}).then(function (response) {
             *       var colModels = $this.parseMetadata(response.data, 'subgrid');
             *  });
             * </pre>
             * @param {data} odata $metadata in xml format
             * @param {expandable} the expantion type of the odata feature: subgrid,link,json
             */
            parseMetadata: function (data, expandable) {
                var entities = {}, complexes = {}, mdata = {}, i, j, n, cols, props, keys, key, namespace, entityType, attr, nullable;
                var isNum, isDate, isBool, entityValues = [], iskey, name, type, isComplex, isNavigation, isCollection;
                var numTypes = 'Edm.Int16,Edm.Int32,Edm.Int64,Edm.Decimal,Edm.Double,Edm.Single';
                var boolTypes = 'Edm.Byte,Edm.SByte';

                namespace = angular.element(data).find('Schema').attr('Namespace') + '.';
                var arr = angular.element(data).find('EntityContainer').find('EntitySet');
                for (i = 0; i < arr.length; i++) {
                    entities[angular.element(arr[i]).attr('EntityType').replace(namespace, '')] = angular.element(arr[i]).attr('Name');
                    entityValues.push(angular.element(arr[i]).attr('Name'));
                }

                arr = angular.element(data).find('ComplexType');
                for (i = 0; i < arr.length; i++) {
                    complexes[angular.element(arr[i]).attr('Name')] = angular.element(arr[i]).attr('Name');
                }

                arr = concat(arr, angular.element(data).find('EntityType'));
                for (i = 0; i < arr.length; i++) {
                    props = concat(angular.element(arr[i]).find('Property'), angular.element(arr[i]).find('NavigationProperty'));
                    keys = angular.element(arr[i]).find('Key').find('PropertyRef');
                    key = keys && keys.length > 0 ? angular.element(keys[0]).attr('Name') : '';
                    entityType = angular.element(arr[i]).attr('Name');

                    if (props) {
                        cols = [];
                        for (j = 0; j < props.length; j++) {
                            attr = {};
                            for (n = 0; n < props[j].attributes.length; n++) {
                                attr[props[j].attributes[n].name] = props[j].attributes[n].value;
                            }

                            iskey = attr.name === key;
                            name = attr.name;
                            type = attr.type;
                            nullable = attr.nullable;
                            isComplex = props[j].localName.toLowerCase() === 'property' && !!complexes[attr.name];
                            isNavigation = props[j].localName.toLowerCase() === 'navigationproperty';
                            isCollection = entityValues.some(function (itm) {
                                return itm === name;
                            });
                            isNum = numTypes.indexOf(type) >= 0;
                            isBool = boolTypes.indexOf(type) >= 0;
                            isDate = type && (type.indexOf('Edm.') >= 0 && (type.indexOf('Date') >= 0 || type.indexOf('Time') >= 0));

                            cols.push({
                                displayName: name,
                                field: name,
                                name: name,
                                type: (iskey || isNavigation || isComplex) ? 'object' : isNum ? 'number' : isDate ? 'date' : isBool ? 'boolean' : 'text',
                                cellFilter: $injector.has(type.replace('.', '') + 'Filter') ? type.replace('.', '') : isComplex ? 'json' : undefined,
                                headerCellTemplate: (isNavigation || isComplex) ? 'ui-grid/odataHeaderCellTemplateNavigation' : 'ui-grid/uiGridHeaderCell',
                                cellTemplate: isNavigation && expandable === 'subgrid' ? 'ui-grid/odataSubgridTemplate' :
                                    isNavigation && expandable === 'link' ? 'ui-grid/odataLinkTemplate' :
                                        ($templateCache.get('ui-grid/odata' + type.replace('.', '')) ? 'ui-grid/odata' + type.replace('.', '') : 'ui-grid/uiGridCell'),

                                odata: {
                                    expand: isNavigation ? expandable : isComplex ? 'json' : null,
                                    isnavigation: isNavigation,
                                    iscomplex: isComplex,
                                    iscollection: isCollection,
                                    iskey: iskey
                                }
                            });
                        }

                        if (entities[entityType]) {
                            mdata[entities[entityType]] = cols;
                        }
                        mdata[entityType] = cols;
                    }
                }

                return mdata;
            },

            /**
             * @ngdoc method
             * @methodOf ui.grid.odata.service:uiGridODataService
             * @name genColumnDefs
             * @description  Queries odata $metadata and builds grid.columnDefs, initializes ui-grid-expandable feature.
             * @param {grid} reference to the main grid
             * @param {hasExpandable} parameter is true when ui-grid-expandable directive is applied on the main grid.
             * @param {callback} callback function to be called instead of the default success event.
             */
            genColumnDefs: function (grid, hasExpandable, callback) {
                var $this = this;

                grid.options.odata = angular.merge({
                    metadataurl: grid.options.odata.dataurl + '/$metadata',
                    metadatatype: 'xml',
                    expandable: 'subgrid',
                    entitySet: null,
                    expandRow: function (row, col, rowRenderIndex, $event) {
                        return expandRow(row, col, rowRenderIndex, $event);
                    }
                }, grid.options.odata);

                grid.options.onRegisterApi = onRegisterApi(grid.options.onRegisterApi, grid.appScope);

                if (!grid.options.odata.entitySet) {
                    grid.api.odata.raise.error(null, 'entitySet cannot be empty');
                    return;
                }

                //https://cdn.rawgit.com/angular-ui/ui-grid.info/gh-pages/data/500_complex.json
                $http.get(grid.options.odata.metadataurl, {dataType: grid.options.odata.metadatatype})
                    .then(function (response) {
                        var colModels = $this.parseMetadata(response.data, grid.options.odata.expandable);
                        if (!colModels || !colModels[grid.options.odata.entitySet]) {
                            grid.api.odata.raise.error(null, 'failed to parse metadata');
                            return;
                        }

                        var keyColumn = colModels[grid.options.odata.entitySet].filter(function (itm) {return itm.odata.iskey;})[0];
                        if (keyColumn) {
                            keyColumn = keyColumn.name;
                        }

                        grid.options.enableExpandable =
                                grid.options.odata.expandable === 'subgrid' &&
                                colModels[grid.options.odata.entitySet].some(function (itm) {return itm.odata.expand === 'subgrid';});

                        if(grid.options.enableExpandable && !hasExpandable) {
                            grid.api.odata.raise.error(response, 'missing ui-grid-expandable directive');
                            grid.options.enableExpandable = false;
                        }

                        if(!grid.options.enableExpandable && grid.options.odata.expandable === 'subgrid') {
                            grid.options.odata.expandable = 'link';
                        }

                        if(grid.options.enableExpandable && !grid.options.expandableRowTemplate) {
                            grid.options.expandableRowTemplate = 'ui-grid/odataExpandableRowTemplate';
                        }

                        angular.merge(grid.options, {
                            odata: {
                                iscollection: true,
                                subgridCols: colModels,
                                key: keyColumn
                            },
                            columnDefs: angular.merge({}, colModels[grid.options.odata.entitySet], grid.options.columnDefs)
                        });

                        if(angular.isFunction(callback)) {
                            callback();
                        }
                        else {
                            grid.api.odata.raise.success(grid);
                        }
                    },
                    function (response) {
                        grid.api.odata.raise.error(response, 'failed to query $metadata');
                    });
            },

            /**
             * @ngdoc method
             * @methodOf ui.grid.odata.service:uiGridODataService
             * @name initialize
             * @description  Initilizes grid, calls for genColumnDefs when gencolumns=true and, finally queries for data.
             * @param {grid} reference to the main grid
             * @param {hasExpandable} parameter is true when ui-grid-expandable directive is applied on the main grid.
             */
            initializeGrid: function (grid, hasExpandable) {
                grid.api.registerEventsFromObject(publicApi.events);
                grid.api.registerMethodsFromObject(publicApi.methods);
                var $this = this;

                grid.options.odata = angular.merge({
                    datatype: 'json',
                    gencolumns: true
                }, grid.options.odata);

                var callback = function () {
                    $http.get(grid.options.odata.dataurl, {dataType: grid.options.odata.datatype})
                        .then(function (response) {
                            grid.options.data = response.data && response.data.value || [];
                            grid.api.odata.raise.success(grid);
                        },
                        function (response) {
                            grid.api.odata.raise.error(response, 'failed to query dataurl');
                        });
                };

                if (!grid.options.odata.dataurl) {
                    grid.api.odata.raise.error(null, 'dataurl cannot be empty');
                    return;
                }

                if (grid.options.odata.gencolumns) {
                    $this.genColumnDefs(grid, hasExpandable, callback);
                }
                else {
                    callback();
                }
            }
        };

        return service;
    }]);

    /**
     *  @ngdoc directive
     *  @name ui.grid.odata.directive:uiGridOdata
     *  @description stacks on the uiGrid directive to init grid for working with odata server.
     *  @example
     <example module="app">
     <file name="app.js">
     var app = angular.module('app', ['ui.grid', 'ui.grid.expandable', 'ui.grid.odata']);
     app.controller('MainCtrl', ['$scope', 'gridUtil', function ($scope, gridUtil) {
        $scope.myGrid = {
            expandableRowTemplate: 'ui-grid/odataExpandableRowTemplate',
            odata: {
                metadatatype: 'xml',
                datatype: 'json',
                expandable: 'link',
                entitySet: 'Products',
                dataurl: "http://services.odata.org/V4/OData/OData.svc/Products",
                metadataurl: 'http://services.odata.org/V4/OData/OData.svc/$metadata',
                gencolumns: true
            }
        };

        $scope.myGrid.onRegisterApi = function (gridApi) {
            gridApi.expandable.on.rowExpandedStateChanged($scope, function(row) {
                gridUtil.logDebug('expanded: ' + row.entity.Description);
            });

            gridApi.odata.on.success($scope, function(grid) {
                gridUtil.logDebug('succeeded');
            });

            gridApi.odata.on.error($scope, function(data, message) {
                gridUtil.logError(message);
            });
        };
     }]);
     </file>
     <file name="index.html">
     <div ng-controller="MainCtrl">
     <div id="grid1" ui-grid="myGrid" ui-grid-odata ui-grid-expandable></div>
     </div>
     </file>
     </example>
     */
    module.directive('uiGridOdata', ['uiGridODataService', function(uiGridODataService) {
        return {
            restrict: 'A',
            replace: true,
            priority: 0,
            require: '^uiGrid',
            scope: false,
            compile: function () {
                return {
                    pre: function ($scope, $elm, $attrs, uiGridCtrl) {
                        if (uiGridCtrl.grid.options.enableOdata !== false) {
                            var hasExpandable = 'uiGridExpandable' in $attrs;
                            uiGridODataService.initializeGrid(uiGridCtrl.grid, hasExpandable);
                        }
                    }
                };
            }
        };
    }]);
})();
