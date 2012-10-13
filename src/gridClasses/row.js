/// <reference path="../utils.js" />
/// <reference path="../namespace.js" />
/// <reference path="../Grid.js" />

ng.row = function (entity, config, selectionManager) {
    var self = this,
        KEY = '__ng_selected__', // constant for the selection property that we add to each data item
        canSelectRows = config.canSelectRows;
    this.selectedItems = config.selectedItems;
    this.entity = entity;
    this.selectionManager = selectionManager;
    //selectify the entity
    if (this.entity['__ng_selected__'] === undefined) {
        this.entity['__ng_selected__'] = false;
    }
    this.selected = {
        get: function () {
            if (!canSelectRows) {
                return false;
            }
            var val = self.entity['__ng_selected__'];
            return val;
        },
        set: function (val, evt) {
            if (!canSelectRows) {
                return true;
            }
            self.beforeSelectionChange();
            self.entity['__ng_selected__'] = val;
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
        if (element.type == "checkbox" && element.parentElement.className.indexOf("ngSelectionCell" !== -1)) {
            return true;
        } 
        if (config.selectWithCheckboxOnly && element.type != "checkbox"){
            return true;
        } else {
            self.selected ? self.selected.set(false, event) : self.selected.set(true, event);
        }
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

    this.onSelectionChanged = function () { }; //replaced in rowManager
    this.beforeSelectionChange = function () { };
    this.afterSelectionChange = function () { };
    //during row initialization, let's make all the entities properties first-class properties on the row
    (function () {
        ng.utils.forIn(entity, function (prop, propName) {
            self[propName] = prop;
        });
    }());
}; 