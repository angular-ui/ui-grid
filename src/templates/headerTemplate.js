﻿kg.templates.generateHeaderTemplate = function (options) {
    var b = new kg.utils.StringBuilder(),
        cols = options.columns,
        showFilter = options.showFilter;

    kg.utils.forEach(cols, function (col, i) {
        if (col.field === '__kg_selected__') {
            b.append('<div class="kgSelectionCell" data-bind="kgHeader: { value: \'{0}\' }, css: { \'kgNoSort\': {1} }">', col.field, !col.allowSort);
            b.append('  <input type="checkbox" data-bind="checked: $parent.toggleSelectAll"/>');
            b.append('</div>');
        } else if (col.field === 'rowIndex' && showFilter) {
            b.append('<div data-bind="kgHeader: { value: \'{0}\' }, css: { \'kgNoSort\': {1} }">', col.field, !col.allowSort);
            b.append('      <div title="Filter Results" class="kgFilterBtn openBtn" data-bind="visible: !$data.filterVisible(), click: $parent.showFilter_Click"></div>');
            b.append('      <div title="Close" class="kgFilterBtn closeBtn" data-bind="visible: $data.filterVisible, click: $parent.showFilter_Click"></div>');
            b.append('      <div title="Clear Filters" class="kgFilterBtn clearBtn" data-bind="visible: $data.filterVisible, click: $parent.clearFilter_Click"></div>');
            b.append('</div>');
        } else {
            b.append('<div data-bind="kgHeader: { value: \'{0}\' }, style: { width: $parent.columns()[{1}].width }, css: { \'kgNoSort\': {2} }">', col.field, i, !col.allowSort);
            b.append('</div>');
        }
    });

    return b.toString();
};
