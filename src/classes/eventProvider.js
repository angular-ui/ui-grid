var ngEventProvider = function (grid, $scope, domUtilityService, $timeout) {
    var self = this;
    // The init method gets called during the ng-grid directive execution.
    self.colToMove = undefined;
    self.groupToMove = undefined;
    self.assignEvents = function() {
        // Here we set the onmousedown event handler to the header container.
        if (grid.config.jqueryUIDraggable && !grid.config.enablePinning) {
            grid.$groupPanel.droppable({
                addClasses: false,
                drop: function(event) {
                    self.onGroupDrop(event);
                }
            });

            grid.$groupPanel.on('$destroy', function() {
                grid.$groupPanel = null;
            });
        } else {
            grid.$groupPanel.on('mousedown', self.onGroupMouseDown).on('dragover', self.dragOver).on('drop', self.onGroupDrop);
            grid.$topPanel.on('mousedown', '.ngHeaderScroller', self.onHeaderMouseDown).on('dragover', '.ngHeaderScroller', self.dragOver);

            grid.$groupPanel.on('$destroy', function() {
                if (grid.$groupPanel){
                    grid.$groupPanel.off('mousedown');
                }

                grid.$groupPanel = null;
            });

            if (grid.config.enableColumnReordering) {
                grid.$topPanel.on('drop', '.ngHeaderScroller', self.onHeaderDrop);
            }

            grid.$topPanel.on('$destroy', function() {
                if (grid.$topPanel){
                    grid.$topPanel.off('mousedown');
                }

                if (grid.config.enableColumnReordering && grid.$topPanel) {
                    grid.$topPanel.off('drop');
                }

                grid.$topPanel = null;
            });
        }

        $scope.$on('$destroy', $scope.$watch('renderedColumns', function() {
            $timeout(self.setDraggables);
        }));
    };
    self.dragStart = function(evt){		
      //FireFox requires there to be dataTransfer if you want to drag and drop.
      evt.dataTransfer.setData('text', ''); //cannot be empty string
    };
    self.dragOver = function(evt) {
        evt.preventDefault();
    };
    //For JQueryUI
    self.setDraggables = function() {
        if (!grid.config.jqueryUIDraggable) {
            //Fix for FireFox. Instead of using jQuery on('dragstart', function) on find, we have to use addEventListeners for each column.
            var columns = grid.$root.find('.ngHeaderSortColumn'); //have to iterate if using addEventListener
            angular.forEach(columns, function(col){
                if(col.className && col.className.indexOf("ngHeaderSortColumn") !== -1){
                    col.setAttribute('draggable', 'true');
                    //jQuery 'on' function doesn't have  dataTransfer as part of event in handler unless added to event props, which is not recommended
                    //See more here: http://api.jquery.com/category/events/event-object/
                    if (col.addEventListener) { //IE8 doesn't have drag drop or event listeners
                        col.addEventListener('dragstart', self.dragStart);

                        angular.element(col).on('$destroy', function() {
                            angular.element(col).off('dragstart', self.dragStart);
                            col.removeEventListener('dragstart', self.dragStart);
                        });
                    }
                }
            });
            if (navigator.userAgent.indexOf("MSIE") !== -1){
                //call native IE dragDrop() to start dragging
                var sortColumn = grid.$root.find('.ngHeaderSortColumn');
                sortColumn.bind('selectstart', function () { 
                    this.dragDrop(); 
                    return false; 
                });
                angular.element(sortColumn).on('$destroy', function() {
                    sortColumn.off('selectstart');
                });
            }
        } else {
            if (grid.$root) {
                grid.$root.find('.ngHeaderSortColumn').draggable({
                    helper: 'clone',
                    appendTo: 'body',
                    stack: 'div',
                    addClasses: false,
                    start: function(event) {
                        self.onHeaderMouseDown(event);
                    }
                }).droppable({
                    drop: function(event) {
                        self.onHeaderDrop(event);
                    }
                });
            }
        }
    };
    self.onGroupMouseDown = function(event) {
        var groupItem = $(event.target);
        // Get the scope from the header container
        if (groupItem[0].className !== 'ngRemoveGroup') {
            var groupItemScope = angular.element(groupItem).scope();
            if (groupItemScope) {
                // set draggable events
                if (!grid.config.jqueryUIDraggable) {
                    groupItem.attr('draggable', 'true');
                    if(this.addEventListener){//IE8 doesn't have drag drop or event listeners
                        this.addEventListener('dragstart', self.dragStart); 

                        angular.element(this).on('$destroy', function() {
                            this.removeEventListener('dragstart', self.dragStart); 
                        });
                    }
                    if (navigator.userAgent.indexOf("MSIE") !== -1){
                        //call native IE dragDrop() to start dragging
                        groupItem.bind('selectstart', function () { 
                            this.dragDrop(); 
                            return false; 
                        });

                        groupItem.on('$destroy', function() {
                            groupItem.off('selectstart');
                        });
                    }
                }
                // Save the column for later.
                self.groupToMove = { header: groupItem, groupName: groupItemScope.group, index: groupItemScope.$index };
            }
        } else {
            self.groupToMove = undefined;
        }
    };
    self.onGroupDrop = function(event) {
        event.stopPropagation();
        // clear out the colToMove object
        var groupContainer;
        var groupScope;
        if (self.groupToMove) {
            // Get the closest header to where we dropped
            groupContainer = $(event.target).closest('.ngGroupElement'); // Get the scope from the header.
            if (groupContainer.context.className === 'ngGroupPanel') {
                $scope.configGroups.splice(self.groupToMove.index, 1);
                $scope.configGroups.push(self.groupToMove.groupName);
            } else {
                groupScope = angular.element(groupContainer).scope();
                if (groupScope) {
                    // If we have the same column, do nothing.
                    if (self.groupToMove.index !== groupScope.$index) {
                        // Splice the columns
                        $scope.configGroups.splice(self.groupToMove.index, 1);
                        $scope.configGroups.splice(groupScope.$index, 0, self.groupToMove.groupName);
                    }
                }
            }
            self.groupToMove = undefined;
            grid.fixGroupIndexes();
        } else if (self.colToMove) {
            if ($scope.configGroups.indexOf(self.colToMove.col) === -1) {
                groupContainer = $(event.target).closest('.ngGroupElement'); // Get the scope from the header.
                if (groupContainer.context.className === 'ngGroupPanel' || groupContainer.context.className === 'ngGroupPanelDescription ng-binding') {
                    $scope.groupBy(self.colToMove.col);
                } else {
                    groupScope = angular.element(groupContainer).scope();
                    if (groupScope) {
                        // Splice the columns
                        $scope.removeGroup(groupScope.$index);
                    }
                }
            }
            self.colToMove = undefined;
        }
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };
    //Header functions
    self.onHeaderMouseDown = function(event) {
        // Get the closest header container from where we clicked.
        var headerContainer = $(event.target).closest('.ngHeaderSortColumn');
        // Get the scope from the header container
        var headerScope = angular.element(headerContainer).scope();
        if (headerScope) {
            // Save the column for later.
            self.colToMove = { header: headerContainer, col: headerScope.col };
        }
    };
    self.onHeaderDrop = function(event) {
        if (!self.colToMove || self.colToMove.col.pinned) {
            return;
        }
        // Get the closest header to where we dropped
        var headerContainer = $(event.target).closest('.ngHeaderSortColumn');
        // Get the scope from the header.
        var headerScope = angular.element(headerContainer).scope();
        if (headerScope) {
            // If we have the same column or the target column is pinned, do nothing.
            if (self.colToMove.col === headerScope.col || headerScope.col.pinned) {
                return;
            }
            // Splice the columns
            $scope.columns.splice(self.colToMove.col.index, 1);
            $scope.columns.splice(headerScope.col.index, 0, self.colToMove.col);
            grid.fixColumnIndexes();
            // clear out the colToMove object
            self.colToMove = undefined;
            domUtilityService.digest($scope);
        }
    };

    self.assignGridEventHandlers = function() {
        //Chrome and firefox both need a tab index so the grid can recieve focus.
        //need to give the grid a tabindex if it doesn't already have one so
        //we'll just give it a tab index of the corresponding gridcache index 
        //that way we'll get the same result every time it is run.
        //configurable within the options.
        if (grid.config.tabIndex === -1) {
            grid.$viewport.attr('tabIndex', domUtilityService.numberOfGrids);
            domUtilityService.numberOfGrids++;
        } else {
            grid.$viewport.attr('tabIndex', grid.config.tabIndex);
        }
        // resize on window resize
        var windowThrottle;
        var windowResize = function(){
            clearTimeout(windowThrottle);
            windowThrottle = setTimeout(function() {
                //in function for IE8 compatibility
                domUtilityService.RebuildGrid($scope,grid);
            }, 100);
        };
        $(window).on('resize.nggrid', windowResize);
        // resize on parent resize as well.
        var parentThrottle;
        var parentResize = function() {
            clearTimeout(parentThrottle);
            parentThrottle = setTimeout(function() {
                //in function for IE8 compatibility
                domUtilityService.RebuildGrid($scope,grid);
            }, 100);
        };
        $(grid.$root.parent()).on('resize.nggrid', parentResize);

        $scope.$on('$destroy', function(){
            $(window).off('resize.nggrid', windowResize);
            // $(grid.$root.parent()).off('resize.nggrid', parentResize);
        });
    };
    // In this example we want to assign grid events.
    self.assignGridEventHandlers();
    self.assignEvents();
};
