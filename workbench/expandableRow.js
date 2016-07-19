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
        {field: "firstName", displayName: "Name", fontWeight: 'bold'},
        {field: "email", displayName: "Email Address", textAlign: 'center', fontStyle: 'italic'},
        {field: "age", displayName: "Age", textAlign: 'right'},
        {field: 'date', displayName: 'Birthday', textAlign: 'right', cellFilter: "date:'MM/dd/yyyy'"},
        {field: "money", displayName:"Amount", textAlign: 'right', cellFilter: 'currency'},
        {showActionsColumn: true}
    ]

    $scope.myData = [
        {id: '6', firstName: 'Frannie', lastName: 'Thomas', money: '20', date:'11144006', email: 'fran@gmail.com', age: '55', state: 'IL', sex: 'female', details: 'None'},
        {id: '1', firstName: 'Adam', lastName: 'Gwin' ,money: '20.45654654', date:'123', email: 'gwin003@gmail.com', age: '26', state: 'PA', sex: 'male', details: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla eu ligula rhoncus, lobortis urna sit amet, vestibulum turpis. Donec id neque eget orci blandit sollicitudin. Nulla a lectus vel tortor congue ornare quis quis elit. Integer sit amet odio ut nibh dictum vehicula at a quam. Vestibulum hendrerit, nunc non laoreet feugiat, lacus sem finibus arcu, at auctor diam nunc quis sem. Proin vulputate faucibus blandit. Suspendisse potenti. Integer quis aliquet odio. Donec efficitur rhoncus arcu, a viverra erat commodo a. In hac habitasse platea dictumst. Donec sit amet libero mauris. Donec at cursus dolor. Morbi a orci sed ligula maximus facilisis. Fusce non lobortis erat, in cursus felis.'},
        {id: '2', firstName: 'Bob', lastName: 'Smith', money: '0', date:'1286', email: 'bob@gmail.com', age: '18', state: 'CA', sex: 'male', details: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla eu ligula rhoncus, lobortis urna sit amet, vestibulum turpis. Donec id neque eget orci blandit sollicitudin. Nulla a lectus vel tortor congue ornare quis quis elit. Integer sit amet odio ut nibh dictum vehicula at a quam. Vestibulum hendrerit, nunc non laoreet feugiat, lacus sem finibus arcu, at auctor diam nunc quis sem. Proin vulputate faucibus blandit. Suspendisse potenti. Integer quis aliquet odio. Donec efficitur rhoncus arcu, a viverra erat commodo a.'},
        {id: '3', firstName: 'Chris', lastName: 'Scott', money: '20', date:'128832366', email: 'chris@gmail.com', age: '42', state: 'NC', sex: 'male', details: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla eu ligula rhoncus, lobortis urna sit amet, vestibulum turpis. Donec id neque eget orci blandit sollicitudin. Nulla a lectus vel tortor congue ornare quis quis elit. Integer sit amet odio ut nibh dictum vehicula at a quam. Vestibulum hendrerit, nunc non laoreet feugiat, lacus sem finibus arcu, at auctor diam nunc quis sem. Proin vulputate faucibus blandit. Suspendisse potenti.'},
        {id: '4', firstName: 'Deb', lastName: 'Thomas', money: '20', date:'720159706', email: 'deb@gmail.com', age: '35', state: 'TX', sex: 'female', details: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla eu ligula rhoncus, lobortis urna sit amet, vestibulum turpis. Donec id neque eget orci blandit sollicitudin. Nulla a lectus vel tortor congue ornare quis quis elit. Integer sit amet odio ut nibh dictum vehicula at a quam.'},
        {id: '5', firstName: 'Ed', lastName: 'Reed', money: '20', date:'1359163006', email: 'ed@gmail.com', age: '21', state: 'ME', sex: 'male', details: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla eu ligula rhoncus, lobortis urna sit amet, vestibulum turpis. Donec id neque eget orci blandit sollicitudin.'},
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
        plugins: [plugin],
        detailHeight: 100,
        onColumnWidthResize: function () {

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

        if (opts != null) {
            if (opts.minHeight != null && (naturalHeight + extraHeight) < opts.minHeight) {
                naturalHeight = opts.minHeight - extraHeight - 2;
            }
            if (opts.maxHeight != null && (naturalHeight + extraHeight) > opts.maxHeight) {
                naturalHeight = opts.maxHeight;
            }
        }

        var newViewportHeight = Math.max(naturalHeight + 20, 100);

        self.grid.$viewport.css('height', newViewportHeight + 'px');
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