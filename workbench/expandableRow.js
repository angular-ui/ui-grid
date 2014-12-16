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
        {id: '6', firstName: 'Frannie', lastName: 'Thomas', email: 'fran@gmail.com', age: '55', state: 'IL', sex: 'female'}
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
        singleDetailExpansionMode: true,        //not functional quite yet
        rowActionsConfig: {
            displayName: "Actions", showExpandButton: true,
            showEditButton: true, editRowCallback: editRow,
            showDeleteButton: true, deleteRowCallback: deleteRow
        }
    }
}