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