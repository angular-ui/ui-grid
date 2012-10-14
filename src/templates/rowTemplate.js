kg.templates.generateRowTemplate = function (options) {
    var b = new ng.utils.StringBuilder(),
        cols = options.columns;
    b.append('<div ng-row="rowData" ng-click="toggleSelected" ng-class="{ \'kgSelected\': selected }">');
    angular.forEach(cols, function (col, i) {
        // check for the Selection Column
        if (col.field === SELECTED_PROP) {
            b.append('<div class="kgSelectionCell" ng-class="[\'kgCell\',\'col{0}]\']">', col.index);
            b.append('  <input type="checkbox" ng-checked="selected"/>');
            b.append('</div>');
        }
        // check for RowIndex Column
        else if (col.field === 'rowIndex') {
            b.append('<div class="kgRowIndexCell" ng-class="[\'kgCell\',\'col{0}]\']">{{rowIndex}}</div>', col.index);
        }
        // check for a Column with a Cell Template
        else if (col.hasCellTemplate) {
            // first pull the template
            var tmpl = kg.templateManager.getTemplateText(col.cellTemplate);
            // build the replacement text
            var replacer = "{{field}}' }";
            // run any changes on the template for re-usable templates
            tmpl = tmpl.replace(/\$cellClass/g, col.cellClass || 'kgEmpty');
            tmpl = tmpl.replace(/\$cellValue/g, col.field);
            tmpl = tmpl.replace(/\$cell/g, replacer);
            b.append(tmpl);
        }
        // finally just use a basic template for the cell
        else {
            b.append('  <div ng-class="[\'kgCell\',\'col{0}]\', \'{0}\']">{{field}}</div>', col.cellClass || 'kgEmpty',  col.index);
        }
    });
    b.append('</div>');
    return b.toString();
};