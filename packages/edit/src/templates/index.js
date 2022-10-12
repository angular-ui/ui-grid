angular.module('ui.grid.edit').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ui-grid/cellEditor', require('./cellEditor.html'));
  $templateCache.put('ui-grid/dropdownEditor', require('./dropdownEditor.html'));
  $templateCache.put('ui-grid/fileChooserEditor', require('./fileChooserEditor.html'));
}]);
