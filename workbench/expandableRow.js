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
        {id: '1', firstName: 'Adam', email: 'gwin003@gmail.com', age: '26'},
        {id: '2', firstName: 'Bob', email: 'bob@gmail.com', age: '18'},
        {id: '3', firstName: 'Chris', email: 'chris@gmail.com', age: '42'},
        {id: '4', firstName: 'Dave', email: 'dave@gmail.com', age: '35'},
        {id: '5', firstName: 'Ed', email: 'ed@gmail.com', age: '21'},
        {id: '6', firstName: 'Frank', email: 'frank@gmail.com', age: '55'}
    ]


    $scope.expand = function () {
        $scope.gridOptions.detailsExpanded = true;
    }

    $scope.collapse = function () {
        $scope.gridOptions.detailsExpanded = false;
    }

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
        detailsExpanded: false,
        rowActionsConfig: {
            displayName: "Actions", showExpandButton: true,
            showEditButton: true, editRowCallback: editRow,
            showDeleteButton: true, deleteRowCallback: deleteRow
        }
    }
}