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