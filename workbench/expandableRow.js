/**
 * Created by adam_gwin on 12/11/2014.
 */
function expandableRowController($scope) {


    var editRow = function (row) {
        console.log('edit');
        console.log(row);
    }

    var deleteRow = function (row) {
        console.log('delete');
        console.log(row);
    }

    var defs = [
        {field: "id", displayName: "Id", visible: false},
        {field: "firstName", displayName: "Name"},
        {field: "email", displayName: "Email Address"},
        {field: "age", displayName: "Age"},
        {showActionsColumn: true}
    ]

    $scope.myData = [
        {id: '1', firstName: 'Adam', lastName: 'Gwin', email: 'gwin003@gmail.com', age: '26', state: 'PA', sex: 'male'},
        {id: '2', firstName: 'Bob', lastName: 'Smith', email: 'bob@gmail.com', age: '18', state: 'CA', sex: 'male'},
        {id: '3', firstName: 'Chris', lastName: 'Scott', email: 'chris@gmail.com', age: '42', state: 'NC', sex: 'male'},
        {id: '4', firstName: 'Deb', lastName: 'Thomas', email: 'deb@gmail.com', age: '35', state: 'TX', sex: 'female'},
        {id: '5', firstName: 'Ed', lastName: 'Reed', email: 'ed@gmail.com', age: '21', state: 'ME', sex: 'male'},
        {
            id: '6',
            firstName: 'Frannie',
            lastName: 'Thomas',
            email: 'fran@gmail.com',
            age: '55',
            state: 'IL',
            sex: 'female'
        }
    ]


    $scope.expand = function () {
        $scope.gridOptions.detailsExpanded = true;
    }

    $scope.collapse = function () {
        $scope.gridOptions.detailsExpanded = false;
    }

    var plugin = new ngGridFlexibleHeightPlugin();
    $scope.gridOptions = {
        data: 'myData',
        columnDefs: defs,
        enableScrollbars: false,
        enableRowSelection: true,
        multiSelect: false,
        enableSorting: true,
        //useExternalSorting: true,
        enablePaging: true,
        showFooter: true,
        enableColumnResize: true,
        //plugins: [plugin],
        onColumnWidthResize: function () {
            console.log('resize columns');
        },
        rowActionsConfig: {
            displayName: "Actions",
            showEditButton: true, editRowCallback: editRow, disableEditButton: true,
            showExpandButton: true, //disableExpandButton: true,
            showDeleteButton: true, deleteRowCallback: deleteRow, disableDeleteButton: true
        }
    }
}

function ngGridFlexibleHeightPlugin(opts) {
    var self = this;
    self.grid = null;
    self.scope = null;
    self.init = function (scope, grid, services) {
        self.domUtilityService = services.DomUtilityService;
        self.grid = grid;
        self.scope = scope;
        var recalcHeightForData = function () {
            setTimeout(innerRecalcForData, 10);
        };

        self.scope.catHashKeys = function () {
            var hash = '', idx;
            for (idx = 0; idx < self.scope.renderedRows.count; idx++) {
                hash += self.scope.renderedRows[idx].$$hashKey;
            }
            return hash;
        };
        self.scope.catRowCache = function(){
            var hash = '', idx;
            for (idx = 0; idx < self.grid.rowCache.length; idx++) {
                hash += self.grid.rowCache[idx].detailsExpanded;
            }
            return hash;
        }
        self.scope.$watch('catHashKeys()', innerRecalcForData);
        self.scope.$watch('catRowCache()', innerRecalcForData);
        self.scope.$watch(self.grid.config.data, recalcHeightForData);

        //setInterval(innerRecalcForData, 1000);
    };

    var innerRecalcForData = function () {
        if (!self.grid.$topPanel) return;

        var gridId = self.grid.gridId;
        var footerPanelSel = '.' + gridId + ' .ngFooterPanel';
        var extraHeight = self.grid.$topPanel.height() + $(footerPanelSel).height();
        var naturalHeight = self.grid.$canvas.height() + 1;

        var expandedRowsHeight = 0;
        angular.forEach(self.grid.rowCache, function(value, index){
            if(value.detailsExpanded){
                expandedRowsHeight += value.detailHeight();
            }
        });
        //extraHeight += expandedRowsHeight;

        if (opts != null) {
            if (opts.minHeight != null && (naturalHeight + extraHeight) < opts.minHeight) {
                naturalHeight = opts.minHeight - extraHeight - 2;
            }
            if (opts.maxHeight != null && (naturalHeight + extraHeight) > opts.maxHeight) {
                naturalHeight = opts.maxHeight;
            }
        }

        var newViewportHeight = Math.max(naturalHeight + 20, 100) + expandedRowsHeight;

        self.grid.$viewport.css('height', newViewportHeight + expandedRowsHeight + 'px');
        self.grid.$root.css('height', (newViewportHeight + extraHeight) + 'px');

        if (self.scope.baseViewportWidth) {
            self.grid.$viewport.css('width', self.scope.baseViewportWidth);
            self.grid.$root.css('width', self.scope.baseViewportWidth);
        }
        else
            self.scope.baseViewportWidth = self.grid.$viewport.width();

        self.scope.baseViewportHeight = newViewportHeight;
        self.domUtilityService.RebuildGrid(self.scope, self.grid);
    };
}