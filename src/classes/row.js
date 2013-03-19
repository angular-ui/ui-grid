var ngRow = function (entity, config, selectionProvider, rowIndex, $utils) {
    var self = this, // constant for the selection property that we add to each data item
        enableRowSelection = config.enableRowSelection;

    self.jqueryUITheme = config.jqueryUITheme;
    self.rowClasses = config.rowClasses;
    self.entity = entity;
    self.selectionProvider = selectionProvider;
	self.selected = selectionProvider.getSelection(entity);
    self.cursor = enableRowSelection ? 'pointer' : 'default';
	self.setSelection = function(isSelected) {
		self.selectionProvider.setSelection(self, isSelected);
		self.selectionProvider.lastClickedRow = self;
	};
    self.continueSelection = function(event) {
        self.selectionProvider.ChangeSelection(self, event);
    };
    self.ensureEntity = function(expected) {
        if (self.entity != expected) {
            // Update the entity and determine our selected property
            self.entity = expected;
            self.selected = self.selectionProvider.getSelection(self.entity);
        }
    };
    self.toggleSelected = function(event) {
        if (!enableRowSelection && !config.enableCellSelection) {
            return true;
        }
        var element = event.target || event;
        //check and make sure its not the bubbling up of our checked 'click' event 
        if (element.type == "checkbox" && element.parentElement.className != "ngSelectionCell ng-scope") {
            return true;
        }
        if (config.selectWithCheckboxOnly && element.type != "checkbox") {
            self.selectionProvider.lastClickedRow = self;
            return true;
        } else {
            if (self.beforeSelectionChange(self, event)) {
                self.continueSelection(event);
            }
        }
        return false;
    };
    self.rowIndex = rowIndex;
    self.offsetTop = self.rowIndex * config.rowHeight;
    self.rowDisplayIndex = 0;
    self.alternatingRowClass = function () {
        var isEven = (self.rowIndex % 2) === 0;
        var classes = {
            'ngRow' : true,
            'selected': self.selected,
            'even': isEven,
            'odd': !isEven,
            'ui-state-default': self.jqueryUITheme && isEven,
            'ui-state-active': self.jqueryUITheme && !isEven
        };
        return classes;
    };
    self.beforeSelectionChange = config.beforeSelectionChangeCallback;
    self.afterSelectionChange = config.afterSelectionChangeCallback;

    self.getProperty = function(path) {
        return $utils.evalProperty(self.entity, path);
    };
    self.copy = function () {
        self.clone = new ngRow(entity, config, selectionProvider, rowIndex, $utils);
        self.clone.isClone = true;
        self.clone.elm = self.elm;
        return self.clone;
    };
    self.setVars = function (fromRow) {
        fromRow.clone = self;
        self.entity = fromRow.entity;
        self.selected = fromRow.selected;
    };
};