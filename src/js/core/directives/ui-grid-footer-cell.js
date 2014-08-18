(function(){
    'use strict';

    angular.module('ui.grid').directive('uiGridFooterCell', ['$log', '$timeout', '$window', '$document', 'gridUtil', 'uiGridConstants', function ($log, $timeout, $window, $document, gridUtil, uiGridConstants) {
        // Do stuff after mouse has been down this many ms on the header cell
        var mousedownTimeout = 500;

        var uiGridFooterCell = {
            priority: 0,
            scope: {
                col: '=',
                row: '=',
                renderIndex: '='
            },
            require: '?^uiGrid',
            templateUrl: 'ui-grid/uiGridFooterCell',
            replace: true,
            link: function ($scope, $elm, $attrs, uiGridCtrl) {
                $scope.grid = uiGridCtrl.grid;

                $elm.addClass($scope.col.getColClass(false));

                var $contentsElm = angular.element( $elm[0].querySelectorAll('.ui-grid-cell-contents') );
            }
        };

        return uiGridFooterCell;
    }]);

})();
