ko.bindingHandlers['kgSize'] = (function () {

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