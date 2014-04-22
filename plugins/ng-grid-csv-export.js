// Todo:
// 1) Make the button prettier
// 2) add a config option for IE users which takes a URL.  That URL should accept a POST request with a
//    JSON encoded object in the payload and return a CSV.  This is necessary because IE doesn't let you
//    download from a data-uri link
//
// Notes:  This has not been adequately tested and is very much a proof of concept at this point
function ngGridCsvExportPlugin (opts) {
    var self = this, 
        options = {
            columnOverrides : null,
            enableSelectionExporting : false,
            template : '<span class="csv-data-link-span"><br><a href="data:text/csv;charset=UTF-8,{{__ALL__}}" download="Export.csv"><i class="icon-download icon-white"></i>Export CSV</a></span>'
        };

    angular.extend(options, opts);  
    self.grid = null;
    self.scope = null;
    self.init = function(scope, grid, services) {
        self.grid = grid;
        self.scope = scope;
        self.cache = null;

        function csvStringify(str) {
            if (str == null) { // we want to catch anything null-ish, hence just == not ===
                return '';
            }
            if (typeof(str) === 'number') {
                return '' + str;
            }
            if (typeof(str) === 'boolean') {
                return (str ? 'TRUE' : 'FALSE');
            }
            if (typeof(str) === 'string') {
                return str.replace(/"/g,'""');
            }
            return JSON.stringify(str).replace(/"/g,'""');
        }

        function buildCsv(data) {
            var keys = [], csvData = '', i, rIdx, cIdx;

            function writeHeader(col) {
                var fieldName = grid.config.columnDefs[col].field;
                keys.push(fieldName);
                csvData += col < grid.config.columnDefs.length - 1 ? 
                            '"' + csvStringify(fieldName) + '",' : 
                            '"' + csvStringify(fieldName) + '"\r\n';
            }

            function writeCell(row, col) {
                var curCellRaw, columnName = keys[col];
                if (opts != null && opts.columnOverrides != null && opts.columnOverrides[columnName] != null) {
                    curCellRaw = opts.columnOverrides[columnName](data[row][columnName]);
                }
                else {
                    curCellRaw = data[row][columnName];
                }
                csvData += col < keys.length - 1 ? 
                            '"' + csvStringify(curCellRaw) + '",' : 
                            '"' + csvStringify(curCellRaw) + '"\r\n';
            }

            // Header
            for (i = 0; i < grid.config.columnDefs.length; i++) {
                writeHeader(i);
            }

            // Body
            for (rIdx = 0; rIdx < data.length; rIdx++) {
                for (cIdx = 0; cIdx < keys.length; cIdx++) {
                    writeCell(rIdx, cIdx);
                }
            }

            return csvData;
        }

        function createDownloadLink (selectedItemsOnly) {
            var csvAllData, csvSelectedData, csvDefaultData, csvDataLinkHtml, 
                csvDataLinkPrev = grid.$footerPanel.find('.csv-data-link-span');

            if (csvDataLinkPrev != null) { csvDataLinkPrev.remove(); }

            // Do not regenerate link for all data on selection change
            if (!selectedItemsOnly) { self.cache = buildCsv(grid.data); }

            csvAllData = self.cache;
            csvDataLinkHtml = options.template.replace(/{{__ALL__}}/g, encodeURIComponent(csvAllData));

            if (options.enableSelectionExporting) {
                csvSelectedData = buildCsv(grid.config.selectedItems);
                csvDefaultData = grid.config.selectedItems.length > 0 ? csvSelectedData : csvAllData;
                csvDataLinkHtml = csvDataLinkHtml.replace(/{{__SELECTED_ITEMS__}}/g, encodeURIComponent(csvSelectedData));
                csvDataLinkHtml = csvDataLinkHtml.replace(/{{__DEFAULT__}}/g, encodeURIComponent(csvDefaultData));
            }

            grid.$footerPanel.append(csvDataLinkHtml);
        }

        setTimeout(createDownloadLink, 0);
        
        scope.gridDataChanged = function () { 
            return grid.data.length;
        };

        scope.gridSelectionChanged = function () { 
            return grid.config.selectedItems.length; 
        };

        // Watches selection changes only when user turns on support for exporting selection
        if (options.enableSelectionExporting) {
            scope.$watch('gridSelectionChanged()', function () {
                createDownloadLink(true);
            });
        }

        if (opts.customDataWatcher) {
            scope.$watch(opts.customDataWatcher, function () {
                createDownloadLink();                
            });
        } else {
            scope.$watch('gridDataChanged()', function () {
                createDownloadLink();
            });
        }
    };
}
