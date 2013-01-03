Notes
=====

For anyone else writing plugins, please feel free to add to this readme.

CSV-Export
==========

Usage
-----

Add CSV Export to your ng-grid tables by including it in your plugins array:

          plugins: [new ngGridCsvExportPlugin()]

Options
-------

        opts =
             { columnOverrides: < hash of column override functions > }

For arrays and objects you may want to override the default `JSON.stringify`
conversion into strings.


