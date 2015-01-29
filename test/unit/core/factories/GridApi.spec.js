describe('GridEvent factory', function () {
  var $q, $scope, Grid, GridApi;

  beforeEach(module('ui.grid'));

  beforeEach(inject(function (_$q_, _$rootScope_, _Grid_, _GridApi_) {
    $q = _$q_;
    $scope = _$rootScope_;
    Grid = _Grid_;
    GridApi = _GridApi_;
  }));

  it('should register, publish, and subscribe to events', inject(function($timeout, $rootScope) {
    var grid = new Grid({ id: 1 });
    var scope = $rootScope.$new();
    var gridApi = new GridApi(grid);
    expect(gridApi.grid.id).toBe(grid.id);

    gridApi.registerEvent('testFeature','testEvent');

    var onFired = false;
    var arg1Val = '';
    var arg2Val = '';

    var pubArg1Val = '';
    var pubArg2Val = '';
    $timeout(function(){
      $rootScope.$on(grid.id + 'testFeature' + 'testEvent',function(evt,arg1,arg2){
        onFired = true;
        arg1Val = arg1;
        arg2Val = arg2;
      });
      gridApi.testFeature.on.testEvent(scope,function(arg1,arg2){
        pubArg1Val = arg1;
        pubArg2Val = arg2;
      });

      gridApi.testFeature.raise.testEvent('123', '456');

    });
    $timeout.flush();

    expect(onFired).toBe(true);
    expect(arg1Val).toBe('123');
    expect(arg2Val).toBe('456');
    expect(pubArg1Val).toBe('123');
    expect(pubArg2Val).toBe('456');
  }));

  it('should keep events separate for different grids', inject(function($timeout, $rootScope) {
    var grid1 = new Grid({ id: 1 });
    var grid2 = new Grid({ id: 2 });

    var scope = $rootScope.$new();
    var GridApi1 = new GridApi(grid1);
    var GridApi2 = new GridApi(grid2);

    expect(GridApi1.grid.id).toBe(grid1.id);
    expect(GridApi2.grid.id).toBe(grid2.id);

    GridApi1.registerEvent('testFeature','testEvent');
    GridApi2.registerEvent('testFeature','testEvent');

    var grid1arg = '';
    var grid2arg = '';

    $timeout(function(){
      GridApi1.testFeature.on.testEvent(scope,function(arg1){
        grid1arg = arg1;
      });

      GridApi2.testFeature.on.testEvent(scope,function(arg1){
        grid2arg = arg1;
      });

      GridApi1.testFeature.raise.testEvent('grid1');
      GridApi2.testFeature.raise.testEvent('grid2');

    });
    $timeout.flush();

    expect(grid1arg).toBe('grid1');
    expect(grid2arg).toBe('grid2');
  }));

  it('should register events from object', inject(function($timeout, $rootScope) {
    var publicEvents = {
      gridCellNav : {
        cellNav : function(scope, newRowCol, oldRowCol){}
      },
      someOtherFeature: {
        someEvent : function(){},
        someOtherEvent : function(){}
      }
    };

    var grid = new Grid({ id: 1 });
    var gridApi = new GridApi(grid);

    gridApi.registerEventsFromObject(publicEvents);

    expect(gridApi.gridCellNav).toBeDefined();
    expect(gridApi.gridCellNav.raise.cellNav).toBeDefined();
    expect(gridApi.gridCellNav.on.cellNav).toBeDefined();
    expect(gridApi.someOtherFeature.raise.someEvent).toBeDefined();
    expect(gridApi.someOtherFeature.raise.someOtherEvent).toBeDefined();
  }));

  it('should supress events', inject(function($timeout, $rootScope) {
    var grid = new Grid({ id: 1 });
    var scope = $rootScope.$new();
    var gridApi = new GridApi(grid);
    expect(gridApi.grid.id).toBe(grid.id);

    gridApi.registerEvent('testFeature','testEvent');

    var listener1Call = 0;
    var listener1Val1 = '';
    var listener1Val2 = '';

    var listener2Call = 0;
    var listener2Val1 = '';
    var listener2Val2 = '';

    var listener3Call = 0;
    var listener3Val1 = '';
    var listener3Val2 = '';

    var listener1 = function(evt,arg1,arg2){
      listener1Call++;
      listener1Val1 = arg1;
      listener1Val2 = arg2;
    };

    var listener2 = function(arg1,arg2){
      listener2Call++;
      listener2Val1 = arg1;
      listener2Val2 = arg2;
    };

    var listener3 = function(arg1,arg2){
      listener3Call++;
      listener3Val1 = arg1;
      listener3Val2 = arg2;
      //always this should be grid for this listener
      expect(this).toBe(grid);
    };


    $timeout(function(){
      //native angular listener
      $rootScope.$on(grid.id + 'testFeature' + 'testEvent', listener1);
      //grid listener
      gridApi.testFeature.on.testEvent(scope, listener2);
      //grid listener to be suppressed. grid as this to make sure it is put back

      gridApi.testFeature.on.testEvent(scope, listener3, grid);
      //register again just to make sure all are suppressed
      gridApi.testFeature.on.testEvent(scope, listener3, grid);

      gridApi.suppressEvents(listener3,function(){
        gridApi.testFeature.raise.testEvent('123', '456');
      });

    });
    $timeout.flush();

    expect(listener1Call).toBe(1);
    expect(listener1Val1).toBe('123');
    expect(listener1Val2).toBe('456');
    expect(listener2Call).toBe(1);
    expect(listener2Val1).toBe('123');
    expect(listener2Val2).toBe('456');
    expect(listener3Call).toBe(0);
    expect(listener3Val1).toBe('');
    expect(listener3Val1).toBe('');

    //try again without supression
    $timeout(function(){
      gridApi.testFeature.raise.testEvent('123', '456');
    });
    $timeout.flush();

    expect(listener1Call).toBe(2);
    expect(listener1Val1).toBe('123');
    expect(listener1Val2).toBe('456');
    expect(listener2Call).toBe(2);
    expect(listener2Val1).toBe('123');
    expect(listener2Val2).toBe('456');
    expect(listener3Call).toBe(2);
    expect(listener3Val1).toBe('123');
    expect(listener3Val2).toBe('456');

    scope.$destroy();
  }));

  it('should register methods from object', inject(function($timeout, $rootScope) {
    var publicMethods = {
      gridCellNav : {
        cellNav : function(scope, newRowCol, oldRowCol){}
      },
      someOtherFeature: {
        someEvent : function(){},
        someOtherEvent : function(){}
      }
    };

    var grid = new Grid({ id: 1 });
    var gridApi = new GridApi(grid);

    gridApi.registerMethodsFromObject(publicMethods);

    expect(gridApi.gridCellNav).toBeDefined();
    expect(gridApi.gridCellNav.cellNav).toBeDefined();
    expect(gridApi.someOtherFeature.someEvent).toBeDefined();
    expect(gridApi.someOtherFeature.someOtherEvent).toBeDefined();
  }));

  it('should default registerMethod callbacks this to grid', inject(function($timeout, $rootScope) {
    var grid = new Grid({ id: 1 });
    var gridApi = new GridApi(grid);

    function callBackFn(scope, newRowCol, oldRowCol){
      expect(this).toBe(grid);
    }

    var publicMethods = {
      gridCellNav : {
        cellNav : function(scope, newRowCol, oldRowCol){
          expect(this).toBe(grid);
        }
      }
    };

    gridApi.registerMethodsFromObject(publicMethods);
    gridApi.registerMethod('f','m',callBackFn);

    expect(gridApi.gridCellNav.cellNav).toBeDefined();
    gridApi.gridCellNav.cellNav();
  }));

  it('should use thisArg in callback for methods', inject(function($timeout, $rootScope) {
    var grid = new Grid({ id: 1 });
    var gridApi = new GridApi(grid);
    var someThisArg = {};

    function callBackFn(scope, newRowCol, oldRowCol){
      expect(this).toBeDefined(someThisArg);
    }

    var publicMethods = {
      gridCellNav : {
        cellNav : function(scope, newRowCol, oldRowCol){
          expect(this).toBeDefined(someThisArg);
        }
      }
    };

    gridApi.registerMethodsFromObject(publicMethods, someThisArg);
    gridApi.registerMethod('f','m',callBackFn, someThisArg);

    expect(gridApi.gridCellNav.cellNav).toBeDefined();
    gridApi.gridCellNav.cellNav();
  }));


  it('should destroy listener when scope is destroyed', inject(function($timeout, $rootScope) {
    var grid = new Grid({ id: 1 });
    var gridApi = new GridApi(grid);
    var scope = $rootScope.$new();

    function callBackFn(){}


    gridApi.registerEvent('testFeature','testEvent');
    expect($rootScope.$$listeners['1testFeaturetestEvent']).toBeUndefined();
    expect(gridApi.listeners.length).toBe(0);


    //the dereg function should remove the listener from $rootscope
    var dereg = gridApi.testFeature.on.testEvent(scope, callBackFn);
    expect($rootScope.$$listeners['1testFeaturetestEvent']).toBeDefined();
    expect(gridApi.listeners.length).toBe(1);
    dereg();
    expect($rootScope.$$listeners['testFeaturetestEvent']).toBeUndefined();
    expect(gridApi.listeners.length).toBe(0);


    //destroying the scope should remove listener from rootscope
    dereg = gridApi.testFeature.on.testEvent(scope, callBackFn);
    expect($rootScope.$$listeners['1testFeaturetestEvent']).toBeDefined();
    scope.$destroy();
    expect($rootScope.$$listeners['testFeaturetestEvent']).toBeUndefined();
    expect(gridApi.listeners.length).toBe(0);
  }));

  it('should use _this argument in event callbacks', inject(function($timeout, $rootScope) {
    var grid = new Grid({ id: 1 });
    var gridApi = new GridApi(grid);
    var scope = $rootScope.$new();

    var callBackFnGridApi_ThisCalled = false;
    function callBackFnGridApi_This(){
      expect(this).toBe(grid.api);
      callBackFnGridApi_ThisCalled = true;
    }

    var callBackFnGrid_ThisCalled = false;
    function callBackFnGrid_This(){
      expect(this).toBe(grid);
      callBackFnGrid_ThisCalled = true;
    }

    gridApi.registerEvent('testFeature','testEvent');
    gridApi.testFeature.on.testEvent(scope, callBackFnGridApi_This);
    gridApi.testFeature.on.testEvent(scope, callBackFnGrid_This, grid);

    $timeout(function(){
      gridApi.testFeature.raise.testEvent();
    });
    $timeout.flush();
    expect(callBackFnGridApi_ThisCalled).toBe(true);
    expect(callBackFnGrid_ThisCalled).toBe(true);


  }));



});
