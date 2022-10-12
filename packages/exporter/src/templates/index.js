angular.module('ui.grid.exporter').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ui-grid/csvLink', require('./csvLink.html'));
}]);
