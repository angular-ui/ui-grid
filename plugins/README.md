Notes
=====

For anyone else writing plugins, please feel free to add to this readme.

Flexible-Height
===============

Automatically resize a table to accomodate a varying number of rows.

Usage
-----

A semi-ugly hack to make tables shrink automatically so you don't have big ugly gray space to worry about.

          plugins: [new ngGridFlexibleHeightPlugin()]

Options
-------

        opts = { minHeight: <minimum height in px> }

CSV-Export
==========

Usage
-----

Add CSV Export to your ng-grid tables by including it in your plugins array:

          plugins: [new ngGridCsvExportPlugin()]

Options
-------

    opts = {
        columnOverrides: < hash of column override functions >,
        customDataWatcher: < function whose return value can be $watched to detect changed data >,
        initialFilename: < export filename to use, defaults to "Export.csv" >,
        editableFilename: < whether to provide a text input for the user to set export filename, defaults to false >
    }

For arrays and objects you may want to override the default `JSON.stringify`
conversion into strings.


