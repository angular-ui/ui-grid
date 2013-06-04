var ngRow = function (entity, config, selectionProvider, rowIndex, $utils) {
	this.entity = entity;
	this.config = config;
	this.selectionProvider = selectionProvider;
	this.rowIndex = rowIndex;
	this.utils = $utils;
	this.selected = selectionProvider.getSelection(entity);
	this.cursor = this.config.enableRowSelection ? 'pointer' : 'default';
	this.beforeSelectionChange = config.beforeSelectionChangeCallback;
	this.afterSelectionChange = config.afterSelectionChangeCallback;
	this.offsetTop = this.rowIndex * config.rowHeight;
	this.rowDisplayIndex = 0;
};

ngRow.prototype.setSelection = function (isSelected) {
	this.selectionProvider.setSelection(this, isSelected);
	this.selectionProvider.lastClickedRow = this;
};
ngRow.prototype.continueSelection = function (event) {
	this.selectionProvider.ChangeSelection(this, event);
};
ngRow.prototype.ensureEntity = function (expected) {
	if (this.entity !== expected) {
		// Update the entity and determine our selected property
		this.entity = expected;
		this.selected = this.selectionProvider.getSelection(this.entity);
	}
};
ngRow.prototype.toggleSelected = function (event) {
	if (!this.config.enableRowSelection && !this.config.enableCellSelection) {
		return true;
	}
	var element = event.target || event;
	//check and make sure its not the bubbling up of our checked 'click' event 
	if (element.type === "checkbox" && element.parentElement.className !== "ngSelectionCell ng-scope") {
		return true;
	}
	if (this.config.selectWithCheckboxOnly && element.type !== "checkbox") {
		this.selectionProvider.lastClickedRow = this;
		return true;
	} 
	if (this.beforeSelectionChange(this, event)) {
		this.continueSelection(event);
	}
	return false;
};
ngRow.prototype.alternatingRowClass = function () {
	var isEven = (this.rowIndex % 2) === 0;
	var classes = {
		'ngRow' : true,
		'selected': this.selected,
		'even': isEven,
		'odd': !isEven,
		'ui-state-default': this.config.jqueryUITheme && isEven,
		'ui-state-active': this.config.jqueryUITheme && !isEven
	};
	return classes;
};
ngRow.prototype.getProperty = function (path) {
	return this.utils.evalProperty(this.entity, path);
};
ngRow.prototype.copy = function () {
	this.clone = new ngRow(this.entity, this.config, this.selectionProvider, this.rowIndex, this.utils);
	this.clone.isClone = true;
	this.clone.elm = this.elm;
	this.clone.orig = this;
	return this.clone;
};
ngRow.prototype.setVars = function (fromRow) {
	fromRow.clone = this;
	this.entity = fromRow.entity;
	this.selected = fromRow.selected;
    this.orig = fromRow;
};