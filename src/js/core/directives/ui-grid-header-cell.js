(function(){

angular.module('ui.grid').directive('uiGridHeaderCell', ['$log', '$parse', function ($log, $parse) {
  var uiGridHeaderCell = {
    priority: 0,
    scope: {
      col: '=',
      row: '=',
      renderIndex: '='
    },
    require: '?^uiGrid',
    templateUrl: 'ui-grid/uiGridHeaderCell',
    replace: true,
    link: function ($scope, $elm, $attrs, uiGridCtrl) {
      $scope.grid = uiGridCtrl.grid;
    }
  };

  return uiGridHeaderCell;
}]);

})();