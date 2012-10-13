serviceModule.factory('GridService', ['$scope', function($scope) {
    var GridService = {};
    $scope.gridCache = {};
    
    $scope.getIndexOfCache = function(gridId) {
        var indx = -1;   
        for (var grid in $scope.gridCache) {
            indx++;
            if (!$scope.gridCache.hasOwnProperty(grid)) continue;
            return indx;
        }
        return indx;
    ﻿};
    
    GridService.initialize = function (){
        
    };
    GridService.StoreGrid = function (element, grid) {
        $scope.gridCache[grid.gridId] = grid;
        element[GRID_KEY] = grid.gridId;
    };
        
    GridService.RemoveGrid = function(gridId) {
        delete $scope.gridCache[gridId];
    };
    
    GridService.GetGrid = function (element) {
        var grid;
        if (element[GRID_KEY]) {
            grid = $scope.gridCache[element[GRID_KEY]];
        }
        return grid;
    };
    
    GridService.ClearGridCache = function () {
        $scope.gridCache = {};
    };
    
    GridService.AssignGridEventHandlers = function (grid) {
        grid.$viewport.scroll(function (e) {
            var scrollLeft = e.target.scrollLeft,
            scrollTop = e.target.scrollTop;
            grid.adjustScrollLeft(scrollLeft);
            grid.adjustScrollTop(scrollTop);
        });
        grid.$viewport.off('keydown');
        grid.$viewport.on('keydown', function (e) {
            return ng.moveSelectionHandler(grid, e);
        });
        //Chrome and firefox both need a tab index so the grid can recieve focus.
        //need to give the grid a tabindex if it doesn't already have one so
        //we'll just give it a tab index of the corresponding gridcache index 
        //that way we'll get the same result every time it is run.
        //configurable within the options.
        if (grid.config.tabIndex === -1){
            grid.$viewport.attr('tabIndex', $scope.getIndexOfCache(grid.gridId));
        } else {
            grid.$viewport.attr('tabIndex', grid.config.tabIndex);
        }
        //resize the grid on parent re-size events
        var $parent = grid.$root.parent();
        if ($parent.length == 0) {
            $parent = grid.$root;
        }
        $(window).resize(function () {
            var prevSizes = {
                rootMaxH: grid.elementDims.rootMaxH,
                rootMaxW: grid.elementDims.rootMaxW,
                rootMinH: grid.elementDims.rootMinH,
                rootMinW: grid.elementDims.rootMinW
            },
            scrollTop = 0,
            isDifferent = false;
            // first check to see if the grid is hidden... if it is, we will screw a bunch of things up by re-sizing
            var $hiddens = grid.$root.parents(":hidden");
            if ($hiddens.length > 0) {
                return;
            }
            //catch this so we can return the viewer to their original scroll after the resize!
            scrollTop = grid.$viewport.scrollTop();
            ng.domUtility.measureGrid(grid.$root, grid);
            //check to see if anything has changed
            if (prevSizes.rootMaxH !== grid.elementDims.rootMaxH && grid.elementDims.rootMaxH !== 0) { // if display: none is set, then these come back as zeros
                isDifferent = true;
            } else if (prevSizes.rootMaxW !== grid.elementDims.rootMaxW && grid.elementDims.rootMaxW !== 0) {
                isDifferent = true;
            } else if (prevSizes.rootMinH !== grid.elementDims.rootMinH) {
                isDifferent = true;
            } else if (prevSizes.rootMinW !== grid.elementDims.rootMinW) {
                isDifferent = true;
            } else {
                return;
            }
            if (isDifferent) {
                
                grid.refreshDomSizes();
                
                grid.adjustScrollTop(scrollTop, true); //ensure that the user stays scrolled where they were
            }
        });
    };
    return GridService;
}]);