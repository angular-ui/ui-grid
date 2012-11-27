/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>
ng.Row = function (entity, config, selectionService) {
    var self = this, // constant for the selection property that we add to each data item
        canSelectRows = config.canSelectRows;

    self.rowClasses = config.rowClasses;
    self.selectedItems = config.selectedItems;
    self.entity = entity;
    self.selectionService = selectionService;
    //selectify the entity
    if (self.entity[SELECTED_PROP] === undefined) {
        self.entity[SELECTED_PROP] = false;
    }
    self.selected = false;
    self.toggleSelected = function (event) {
        if (!canSelectRows) {
            return true;
        }
        var element = event.target || event;
        //check and make sure its not the bubbling up of our checked 'click' event 
        if (element.type == "checkbox" && element.parentElement.className != "ngSelectionCell ng-scope") {
            return true;
        } 
        if (config.selectWithCheckboxOnly && element.type != "checkbox"){
            return true;
        } else {
            if (self.beforeSelectionChange(self)) {
                self.selectionService.ChangeSelection(self, event);
                return self.afterSelectionChange();
            }
        }
        return false;
    };
    self.rowIndex = 0;
    self.offsetTop = 0;
    self.rowDisplayIndex = 0;
    self.alternatingRowClass = function () {
        if (self.rowIndex % 2 == 0)
            return "even";
		return "odd";
    };
    self.beforeSelectionChange = config.beforeSelectionChangeCallback;
    self.afterSelectionChange = config.afterSelectionChangeCallback;
    self.propertyCache = {};
    self.getProperty = function (path) {
        return self.propertyCache[path] || ng.utils.evalProperty(self.entity, path);
    };
}; 