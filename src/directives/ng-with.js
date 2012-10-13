
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