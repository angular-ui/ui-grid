/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ng.Row = function (entity, config, selectionService) {
    var self = this, // constant for the selection property that we add to each data item
        canSelectRows = config.canSelectRows;
    
    this.selectedItems = config.selectedItems;
    this.entity = entity;
    this.selectionService = selectionService;
    //selectify the entity
    if (this.entity[SELECTED_PROP] === undefined) {
        this.entity[SELECTED_PROP] = false;
    }
    this.selected = false;

    this.toggleSelected = function (data, event) {
        if (!canSelectRows) {
            return true;
        }
        var element = event.target;

        //check and make sure its not the bubbling up of our checked 'click' event 
        if (element.type == "checkbox" && element.parentElement.className.indexOf("ngSelectionCell" !== -1)) {
            return true;
        } 
        if (config.selectWithCheckboxOnly && element.type != "checkbox"){
            return true;
        } else {
            self.beforeSelectionChange();
            self.selected ? self.selected = false : self.selected = true;
            self.selectionService.ChangeSelection(data, event);
            self.afterSelectionChange();
        }
        return true;
    };

    this.toggle = function(item) {
        if (item.selected.get()) {
            item.selected.set(false);
            self.selectedItems.remove(item.entity);
        } else {
            item.selected.set(true);
            if (self.selectedItems.indexOf(item.entity) === -1) {
                self.selectedItems.push(item.entity);
            }
        }

    };

    this.cells = [];
    this.cellMap = {};
    this.rowIndex = 0;
    this.offsetTop = 0;
    this.rowKey = ng.utils.newId();
    this.rowDisplayIndex = 0;

    this.beforeSelectionChange = config.beforeSelectionChange || function () { };
    this.afterSelectionChange = config.afterSelectionChange || function () { };
    //during row initialization, let's make all the entities properties first-class properties on the row
    (function () {
        ng.utils.forIn(entity, function (prop, propName) {
            self[propName] = prop;
        });
    }());
}; 