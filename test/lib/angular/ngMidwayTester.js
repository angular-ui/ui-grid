;var ngMidwayTester;

(function() {

  ngMidwayTester = function() {};

  ngMidwayTester.cache = {};

  ngMidwayTester.register = function(module, callback) {
    if(typeof module == 'string') {
      module = angular.module(module);
    }

    var name = module.value('appName').name;

    var instance = this.cache[name];
    if(instance) {
      instance.reset();
      callback(instance);
      return;
    }
    
    instance = new ngMidwayTester();
    this.cache[name] = instance;
    instance.register(name, module, function() {
      callback(instance); 
    });
  };

  ngMidwayTester.prototype.register = function(name, module, callback) {
    var testModuleName = 'ngMidwayTest';
    var that = this;
    this.$module = angular.module(testModuleName, [name]).config(
      ['$provide','$routeProvider','$locationProvider', function($p, $r, $l) {
        that.$provide = $p;
        that.$routeProvider = $r;
        that.$locationProvider = $l;
      }]
    );

    this.$module.run(['$injector', function($injector) {
      that.$injector = $injector;
    }]);

    this.attach(testModuleName);
    this.prepareGlobals(callback);
  };

  ngMidwayTester.prototype.attach = function(name) {
    var html = this.html();
    html.setAttribute('data-ng-app',name);
    var body = this.body();
    body.innerHTML += '<div id="data-ng-view" data-ng-view></div>';
    angular.bootstrap(html, [name]);
  };

  ngMidwayTester.prototype.html = function() {
    return document.getElementsByTagName('html')[0];
  };

  ngMidwayTester.prototype.body = function() {
    return document.getElementsByTagName('body')[0];
  };

  ngMidwayTester.prototype.view = function() {
    return document.getElementById('data-ng-view');
  };

  ngMidwayTester.prototype.reset = function(callback) {
    this.resetPath();
    this.resetView();
    this.apply(null, callback);
  };

  ngMidwayTester.prototype.resetView = function(callback) {
    this.view().innerHTML = '';
  };

  ngMidwayTester.prototype.resetPath = function(callback) {
    this.path('/', callback);
  };

  ngMidwayTester.prototype.path = function(url, callback) {
    if(url) {
      callback = callback || function() {};
      this.location().path(url);
      this.apply(null, callback);
    }
    else {
      return this.location().path();
    }
  };

  ngMidwayTester.prototype.directive = function(html, scope, onReady) {
    var elm = angular.element(html);
    scope = scope || this.scope();
    var element = this.$compile(elm)(scope);
    if(onReady) {
      this.apply(null, function() {
        onReady(element); 
      });
    }
    return element;
  };

  ngMidwayTester.prototype.module = function(module) {
    return this.$module;
  };

  ngMidwayTester.prototype.factory = function(service) {
    return this.service(service);
  };

  ngMidwayTester.prototype.routeProvider = function() {
    return this.$routeProvider;
  };

  ngMidwayTester.prototype.routeParams = function() {
    return this.$params;
  };

  ngMidwayTester.prototype.route = function() {
    return this.$route;
  };

  ngMidwayTester.prototype.service = function(service) {
    try {
      return this.$injector.get(service);
    }
    catch(e) {
      return null;
    };
  };

  ngMidwayTester.prototype.location = function() {
    return this.$location;
  };

  ngMidwayTester.prototype.injector = function() {
    return this.$injector;
  };

  ngMidwayTester.prototype.filter = function() {
    return this.$filter;
  };

  ngMidwayTester.prototype.module = function() {
    return this.$module;
  };

  ngMidwayTester.prototype.inject = function(array) {
    if(this.$injector) {
      this.injector().invoke(array);
    }
    else {
      this.module().run(array);
    }
  };

  ngMidwayTester.prototype.ready = function() {
    return !!this.$injector;
  };

  ngMidwayTester.prototype.controller = function(ctrl, options) {
    return this.$controller(ctrl, options);
  };

  ngMidwayTester.prototype.newScope = function(fn) {
    return this.$rootScope.$new();
  };

  ngMidwayTester.prototype.scope = function(element) {
    return angular.element(element || document.body).scope();
  };

  ngMidwayTester.prototype.apply = function(scope, callback) {
    callback = callback || function() {};
    var s = scope || this.scope();
    if(s.$$phase) {
      callback();
    }
    else {
      s.$apply(function() {
        callback(); 
      });
    }
  };

  ngMidwayTester.prototype.prepareGlobals = function(callback) {
    var that = this;
    this.inject(['$controller','$location','$routeParams','$rootScope','$compile','$filter',function($c, $l, $p, $r, $o, $f) {
      that.$controller  = $c;
      that.$location    = $l;
      that.$params      = $p;
      that.$compile     = $o;
      that.$filter      = $f;
      that.$rootScope   = that.$injector.get('$rootScope');
      that.$route       = that.$injector.get('$route');

      //that.prepareEvents(that);

      if(callback) callback();
    }]);
  };

})();
