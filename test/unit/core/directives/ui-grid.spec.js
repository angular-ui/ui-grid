describe('ui-grid', function() {

  beforeEach(module('ui.grid'));
  // beforeEach(module('ui.grid.body'));
  // beforeEach(module('ui.grid.header'));
  
  /*describe('ui-grid calculated columns', function() {
    var element, scope;

    beforeEach(inject(function($compile, $rootScope) {
      element = angular.element('<div class="col-md-5" ui-grid="data" ui-grid-table-class="table"></div>');
      scope = $rootScope;
      scope.data = [{ col1: 'col1', col2: 'col2' }];
      $compile(element)(scope);
      scope.$digest();
    }));

    it('gets columns correctly', function() {
      expect(element.isolateScope().gridOptions.columnDefs.length).toBe(2);
      expect(element.isolateScope().gridOptions.columnDefs[0].name).toBe('Col1');
      expect(element.isolateScope().gridOptions.columnDefs[0].field).toBe('col1');
    });

  });

  describe('ui-grid declarative columns', function() {
      var element, scope;

      beforeEach(inject(function($compile, $rootScope) {
        element = angular.element('<div class="col-md-5" ui-grid="data" ui-grid-columns="[{name:\'Decl Col 1\',field:\'declCol1\'}]" ui-grid-table-class="table"></div>');
        scope = $rootScope;
        scope.data = [{ declCol1: 'col1', declCol2: 'col2' }];
        $compile(element)(scope);
        scope.$digest();
      }));

      it('gets columns correctly', function() {
        expect(element.isolateScope().gridOptions.columnDefs.length).toBe(1);
        expect(element.isolateScope().gridOptions.columnDefs[0].name).toBe('Decl Col 1');
        expect(element.isolateScope().gridOptions.columnDefs[0].field).toBe('declCol1');
      }); 

  });
  
  describe('ui-grid imperative columns', function () {
    var element, scope;

    beforeEach(inject(function ($compile, $rootScope) {
      element = angular.element('<div class="col-md-5" ui-grid="data" ui-grid-options="myGridOptions" ui-grid-columns="[{name:\'Decl Col 1\',field:\'declCol1\'}]" ui-grid-table-class="table"></div>');
      scope = $rootScope;
      scope.data = [{ impCol1: 'col1', impCol2: 'col2' }];
      //specifying gridOptions on parent scope will override any attributes
      scope.myGridOptions = {};
      scope.myGridOptions.columnDefs = [{ name: 'Imp Col 1', field: 'impCol1' }];
      $compile(element)(scope);
      scope.$digest();
    }));

    it('gets columns correctly', function () {
      expect(element.isolateScope().gridOptions.columnDefs.length).toBe(1);
      expect(element.isolateScope().gridOptions.columnDefs[0].name).toBe('Imp Col 1');
      expect(element.isolateScope().gridOptions.columnDefs[0].field).toBe('impCol1');
    });

  });*/


  describe('minColumnsToRender', function() {
    it('calculates the minimum number of columns to render, correctly', function() {
      // TODO
    });
  });

  describe('column width calculation', function () {
    var element = null, gridApi = null;

    var columnDefs = [
      { name: 'col1' },
      { name: 'col2' },
      { name: 'col3' },
      { name: 'col4' },
      { name: 'col5' },
      { name: 'col6' },
      { name: 'col7' }
    ];

    beforeEach(inject(function ($compile, $rootScope, $document) {
      var scope = $rootScope;

      element = angular.element('<div style="width 333px; height: 150px" ui-grid="gridOptions"></div>');
      scope.gridOptions = {
        columnDefs: columnDefs,
        data: [],
        onRegisterApi: function( api ){ gridApi = api; }
      };

      $compile(element)(scope);
      $document[0].body.appendChild(element[0]);

      scope.$digest();
    }));

    afterEach(function() {
      element.remove();
      angular.forEach(columnDefs, function (c) {
        delete c.width;
      });
    });

    // ideally there should be tests for multiple column configurations here
    // but need to figure out how to have separate columnDefs for each
    // expect block below

    it('should distribute extra width', function () {
      var renderWidth = 0;

      angular.forEach(gridApi.grid.columns, function (c) {
        renderWidth += c.drawnWidth;
      });

      expect(renderWidth).toBe(gridApi.grid.gridWidth);
    });

  });

  describe('section width calculation', function() {
    var element = null, gridApi = null;

    var columnDefs = [
      { name: 'col1' },
      { name: 'col2' },
      { name: 'col3' },
      { name: 'col4' }
    ];

    var sec1 = { displayName: 'sec1', columns: [ 'col1', 'col2' ] };
    var sec2 = { displayName: 'sec2', columns: [ 'col3', 'col4' ] };

    beforeEach(inject(function ($compile, $rootScope, $document) {
      var scope = $rootScope;

      element = angular.element('<div style="width: 333px; height: 150px" ui-grid="gridOptions"></div>');
      scope.gridOptions = {
        columnDefs: columnDefs,
        data: [],
        onRegisterApi: function( api ){ gridApi = api; },
        sectionHeaders: [ sec1, sec2 ]
      };

      $compile(element)(scope);
      $document[0].body.appendChild(element[0]);

      scope.$digest();
    }));

    afterEach(function() {
      element.remove();
      angular.forEach(columnDefs, function (c) {
        delete c.width;
      });
    });

    it('should sum column widths for section widths', function() {
      expect(gridApi.grid.getSectionWidth(sec1))
        .toEqual(gridApi.grid.columns[0].drawnWidth + gridApi.grid.columns[1].drawnWidth);
      expect(gridApi.grid.getSectionWidth(sec2))
        .toEqual(gridApi.grid.columns[2].drawnWidth + gridApi.grid.columns[3].drawnWidth);

      expect(gridApi.grid.getSectionWidth(sec1) + gridApi.grid.getSectionWidth(sec2))
        .toEqual(gridApi.grid.gridWidth);
    });

  });

  describe('two layer section width calculation', function() {
    var element = null, gridApi = null;

    var columnDefs = [
      { name: 'col1' },
      { name: 'col2' },
      { name: 'col3' },
      { name: 'col4' },
      { name: 'col5' },
      { name: 'col6' },
      { name: 'col7' },
      { name: 'col8' }
    ];

    var subsec1 = { displayName: 'subsec1', columns: [ 'col1', 'col2' ] };
    var subsec2 = { displayName: 'subsec2', columns: [ 'col3', 'col4' ] };
    var subsec3 = { displayName: 'subsec3', columns: [ 'col5', 'col6' ] };
    var subsec4 = { displayName: 'subsec4', columns: [ 'col7', 'col8' ] };

    var sec1 = { displayName: 'sec1', subSections: [ subsec1, subsec2 ] };
    var sec2 = { displayName: 'sec2', subSections: [ subsec3, subsec4 ] };

    beforeEach(inject(function ($compile, $rootScope, $document) {
      var scope = $rootScope;

      element = angular.element('<div style="width: 333px; height: 150px" ui-grid="gridOptions"></div>');
      scope.gridOptions = {
        columnDefs: columnDefs,
        data: [],
        onRegisterApi: function( api ){ gridApi = api; },
        sectionHeaders: [ sec1, sec2 ]
      };

      $compile(element)(scope);
      $document[0].body.appendChild(element[0]);

      scope.$digest();
    }));

    afterEach(function() {
      element.remove();
      angular.forEach(columnDefs, function (c) {
        delete c.width;
      });
    });

    it('should sum sub-section widths for section widths', function() {
      // sub-section 1
      var subSection1Width = gridApi.grid.getSectionWidth(subsec1);
      expect(subSection1Width)
        .toEqual(gridApi.grid.columns[0].drawnWidth + gridApi.grid.columns[1].drawnWidth);

      // sub-section 2
      var subSection2Width = gridApi.grid.getSectionWidth(subsec2);
      expect(subSection2Width)
        .toEqual(gridApi.grid.columns[2].drawnWidth + gridApi.grid.columns[3].drawnWidth);

      // section 1 (contains sub-section 1 and sub-section 2)
      expect(gridApi.grid.getSectionWidth(sec1))
        .toEqual(subSection1Width + subSection2Width);

      // sub-section 3
      var subSection3Width = gridApi.grid.getSectionWidth(subsec3);
      expect(subSection3Width)
          .toEqual(gridApi.grid.columns[4].drawnWidth + gridApi.grid.columns[5].drawnWidth);

      // sub-section 4
      var subSection4Width = gridApi.grid.getSectionWidth(subsec4);
      expect(subSection4Width)
          .toEqual(gridApi.grid.columns[6].drawnWidth + gridApi.grid.columns[7].drawnWidth);

      // section 2 (contains sub-section 3 and sub-section 4)
      expect(gridApi.grid.getSectionWidth(sec2))
          .toEqual(subSection3Width + subSection4Width);
    });

  });

  describe('section width calculation with invisible column', function() {
    var element = null, gridApi = null;

    var columnDefs = [
      { name: 'col1' },
      { name: 'col2' }
    ];

    var sec1 = { displayName: 'sec1', columns: [ 'col1', 'col2' ] };

    beforeEach(inject(function ($compile, $rootScope, $document) {
      var scope = $rootScope;

      element = angular.element('<div style="width: 333px; height: 150px" ui-grid="gridOptions"></div>');
      scope.gridOptions = {
        columnDefs: columnDefs,
        data: [],
        onRegisterApi: function( api ){ gridApi = api; },
        sectionHeaders: [ sec1 ]
      };

      $compile(element)(scope);
      $document[0].body.appendChild(element[0]);

      scope.$digest();
    }));

    afterEach(function() {
      element.remove();
      angular.forEach(columnDefs, function (c) {
        delete c.width;
      });
    });

    it('should only sum widths of visible columns for section widths', function() {

      // hide the first column
      gridApi.grid.columns[0].visible = false;

      expect(gridApi.grid.getSectionWidth(sec1))
          .toEqual(gridApi.grid.columns[1].drawnWidth);

    });

  });

  describe('section visibility check', function() {
    var element = null, gridApi = null;

    var columnDefs = [
      { name: 'col1' },
      { name: 'col2' },
      { name: 'col3' },
      { name: 'col4' }
    ];

    var sec1 = { displayName: 'sec1', columns: [ 'col1', 'col2' ] };
    var sec2 = { displayName: 'sec2', columns: [ 'col3', 'col4' ] };

    beforeEach(inject(function ($compile, $rootScope, $document) {
      var scope = $rootScope;

      element = angular.element('<div style="width: 333px; height: 150px" ui-grid="gridOptions"></div>');
      scope.gridOptions = {
        columnDefs: columnDefs,
        data: [],
        onRegisterApi: function( api ){ gridApi = api; },
        sectionHeaders: [ sec1, sec2 ]
      };

      $compile(element)(scope);
      $document[0].body.appendChild(element[0]);

      scope.$digest();
    }));

    afterEach(function() {
      element.remove();
    });

    it('should return true when all columns are visible', function() {
      expect(gridApi.grid.isSectionVisible(sec1)).toBeTruthy();
      expect(gridApi.grid.isSectionVisible(sec2)).toBeTruthy();
    });

    it('should return true when any column within section is visible', function() {
      gridApi.grid.columns[0].visible = false;

      expect(gridApi.grid.isSectionVisible(sec1)).toBeTruthy();
    });

    it('should return false when all columns within section are hidden', function() {
      gridApi.grid.columns[0].visible = false;
      gridApi.grid.columns[1].visible = false;

      expect(gridApi.grid.isSectionVisible(sec1)).toBeFalsy();
      expect(gridApi.grid.isSectionVisible(sec2)).toBeTruthy();
    });

  });

  describe('two layer section visibility check', function() {
    var element = null, gridApi = null;

    var columnDefs = [
      {name: 'col1'},
      {name: 'col2'},
      {name: 'col3'},
      {name: 'col4'},
      {name: 'col5'},
      {name: 'col6'},
      {name: 'col7'},
      {name: 'col8'}
    ];

    var subsec1 = {displayName: 'subsec1', columns: ['col1', 'col2']};
    var subsec2 = {displayName: 'subsec2', columns: ['col3', 'col4']};
    var subsec3 = {displayName: 'subsec3', columns: ['col5', 'col6']};
    var subsec4 = {displayName: 'subsec4', columns: ['col7', 'col8']};

    var sec1 = {displayName: 'sec1', subSections: [subsec1, subsec2]};
    var sec2 = {displayName: 'sec2', subSections: [subsec3, subsec4]};

    beforeEach(inject(function ($compile, $rootScope, $document) {
      var scope = $rootScope;

      element = angular.element('<div style="width: 333px; height: 150px" ui-grid="gridOptions"></div>');
      scope.gridOptions = {
        columnDefs: columnDefs,
        data: [],
        onRegisterApi: function (api) {
          gridApi = api;
        },
        sectionHeaders: [sec1, sec2]
      };

      $compile(element)(scope);
      $document[0].body.appendChild(element[0]);

      scope.$digest();
    }));

    afterEach(function () {
      element.remove();
    });

    it('should return true when all columns are visible', function() {
      expect(gridApi.grid.isSectionVisible(subsec1)).toBeTruthy();
      expect(gridApi.grid.isSectionVisible(subsec2)).toBeTruthy();
      expect(gridApi.grid.isSectionVisible(subsec3)).toBeTruthy();
      expect(gridApi.grid.isSectionVisible(subsec4)).toBeTruthy();
      expect(gridApi.grid.isSectionVisible(sec1)).toBeTruthy();
      expect(gridApi.grid.isSectionVisible(sec2)).toBeTruthy();
    });

    it('should return true when any column within section is visible', function() {
      gridApi.grid.columns[0].visible = false;

      expect(gridApi.grid.isSectionVisible(subsec1)).toBeTruthy();
    });

    it('should return false when all columns within section are hidden', function() {
      gridApi.grid.columns[0].visible = false;
      gridApi.grid.columns[1].visible = false;

      expect(gridApi.grid.isSectionVisible(subsec1)).toBeFalsy();
    });

    it('should return false when all subsections within section are hidden', function () {
      gridApi.grid.columns[0].visible = false;
      gridApi.grid.columns[1].visible = false;

      expect(gridApi.grid.isSectionVisible(subsec1)).toBeFalsy();

      gridApi.grid.columns[2].visible = false;
      gridApi.grid.columns[3].visible = false;

      expect(gridApi.grid.isSectionVisible(subsec2)).toBeFalsy();

      expect(gridApi.grid.isSectionVisible(sec1)).toBeFalsy();
    });

  });

  describe('watch for new pinned containers', function () {
    var element, scope;

    beforeEach(inject(function ($compile, $rootScope, $timeout) {
      element = angular.element('<div class="col-md-5" ui-grid="gridOptions"></div>');
      scope = $rootScope;
      scope.gridOptions = {};
      scope.gridOptions.data = [
        { col1: 'col1', col2: 'col2' }
      ];

      scope.gridOptions.onRegisterApi = function(gridApi) {
        scope.grid = gridApi.grid;
      };

      $timeout(function () {
        $compile(element)(scope);
      });
      $timeout.flush();
    }));

    it('fires watch for left container', inject(function($timeout) {
      spyOn(scope.grid, 'refreshCanvas');

      expect(scope.grid.refreshCanvas.callCount).toEqual(0);
      $timeout(function(){
        scope.grid.createLeftContainer();
      });
      $timeout.flush();

      expect(scope.grid.refreshCanvas).toHaveBeenCalledWith(true);
    }));


    it('fires watch for right container', inject(function($timeout) {
      spyOn(scope.grid, 'refreshCanvas');

      expect(scope.grid.refreshCanvas.callCount).toEqual(0);
      $timeout(function(){
        scope.grid.createRightContainer();
      });
      $timeout.flush();

      expect(scope.grid.refreshCanvas).toHaveBeenCalledWith(true);
    }));

 });

});