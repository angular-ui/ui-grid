(function() {
	'use strict';

	var module = angular.module('ui.grid');

	module.directive('uiGridRenderContainer', ['$timeout', '$document', 'uiGridConstants', 'gridUtil', 'ScrollEvent',
		function($timeout, $document, uiGridConstants, gridUtil, ScrollEvent) {
			return {
				replace: true,
				transclude: true,
				templateUrl: 'ui-grid/uiGridRenderContainer',
				require: ['^uiGrid', 'uiGridRenderContainer'],
				scope: {
					containerId: '=',
					rowContainerName: '=',
					colContainerName: '=',
					bindScrollHorizontal: '=',
					bindScrollVertical: '=',
					enableVerticalScrollbar: '=',
					enableHorizontalScrollbar: '='
				},
				controller: 'uiGridRenderContainer as RenderContainer',
				compile: function() {
					return {
						pre: function prelink($scope, $elm, $attrs, controllers) {
							var rowContainer, colContainer, gridContainerPrefix,
								uiGridCtrl = controllers[0],
								containerCtrl = controllers[1],
								grid = $scope.grid = uiGridCtrl.grid,
								gridContainerId = 'grid-container';

							// Verify that the render container for this element exists
							if (!$scope.rowContainerName) {
								throw new Error('No row render container name specified');
							}
							if (!$scope.colContainerName) {
								throw new Error('No column render container name specified');
							}

							if (!grid.renderContainers[$scope.rowContainerName]) {
								throw new Error('Row render container "' + $scope.rowContainerName + '" is not registered.');
							}
							if (!grid.renderContainers[$scope.colContainerName]) {
								throw new Error('Column render container "' + $scope.colContainerName + '" is not registered.');
							}

							rowContainer = $scope.rowContainer = grid.renderContainers[$scope.rowContainerName];
							colContainer = $scope.colContainer = grid.renderContainers[$scope.colContainerName];
							gridContainerPrefix = $scope.containerId !== 'body' ? $scope.containerId + '-' : '';

							containerCtrl.gridContainerId = gridContainerPrefix + gridContainerId;
							containerCtrl.containerId = $scope.containerId;
							containerCtrl.rowContainer = rowContainer;
							containerCtrl.colContainer = colContainer;
							containerCtrl.grid = grid;
						},
						post: function postlink($scope, $elm, $attrs, controllers) {
							var uiGridCtrl = controllers[0],
								containerCtrl = controllers[1],
								grid = uiGridCtrl.grid,
								rowContainer = containerCtrl.rowContainer,
								colContainer = containerCtrl.colContainer,
								scrollTop = null,
								scrollLeft = null,
								renderContainer = grid.renderContainers[$scope.containerId];

							// Put the container name on this element as a class
							$elm.addClass('ui-grid-render-container-' + $scope.containerId);

							// Scroll the render container viewport when the mousewheel is used
							gridUtil.on.mousewheel($elm, function(event) {
								var scrollEvent = new ScrollEvent(grid, rowContainer, colContainer, ScrollEvent.Sources.RenderContainerMouseWheel);
								if (event.deltaY !== 0) {
									var scrollYAmount = event.deltaY * -1 * event.deltaFactor;

									scrollTop = containerCtrl.viewport[0].scrollTop;

									// Get the scroll percentage
									scrollEvent.verticalScrollLength = rowContainer.getVerticalScrollLength();
									var scrollYPercentage = (scrollTop + scrollYAmount) / scrollEvent.verticalScrollLength;

									// If we should be scrolled 100%, make sure the scrollTop matches the maximum scroll length
									//   Viewports that have "overflow: hidden" don't let the mousewheel scroll all the way to the bottom without this check
									if (scrollYPercentage >= 1 && scrollTop < scrollEvent.verticalScrollLength) {
										containerCtrl.viewport[0].scrollTop = scrollEvent.verticalScrollLength;
									}

									// Keep scrollPercentage within the range 0-1.
									if (scrollYPercentage < 0) { scrollYPercentage = 0; }
									else if (scrollYPercentage > 1) { scrollYPercentage = 1; }

									scrollEvent.y = {percentage: scrollYPercentage, pixels: scrollYAmount};
								}
								if (event.deltaX !== 0) {
									var scrollXAmount = event.deltaX * event.deltaFactor;

									// Get the scroll percentage
									scrollLeft = gridUtil.normalizeScrollLeft(containerCtrl.viewport, grid);
									scrollEvent.horizontalScrollLength = (colContainer.getCanvasWidth() - colContainer.getViewportWidth());
									var scrollXPercentage = (scrollLeft + scrollXAmount) / scrollEvent.horizontalScrollLength;

									// Keep scrollPercentage within the range 0-1.
									if (scrollXPercentage < 0) { scrollXPercentage = 0; }
									else if (scrollXPercentage > 1) { scrollXPercentage = 1; }

									scrollEvent.x = {percentage: scrollXPercentage, pixels: scrollXAmount};
								}

								// Let the parent container scroll if the grid is already at the top/bottom
								if ((event.deltaY !== 0 && (scrollEvent.atTop(scrollTop) || scrollEvent.atBottom(scrollTop))) ||
									(event.deltaX !== 0 && (scrollEvent.atLeft(scrollLeft) || scrollEvent.atRight(scrollLeft)))) {
									// parent controller scrolls
								}
								else {
									event.preventDefault();
									event.stopPropagation();
									scrollEvent.fireThrottledScrollingEvent('', scrollEvent);
								}

							});

							$elm.bind('$destroy', function() {
								var eventsToUnbind = ['touchstart', 'touchmove', 'touchend', 'keydown', 'wheel', 'mousewheel',
									'DomMouseScroll', 'MozMousePixelScroll'];

								eventsToUnbind.forEach(function(eventName) {
									$elm.unbind(eventName);
								});
							});

							// TODO(c0bra): Handle resizing the inner canvas based on the number of elements
							function update() {
								var ret = '';

								var canvasWidth = colContainer.canvasWidth;
								var viewportWidth = colContainer.getViewportWidth();

								var canvasHeight = rowContainer.getCanvasHeight();

								// add additional height for scrollbar on left and right container
								// if ($scope.containerId !== 'body') {
								//   canvasHeight -= grid.scrollbarHeight;
								// }

								var viewportHeight = rowContainer.getViewportHeight();
								// shorten the height to make room for a scrollbar placeholder
								if (colContainer.needsHScrollbarPlaceholder()) {
									viewportHeight -= grid.scrollbarHeight;
								}

								var headerViewportWidth,
									footerViewportWidth;
								headerViewportWidth = footerViewportWidth = colContainer.getHeaderViewportWidth();

								// Set canvas dimensions
								ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId
									+ ' .ui-grid-canvas { width: ' + canvasWidth + 'px; height: ' + canvasHeight + 'px; }';

								ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId
									+ ' .ui-grid-header-canvas { width: ' + (canvasWidth + grid.scrollbarWidth) + 'px; }';

								if (renderContainer.explicitHeaderCanvasHeight) {
									// get height from body container
									var reHCHeight = document.querySelector(
										'.grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-body .ui-grid-header-canvas');

									if (reHCHeight) {
										renderContainer.explicitHeaderCanvasHeight = reHCHeight.offsetHeight;
									}

									ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId
										+ ' .ui-grid-header-canvas { height: ' + renderContainer.explicitHeaderCanvasHeight + 'px; }';
								}
								else {
									ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId
										+ ' .ui-grid-header-canvas { height: inherit; }';
								}

								ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId
									+ ' .ui-grid-viewport { width: ' + viewportWidth + 'px; height: ' + viewportHeight + 'px; }';
								ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId
									+ ' .ui-grid-header-viewport { width: ' + headerViewportWidth + 'px; }';

								ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId
									+ ' .ui-grid-footer-canvas { width: ' + (canvasWidth + grid.scrollbarWidth) + 'px; }';
								ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId
									+ ' .ui-grid-footer-viewport { width: ' + footerViewportWidth + 'px; }';

								return ret;
							}

							uiGridCtrl.grid.registerStyleComputation({
								priority: 6,
								func: update
							});
						}
					};
				}
			};
		}]);

	module.controller('uiGridRenderContainer', ['$scope', 'gridUtil', function($scope, gridUtil) {
	}]);
})();
