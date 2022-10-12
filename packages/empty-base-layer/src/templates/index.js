angular.module('ui.grid.emptyBaseLayer').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ui-grid/emptyBaseLayerContainer', require('./emptyBaseLayerContainer.html'));
}]);
