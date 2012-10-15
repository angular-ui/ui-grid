ngGridDirectives.directive('ngRows', function factory(){
    var RowSubscription = function () {
        this.rowKey;
        this.rowIndex;
        this.node;
        this.subscription;
    };
    // figures out what rows already exist in DOM and 
    // what rows need to be added as new DOM nodes
    //
    // the 'currentNodeCache' is dictionary of currently existing
    // DOM nodes indexed by rowIndex
    var compareRows = function (rows, rowSubscriptions) {
        rowMap = {},
        newRows = [],
        rowSubscriptionsToRemove = [];
        
        //figure out what rows need to be added
        ko.utils.arrayForEach(rows, function (row) {
            rowMap[row.rowIndex] = row;
            
            // make sure that we create new rows when sorting/filtering happen.
            // The rowKey tells us whether the row for that rowIndex is different or not
            var possibleRow = rowSubscriptions[row.rowIndex];
            if (!possibleRow) {
                newRows.push(row);
            } else if (possibleRow.rowKey !== row.rowKey) {
                newRows.push(row);
            }
        });
        //figure out what needs to be deleted
        kg.utils.forIn(rowSubscriptions, function (rowSubscription, index) {
            
            //get the row we might be able to compare to
            var compareRow = rowMap[index];
            
            // if there is no compare row, we want to remove the row from the DOM
            // if there is a compare row and the rowKeys are different, we want to remove from the DOM
            //  bc its most likely due to sorting etc..
            if (!compareRow) {
                rowSubscriptionsToRemove.push(rowSubscription);
            } else if (compareRow.rowKey !== rowSubscription.rowKey) {
                rowSubscriptionsToRemove.push(rowSubscription);
            }
        });
        return {
            add: newRows,
            remove: rowSubscriptionsToRemove
        };
    };
    return function(scope, iElement, iAttrs){ //TODO: need to make this actually work.
        var rowManager = scope.rowManager,
        rows = scope.rows,
        grid = bindingContext.$data,
        rowChanges;
        //figure out what needs to change
        rowChanges = compareRows(rows, rowManager.rowSubscriptions || {});
        // FIRST!! We need to remove old ones in case we are sorting and simply replacing the data at the same rowIndex            
        ko.utils.arrayForEach(rowChanges.remove, function (rowSubscription) {
            if (rowSubscription.node) {
                ko.removeNode(rowSubscription.node);
            }
            rowSubscription.subscription.dispose();
            delete rowManager.rowSubscriptions[rowSubscription.rowIndex];
        });
        // and then we add the new row after removing the old rows
        ko.utils.arrayForEach(rowChanges.add, function (row) {
            var newBindingCtx,
            rowSubscription,
            divNode = document.createElement('DIV');
            //make sure the bindingContext of the template is the row and not the grid!
            newBindingCtx = bindingContext.createChildContext(row);
            //create a node in the DOM to replace, because KO doesn't give us a good hook to just do this...
            element.appendChild(divNode);
            //create a row subscription to add data to
            rowSubscription = new RowSubscription();
            rowSubscription.rowKey = row.rowKey;
            rowSubscription.rowIndex = row.rowIndex;
            rowManager.rowSubscriptions[row.rowIndex] = rowSubscription;
            rowSubscription.subscription = ko.renderTemplate(grid.config.rowTemplate, newBindingCtx, null, divNode, 'replaceNode');
        });
        //only measure the row and cell differences when data changes
        if (grid.elementsNeedMeasuring && grid.initPhase > 0) {
            //Measure the cell and row differences after rendering
            kg.domUtility.measureRow($(element), grid);
        }
    };
});
