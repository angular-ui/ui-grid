/*********************************************** 
* KoGrid JavaScript Library 
* Authors:  https://github.com/ericmbarnard/KoGrid/blob/master/README.md 
* License: MIT (http://www.opensource.org/licenses/mit-license.php) 
* Compiled At: 17:20:59.65 Fri 10/12/2012 
***********************************************/ 
(function(window, undefined){ 
 
 
/*********************************************** 
* FILE: ..\Src\Namespace.js 
***********************************************/ 
﻿
var kg = window['kg'] = {};
kg.templates = {}; 
 
 
/*********************************************** 
* FILE: ..\Src\Constants.js 
***********************************************/ 
﻿
var SELECTED_PROP = '__kg_selected__';
var GRID_TEMPLATE = 'koGridTmpl'; 
 
 
/*********************************************** 
* FILE: ..\src\Navigation.js 
***********************************************/ 
/// <reference path="../lib/jquery-1.7.js" />
/// <reference path="../lib/knockout-2.0.0.debug.js" />

//set event binding on the grid so we can select using the up/down keys
kg.moveSelectionHandler = function (grid, evt) {
    // null checks 
    if (grid === null || grid === undefined)
        return true;

    if (grid.config.selectedItems() === undefined)
        return true;
        
    var offset,
        charCode = (evt.which) ? evt.which : event.keyCode,
        ROW_KEY = '__kg_rowIndex__'; // constant for the entity's row's rowIndex

    // detect which direction for arrow keys to navigate the grid
    switch (charCode) {
        case 38:
            // up - select previous
            offset = -1;
            break;
        case 40:
            // down - select next
            offset = 1;
            break;
        default:
            return true;
    }

    var items = grid.finalData(),
        n = items.length,
        index = ko.utils.arrayIndexOf(items, grid.config.lastClickedRow().entity()) + offset,
        rowCache = grid.rowManager.rowCache,
        rowHeight = grid.config.rowHeight,
        currScroll = grid.$viewport.scrollTop(),
        row = null,
        selected = null,
        itemToView = null;

    // now find the item we arrowed to, and select it
    if (index >= 0 && index < n) {

        selected = items[index];
        row = rowCache[selected[ROW_KEY]];

        // fire the selection
        row.toggleSelected(null, evt);

        itemtoView = kg.utils.getElementsByClassName("kgSelected");

        // finally scroll it into view as we arrow through
        if (!Element.prototype.scrollIntoViewIfNeeded) {
            itemtoView[0].scrollIntoView(false);
            grid.$viewport.focus();
           
        } else {
            itemtoView[0].scrollIntoViewIfNeeded();
        }

        //grid.$viewport.scrollTop(currScroll + (offset * rowHeight));

        return false;
    }
};  
 
 
/*********************************************** 
* FILE: ..\Src\Labels.js 
***********************************************/ 
﻿kg.labels = {

}; 
 
 
/*********************************************** 
* FILE: ..\Src\Utils.js 
***********************************************/ 
﻿kg.utils = {

    forEach: function (arr, action) {
        var len = arr.length,
            i = 0;
        for (; i < len; i++) {
            if (arr[i] !== undefined) {
                action(arr[i], i);
            }
        }
    },

    forIn: function (obj, action) {
        var prop;

        for (prop in obj) {
            if(obj.hasOwnProperty(prop)){
                action(obj[prop], prop);
            }
        }
    },
        
    endsWith: function (str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    },
    
    StringBuilder: function () {
        var strArr = [];
        
        this.append = function (str, data) {
            var len = arguments.length,
                intMatch = 0,
                strMatch = '{0}',
                i = 1;

            if (len > 1) { // they provided data
                while (i < len) {

                    //apparently string.replace only works on one match at a time
                    //so, loop through the string and hit all matches
                    while (str.indexOf(strMatch) !== -1) {
                        str = str.replace(strMatch, arguments[i]);
                    }
                    i++;
                    intMatch = i - 1;
                    strMatch = "{" + intMatch.toString() + "}";
                }
            }
            strArr.push(str);
        };

        this.toString = function () {
            var separator = arguments[0];
            if (separator !== null && separator !== undefined) {
                return strArr.join(separator);
            } else {
                return strArr.join("");
            }
        };
    },
    
    getElementsByClassName: function(cl) {
        var retnode = [];
        var myclass = new RegExp('\\b'+cl+'\\b');
        var elem = document.getElementsByTagName('*');
        for (var i = 0; i < elem.length; i++) {
            var classes = elem[i].className;
            if (myclass.test(classes)) retnode.push(elem[i]);
        }
        return retnode;
    },
    
    unwrapPropertyPath: function(path, entity){
        var propPath = path.split('.');
        var tempProp = entity[propPath[0]];

        for (var j = 1; j < propPath.length; j++){
            tempProp = ko.utils.unwrapObservable(tempProp)[propPath[j]];
        }
        return tempProp;
    },
    
    newId: (function () {
        var seedId = new Date().getTime();

        return function () {
            return seedId += 1;
        };
    })(),
    
    // we copy KO's ie detection here bc it isn't exported in the min versions of KO
    // Detect IE versions for bug workarounds (uses IE conditionals, not UA string, for robustness) 
    ieVersion: (function () {
        var version = 3, div = document.createElement('div'), iElems = div.getElementsByTagName('i');

        // Keep constructing conditional HTML blocks until we hit one that resolves to an empty fragment
        while (
            div.innerHTML = '<!--[if gt IE ' + (++version) + ']><i></i><![endif]-->',
            iElems[0]
        );
        return version > 4 ? version : undefined;
    })(),
};

$.extend(kg.utils, {
    isIe6: (function(){ 
        return kg.utils.ieVersion === 6}
    )(),
    isIe7: (function(){ 
        return kg.utils.ieVersion === 7}
    )(),
    isIe: (function () { 
        return kg.utils.ieVersion !== undefined; 
    })()
});  
 
 
/*********************************************** 
* FILE: ..\Src\Templates\GridTemplate.js 
***********************************************/ 
kg.templates.defaultGridInnerTemplate = function (options) {
    var b = new kg.utils.StringBuilder();
    b.append('<div class="kgTopPanel" data-bind="kgSize: $data.headerDim">');
    b.append(    '<div class="kgHeaderContainer" data-bind="kgSize: $data.headerDim">');
    b.append(        '<div class="kgHeaderScroller" data-bind="kgHeaderRow: $data, kgSize: $data.headerScrollerDim">');
    b.append(        '</div>');
    b.append(    '</div>');
    b.append('</div>');
    b.append('<div class="kgViewport {0}" data-bind="{0}kgSize: $data.viewportDim">', options.disableTextSelection ? "kgNoSelect": "");
    b.append(    '<div class="kgCanvas" data-bind="kgRows: $data.rows, style: { height: $data.canvasHeight }" style="position: relative">');
    b.append(    '</div>');
    b.append('</div>');
    b.append('<div class="kgFooterPanel" data-bind="kgFooter: $data, kgSize: $data.footerDim">');
    b.append('</div>');
    return b.toString();
}; 
 
 
/*********************************************** 
* FILE: ..\Src\Templates\HeaderTemplate.js 
***********************************************/ 
﻿﻿kg.templates.generateHeaderTemplate = function (options) {
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
 
 
 
/*********************************************** 
* FILE: ..\Src\Templates\HeaderCellTemplate.js 
***********************************************/ 
kg.templates.defaultHeaderCellTemplate = function (options) {
    var b = new kg.utils.StringBuilder();

    b.append('<div data-bind="click: $data.sort, css: { \'kgSorted\': !$data.noSortVisible() }">');
    b.append('  <span data-bind="text: $data.displayName"></span>');
    b.append('  <div class="kgSortButtonDown" data-bind="visible: ($data.allowSort() ? ($data.noSortVisible() || $data.sortAscVisible) : $data.allowSort())"></div>');
    b.append('  <div class="kgSortButtonUp" data-bind="visible: ($data.allowSort() ? ($data.noSortVisible() || $data.sortDescVisible) : $data.allowSort())"></div>');
    b.append('</div>');
    if (!options.autogenerateColumns && options.enableColumnResize){
        b.append('<div class="kgHeaderGrip" data-bind="visible: $data.allowResize, mouseEvents: { mouseDown:  $data.gripOnMouseDown }"></div>');
    }
    b.append('<div data-bind="visible: $data._filterVisible">');
    b.append('  <input type="text" data-bind="value: $data.column.filter, valueUpdate: \'afterkeydown\'" style="width: 80%" tabindex="1" />');
    b.append('</div>');

    return b.toString();
}; 
 
 
/*********************************************** 
* FILE: ..\Src\Templates\RowTemplate.js 
***********************************************/ 
﻿kg.templates.generateRowTemplate = function (options) {
    var b = new kg.utils.StringBuilder(),
        cols = options.columns;

    b.append('<div data-bind="kgRow: $data, click: $data.toggleSelected, css: { \'kgSelected\': $data.selected }">');

    kg.utils.forEach(cols, function (col, i) {

        // check for the Selection Column
        if (col.field === '__kg_selected__') {
            b.append('<div class="kgSelectionCell" data-bind="kgCell: { value: \'{0}\' } ">', col.field);
            b.append('  <input type="checkbox" data-bind="checked: $data.selected" />');
            b.append('</div>');
        }
        // check for RowIndex Column
        else if (col.field === 'rowIndex') {
            b.append('<div class="kgRowIndexCell" data-bind="kgCell: { value: \'{0}\' } "></div>', col.field);
        }
        // check for a Column with a Cell Template
        else if (col.hasCellTemplate) {
            // first pull the template
            var tmpl = kg.templateManager.getTemplateText(col.cellTemplate);

            // build the replacement text
            var replacer = "{ value: '" + col.field + "' }";

            // run any changes on the template for re-usable templates
            tmpl = tmpl.replace(/\$cellClass/g, col.cellClass || 'kgEmpty');
            tmpl = tmpl.replace(/\$cellValue/g, "$data." + col.field);
            tmpl = tmpl.replace(/\$cell/g, replacer);

            b.append(tmpl);
        }
        // finally just use a basic template for the cell
        else {
            b.append('  <div class="{0}"  data-bind="kgCell: { value: \'{1}\' } "></div>', col.cellClass || 'kgEmpty',  col.field);
        }
    });

    b.append('</div>');

    return b.toString();
}; 
 
 
/*********************************************** 
* FILE: ..\Src\Templates\FooterTemplate.js 
***********************************************/ 
﻿﻿kg.templates.defaultFooterTemplate = function (options) {
    var b = new kg.utils.StringBuilder();
    b.append('<div class="kgTotalSelectContainer" data-bind="visible: footerVisible">');
    b.append(    '<div class="kgFooterTotalItems" data-bind="css: {\'kgNoMultiSelect\': !isMultiSelect()}" >');
    b.append(        '<span class="kgLabel">Total Items:</span> <span data-bind="text: maxRows"></span>');
    b.append(    '</div>');
    b.append(    '<div class="kgFooterSelectedItems" data-bind="visible: isMultiSelect">');
    b.append(        '<span class="kgLabel">Selected Items:</span> <span data-bind="text: selectedItemCount"></span>');
    b.append(    '</div>');
    b.append('</div>');
    b.append('<div class="kgPagerContainer" data-bind="visible: pagerVisible() && footerVisible(), css: {\'kgNoMultiSelect\': !isMultiSelect()}">');
    b.append(    '<div style="float: right;">');
    b.append(        '<div class="kgRowCountPicker">');
    b.append(            '<span class="kgLabel">Rows:</span>');
    b.append(            '<select data-bind="options: pageSizes, value: selectedPageSize">');
    b.append(            '</select>');
    b.append(        '</div>');
    b.append(        '<div class="kgPagerControl" style="float: left; min-width: 135px;">');
    b.append(            '<input class="kgPagerFirst" type="button" data-bind="click: pageToFirst, enable: canPageBackward" title="First Page"/>');
    b.append(            '<input class="kgPagerPrev" type="button"  data-bind="click: pageBackward, enable: canPageBackward" title="Previous Page"/>');
    b.append(            '<input class="kgPagerCurrent" type="text" data-bind="value: protectedCurrentPage, enable: maxPages() > 1" />');
    b.append(            '<input class="kgPagerNext" type="button"  data-bind="click: pageForward, enable: canPageForward" title="Next Page"/>');
    b.append(            '<input class="kgPagerLast" type="button"  data-bind="click: pageToLast, enable: canPageForward" title="Last Page"/>');
    b.append(        '</div>');
    b.append(    '</div>');
    b.append('</div>');
    return b.toString();
};
 
 
 
/*********************************************** 
* FILE: ..\Src\Templates\TemplateManager.js 
***********************************************/ 
﻿kg.templateManager = (new function () {
    var self = this;

    self.templateExists = function (tmplId) {
        var el = document.getElementById(tmplId);
        return (el !== undefined && el !== null);
    };

    self.addTemplate = function (templateText, tmplId) {
        var tmpl = document.createElement("SCRIPT");
        tmpl.type = "text/html";
        tmpl.id = tmplId;

        //        'innerText' in tmpl ? tmpl.innerText = templateText
        //                            : tmpl.textContent = templateText;

        tmpl.text = templateText;

        document.body.appendChild(tmpl);
    };
    
    this.removeTemplate = function (tmplId){
        var element = document.getElementById(tmplId);
        if (element) element.parentNode.removeChild(element);
    };
    
    this.addTemplateSafe = function (tmplId, templateTextAccessor) {
        if (!self.templateExists(tmplId)) {
            self.addTemplate(templateTextAccessor(), tmplId);
        }
    };

    this.ensureGridTemplates = function (options) {
        var defaults = {
            rowTemplate: '',
            headerTemplate: '',
            headerCellTemplate: '',
            footerTemplate: '',
            columns: null,
            showFilter: true
        },
            config = $.extend(defaults, options);

        //first ensure the koGrid template!
        self.addTemplateSafe(GRID_TEMPLATE,  function () {
                return kg.templates.defaultGridInnerTemplate(config);
            });

        //header row template
        if (config.headerTemplate) {
            self.addTemplateSafe(config.headerTemplate, function () {
                return kg.templates.generateHeaderTemplate(config);
            });
        }

        //header cell template
        if (config.headerCellTemplate) {
            self.addTemplateSafe(config.headerCellTemplate, function () {
                return kg.templates.defaultHeaderCellTemplate(config);
            });
        }

        //row template
        if (config.rowTemplate) {
            self.addTemplateSafe(config.rowTemplate, function () {
                return kg.templates.generateRowTemplate(config);
            });
        }

        //footer template
        if (config.footerTemplate) {
            self.addTemplateSafe(config.footerTemplate, function () {
                return kg.templates.defaultFooterTemplate(config);
            });
        }
    };

    this.getTemplateText = function (tmplId) {
        if (!self.templateExists(tmplId)) {
            return "";
        } else {
            var el = document.getElementById(tmplId);
            return el.text;
        }
    };

} ()); 
 
 
/*********************************************** 
* FILE: ..\Src\GridClasses\Dimension.js 
***********************************************/ 
﻿kg.Dimension = function (options) {
    this.innerHeight = null;
    this.innerWidth = null;
    this.outerHeight = null;
    this.outerWidth = null;
    this.widthDiff = null;
    this.heightDiff = null;

    this.autoFitHeight = false; //tells it to just fit to the wrapping container
    this.autoFitWidth = false;

    $.extend(this, options);
}; 
 
 
/*********************************************** 
* FILE: ..\Src\GridClasses\Cell.js 
***********************************************/ 
﻿kg.Cell = function (col) {
    this.data = '';
    this.column = col;
    this.row = null;
}; 
 
 
/*********************************************** 
* FILE: ..\Src\GridClasses\Column.js 
***********************************************/ 
﻿﻿kg.Column = function (colDef, index) {
    var self = this,
        minWIsOB = ko.isObservable(colDef.minWidth),
        maxWIsOB = ko.isObservable(colDef.maxWidth);
        
    this.width = ko.observable(colDef.width);
    this.widthIsConfigured = false;
    this.minWidth = minWIsOB ? colDef.minWidth : ( !colDef.minWidth ? ko.observable(50) : ko.observable(colDef.minWidth));
    this.maxWidth = maxWIsOB ? colDef.maxWidth : ( !colDef.maxWidth ? ko.observable(9000) : ko.observable(colDef.maxWidth));
    
    this.field = colDef.field;
    if (colDef.displayName === undefined || colDef.displayName === null) {
        // Allow empty column names -- do not check for empty string
        colDef.displayName = colDef.field;
    }
    this.displayName = colDef.displayName;
    this.index = index;
    this.isVisible = ko.observable(false);

    //sorting
    if (colDef.sortable === undefined || colDef.sortable === null) {
        colDef.sortable = true;
    }
    
    //resizing
    if (colDef.resizable === undefined || colDef.resizable === null) {
        colDef.resizable = true;
    }
    //resizing
    if (colDef.filterable === undefined || colDef.filterable === null) {
        colDef.filterable = true;
    }
    
    this.allowSort = colDef.sortable;
    this.allowResize = colDef.resizable;
    this.allowFilter = colDef.filterable;
    
    this.sortDirection = ko.observable("");
    this.sortingAlgorithm = colDef.sortFn;

    //filtering
    this.filter = ko.observable();

    //cell Template
    this.cellTemplate = colDef.cellTemplate; // string of the cellTemplate script element id
    this.hasCellTemplate = (this.cellTemplate ? true : false);

    this.cellClass = colDef.cellClass;
    this.headerClass = colDef.headerClass;

    this.headerTemplate = colDef.headerTemplate
    this.hasHeaderTemplate = (this.headerTemplate ? true : false);
}; 
 
 
/*********************************************** 
* FILE: ..\Src\GridClasses\ColumnCollection.js 
***********************************************/ 
﻿kg.ColumnCollection = function () {

    var obs = ko.observableArray([]);
    ko.utils.extend(obs, kg.ColumnCollection.fn);

    return obs;
};

kg.ColumnCollection.fn = {

}; 
 
 
/*********************************************** 
* FILE: ..\Src\GridClasses\Row.js 
***********************************************/ 
/// <reference path="../utils.js" />
/// <reference path="../namespace.js" />
/// <reference path="../Grid.js" />

kg.Row = function (entity, config, selectionManager) {
    var self = this,
        KEY = '__kg_selected__', // constant for the selection property that we add to each data item
        canSelectRows = config.canSelectRows;
    this.selectedItems = config.selectedItems;
    this.entity = ko.isObservable(entity) ? entity : ko.observable(entity);
    this.selectionManager = selectionManager;
    //selectify the entity
    if (this.entity()['__kg_selected__'] === undefined) {
        this.entity()['__kg_selected__'] = ko.observable(false);
    }
    this.selected = ko.dependentObservable({
        read: function () {
            if (!canSelectRows) {
                return false;
            }
            var val = self.entity()['__kg_selected__']();
            return val;
        },
        write: function (val, evt) {
            if (!canSelectRows) {
                return true;
            }
            self.beforeSelectionChange();
            self.entity()['__kg_selected__'](val);
            self.selectionManager.changeSelection(self, evt);
            self.afterSelectionChange();
            self.onSelectionChanged();
        }
    });

    this.toggleSelected = function (data, event) {
        if (!canSelectRows) {
            return true;
        }
        var element = event.target;

        //check and make sure its not the bubbling up of our checked 'click' event 
        if (element.type == "checkbox" && element.parentElement.className.indexOf("kgSelectionCell" !== -1)) {
            return true;
        } 
        if (config.selectWithCheckboxOnly && element.type != "checkbox"){
            return true;
        } else {
            self.selected() ? self.selected(false, event) : self.selected(true, event);
        }
    };

    this.toggle = function(item) {
        if (item.selected()) {
            item.selected(false);
            self.selectedItems.remove(item.entity());
        } else {
            item.selected(true);
            if (self.selectedItems.indexOf(item.entity()) === -1) {
                self.selectedItems.push(item.entity());
            }
        }

    };

    this.cells = ko.observableArray([]);
    this.cellMap = {};
    this.rowIndex = 0;
    this.offsetTop = 0;
    this.rowKey = kg.utils.newId();
    this.rowDisplayIndex = 0;

    this.onSelectionChanged = function () { }; //replaced in rowManager
    this.beforeSelectionChange = function () { };
    this.afterSelectionChange = function () { };
    //during row initialization, let's make all the entities properties first-class properties on the row
    (function () {
        kg.utils.forIn(entity, function (prop, propName) {
            self[propName] = prop;
        });
    } ());
};  
 
 
/*********************************************** 
* FILE: ..\Src\GridClasses\Range.js 
***********************************************/ 
﻿kg.Range = function (bottom, top) {
    this.topRow = top;
    this.bottomRow = bottom;
}; 
 
 
/*********************************************** 
* FILE: ..\Src\GridClasses\CellFactory.js 
***********************************************/ 
﻿kg.CellFactory = function (cols) {
    var colCache = cols,
        len = colCache.length;

    this.buildRowCells = function (row) {
        var cell,
            cells = [],
            col,
            i = 0;

        for (; i < len; i++) {
            col = colCache[i];

            cell = new kg.Cell(col);
            cell.row = row;
            //enabling nested property values in a viewmodel
            cell.data = kg.utils.unwrapPropertyPath(col.field, row.entity()); 
            cells.push(cell);
            row.cellMap[col.field] = cell;
        }
        row.cells(cells);

        return row;
    };
}; 
 
 
/*********************************************** 
* FILE: ..\Src\GridClasses\HeaderCell.js 
***********************************************/ 
﻿kg.HeaderCell = function (col) {
    var self = this;

    this.colIndex = col.colIndex;
    this.displayName = col.displayName;
    this.field = col.field;
    this.column = col;

    this.headerClass = col.headerClass;
    this.headerTemplate = col.headerTemplate;
    this.hasHeaderTemplate = col.hasHeaderTemplate;
    
    this.allowSort = ko.observable(col.allowSort);
    this.allowFilter = col.allowFilter;
    this.allowResize = ko.observable(col.allowResize);
    
    this.width = col.width;
    this.minWidth = col.minWidth;
    this.maxWidth = col.maxWidth;

    this.filter = ko.computed({
        read: function () {
            return self.column.filter();
        },
        write: function (val) {
            self.column.filter(val);
        }
    });

    this.filterVisible = ko.observable(false);
    this._filterVisible = ko.computed({
        read: function () {
            return self.allowFilter;
        },
        write: function (val) {
            self.filterVisible(val);
        }
    });
    
    this.sortAscVisible = ko.computed(function () {
        return self.column.sortDirection() === "asc";
    });

    this.sortDescVisible = ko.computed(function () {
        return self.column.sortDirection() === "desc";
    });

    this.noSortVisible = ko.computed(function () {
        var sortDir = self.column.sortDirection();

        return sortDir !== "asc" && sortDir !== "desc";
    });

    this.sort = function () {
        if (!self.allowSort()) {
            return; // column sorting is disabled, do nothing
        }
        var dir = self.column.sortDirection() === "asc" ? "desc" : "asc";
        self.column.sortDirection(dir);
    };

    this.filterHasFocus = ko.observable(false);

﻿    this.startMousePosition = 0;
    
﻿    this.startMousePosition = 0;
    this.origWidth = 0;
﻿    
    this.gripOnMouseUp = function () {
        $(document).off('mousemove');
        $(document).off('mouseup');
        document.body.style.cursor = 'default';
        return false;
    };

    this.onMouseMove = function (event) {
        var diff = event.clientX - self.startMousePosition;
        var newWidth = diff + self.origWidth;
        self.width(newWidth < self.minWidth() ? self.minWidth() : ( newWidth > self.maxWidth() ? self.maxWidth() : newWidth) );
        return false;
﻿    };
﻿    
    this.gripOnMouseDown = function (event) {
        self.startMousePosition = event.clientX;
        self.origWidth = self.width();
﻿        $(document).mousemove(self.onMouseMove);
﻿        $(document).mouseup(self.gripOnMouseUp);
        document.body.style.cursor = 'col-resize';
        event.target.parentElement.style.cursor = 'col-resize';
        return false;
    };
}; 
 
 
/*********************************************** 
* FILE: ..\Src\GridClasses\HeaderRow.js 
***********************************************/ 
﻿kg.HeaderRow = function () {
    this.headerCells = [];
    this.height;
    this.headerCellMap = {};
    this.filterVisible = ko.observable(false);
}; 
 
 
/*********************************************** 
* FILE: ..\Src\GridClasses\RowManager.js 
***********************************************/ 
﻿kg.RowManager = function (grid) {
    var self = this,
        prevMaxRows = 0, // for comparison purposes when scrolling
        prevMinRows = 0, // for comparison purposes when scrolling
        currentPage = grid.config.currentPage,
        pageSize = grid.config.pageSize,
        ROW_KEY = '__kg_rowIndex__', // constant for the entity's rowCache rowIndex
        prevRenderedRange = new kg.Range(0, 1), // for comparison purposes to help throttle re-calcs when scrolling
        prevViewableRange = new kg.Range(0, 1), // for comparison purposes to help throttle re-calcs when scrolling
        internalRenderedRange = ko.observable(prevRenderedRange); // for comparison purposes to help throttle re-calcs when scrolling
        
    this.dataChanged = true;
     // we cache rows when they are built, and then blow the cache away when sorting/filtering
    this.rowCache = [];
    // short cut to sorted and filtered data
    this.dataSource = grid.finalData; //observableArray

    // change subscription to clear out our cache
    this.dataSource.subscribe(function () {
        self.dataChanged = true;
        self.rowCache = []; //if data source changes, kill this!
    });

    // shortcut to the calculated minimum viewport rows
    this.minViewportRows = grid.minRowsToRender; //observable

    // the # of rows we want to add to the top and bottom of the rendered grid rows 
    this.excessRows = 8;

    // height of each row
    this.rowHeight = grid.config.rowHeight;

    // the logic that builds cell objects
    this.cellFactory = new kg.CellFactory(grid.columns());

    // the actual range the user can see in the viewport
    this.viewableRange = ko.observable(prevViewableRange);

    // the range of rows that we actually render on the canvas ... essentially 'viewableRange' + 'excessRows' on top and bottom
    this.renderedRange = ko.observable(prevRenderedRange);

    // the array of rows that we've rendered
    this.rows = ko.observableArray([]);

    // change handler subscriptions for disposal purposes (used heavily by the 'rows' binding)
    this.rowSubscriptions = {};

    // Builds rows for each data item in the 'dataSource'
    // @entity - the data item
    // @rowIndex - the index of the row
    // @pagingOffset - the # of rows to add the the rowIndex in case server-side paging is happening
    this.buildRowFromEntity = function (entity, rowIndex, pagingOffset) {
        var row = self.rowCache[rowIndex]; // first check to see if we've already built it

        if (!row) {

            // build the row
            row = new kg.Row(entity, grid.config, grid.selectionManager);
            row.rowIndex = rowIndex + 1; //not a zero-based rowIndex
            row.rowDisplayIndex = row.rowIndex + pagingOffset;
            row.offsetTop = self.rowHeight * rowIndex;

            //build out the cells
            self.cellFactory.buildRowCells(row);

            // finally cache it for the next round
            self.rowCache[rowIndex] = row;
        }

        // store the row's index on the entity for future ref
        entity[ROW_KEY] = rowIndex;

        return row;
    };

    // core logic here - anytime we updated the renderedRange, we need to update the 'rows' array 
    this.renderedRange.subscribe(function (rg) {
        var rowArr = [],
            row,
            pagingOffset = (pageSize() * (currentPage() - 1)),
            dataArr = self.dataSource().slice(rg.bottomRow, rg.topRow);

        kg.utils.forEach(dataArr, function (item, i) {
            row = self.buildRowFromEntity(item, rg.bottomRow + i, pagingOffset);

            //add the row to our return array
            rowArr.push(row);

            //null the row pointer for next iteration
            row = null;
        });

        self.rows(rowArr);
    });

    // core logic that intelligently figures out the rendered range given all the contraints that we have
    this.calcRenderedRange = function () {
        var rg = self.viewableRange(),
            minRows = self.minViewportRows(),
            maxRows = self.dataSource().length,
            isDif = false, // flag to help us see if the viewableRange or data has changed "enough" to warrant re-building our rows
            newRg; // variable to hold our newly-calc'd rendered range 

        if (rg) {

            isDif = (rg.bottomRow !== prevViewableRange.bottomRow || rg.topRow !== prevViewableRange.topRow || self.dataChanged)
            if (!isDif && prevMaxRows !== maxRows) {
                isDif = true;
                rg = new kg.Range(prevViewableRange.bottomRow, prevViewableRange.topRow);
            }

            if (!isDif && prevMinRows !== minRows) {
                isDif = true;
                rg = new kg.Range(prevViewableRange.bottomRow, prevViewableRange.topRow);
            }

            if (isDif) {
                //Now build out the new rendered range
                rg.topRow = rg.bottomRow + minRows;

                //store it for next rev
                prevViewableRange = rg;

                // now build the new rendered range
                newRg = new kg.Range(rg.bottomRow, rg.topRow);

                // make sure we are within our data constraints (can't render negative rows or rows greater than the # of data items we have)
                newRg.bottomRow = Math.max(0, rg.bottomRow - self.excessRows);
                newRg.topRow = Math.min(maxRows, rg.topRow + self.excessRows);

                // store them for later comparison purposes
                prevMaxRows = maxRows;
                prevMinRows = minRows;

                //one last equality check
                if (prevRenderedRange.topRow !== newRg.topRow || prevRenderedRange.bottomRow !== newRg.bottomRow || self.dataChanged) {
                    self.dataChanged = false;
                    prevRenderedRange = newRg;

                    // now kickoff row building
                    self.renderedRange(newRg);
                }
            }
        } else {
            self.renderedRange(new kg.Range(0, 0));
        }
    };

    // make sure that if any of these change, we re-fire the calc logic
    self.viewableRange.subscribe(self.calcRenderedRange);
    self.minViewportRows.subscribe(self.calcRenderedRange);
    self.dataSource.subscribe(self.calcRenderedRange);
}; 
 
 
/*********************************************** 
* FILE: ..\Src\GridClasses\Footer.js 
***********************************************/ 
﻿kg.Footer = function (grid) {
    var self = this;

    this.maxRows;

    if (grid.config.totalServerItems() !== null && grid.config.totalServerItems() !== undefined) {
        this.maxRows = grid.config.totalServerItems; //observable
    } else {
        this.maxRows = grid.maxRows; //observable
    }
    this.isMultiSelect = ko.observable(grid.config.canSelectRows && grid.config.isMultiSelect);
    this.selectedItemCount = grid.selectedItemCount; //observable

    this.footerVisible = grid.config.footerVisible;
    this.pagerVisible = ko.observable(grid.config.enablePaging);
    this.selectedPageSize = grid.config.pageSize; //observable
    this.pageSizes = ko.observableArray(grid.config.pageSizes);
    this.currentPage = grid.config.currentPage; //observable
    this.maxPages = ko.computed(function () {
        var maxCnt = self.maxRows() || 1,
            pageSize = self.selectedPageSize();
        return Math.ceil(maxCnt / pageSize);
    });

    this.protectedCurrentPage = ko.computed({
        read: function () {
            return self.currentPage();
        },
        write: function (page) {
            var pageInt = parseInt(page);
            if (!isNaN(pageInt) || (pageInt && pageInt <= self.maxPages() && pageInt > 0)) {
                self.currentPage(pageInt); //KO does an equality check on primitives before notifying subscriptions here
            }
        },
        owner: self
    });

    this.pageForward = function () {
        var page = self.currentPage();
        self.currentPage(Math.min(page + 1, self.maxPages()));
    }

    this.pageBackward = function () {
        var page = self.currentPage();
        self.currentPage(Math.max(page - 1, 1));
    };

    this.pageToFirst = function () {
        self.currentPage(1);
    };

    this.pageToLast = function () {
        var maxPages = self.maxPages();
        self.currentPage(maxPages);
    };

    this.canPageForward = ko.computed(function () {
        var curPage = self.currentPage();
        var maxPages = self.maxPages();
        return curPage < maxPages;
    });

    this.canPageBackward = ko.computed(function () {
        var curPage = self.currentPage();
        return curPage > 1;
    });
}; 
 
 
/*********************************************** 
* FILE: ..\Src\GridClasses\FilterManager.js 
***********************************************/ 
﻿kg.FilterManager = function (options) {
    var self = this,
        wildcard = options.filterWildcard || "*", // the wildcard character used by the user
        includeDestroyed = options.includeDestroyed || false, // flag to indicate whether to include _destroy=true items in filtered data
        regExCache = {}, // a cache of filterString to regex objects, eg: { 'abc%' : RegExp("abc[^\']*, "gi") }
        initPhase = 0, // flag for allowing us to do initialization only once and prevent dependencies from getting improperly registered
        internalFilteredData = ko.observableArray([]); // obs array that we use to manage the filtering before it updates the final data

    // first check the wildcard as we only support * and % currently
    if (wildcard === '*' || wildcard === '%') {
        // do nothing
    } else {
        throw new Error("You can only declare a percent sign (%) or an asterisk (*) as a wildcard character");
    }

    // filters off _destroy = true items
    var filterDestroyed = function (arr) {
        return ko.utils.arrayFilter(arr, function (item) {
            return (item['_destroy'] === true ? false : true);
        });
    };

    // map of column.field values to filterStrings
    this.filterInfo = options.filterInfo || ko.observable();

    // the obs array of data that the user defined
    this.data = options.data;

    // the obs array of filtered data we return to the grid
    this.filteredData = ko.computed(function () {
        var data = internalFilteredData();

        //this is a bit funky, but it prevents our options.data observable from being registered as a subscription to our grid.update bindingHandler
        if (initPhase > 0) {
            return data;
        } else {
            return filterDestroyed(self.data());
        }
    });

    // utility function for checking data validity
    var isEmpty = function (data) {
        return (data === null || data === undefined || data === '');
    };

    // performs regex matching on data strings
    var matchString = function (itemStr, filterStr) {
        //first check for RegEx thats already built
        var regex = regExCache[filterStr];

        //if nothing, build the regex
        if (!regex) {
            var replacer = "";

            //escape any wierd characters they might using
            filterStr = filterStr.replace(/\\/g, "\\");

            // build our replacer regex
            if (wildcard === "*") {
                replacer = /\*/g;
            } else {
                replacer = /\%/g;
            }

            //first replace all % percent signs with the true regex wildcard *
            var regexStr = filterStr.replace(replacer, "[^\']*");

            //ensure that we do "beginsWith" logic
            if (regexStr !== "*") { // handle the asterisk logic
                regexStr = "^" + regexStr;
            }

            // incase the user makes some nasty regex that we can't use
            try{
                // then create an actual regex object
                regex = new RegExp(regexStr, "gi");
            }
            catch (e) {
                // the user input something we can't parse into a valid RegExp, so just say that the data
                // was a match
                regex = /.*/gi;
            }
            // store it
            regExCache[filterStr] = regex;
        }

        return itemStr.match(regex);
    };

    // the core logic for filtering data
    var filterData = function () {
        var filterInfo = self.filterInfo(),
            data = self.data(),
            keepRow = false, // flag to say if the row will be removed or kept in the viewport
            match = true, // flag for matching logic
            newArr = [], // the filtered array
            field, // the field of the column that we are filtering
            itemData, // the data from the specific row's column
            itemDataStr, // the stringified version of itemData
            filterStr; // the user-entered filtering criteria

        // filter the destroyed items
        data = filterDestroyed(data);

        // make sure we even have work to do before we get started
        if (!filterInfo || $.isEmptyObject(filterInfo) || options.useExternalFiltering) {
            internalFilteredData(data);
            return;
        }

        //clear out the regex cache so that we don't get improper results
        regExCache = {};

        // filter the data array
        newArr = ko.utils.arrayFilter(data, function (item) {
            var propPath,
                i;

            //loop through each property and filter it
            for (field in filterInfo) {

                if (filterInfo.hasOwnProperty(field)) {

                    // pull the data out of the item
                    propPath = field.split(".");
                    itemData = item;
                    for (i = 0; i < propPath.length && itemData !== undefined && itemData !== null; i++) {
                        itemData = ko.utils.unwrapObservable(itemData[propPath[i]]);
                    }

                    // grab the user-entered filter criteria
                    filterStr = filterInfo[field];

                    // make sure they didn't just enter the wildcard character
                    if (!isEmpty(filterStr) && filterStr !== wildcard) {

                        // execute regex matching
                        if (isEmpty(itemData)) {
                            match = false;
                        } else if (typeof itemData === "string") {
                            match = matchString(itemData, filterStr);
                        } else {
                            itemDataStr = itemData.toString();
                            match = matchString(itemDataStr, filterStr);
                        }
                    }
                }

                //supports "AND" filtering logic
                if (keepRow && !match) {
                    keepRow = false;
                } else if (!keepRow && match) {
                    keepRow = true; //should only catch on the first pass
                }

                //now if we catch anything thats not a match, break out of the loop
                if (!match) { break; }
            }

            //reset variables
            filterStr = null;
            itemData = null;
            itemDataStr = null;
            match = true;

            return keepRow;
        });

        // finally set our internal array to the filtered stuff, which will tell the rest of the manager to propogate it up to the grid
        internalFilteredData(newArr);

    };

    //create subscriptions
    this.data.subscribe(filterData);
    this.filterInfo.subscribe(filterData);

    // the grid uses this to asign the change handlers to the filter boxes during initialization
    this.createFilterChangeCallback = function (col) {

        // the callback
        return function (newFilterVal) {
            var info = self.filterInfo();

            if (!info && !newFilterVal) {
                return;
            }

            //if we're still here, we may need to new up the info
            if (!info) { info = {}; }

            if ((newFilterVal === null ||
                newFilterVal === undefined ||
                newFilterVal === "") &&
                info[col.field]) { // we don't it to be null or undefined

                //smoke it so we don't loop through it for filtering anymore!
                delete info[col.field];

            } else if (newFilterVal !== null && newFilterVal !== undefined) {

                info[col.field] = newFilterVal;

            }
            self.filterInfo(info);

            if (options && options.currentPage) {
                options.currentPage(1);
            }
        };
    };

    //increase this after initialization so that the computeds fire correctly
    initPhase = 1;
}; 
 
 
/*********************************************** 
* FILE: ..\Src\GridClasses\SortManager.js 
***********************************************/ 
﻿﻿kg.SortManager = function (options) {
    var self = this,
        colSortFnCache = {}, // cache of sorting functions. Once we create them, we don't want to keep re-doing it
        dateRE = /^(\d\d?)[\/\.-](\d\d?)[\/\.-]((\d\d)?\d\d)$/, // nasty regex for date parsing
        ASC = "asc", // constant for sorting direction
        DESC = "desc", // constant for sorting direction
        prevSortInfo = {}, // obj for previous sorting comparison (helps with throttling events)
        dataSource = options.data, //observableArray
        initPhase = 0, // flag for preventing improper dependency registrations with KO
        internalSortedData = ko.observableArray([]);

    // utility function for null checking
    this.isEmpty = function (val) {
        return (val === null || val === undefined || val === '');
    };

    // the sorting metadata, eg: { column: { field: 'sku' }, direction: "asc" }
    this.sortInfo = options.sortInfo || ko.observable();

    this.sortedData = ko.computed(function () {
        var sortData = internalSortedData();
        //We have to do this because any observable that is invoked inside of a bindingHandler (init or update) is registered as a
        // dependency during the binding handler's dependency detection :(
        if (initPhase > 0) {
            return sortData;
        } else {
            return dataSource();
        }
    });

    // this takes an piece of data from the cell and tries to determine its type and what sorting
    // function to use for it
    // @item - the cell data
    this.guessSortFn = function (item) {
        var sortFn, // sorting function that is guessed
            itemStr, // the stringified version of the item
            itemType, // the typeof item
            dateParts, // for date parsing
            month, // for date parsing
            day; // for date parsing

        if (item === undefined || item === null || item === '') {
            return null;
        }

        itemType = typeof (item);

        //check for numbers and booleans
        switch (itemType) {
            case "number":
                sortFn = self.sortNumber;
                break;
            case "boolean":
                sortFn = self.sortBool;
                break;
        }

        //if we found one, return it
        if (sortFn) {
            return sortFn;
        }

        //check if the item is a valid Date
        if (Object.prototype.toString.call(item) === '[object Date]') {
            return self.sortDate;
        }

        // if we aren't left with a string, we can't sort full objects...
        if (itemType !== "string") {
            return null;
        }

        // now lets string check..

        //check if the item data is a valid number
        if (item.match(/^-?[£$¤]?[\d,.]+%?$/)) {
            return self.sortNumberStr;
        }

        // check for a date: dd/mm/yyyy or dd/mm/yy
        // can have / or . or - as separator
        // can be mm/dd as well
        dateParts = item.match(dateRE)
        if (dateParts) {
            // looks like a date
            month = parseInt(dateParts[1]);
            day = parseInt(dateParts[2]);
            if (month > 12) {
                // definitely dd/mm
                return self.sortDDMMStr;
            } else if (day > 12) {

                return self.sortMMDDStr;
            } else {
                // looks like a date, but we can't tell which, so assume that it's MM/DD
                return self.sortMMDDStr;
            }
        }

        //finally just sort the normal string...
        return self.sortAlpha;

    };

    //#region Sorting Functions

    this.sortNumber = function (a, b) {

        return a - b;
    };

    this.sortNumberStr = function (a, b) {
        var numA, numB, badA = false, badB = false;

        numA = parseFloat(a.replace(/[^0-9.-]/g, ''));
        if (isNaN(numA)) {
            badA = true;
        }

        numB = parseFloat(b.replace(/[^0-9.-]/g, ''));
        if (isNaN(numB)) {
            badB = true;
        }

        // we want bad ones to get pushed to the bottom... which effectively is "greater than"
        if (badA && badB) {
            return 0;
        }

        if (badA) {
            return 1;
        }

        if (badB) {
            return -1;
        }

        return numA - numB;
    };

    this.sortAlpha = function (a, b) {
        var strA = a.toUpperCase(),
            strB = b.toUpperCase();

        return strA == strB ? 0 : (strA < strB ? -1 : 1);
    };

    this.sortDate = function (a, b) {
        var timeA = a.getTime(),
            timeB = b.getTime();

        return timeA == timeB ? 0 : (timeA < timeB ? -1 : 1);
    };

    this.sortBool = function (a, b) {
        if (a && b) { return 0; }
        if (!a && !b) { return 0; }
        else { return a ? 1 : -1 }
    };

    this.sortDDMMStr = function (a, b) {
        var dateA, dateB, mtch,
            m, d, y;

        mtch = a.match(dateRE);
        y = mtch[3]; m = mtch[2]; d = mtch[1];
        if (m.length == 1) m = '0' + m;
        if (d.length == 1) d = '0' + d;
        dateA = y + m + d;
        mtch = b.match(dateRE);
        y = mtch[3]; m = mtch[2]; d = mtch[1];
        if (m.length == 1) m = '0' + m;
        if (d.length == 1) d = '0' + d;
        dateB = y + m + d;
        if (dateA == dateB) return 0;
        if (dateA < dateB) return -1;
        return 1;
    };

    this.sortMMDDStr = function (a, b) {
        var dateA, dateB, mtch,
            m, d, y;

        mtch = a.match(dateRE);
        y = mtch[3]; d = mtch[2]; m = mtch[1];
        if (m.length == 1) m = '0' + m;
        if (d.length == 1) d = '0' + d;
        dateA = y + m + d;
        mtch = b.match(dateRE);
        y = mtch[3]; d = mtch[2]; m = mtch[1];
        if (m.length == 1) m = '0' + m;
        if (d.length == 1) d = '0' + d;
        dateB = y + m + d;
        if (dateA == dateB) return 0;
        if (dateA < dateB) return -1;
        return 1;
    };

    //#endregion

    // the actual sort function to call
    // @col - the column to sort
    // @direction - "asc" or "desc"
    this.sort = function (col, direction) {
        //do an equality check first
        if (col === prevSortInfo.column && direction === prevSortInfo.direction) {
            return;
        }

        //if its not equal, set the observable and kickoff the event chain
        self.sortInfo({
            column: col,
            direction: direction
        });
    };

    // the core sorting logic trigger
    this.sortData = function () {
        var data = dataSource(),
            sortInfo = self.sortInfo(),
            col,
            direction,
            sortFn,
            item,
            propPath,
            prop,
            i;

        // first make sure we are even supposed to do work
        if (!data || !sortInfo || options.useExternalSorting) {
            internalSortedData(data);
            return;
        }

        // grab the metadata for the rest of the logic
        col = sortInfo.column;
        direction = sortInfo.direction;

        //see if we already figured out what to use to sort the column
        if (colSortFnCache[col.field]) {
            sortFn = colSortFnCache[col.field];
        } else if (col.sortingAlgorithm != undefined){
            sortFn = col.sortingAlgorithm;
            colSortFnCache[col.field] = col.sortingAlgorithm;
        } else { // try and guess what sort function to use
            item = dataSource()[0];

            if (item) {
                propPath = col.field.split(".");
                prop = item;
                for (i = 0; i < propPath.length && prop !== undefined && prop !== null; i++) {
                    prop = ko.utils.unwrapObservable(prop[propPath[i]]);
                }
            }

            sortFn = self.guessSortFn(prop);

            //cache it
            if (sortFn) {
                colSortFnCache[col.field] = sortFn;
            } else {
                // we assign the alpha sort because anything that is null/undefined will never get passed to
                // the actual sorting function. It will get caught in our null check and returned to be sorted
                // down to the bottom
                sortFn = self.sortAlpha;
            }
        }

        //now actually sort the data
        data.sort(function (itemA, itemB) {
            var propA = itemA,
                propB = itemB,
                propAEmpty = false,
                propBEmpty = false,
                propPath,
                i;

            propPath = col.field.split(".");
            for (i = 0; i < propPath.length; i++) {
                if (propA !== undefined && propA !== null) { propA = ko.utils.unwrapObservable(propA[propPath[i]]); }
                if (propB !== undefined && propB !== null) { propB = ko.utils.unwrapObservable(propB[propPath[i]]); }
            }

            propAEmpty = self.isEmpty(propA);
            propBEmpty = self.isEmpty(propB);

            // we want to force nulls and such to the bottom when we sort... which effectively is "greater than"
            if (propAEmpty && propBEmpty) {
                return 0;
            } else if (propAEmpty) {
                return 1;
            } else if (propBEmpty) {
                return -1;
            }

            //made it this far, we don't have to worry about null & undefined
            if (direction === ASC) {
                return sortFn(propA, propB);
            } else {
                return 0 - sortFn(propA, propB);
            }
        });

        internalSortedData(data);
    };

    //subscribe to the changes in these objects
    dataSource.subscribe(self.sortData);
    this.sortInfo.subscribe(self.sortData);

    //change the initPhase so computed bindings now work!
    initPhase = 1;
}; 
 
 
/*********************************************** 
* FILE: ..\Src\GridClasses\SelectionManager.js 
***********************************************/ 
﻿// Class that manages all row selection logic
// @options - {
//      selectedItems - an observable array to keep in sync w/ the selected rows
//      selectedIndex - an observable to keep in sync w/ the index of the selected data item
//      data - (required) the observable array data source of data items
//  }
//
kg.SelectionManager = function (options, rowManager) {
    var self = this,
        isMulti = options.isMulti || options.isMultiSelect,
        ignoreSelectedItemChanges = false, // flag to prevent circular event loops keeping single-select observable in sync
        dataSource = options.data, // the observable array datasource
        KEY = '__kg_selected__', // constant for the selection property that we add to each data item,
        ROW_KEY = '__kg_rowIndex__', // constant for the entity's rowCache rowIndex
        maxRows = ko.computed(function () {
            return dataSource().length;
        });
        
    this.selectedItem = options.selectedItem || ko.observable(); // observable
    this.selectedItems = options.selectedItems || ko.observableArray([]); //observableArray
    this.selectedIndex = options.selectedIndex; //observable
    this.lastClickedRow = options.lastClickedRow;

    // some subscriptions to keep the selectedItem in sync
    this.selectedItem.subscribe(function (val) {
        if (ignoreSelectedItemChanges)
            return;

        self.selectedItems([val]);
    });
    this.selectedItems.subscribe(function (vals) {
        ignoreSelectedItemChanges = true;

        self.selectedItem(vals ? vals[0] : null);

        ignoreSelectedItemChanges = false;
    });
    
    // function to manage the selection action of a data item (entity)
    this.changeSelection = function (rowItem, evt) {
        if (isMulti && evt && evt.shiftKey) {
            if(self.lastClickedRow()) {
                var thisIndx = rowManager.rowCache.indexOf(rowItem);
                var prevIndx = rowManager.rowCache.indexOf(self.lastClickedRow());
                if (thisIndx == prevIndx) return;
                prevIndx++;
                if (thisIndx < prevIndx) {
                    thisIndx = thisIndx ^ prevIndx;
                    prevIndx = thisIndx ^ prevIndx;
                    thisIndx = thisIndx ^ prevIndx;
                }
                for (; prevIndx <= thisIndx; prevIndx++) {
                    rowManager.rowCache[prevIndx].selected(self.lastClickedRow().selected());
                    self.addOrRemove(rowItem);
                }
                self.lastClickedRow(rowItem);
                return true;
            }
        } else if (!isMulti) {
            rowItem.selected() ? self.selectedItems([rowItem.entity()]) :self.selectedItems([]);
        }      
        self.addOrRemove(rowItem);
        self.lastClickedRow(rowItem);
        return true;
    }

    // just call this func and hand it the rowItem you want to select (or de-select)    
    this.addOrRemove = function(rowItem) {
        if (!rowItem.selected()) {
            self.selectedItems.remove(rowItem.entity());
        } else {
            if (self.selectedItems.indexOf(rowItem.entity()) === -1) {
                self.selectedItems.push(rowItem.entity());
            }
        }
    };
    
    // the count of selected items (supports both multi and single-select logic
    this.selectedItemCount = ko.computed(function () {
        return self.selectedItems().length;
    });

    // ensures our selection flag on each item stays in sync
    this.selectedItems.subscribe(function (newItems) {
        var data = dataSource();

        if (!newItems) {
            newItems = [];
        }

        kg.utils.forEach(data, function (item, i) {

            if (!item[KEY]) {
                item[KEY] = ko.observable(false);
            }

            if (ko.utils.arrayIndexOf(newItems, item) > -1) {
                //newItems contains the item
                item[KEY](true);
            } else {
                item[KEY](false);
            }

        });
    });

    this.lastSelectedItem = options.lastClickedRow;

    // writable-computed observable
    // @return - boolean indicating if all items are selected or not
    // @val - boolean indicating whether to select all/de-select all
    this.toggleSelectAll = ko.computed({
        read: function () {
            var cnt = self.selectedItemCount();
            if (maxRows() === 0) {
                return false;
            }
            return cnt === maxRows();
        },
        write: function (val) {
            var checkAll = val,
            dataSourceCopy = [];
            kg.utils.forEach(dataSource(), function (item) {
                dataSourceCopy.push(item);
            });
            if (checkAll) {
                self.selectedItems(dataSourceCopy);
            } else {

                self.selectedItems([]);

            }
        }
    });

    //make sure as the data changes, we keep the selectedItem(s) correct
    dataSource.subscribe(function (items) {
        var selectedItems,
            itemsToRemove;
        if (!items) {
            return;
        }
        
        //make sure the selectedItem(s) exist in the new data
        selectedItems = self.selectedItems();
        itemsToRemove = [];

        ko.utils.arrayForEach(selectedItems, function (item) {
            if (ko.utils.arrayIndexOf(items, item) < 0) {
                itemsToRemove.push(item);
            }
        });

        //clean out any selectedItems that don't exist in the new array
        if (itemsToRemove.length > 0) {
            self.selectedItems.removeAll(itemsToRemove);
        }
    });
};   
 
 
/*********************************************** 
* FILE: ..\Src\GridManager.js 
***********************************************/ 
﻿kg.gridManager = (new function () {
    var self = this,
        elementGridKey = '__koGrid__';

    //#region Public Properties
    this.gridCache = {};

    //#endregion

    //#region Public Methods
    this.storeGrid = function (element, grid) {
        self.gridCache[grid.gridId] = grid;
        element[elementGridKey] = grid.gridId;
    };
    
    this.removeGrid = function(gridId) {
        delete self.gridCache[gridId];
    };

    this.getGrid = function (element) {
        var grid;
        if (element[elementGridKey]) {
            grid = self.gridCache[element[elementGridKey]];
        }
        return grid;
    };

    this.clearGridCache = function () {
        self.gridCache = {};
    };
    
    this.getIndexOfCache = function(gridId) {
        var indx = -1;   
        for (var grid in self.gridCache) {
            indx++;
            if (!self.gridCache.hasOwnProperty(grid)) continue;
            return indx;
        }
        return indx;
﻿    };

    this.assignGridEventHandlers = function (grid) {

        grid.$viewport.scroll(function (e) {
            var scrollLeft = e.target.scrollLeft,
                scrollTop = e.target.scrollTop;

            grid.adjustScrollLeft(scrollLeft);
            grid.adjustScrollTop(scrollTop);
        });

        grid.$viewport.off('keydown');
        grid.$viewport.on('keydown', function (e) {
            return kg.moveSelectionHandler(grid, e);
        });
        
        //Chrome and firefox both need a tab index so the grid can recieve focus.
        //need to give the grid a tabindex if it doesn't already have one so
        //we'll just give it a tab index of the corresponding gridcache index 
        //that way we'll get the same result every time it is run.
        //configurable within the options.
        if (grid.config.tabIndex === -1){
            grid.$viewport.attr('tabIndex', self.getIndexOfCache(grid.gridId));
        } else {
            grid.$viewport.attr('tabIndex', grid.config.tabIndex);
        }
        
        //resize the grid on parent re-size events
        var $parent = grid.$root.parent();

        if ($parent.length == 0) {
            $parent = grid.$root;
        }

        $(window).resize(function () {
            var prevSizes = {
                rootMaxH: grid.elementDims.rootMaxH,
                rootMaxW: grid.elementDims.rootMaxW,
                rootMinH: grid.elementDims.rootMinH,
                rootMinW: grid.elementDims.rootMinW
            },
            scrollTop = 0,
            isDifferent = false;
            
            // first check to see if the grid is hidden... if it is, we will screw a bunch of things up by re-sizing
            var $hiddens = grid.$root.parents(":hidden");
            if ($hiddens.length > 0) {
                return;
            }

            //catch this so we can return the viewer to their original scroll after the resize!
            scrollTop = grid.$viewport.scrollTop();

            kg.domUtility.measureGrid(grid.$root, grid);

            //check to see if anything has changed
            if (prevSizes.rootMaxH !== grid.elementDims.rootMaxH && grid.elementDims.rootMaxH !== 0) { // if display: none is set, then these come back as zeros
                isDifferent = true;
            } else if (prevSizes.rootMaxW !== grid.elementDims.rootMaxW && grid.elementDims.rootMaxW !== 0) {
                isDifferent = true;
            } else if (prevSizes.rootMinH !== grid.elementDims.rootMinH) {
                isDifferent = true;
            } else if (prevSizes.rootMinW !== grid.elementDims.rootMinW) {
                isDifferent = true;
            } else {
                return;
            }

            if (isDifferent) {

                grid.refreshDomSizes();

                grid.adjustScrollTop(scrollTop, true); //ensure that the user stays scrolled where they were
            }
        });
    };
    //#endregion
} ()); 
 
 
/*********************************************** 
* FILE: ..\Src\Grid.js 
***********************************************/ 
﻿/// <reference path="../lib/jquery-1.7.js" />
/// <reference path="../lib/knockout-2.0.0.debug.js" />

kg.KoGrid = function (options, gridWidth) {
    var defaults = {
        rowHeight: 30,
        columnWidth: 100,
        headerRowHeight: 30,
        footerRowHeight: 55,
        filterRowHeight: 30,
        rowTemplate: 'kgRowTemplate',
        headerTemplate: 'kgHeaderRowTemplate',
        headerCellTemplate: 'kgHeaderCellTemplate',
        footerTemplate: 'kgFooterTemplate',
        footerVisible: ko.observable(true),
        canSelectRows: true,
        autogenerateColumns: true,
        data: null, //ko.observableArray
        columnDefs: ko.observableArray([]),
        pageSizes: [250, 500, 1000], //page Sizes
        enablePaging: false,
        pageSize: ko.observable(250), //Size of Paging data
        totalServerItems: ko.observable(), //ko.observable of how many items are on the server (for paging)
        currentPage: ko.observable(1), //ko.observable of what page they are currently on
        selectedItems: ko.observableArray([]), //ko.observableArray
        selectedIndex: ko.observable(0), //observable of the index of the selectedItem in the data array
        displaySelectionCheckbox: true, //toggles whether row selection check boxes appear
        displayRowIndex: true, //shows the rowIndex cell at the far left of each row
        useExternalFiltering: false,
        useExternalSorting: false,
        filterInfo: ko.observable(), //observable that holds filter information (fields, and filtering strings)
        sortInfo: ko.observable(), //observable similar to filterInfo
        filterWildcard: "*",
        includeDestroyed: false, // flag to show _destroy=true items in grid
        selectWithCheckboxOnly: false,
        keepLastSelectedAround: false,
        isMultiSelect: true,
        lastClickedRow: ko.observable(),
        tabIndex: -1,
        disableTextSelection: false,
        enableColumnResize: true
    },

    self = this,
    filterIsOpen = ko.observable(false), //observable so that the header can subscribe and change height when opened
    filterManager, //kg.FilterManager
    sortManager, //kg.SortManager
    isSorting = false,
    prevScrollTop,
    prevScrollLeft,
    prevMinRowsToRender,
    maxCanvasHt = 0,
    h_updateTimeout;

    this.$root; //this is the root element that is passed in with the binding handler
    this.$topPanel;
    this.$headerContainer;
    this.$headerScroller;
    this.$headers;
    this.$viewport;
    this.$canvas;
    this.$footerPanel;
    this.width = ko.observable(gridWidth);
    this.selectionManager;
    this.selectedItemCount;
    
    //If column Defs are not observable, make them so. Will not update dynamically this way.
    if (options.columnDefs && !ko.isObservable(options.columnDefs)){
        var observableColumnDefs = ko.observableArray(options.columnDefs);
        options.columnDefs = observableColumnDefs;
    }
    this.config = $.extend(defaults, options);
    this.gridId = "kg" + kg.utils.newId();
    this.initPhase = 0;


    // Set new default footer height if not overridden, and multi select is disabled
    if (this.config.footerRowHeight === defaults.footerRowHeight
        && !this.config.canSelectRows) {
        defaults.footerRowHeight = 30;
        this.config.footerRowHeight = 30;
    }
    
    // set this during the constructor execution so that the
    // computed observables register correctly;
    this.data = self.config.data;

    filterManager = new kg.FilterManager(self.config);
    sortManager = new kg.SortManager({
        data: filterManager.filteredData,
        sortInfo: self.config.sortInfo,
        useExternalSorting: self.config.useExternalSorting
    });

    this.sortInfo = sortManager.sortInfo; //observable
    this.filterInfo = filterManager.filterInfo; //observable
    this.finalData = sortManager.sortedData; //observable Array
    this.canvasHeight = ko.observable(maxCanvasHt.toString() + 'px');

    this.maxRows = ko.computed(function () {
        var rows = self.finalData();
        maxCanvasHt = rows.length * self.config.rowHeight;
        self.canvasHeight(maxCanvasHt.toString() + 'px');
        return rows.length || 0;
    });

    this.maxCanvasHeight = function () {
        return maxCanvasHt || 0;
    };

    this.columns = new kg.ColumnCollection();

    //initialized in the init method
    this.rowManager;
    this.rows;
    this.headerRow;
    this.footer;

    this.elementDims = {
        scrollW: 0,
        scrollH: 0,
        cellHdiff: 0,
        cellWdiff: 0,
        rowWdiff: 0,
        rowHdiff: 0,
        rowIndexCellW: 25,
        rowSelectedCellW: 25,
        rootMaxW: 0,
        rootMaxH: 0,
        rootMinW: 0,
        rootMinH: 0
    };
    this.elementsNeedMeasuring = true;

    //#region Container Dimensions

    this.rootDim = ko.observable(new kg.Dimension({ outerHeight: 20000, outerWidth: 20000 }));

    this.headerDim = ko.computed(function () {
        var rootDim = self.rootDim(),
            filterOpen = filterIsOpen(),
            newDim = new kg.Dimension();

        newDim.outerHeight = self.config.headerRowHeight;
        newDim.outerWidth = rootDim.outerWidth;

        if (filterOpen) {
            newDim.outerHeight += self.config.filterRowHeight;
        }

        return newDim;
    });

    this.footerDim = ko.computed(function () {
        var rootDim = self.rootDim(),
            showFooter = self.config.footerVisible(),
            newDim = new kg.Dimension();

        newDim.outerHeight = self.config.footerRowHeight;
        newDim.outerWidth = rootDim.outerWidth;

        if (!showFooter) {
            newDim.outerHeight = 3;
        }

        return newDim;
    });

    this.viewportDim = ko.computed(function () {
        var rootDim = self.rootDim(),
            headerDim = self.headerDim(),
            footerDim = self.footerDim(),
            newDim = new kg.Dimension();

        newDim.outerHeight = rootDim.outerHeight - headerDim.outerHeight - footerDim.outerHeight;
        newDim.outerWidth = rootDim.outerWidth;
        newDim.innerHeight = newDim.outerHeight;
        newDim.innerWidth = newDim.outerWidth;

        return newDim;
    });

    this.totalRowWidth = ko.computed(function () {
        var totalWidth = 0,
            cols = self.columns(),
            numOfCols = self.columns().length,
            asterisksArray = [],
            percentArray = [],
            asteriskNum = 0;
            
        kg.utils.forEach(cols, function (col, i) {
            // get column width out of the observable
            var t = col.width();
            // check if it is a number
            if (isNaN(t)){
                // figure out if the width is defined or if we need to calculate it
                if (t == undefined) {
                    // set the width to the length of the header title +30 for sorting icons and padding
                    col.width((col.displayName.length * kg.domUtility.letterW) + 30); 
                } else if (t.indexOf("*") != -1){
                    // if it is the last of the columns just configure it to use the remaining space
                    if (i + 1 == numOfCols && asteriskNum == 0){
                        col.width(self.width() - totalWidth);
                    } else { // otherwise we need to save it until the end to do the calulations on the remaining width.
                        asteriskNum += t.length;
                        asterisksArray.push(col);
                        return;
                    }
                } else if (kg.utils.endsWith(t, "%")){ // If the width is a percentage, save it until the very last.
                    percentArray.push(col);
                    return;
                } else { // we can't parse the width so lets throw an error.
                    throw "unable to parse column width, use percentage (\"10%\",\"20%\", etc...) or \"*\" to use remaining width of grid";
                }
            }
            // add the caluclated or pre-defined width the total width
            totalWidth += col.width();
            // set the flag as the width is configured so the subscribers can be added
            col.widthIsConfigured = true;
        });
        // check if we saved any asterisk columns for calculating later
        if (asterisksArray.length > 0){
            // get the remaining width
            var remainigWidth = self.width() - totalWidth;
            // calculate the weight of each asterisk rounded down
            var asteriskVal = Math.floor(remainigWidth / asteriskNum);
            // set the width of each column based on the number of stars
            kg.utils.forEach(asterisksArray, function (col, i) {
                var t = col.width().length;
                col.width(asteriskVal * t);
                totalWidth += col.width();
            });
        }
        // Now we check if we saved any percentage columns for calculating last
        if (percentArray.length > 0){
            // do the math
            kg.utils.forEach(percentArray, function (col, i) {
                var t = col.width();
                col.width(Math.floor(self.width() * (parseInt(t.slice(0, - 1)) / 100)));
                totalWidth += col.width();
            });
        }
        return totalWidth;
    });

    this.minRowsToRender = ko.computed(function () {
        var viewportH = self.viewportDim().outerHeight || 1;

        if (filterIsOpen()) {
            return prevMinRowsToRender;
        };

        prevMinRowsToRender = Math.floor(viewportH / self.config.rowHeight);

        return prevMinRowsToRender;
    });


    this.headerScrollerDim = ko.computed(function () {
        var viewportH = self.viewportDim().outerHeight,
            filterOpen = filterIsOpen(), //register this observable
            maxHeight = self.maxCanvasHeight(),
            vScrollBarIsOpen = (maxHeight > viewportH),
            hScrollBarIsOpen = (self.viewportDim().outerWidth < self.totalRowWidth()),
            newDim = new kg.Dimension();

        newDim.autoFitHeight = true;
        newDim.outerWidth = self.totalRowWidth();

        if (vScrollBarIsOpen) { newDim.outerWidth += self.elementDims.scrollW; }
        else if ((maxHeight - viewportH) <= self.elementDims.scrollH) { //if the horizontal scroll is open it forces the viewport to be smaller
            newDim.outerWidth += self.elementDims.scrollW;
        }
        return newDim;
    });

    //#endregion

    //#region Events
    this.toggleSelectAll;

    this.sortData = function (col, dir) {
        isSorting = true;

        kg.utils.forEach(self.columns(), function (column) {
            if (column.field !== col.field) {
                if (column.sortDirection() !== "") { column.sortDirection(""); }
            }
        });

        sortManager.sort(col, dir);

        isSorting = false;
    };

    //#endregion

    //keep selected item scrolled into view
    this.finalData.subscribe(function () {
         if (self.config.selectedItems()) {
            var lastItemIndex = self.config.selectedItems().length - 1;
            if (lastItemIndex <= 0) {
                var item = self.config.selectedItems()[lastItemIndex];
                if (item) {
                   scrollIntoView(item);
                }
            }
        }
    });

    var scrollIntoView = function (entity) {
        var itemIndex,
            viewableRange = self.rowManager.viewableRange();

        if (entity) {
            itemIndex = ko.utils.arrayIndexOf(self.finalData(), entity);
        }

        if (itemIndex > -1) {
            //check and see if its already in view!
            if (itemIndex > viewableRange.topRow || itemIndex < viewableRange.bottomRow - 5) {

                //scroll it into view
                self.rowManager.viewableRange(new kg.Range(itemIndex, itemIndex + self.minRowsToRender()));

                if (self.$viewport) {
                    self.$viewport.scrollTop(itemIndex * self.config.rowHeight);
                }
            }
        };
    };

    this.refreshDomSizes = function () {
        var dim = new kg.Dimension(),
            oldDim = self.rootDim(),
            rootH = 0,
            rootW = 0,
            canvasH = 0;

        self.elementsNeedMeasuring = true;

        //calculate the POSSIBLE biggest viewport height
        rootH = self.maxCanvasHeight() + self.config.headerRowHeight + self.config.footerRowHeight;

        //see which viewport height will be allowed to be used
        rootH = Math.min(self.elementDims.rootMaxH, rootH);
        rootH = Math.max(self.elementDims.rootMinH, rootH);

        //now calc the canvas height of what is going to be used in rendering
        canvasH = rootH - self.config.headerRowHeight - self.config.footerRowHeight;

        //get the max row Width for rendering
        rootW = self.totalRowWidth() + self.elementDims.rowWdiff;

        //now see if we are going to have a vertical scroll bar present
        if (self.maxCanvasHeight() > canvasH) {

            //if we are, then add that width to the max width 
            rootW += self.elementDims.scrollW || 0;
        }

        //now see if we are constrained by any width dimensions
        dim.outerWidth = Math.min(self.elementDims.rootMaxW, rootW);
        dim.outerWidth = Math.max(self.elementDims.rootMinW, dim.outerWidth);

        dim.outerHeight = rootH;

        //finally don't fire the subscriptions if we aren't changing anything!
        if (dim.outerHeight !== oldDim.outerHeight || dim.outerWidth !== oldDim.outerWidth) {

            //if its not the same, then fire the subscriptions
            self.rootDim(dim);
        }
    };

    this.refreshDomSizesTrigger = ko.computed(function () {
        //register dependencies
        var data = self.data();

        if (h_updateTimeout) {
            if (window.setImmediate) {
                window.clearImmediate(h_updateTimeout);
            } else {
                window.clearTimeout(h_updateTimeout);
            }
        }

        if (self.initPhase > 0) {

            //don't shrink the grid if we sorting or filtering
            if (!filterIsOpen() && !isSorting) {

                self.refreshDomSizes();

                kg.cssBuilder.buildStyles(self);

                if (self.initPhase > 0 && self.$root) {
                    self.$root.show();
                }
            }
        }

    });

    this.buildColumnDefsFromData = function () {
        if (self.config.columnDefs().length > 0){
            return;
        }
        if (!self.data() || !self.data()[0]) {
            throw 'If auto-generating columns, "data" cannot be of null or undefined type!';
        }

        var item;
        item = self.data()[0];

        kg.utils.forIn(item, function (prop, propName) {
            if (propName === '__kg_selected__') {
                return;
            }

            self.config.columnDefs().push({
                field: propName
            });
        });

    };

    this.buildColumns = function () {
        var columnDefs = self.config.columnDefs,
            cols = [];

        if (self.config.autogenerateColumns) { self.buildColumnDefsFromData(); }

        if (self.config.displaySelectionCheckbox) {
            columnDefs().splice(0, 0, { field: '__kg_selected__', width: self.elementDims.rowSelectedCellW });
        }
        if (self.config.displayRowIndex) {
            columnDefs().splice(0, 0, { field: 'rowIndex', width: self.elementDims.rowIndexCellW });
        }
        
        var createColumnSortClosure = function (col) {
            return function (dir) {
                if (dir) {
                    self.sortData(col, dir);
                }
            }
        }

        if (columnDefs().length > 0) {

            kg.utils.forEach(columnDefs(), function (colDef, i) {
                var column = new kg.Column(colDef, i);
                column.sortDirection.subscribe(createColumnSortClosure(column));                
                column.filter.subscribe(filterManager.createFilterChangeCallback(column));
                cols.push(column);
            });

            self.columns(cols);
        }
    };

    this.init = function () {

        self.buildColumns();

        //now if we are using the default templates, then make the generated ones unique
        if (self.config.rowTemplate === 'kgRowTemplate') {
            self.config.rowTemplate = self.gridId + self.config.rowTemplate;
        }

        if (self.config.headerTemplate === 'kgHeaderRowTemplate') {
            self.config.headerTemplate = self.gridId + self.config.headerTemplate;
        }

        self.rowManager = new kg.RowManager(self);
        self.selectionManager = new kg.SelectionManager({
            isMultiSelect: self.config.isMultiSelect,
            data: self.finalData,
            selectedItem: self.config.selectedItem,
            selectedItems: self.config.selectedItems,
            selectedIndex: self.config.selectedIndex,
            lastClickedRow: self.config.lastClickedRow,
            isMulti: self.config.isMultiSelect
        }, self.rowManager);
        
        kg.utils.forEach(self.columns(), function(col) {
            if (col.widthIsConfigured){
                col.width.subscribe(function(){
                    self.rowManager.dataChanged = true;
                    self.rowManager.rowCache = []; //if data source changes, kill this!
                    self.rowManager.calcRenderedRange();
                });
            }
        });
        
        self.selectedItemCount = self.selectionManager.selectedItemCount;
        self.toggleSelectAll = self.selectionManager.toggleSelectAll;
        self.rows = self.rowManager.rows; // dependent observable

        kg.cssBuilder.buildStyles(self);

        self.initPhase = 1;
    };

    this.update = function () {
        //we have to update async, or else all the observables are registered as dependencies

        var updater = function () {

            self.refreshDomSizes();

            kg.cssBuilder.buildStyles(self);

            if (self.initPhase > 0 && self.$root) {
                self.$root.show();
            }
        };

        if (window.setImmediate) {
            h_updateTimeout = setImmediate(updater);
        } else {
            h_updateTimeout = setTimeout(updater, 0);
        }
    };

    this.showFilter_Click = function () {
        var isOpen = (filterIsOpen() ? false : true);

        self.headerRow.filterVisible(isOpen);

        filterIsOpen(isOpen);
    };

    this.clearFilter_Click = function () {
        kg.utils.forEach(self.columns(), function (col, i) {
            col.filter(null);
        });
    };

    this.adjustScrollTop = function (scrollTop, force) {
        var rowIndex;

        if (prevScrollTop === scrollTop && !force) { return; }

        rowIndex = Math.floor(scrollTop / self.config.rowHeight);

        prevScrollTop = scrollTop;

        self.rowManager.viewableRange(new kg.Range(rowIndex, rowIndex + self.minRowsToRender()));
    };

    this.adjustScrollLeft = function (scrollLeft) {
        if (self.$headerContainer) {
            self.$headerContainer.scrollLeft(scrollLeft);
        }
    };

    //call init
    self.init();
}; 
 
 
/*********************************************** 
* FILE: ..\Src\DomManipulation\CssBuilder.js 
***********************************************/ 
﻿/// <reference path="../../lib/jquery-1.7.js" />
/// <reference path="../../lib/knockout-2.0.0.debug.js" />
/// <reference path="../KoGrid.js" />

kg.cssBuilder = {

    buildStyles: function (grid) {
        var rowHeight = (grid.config.rowHeight - grid.elementDims.rowHdiff),
            headerRowHeight = grid.config.headerRowHeight,
            $style = grid.$styleSheet,
            gridId = grid.gridId,
            rules,
            i = 0,
            len = grid.columns().length,
            css = new kg.utils.StringBuilder(),
            col,
            sumWidth = 0,
            colWidth;

        if (!$style) {
            $style = $("<style type='text/css' rel='stylesheet' />").appendTo($('head'));
        }
        $style.empty();
        
        css.append(".{0} .kgCanvas { width: {1}px; }", gridId, grid.totalRowWidth());
        css.append(".{0} .kgCell { height: {1}px; }", gridId, rowHeight);
        css.append(".{0} .kgRow { position: absolute; left: 0; right: 0; height: {1}px; line-height: {1}px; display: inline; }", gridId, rowHeight);
        css.append(".{0} .kgHeaderCell { top: 0; bottom: 0; }", gridId, headerRowHeight);
        css.append(".{0} .kgHeaderScroller { line-height: {1}px; overflow: none; }", gridId, headerRowHeight);    
        
        for (; i < len; i++) {
            col = grid.columns()[i];
            colWidth = col.width() - grid.elementDims.cellWdiff;
            css.append(".{0} .col{1} { left: {2}px; right: {3}px; }", gridId, i, sumWidth, (grid.totalRowWidth() - sumWidth - col.width()));
            sumWidth += col.width();
        }



        if (kg.utils.isIe) { // IE
            $style[0].styleSheet.cssText = css.toString(" ");
        }
        else {
            $style[0].appendChild(document.createTextNode(css.toString(" ")));
        }

        grid.$styleSheet = $style;
    }
}; 
 
 
/*********************************************** 
* FILE: ..\Src\DomManipulation\DomUtility.js 
***********************************************/ 
﻿kg.domUtility = (new function () {
    var $testContainer = $('<div></div>'),
        self = this;

    var parsePixelString = function(pixelStr){
        if(!pixelStr){
            return 0;
        }

        var numStr = pixelStr.replace("/px/gi", "");

        var num = parseInt(numStr, 10);

        return isNaN(num) ? 0 : num;
    };

    this.assignGridContainers = function (rootEl, grid) {

        grid.$root = $(rootEl);

        //Headers
        grid.$topPanel = $(".kgTopPanel", grid.$root[0]);
        grid.$headerContainer = $(".kgHeaderContainer", grid.$topPanel[0]);
        grid.$headerScroller = $(".kgHeaderScroller", grid.$headerContainer[0]);
        grid.$headers = grid.$headerContainer.children();

        //Viewport
        grid.$viewport = $(".kgViewport", grid.$root[0]);

        //Canvas
        grid.$canvas = $(".kgCanvas", grid.$viewport[0]);

        //Footers
        grid.$footerPanel = $(".kgFooterPanel", grid.$root[0]);
    };

    this.measureElementMaxDims = function ($container) {
        var dims = {};

        var $test = $("<div style='height: 20000px; width: 20000px;'></div>");

        $container.append($test);

        dims.maxWidth = $container.width();
        dims.maxHeight = $container.height();


        if (!dims.maxWidth) {
            var pixelStr = $container.css("max-width");
            dims.maxWidth = parsePixelString(pixelStr);
        }

        if (!dims.maxHeight) {
            var pixelStr = $container.css("max-height");
            dims.maxHeight = parsePixelString(pixelStr);
        }

        //if they are zero, see what the parent's size is
        if (dims.maxWidth === 0) {
            dims.maxWidth = $container.parent().width();
        }
        if (dims.maxHeight === 0) {
            dims.maxHeight = $container.parent().height();
        }
        
        $test.remove();

        return dims;
    };

    this.measureElementMinDims = function ($container) {
        var dims = {},
            $testContainer = $container.clone();

        $testContainer.appendTo($container.parent().first());

        dims.minWidth = 0;
        dims.minHeight = 0;

        //since its cloned... empty it out
        $testContainer.empty();

        var $test = $("<div style='height: 0x; width: 0px;'></div>");
        $testContainer.append($test);

        //$testContainer.wrap("<div style='width: 1px; height: 1px;'></div>");

        dims.minWidth = $testContainer.width();
        dims.minHeight = $testContainer.height();

        if (!dims.minWidth) {
            var pixelStr = $testContainer.css("min-width");            
            dims.minWidth = parsePixelString(pixelStr);
        }

        if (!dims.minHeight) {
            var pixelStr = $testContainer.css("min-height");
            dims.minHeight = parsePixelString(pixelStr);
        }

        $testContainer.remove();

        return dims;
    };

    this.measureGrid = function ($container, grid, measureMins) {

        //find max sizes
        var dims = self.measureElementMaxDims($container);

        grid.elementDims.rootMaxW = dims.maxWidth;
        grid.elementDims.rootMaxH = dims.maxHeight;

        //set scroll measurements
        grid.elementDims.scrollW = kg.domUtility.scrollW;
        grid.elementDims.scrollH = kg.domUtility.scrollH;

        //find min sizes
        dims = self.measureElementMinDims($container);

        grid.elementDims.rootMinW = dims.minWidth;

        // do a little magic here to ensure we always have a decent viewport
        dims.minHeight = Math.max(dims.minHeight, (grid.config.headerRowHeight + grid.config.footerRowHeight + (3 * grid.config.rowHeight)));
        dims.minHeight = Math.min(grid.elementDims.rootMaxH, dims.minHeight);

        grid.elementDims.rootMinH = dims.minHeight;
    };

    this.measureRow = function ($canvas, grid) {
        var $row,
            $cell,
            isDummyRow,
            isDummyCell;

        $row = $canvas.children().first();
        if ($row.length === 0) {
            //add a dummy row
            $canvas.append('<div class="kgRow"></div>');
            $row = $canvas.children().first();
            isDummyRow = true;
        }

        $cell = $row.children().first();
        if ($cell.length === 0) {
            //add a dummy cell
            $row.append('<div class="kgCell col0"></div>');
            $cell = $row.children().first();
            isDummyCell = true;
        }

        grid.elementDims.rowWdiff = $row.outerWidth() - $row.width();
        grid.elementDims.rowHdiff = $row.outerHeight() - $row.height();

        grid.elementDims.cellWdiff = $cell.outerWidth() - $cell.width();
        grid.elementDims.cellHdiff = $cell.outerHeight() - $cell.height();

        grid.elementsNeedMeasuring = false;

        if (isDummyRow) {
            $row.remove();
        } else if (isDummyCell) {
            $cell.remove();
        }
    };

    this.scrollH = 17; // default in IE, Chrome, & most browsers
    this.scrollW = 17; // default in IE, Chrome, & most browsers
    this.letterW = 5;

    $(function () {
        $testContainer.appendTo('body');
        // 1. Run all the following measurements on startup!

        //measure Scroll Bars
        $testContainer.height(100).width(100).css("position", "absolute").css("overflow", "scroll");
        $testContainer.append('<div style="height: 400px; width: 400px;"></div>');

        self.scrollH = ($testContainer.height() - $testContainer[0].clientHeight);
        self.scrollW = ($testContainer.width() - $testContainer[0].clientWidth);

        $testContainer.empty();

        //clear styles
        $testContainer.attr('style', '');

        //measure letter sizes using a pretty typical font size and fat font-family
        $testContainer.append('<span style="font-family: Verdana, Helvetica, Sans-Serif; font-size: 14px;"><strong>M</strong></span>');

        self.letterW = $testContainer.children().first().width();

        $testContainer.remove();
    });

} ()); 
 
 
/*********************************************** 
* FILE: ..\Src\BindingHandlers\kgWith.js 
***********************************************/ 
﻿
// This binding only works if the object that you want
// use as the context of child bindings DOESN't change.
// It is useful for us here since many of the grids properties
// don't actually change, and thus this really just helps create
// more readable and manageable code
ko.bindingHandlers['kgWith'] = (function () {

    return {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var val = ko.utils.unwrapObservable(valueAccessor()),
                newContext = bindingContext.createChildContext(val);

            //we don't want bad binding contexts bc all the child bindings will blow up
            if (!val) { throw Error("Cannot use a null or undefined value with the 'kgWith' binding"); }

            //now cascade the new binding context throughout child elements...
            ko.applyBindingsToDescendants(newContext, element);

            return { 'controlsDescendantBindings': true };
        }
    };
} ()); 
 
 
/*********************************************** 
* FILE: ..\Src\BindingHandlers\koGrid.js 
***********************************************/ 
﻿/// <reference path="../../lib/knockout-2.0.0.debug.js" />
/// <reference path="../../lib/jquery-1.7.js" />

ko.bindingHandlers['koGrid'] = (function () {
    var makeNewValueAccessor = function (grid) {
        return function () {
            return {
                name: GRID_TEMPLATE,
                data: grid
            };
        };
    };

    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var grid,
                options = valueAccessor(),
                $element = $(element);

            //create the Grid
            var grid = kg.gridManager.getGrid(element);
            if (!grid){
                grid = new kg.KoGrid(options, $(element).width());
                kg.gridManager.storeGrid(element, grid);
            } else {
                return false;
            }
            
            kg.templateManager.ensureGridTemplates({
                rowTemplate: grid.config.rowTemplate,
                headerTemplate: grid.config.headerTemplate,
                headerCellTemplate: grid.config.headerCellTemplate,
                footerTemplate: grid.config.footerTemplate,
                columns: grid.columns(),
                showFilter: grid.config.allowFiltering,
                disableTextSelection: grid.config.disableTextSelection,
                autogenerateColumns: grid.config.autogenerateColumns,
                enableColumnResize: grid.config.enableColumnResize
            });

            //subscribe to the columns and recrate the grid if they change
            grid.config.columnDefs.subscribe(function (){
                var oldgrid = kg.gridManager.getGrid(element);
                var oldgridId = oldgrid.gridId.toString();
                $(element).empty(); 
                $(element).removeClass("kgGrid")
                          .removeClass("ui-widget")
                          .removeClass(oldgridId);
                kg.gridManager.removeGrid(oldgridId);
                ko.applyBindings(bindingContext, element);
            });
            
            //get the container sizes
            kg.domUtility.measureGrid($element, grid, true);

            $element.hide(); //first hide the grid so that its not freaking the screen out

            //set the right styling on the container
            $element.addClass("kgGrid")
                    .addClass("ui-widget")
                    .addClass(grid.gridId.toString());

            //make sure the templates are generated for the Grid
            return ko.bindingHandlers['template'].init(element, makeNewValueAccessor(grid), allBindingsAccessor, grid, bindingContext);

        },
        'update': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var grid,
                returnVal;

            grid = kg.gridManager.getGrid(element);

            //kind a big problem if this isn't here...
            if (!grid) {
                return { 'controlsDescendantBindings': true };
            }

            //fire the with "update" bindingHandler
            returnVal = ko.bindingHandlers['template'].update(element, makeNewValueAccessor(grid), allBindingsAccessor, grid, bindingContext);

            //walk the element's graph and the correct properties on the grid
            kg.domUtility.assignGridContainers(element, grid);

            //now use the manager to assign the event handlers
            kg.gridManager.assignGridEventHandlers(grid);

            //call update on the grid, which will refresh the dome measurements asynchronously
            grid.update();

            return returnVal;
        }
    };

} ());
 
 
 
