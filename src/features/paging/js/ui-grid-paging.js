(function() {
	'use strict';

	var module = angular.module('ui.grid.paging', ['ui.grid']);

	module.service('uiGridPagingService', ['gridUtil',
		function (gridUtil) {
			var service = {
				initializeGrid: function (grid) {
					service.defaultGridOptions(grid.options);

					var publicApi = {
						events: {
							paging: {
								pagingChanged: function ($scope, fn) { }
							}
						},
						methods: {
							paging: {

							}
						}
					};

					grid.api.registerEventsFromObject(publicApi.events);
					grid.api.registerMethodsFromObject(publicApi.methods);
				},
				defaultGridOptions: function (gridOptions) {
					gridOptions.enablePaging = gridOptions.enablePaging !== false;

					if (gridUtil.isNullOrUndefined(gridOptions.totalServerItems)) {
						gridOptions.totalServerItems = 0;
					}

					if (gridUtil.isNullOrUndefined(gridOptions.pagingOptions)) {
						gridOptions.pagingOptions = {
							pageSizes: [250, 500, 1000],
							pageSize: 250,
							currentPage: 1
						};
					}

					if (gridUtil.isNullOrUndefined(gridOptions.pagingOptions.currentPage)) {
						gridOptions.pagingOptions.currentPage = 1;
					}

				},
				onPagingChanged: function (grid) {
					grid.api.paging.raise.pagingChanged();
				}
			};
			return service;
		}
	]);

	module.directive('uiGridPaging', [
		'gridUtil', 'uiGridPagingService', function (gridUtil, uiGridPagingService) {
			var defaultTemplate = 'ui-grid/ui-grid-paging';

			return {
				priority: -200,
				scope: false,
				require: 'uiGrid',
				compile: function ($scope, $elm, $attr, uiGridCtrl) {
					return {
						pre: function ($scope, $elm, $attr, uiGridCtrl) {

							uiGridPagingService.initializeGrid(uiGridCtrl.grid);

							var pagingTemplate = uiGridCtrl.grid.options.pagingTemplate || defaultTemplate;
							gridUtil.getTemplate(pagingTemplate)
								.then(function (contents) {
									var template = angular.element(contents);
									$elm.append(template);
									uiGridCtrl.innerCompile(template);
								});
						},
						post: function ($scope, $elm, $attr, uiGridCtrl) {

						}
					};
				}
			};
		}
	]);

	module.directive('uiGridPager', [
		'uiGridPagingService', 'gridUtil', function (uiGridPagingService, gridUtil) {
			return {
				priority: -200,
				scope: true,
				require: '^uiGrid',
				link: function ($scope, $elm, $attr, uiGridCtrl) {

					uiGridCtrl.grid.renderContainers.body.registerViewportAdjuster(function (adjustment) {
						//adjustment.height = adjustment.height - gridUtil.elementHeight($elm);
						adjustment.height = adjustment.height - 35;
						return adjustment;
					});

					var options = $scope.grid.options;

					var setShowing = function () {
						$scope.showingLow = ((options.pagingOptions.currentPage - 1) * options.pagingOptions.pageSize) + 1;
						$scope.showingHigh = Math.min(options.pagingOptions.currentPage * options.pagingOptions.pageSize, options.totalServerItems);
					}

					var getMaxPages = function () {
						return (options.totalServerItems === 0)
							? 1
							: Math.ceil(options.totalServerItems / options.pagingOptions.pageSize);
					}

					var deregS = $scope.$watchGroup(['grid.options.totalServerItems', 'grid.options.pagingOptions.pageSize'], function () {
						$scope.currentMaxPages = getMaxPages();
						setShowing();
					});

					var deregP = $scope.$watchGroup(['grid.options.pagingOptions.currentPage', 'grid.options.pagingOptions.pageSize'], function (newValues, oldValues) {
						if (newValues === oldValues) return;

						if (!angular.isNumber(options.pagingOptions.currentPage) || options.pagingOptions.currentPage < 1) {
							options.pagingOptions.currentPage = 1;
							return;
						}

						if (options.totalServerItems > 0 && options.pagingOptions.currentPage > getMaxPages()) {
							options.pagingOptions.currentPage = getMaxPages();
							return;
						}

						setShowing();
						uiGridPagingService.onPagingChanged($scope.grid);
						console.log('fired');
					});

					$scope.$on('$destroy', function() {
						deregS();
						deregP();
					});

					$scope.pageForward = function () {
						if (options.totalServerItems > 0) {
							options.pagingOptions.currentPage = Math.min(options.pagingOptions.currentPage + 1, $scope.currentMaxPages);
						} else {
							options.pagingOptions.currentPage++;
						}
					}

					$scope.pageBackward = function () {
						options.pagingOptions.currentPage = Math.max(options.pagingOptions.currentPage - 1, 1);
					}

					$scope.pageToFirst = function () {
						options.pagingOptions.currentPage = 1;
					};

					$scope.pageToLast = function () {
						options.pagingOptions.currentPage = $scope.currentMaxPages;
					};

					$scope.cantPageForward = function () {
						if (options.totalServerItems > 0) {
							return options.pagingOptions.currentPage >= $scope.currentMaxPages;
						} else {
							return options.data.length < 1;
						}

					};
					$scope.cantPageToLast = function () {
						if (options.totalServerItems > 0) {
							return $scope.cantPageForward();
						} else {
							return true;
						}
					};
					$scope.cantPageBackward = function () {
						return options.pagingOptions.currentPage <= 1;
					};
				}
			};
		}
	]);
})();