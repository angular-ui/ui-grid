describe('ui.grid.selection uiGridSelectionService', function () {
    var uiGridSelectionService;
    var gridClassFactory;
    var grid;

    beforeEach(module('ui.grid.selection'));

    beforeEach(inject(function (_uiGridSelectionService_,_gridClassFactory_, $templateCache, _uiGridSelectionConstants_) {
        uiGridSelectionService = _uiGridSelectionService_;
        gridClassFactory = _gridClassFactory_;

        $templateCache.put('ui-grid/uiGridCell', '<div/>');
        $templateCache.put('ui-grid/editableCell', '<div editable_cell_directive></div>');

        grid = gridClassFactory.createGrid({});
        grid.options.columnDefs = [
            {field: 'col1', enableCellEdit: true}
        ];

        _uiGridSelectionService_.initializeGrid(grid);
        var data = [];
        for (var i = 0; i < 10; i++) {
            data.push({col1:'a_' + i});
        }
        grid.options.data = data;

        grid.buildColumns();
        grid.modifyRows(grid.options.data);
    }));
    

    describe('toggleSelection function', function () {
        it('should toggle selected with multiselect', function () {
            uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], true);
            expect(grid.rows[0].isSelected).toBe(true);

            uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], true);
            expect(grid.rows[0].isSelected).toBe(false);
        });

        it('should toggle selected without multiselect', function () {
            uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], false);
            expect(grid.rows[0].isSelected).toBe(true);

            uiGridSelectionService.toggleRowSelection(grid, grid.rows[1], false);
            expect(grid.rows[0].isSelected).toBe(false);
            expect(grid.rows[1].isSelected).toBe(true);
        });

        it('should toggle selected with noUnselect', function () {
            uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], false, true);
            expect(grid.rows[0].isSelected).toBe(true, 'row should be selected, noUnselect doesn\'t stop rows being selected');

            uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], false, true);
            expect(grid.rows[0].isSelected).toBe(true, 'row should still be selected, noUnselect prevents unselect');
            
            uiGridSelectionService.toggleRowSelection(grid, grid.rows[1], false, true);
            expect(grid.rows[0].isSelected).toBe(false, 'row should not be selected, noUnselect doesn\'t stop other rows being selected');
            expect(grid.rows[1].isSelected).toBe(true, 'new row should be selected');
        });

        it('should clear selected', function () {
            uiGridSelectionService.toggleRowSelection(grid, grid.rows[0]);
            expect(uiGridSelectionService.getSelectedRows(grid).length).toBe(1);
            uiGridSelectionService.clearSelectedRows(grid);
            expect(uiGridSelectionService.getSelectedRows(grid).length).toBe(0);
        });

        it('should utilize public apis', function () {
            grid.api.selection.toggleRowSelection(grid.rows[0].entity);
            expect(uiGridSelectionService.getSelectedRows(grid).length).toBe(1);
            grid.api.selection.clearSelectedRows();
            expect(uiGridSelectionService.getSelectedRows(grid).length).toBe(0);
        });
    });

    describe('shiftSelect function', function() {
        beforeEach(function() {
            grid.setVisibleRows(grid.rows);          
        });
        
        it('should select rows in between using shift key', function () {
            grid.api.selection.toggleRowSelection(grid.rows[2].entity);
            uiGridSelectionService.shiftSelect(grid, grid.rows[5], true);
            expect(grid.rows[2].isSelected).toBe(true);
            expect(grid.rows[3].isSelected).toBe(true);
            expect(grid.rows[4].isSelected).toBe(true);
            expect(grid.rows[5].isSelected).toBe(true);
        });

        it('should reverse selection order if from is bigger then to', function () {
            grid.api.selection.toggleRowSelection(grid.rows[5].entity);
            uiGridSelectionService.shiftSelect(grid, grid.rows[2], true);
            expect(grid.rows[2].isSelected).toBe(true);
            expect(grid.rows[3].isSelected).toBe(true);
            expect(grid.rows[4].isSelected).toBe(true);
            expect(grid.rows[5].isSelected).toBe(true);
        });

        it('should return if multiSelect is false', function () {
            uiGridSelectionService.shiftSelect(grid, grid.rows[2], false);
            expect(uiGridSelectionService.getSelectedRows(grid).length).toBe(0);
        });
    });
    
    describe('selectRow and unselectRow functions', function() {
        it('select then unselect rows, including selecting rows already selected and unselecting rows not selected', function () {
            grid.api.selection.selectRow(grid.rows[4].entity);
            expect(grid.rows[4].isSelected).toBe(true);
            
            grid.api.selection.selectRow(grid.rows[6].entity);
            expect(grid.rows[4].isSelected).toBe(true);
            expect(grid.rows[6].isSelected).toBe(true);

            grid.api.selection.selectRow(grid.rows[4].entity);
            expect(grid.rows[4].isSelected).toBe(true);
            expect(grid.rows[6].isSelected).toBe(true);
            
            grid.api.selection.unSelectRow(grid.rows[4].entity);
            expect(grid.rows[4].isSelected).toBe(false);
            expect(grid.rows[6].isSelected).toBe(true);

            grid.api.selection.unSelectRow(grid.rows[4].entity);
            expect(grid.rows[4].isSelected).toBe(false);
            expect(grid.rows[6].isSelected).toBe(true);

            grid.api.selection.unSelectRow(grid.rows[6].entity);
            expect(grid.rows[4].isSelected).toBe(false);
            expect(grid.rows[6].isSelected).toBe(false);
        });      
    });

    describe('selectAllRows and clearSelectedRows functions', function() {
        it('should select all rows, and select all rows when already all selected, then unselect again', function () {
            grid.api.selection.selectRow(grid.rows[4].entity);
            expect(grid.rows[4].isSelected).toBe(true);
            
            grid.api.selection.selectRow(grid.rows[6].entity);
            expect(grid.rows[4].isSelected).toBe(true);
            expect(grid.rows[6].isSelected).toBe(true);

            grid.api.selection.selectAllRows();
            for (var i = 0; i < 10; i++) {
                expect(grid.rows[i].isSelected).toBe(true);
            }

            grid.api.selection.selectAllRows();
            for (i = 0; i < 10; i++) {
                expect(grid.rows[i].isSelected).toBe(true);
            }
            
            grid.api.selection.clearSelectedRows();
            for (i = 0; i < 10; i++) {
                expect(grid.rows[i].isSelected).toBe(false);
            }
        });     
    });

    describe('selectAllVisibleRows function', function() {
        it('should select all visible rows', function () {
            grid.api.selection.selectRow(grid.rows[4].entity);
            expect(grid.rows[4].isSelected).toBe(true);
            
            grid.api.selection.selectRow(grid.rows[6].entity);
            expect(grid.rows[4].isSelected).toBe(true);
            expect(grid.rows[6].isSelected).toBe(true);

            grid.rows[3].visible = true;
            grid.rows[4].visible = true;
            grid.rows[6].visible = false;
            grid.rows[7].visible = true;
            grid.rows[9].visible = true;
            
            grid.api.selection.selectAllVisibleRows();
            expect(grid.rows[3].isSelected).toBe(true);
            expect(grid.rows[4].isSelected).toBe(true);
            expect(grid.rows[6].isSelected).toBe(false);
            expect(grid.rows[7].isSelected).toBe(true);
            expect(grid.rows[9].isSelected).toBe(true);
        });
    });


});