/*********************************************** 
* FILE: ..\Src\BindingHandlers\kgRows.js 
***********************************************/ 
﻿/// <reference path="../../lib/knockout-2.0.0.debug.js" />
/// <reference path="../../lib/jquery-1.7.js" />

ko.bindingHandlers['kgRows'] = (function () {

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


    return {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            return { 'controlsDescendantBindings': true };
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var rowManager = bindingContext.$data.rowManager,
                rows = ko.utils.unwrapObservable(valueAccessor()),
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

            return { 'controlsDescendantBindings': true };
        }
    };

} ()); 
 
 
/*********************************************** 
* FILE: ..\Src\BindingHandlers\kgRow.js 
***********************************************/ 
ko.bindingHandlers['kgRow'] = (function () {
    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

        },
        'update': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var row = valueAccessor(),
                classes = 'kgRow',
                grid = bindingContext.$parent,
                rowManager = bindingContext.$parent.rowManager,
                rowSubscription;

            if (grid.config.canSelectRows) {
                classes += ' kgCanSelect';
            }
            classes += (row.rowIndex % 2) === 0 ? ' even' : ' odd';

            element['__kg_rowIndex__'] = row.rowIndex;
            element.style.top = row.offsetTop + 'px';
            element.className = classes;

            //ensure we know the node to dispose later!

            rowSubscription = rowManager.rowSubscriptions[row.rowIndex];
            if (rowSubscription) {
                rowSubscription.node = element;
            }
        }
    };
} ()); 
 
 
/*********************************************** 
* FILE: ..\Src\BindingHandlers\kgCell.js 
***********************************************/ 
﻿/// <reference path="../../lib/knockout-2.0.0.debug.js" />
/// <reference path="../../lib/jquery-1.7.js" />

