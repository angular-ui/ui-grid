ng.CellFactory = function (cols) {
    var colCache = cols,
        len = colCache.length;

    this.buildRowCells = function (row) {
        var cell,
            cells = [],
            col,
            i = 0;

        for (; i < len; i++) {
            col = colCache[i];

            cell = new ng.Cell(col);
            cell.row = row;
            //enabling nested property values in a viewmodel
            cell.data = ng.utils.getPropertyPath(col.field, row.entity); 
            cells.push(cell);
            row.cellMap[col.field] = cell;
        }
        row.cells(cells);

        return row;
    };
};