ko.bindingHandlers['kgCell'] = (function () {
    var makeValueAccessor = function (cell) {
        var func;

        if (cell.column.field === 'rowIndex') {
            return function () { return cell.row.rowDisplayIndex; }
        } else {
            return function () { return cell.data; }
        }
    };

    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

        },
        'update': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var options = valueAccessor(),
                cell,
                row = bindingContext.$data;

            //get the cell from the options
            cell = row.cellMap[options.value];
            if (cell == undefined) return;
            //ensure the cell has the right class so it lines up correctly
            element.className += " kgCell " + "col" + cell.column.index + " ";

            if (cell.column.field !== '__kg_selected__' && !cell.column.hasCellTemplate) {
                ko.bindingHandlers.text.update(element, makeValueAccessor(cell));
            }
        }
    };
} ()); 
 
 
/*********************************************** 
* FILE: ..\src\BindingHandlers\kgHeaderRow.js 
***********************************************/ 
﻿ko.bindingHandlers['kgHeaderRow'] = (function () {

    var buildHeaders = function (grid) {
        var cols = grid.columns(),
            cell,
            headerRow = new kg.HeaderRow();

        kg.utils.forEach(cols, function (col, i) {
            cell = new kg.HeaderCell(col);
            cell.colIndex = i;

            headerRow.headerCells.push(cell);
            headerRow.headerCellMap[col.field] = cell;
        });

        grid.headerRow = headerRow;
        grid.headerRow.height = grid.config.headerRowHeight;
    };

    var makeNewValueAccessor = function (grid) {
        return function () {
            return { name: grid.config.headerTemplate, data: grid.headerRow };
        }
    };

    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var grid = bindingContext.$data;

            buildHeaders(grid);

            return ko.bindingHandlers.template.init(element, makeNewValueAccessor(grid), allBindingsAccessor, grid, bindingContext);
        },
        'update': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var grid = bindingContext.$data;

            return ko.bindingHandlers.template.update(element, makeNewValueAccessor(grid), allBindingsAccessor, grid, bindingContext);
        }
    }
} ()); 
 
 
/*********************************************** 
* FILE: ..\src\BindingHandlers\kgHeaderCell.js 
***********************************************/ 
﻿ko.bindingHandlers['kgHeader'] = (function () {
    var makeNewValueAccessor = function (headerCell, grid) {
        return function () {
            return {
                name: headerCell.headerTemplate || grid.config.headerCellTemplate,
                data: headerCell
            };
        };
    };
    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var headerRow = bindingContext.$data,
                cell,
                property,
                options = valueAccessor(); //string of the property name

            if (options) {
                property = options.value;
                cell = headerRow.headerCellMap[property];
                if (cell) {
                    if (property !== 'rowIndex' && property !== '__kg_selected__') {
                        return { 'controlsDescendantBindings': true }
                    }
                }
            }

            
        },
        'update': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var headerRow = bindingContext.$data,
                grid = bindingContext.$parent,
                cell,
                property,
                options = valueAccessor(); //string of the property name

            if (options) {
                property = options.value;
                cell = headerRow.headerCellMap[property];
                if (cell) {
                    
                    //format the header cell
                    element.className += " kgHeaderCell col" + cell.colIndex + " ";
                    
                    //add the custom class in case it has been provided
                    if (cell.headerClass) {
                        element.className += " " + cell.headerClass;
                    }

                    if (property !== 'rowIndex' && property !== '__kg_selected__') {
                        //render the cell template
                        return ko.bindingHandlers.template.update(element, makeNewValueAccessor(cell, grid), allBindingsAccessor, viewModel, bindingContext);
                    }
                }
            }
        }
    }
} ()); 
 
 
/*********************************************** 
* FILE: ..\src\BindingHandlers\kgFooter.js 
***********************************************/ 
﻿ko.bindingHandlers['kgFooter'] = (function () {
    var makeNewValueAccessor = function (grid) {
        return function () {
            return { name: grid.config.footerTemplate, data: grid.footer };
        }
    };

    var makeNewBindingContext = function (bindingContext, footer) {
        return bindingContext.createChildContext(footer);
    };

    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var grid = bindingContext.$data;

            grid.footer = new kg.Footer(grid);

            return ko.bindingHandlers.template.init(element, makeNewValueAccessor(grid), allBindingsAccessor, grid, makeNewBindingContext(bindingContext, grid.footer));
        },
        'update': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var grid = bindingContext.$data;

            return ko.bindingHandlers.template.update(element, makeNewValueAccessor(grid), allBindingsAccessor, grid, makeNewBindingContext(bindingContext, grid.footer));
        }
    }
} ()); 
 
 
/*********************************************** 
* FILE: ..\src\BindingHandlers\kgSize.js 
***********************************************/ 
﻿ko.bindingHandlers['kgSize'] = (function () {

    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

        },
        'update': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $container = $(element),
                $parent = $container.parent(),
                dim = ko.utils.unwrapObservable(valueAccessor()),
                oldHt = $container.outerHeight(),
                oldWdth = $container.outerWidth();

            if (dim != undefined) {
                if (dim.autoFitHeight) {
                    dim.outerHeight = $parent.height();
                }
                if (dim.innerHeight && dim.innerWidth) {
                    $container.height(dim.innerHeight);
                    $container.width(dim.innerWidth);
                    return;
                };
                if (oldHt !== dim.outerHeight || oldWdth !== dim.outerWidth) {
                    //now set it to the new dimension, remeasure, and set it to the newly calculated
                    $container.height(dim.outerHeight).width(dim.outerWidth);

                    //remeasure
                    oldHt = $container.outerHeight();
                    oldWdth = $container.outerWidth();

                    dim.heightDiff = oldHt - $container.height();
                    dim.widthDiff = oldWdth - $container.width();

                    $container.height(dim.outerHeight - dim.heightDiff);
                    $container.width(dim.outerWidth - dim.widthDiff);
                }
            }
        }
    };
} ()); 
 
 
/*********************************************** 
* FILE: ..\src\BindingHandlers\kgMouseEvents.js 
***********************************************/ 
ko.bindingHandlers['mouseEvents'] = (function () {
    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var eFuncs = valueAccessor();
            if (eFuncs.mouseDown) {
                $(element).mousedown(eFuncs.mouseDown);
            }
        },
        'update': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        }
    };
}()); 
}(window)); 
