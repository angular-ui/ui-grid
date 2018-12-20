describe('ui.grid.utilService', function() {
	'use strict';

	var gridUtil, $window, Grid, $rootScope, $q, $interpolateProvider;

	beforeEach(function() {
		module('ui.grid', function(_$interpolateProvider_) {
			$interpolateProvider = _$interpolateProvider_;
		});

		inject(function(_$rootScope_, _$q_, _gridUtil_, _$window_, _Grid_) {
			gridUtil = _gridUtil_;
			$window = _$window_;
			Grid = _Grid_;
			$rootScope = _$rootScope_;
			$q = _$q_;
		});
	});

	describe('newId()', function() {
		it('creates a unique id each time it is called', function() {
			var id1 = gridUtil.newId(),
				id2 = gridUtil.newId();

			expect(id1).not.toEqual(id2);
		});
	});

	describe('debounce()', function() {
		it('debounces a function', inject(function($timeout) {

			var x = 0;
			var func = function() {
				x++;
			};

			var debouncedFunc = gridUtil.debounce(func, 10);
			debouncedFunc();
			debouncedFunc();
			debouncedFunc();
			debouncedFunc();
			debouncedFunc();
			$timeout.flush();

			expect(x).toEqual(1);
		}));
	});

	describe('throttle()', function() {
		var $interval, x, func;

		beforeEach(inject(function(_$interval_) {
			$interval = _$interval_;
			x = 0;
			func = function() {
				x++;
			};
		}));

		it('prevents multiple function calls', function() {
			var throttledFunc = gridUtil.throttle(func, 10);

			throttledFunc();
			throttledFunc();
			throttledFunc();
			expect(x).toEqual(1);
			$interval.flush(15);
			expect(x).toEqual(1);
		});

		// TODO(JLLeitschuh): WHY DOES THIS FAIL?! THIS SHOULD NOT FAIL!!
		xit('queues a final event if trailing param is truthy', function() {
			var throttledFunc = gridUtil.throttle(func, 10, {trailing: true});
			throttledFunc();
			throttledFunc();
			throttledFunc();
			expect(x).toEqual(1);
			$interval.flush(15);
			expect(x).toEqual(2);
		});
	});

	describe('readableColumnName', function() {
		it('does not throw with null name', function() {
			expect(function() {
				gridUtil.readableColumnName(null);
			}).not.toThrow();
		});

		it('should create readable column names from properties', function() {
			var translationExpects = [
				[0, '0'],
				['property', 'Property'],
				['Property', 'Property'],
				['aProperty', 'A Property'],
				['ThisProperty', 'This Property'],
				['thisSecondProperty', 'This Second Property'],
				['thingsILove', 'Things I Love'],
				['a_property', 'A Property'],
				['a__property', 'A Property'],
				['another_property', 'Another Property'],
				['ALLCAPS', 'Allcaps'],
				['address.city', 'Address.City']
			];

			translationExpects.forEach(function(set) {
				var strIn = set[0],
					strOut = set[1];

				expect(gridUtil.readableColumnName(strIn)).toEqual(strOut);
			});
		});

		it('handles multiple capitlization->separations', function() {
			var multiCapsed = gridUtil.readableColumnName('thisIsSoCool');

			expect(multiCapsed).toEqual('This Is So Cool');
		});
	});

	describe('getColumnsFromData', function() {
		it('should create column defs from a data array', function() {
			var data = [
				{
					firstName: 'Bob',
					lastName: 'Smith'
				}
			];

			var columns = gridUtil.getColumnsFromData(data);

			expect(columns)
				.toEqual([
					{
						name: 'firstName'
					},
					{
						name: 'lastName'
					}
				]);
		});
	});

	describe('getColumnsFromData', function() {
		it('should create column defs from a data array omitting $$hashKey', function() {
			var data = [
				{
					firstName: 'Bob',
					lastName: 'Smith',
					$$hashKey: '00A'
				}
			];

			var excludeProperties = ['$$hashKey'];

			var columns = gridUtil.getColumnsFromData(data, excludeProperties);

			expect(columns)
				.toEqual([
					{
						name: 'firstName'
					},
					{
						name: 'lastName'
					}
				]);
		});
	});

	describe('element calculations', function() {
		var elm;

		beforeEach(function() {
			elm = document.createElement('div');
			elm.style.height = "300px";
			elm.style.width = "200px";
			document.body.appendChild(elm);
		});

		afterEach(function() {
			angular.element(elm).remove();
			elm = null;
		});

		describe('elementWidth()', function() {
			it('should calculate element width', function() {
				// var elm = angular.element('<div style="width: 200px">asdf</div>');
				// dump(elm.ownerDocument.defaultView.getComputedStyle(elm, null)['width']);

				var w = gridUtil.elementWidth(elm);

				expect(w).toEqual(200);
			});
		});

		describe('elementHeight()', function() {
			it('should calculate element height', function() {
				var w = gridUtil.elementHeight(elm);

				expect(w).toEqual(300);
			});

			// Width is no longer calculated for hidden elements
			xit('should work with hidden element', function() {
				angular.element(elm).remove();

				elm = document.createElement('div');
				elm.style.height = "300px";
				elm.style.width = "200px";
				elm.style.display = "none";
				document.body.appendChild(elm);

				angular.element(elm).append('<div id="testelm" style="display: none">Test Test Test</div>');

				var testelm = document.getElementById('testelm');
				var h = gridUtil.elementHeight(testelm);

				expect(h).toBeGreaterThan(0);
			});
		});

		describe('outerElementHeight()', function() {
			it('should calculate element height, including border', function() {
				elm.style.border = "1px solid black";
				var w = gridUtil.outerElementHeight(elm);

				expect(w).toEqual(302);
			});
		});

		describe('outerElementWidth()', function() {
			it('should calculate element Width, including border', function() {
				elm.style.border = "1px solid black";
				var w = gridUtil.outerElementWidth(elm);

				expect(w).toEqual(202);
			});
		});

		describe('getTemplate', function() {
			it('should work with url and cache on 2nd call', inject(function($httpBackend, $timeout) {
				var html = '<div/>';
				var url = '/someUrl.html';
				$httpBackend.expectGET(url)
					.respond(html);

				var result;
				gridUtil.getTemplate(url).then(function(r) {
					result = r;
				});
				$httpBackend.flush();

				$httpBackend.verifyNoOutstandingRequest();
				expect(result).toEqual(html);

				// call again should not do any http
				result = null;
				$timeout(function() {
					gridUtil.getTemplate(url).then(function(r) {
						result = r;
					});
				});
				$timeout.flush();

				$httpBackend.verifyNoOutstandingRequest();
				expect(result).toEqual(html);

			}));

			it('should work with many different urls', inject(function($httpBackend, $timeout) {
				var html = '<div/>';
				var url = 'http://someUrl.html';
				$httpBackend.expectGET(url)
					.respond(html);

				var result;
				gridUtil.getTemplate(url).then(function(r) {
					result = r;
				});
				$httpBackend.flush();

				$httpBackend.verifyNoOutstandingRequest();
				expect(result).toEqual(html);

				// call again should not do any http
				result = null;
				$timeout(function() {
					gridUtil.getTemplate(url).then(function(r) {
						result = r;
					});
				});
				$timeout.flush();

				$httpBackend.verifyNoOutstandingRequest();
				expect(result).toEqual(html);

			}));

			it('should work with html', inject(function($timeout) {
				var html = '<div></div>';
				var result = null;
				$timeout(function() {
					gridUtil.getTemplate(html).then(function(r) {
						result = r;
					});
				});
				$timeout.flush();
				expect(result).toEqual(html);
			}));

			it('should work with promise', inject(function($timeout, $q) {
				var html = '<div></div>';
				var promise = $q.when(html);
				var result = null;
				$timeout(function() {
					gridUtil.getTemplate(promise).then(function(r) {
						result = r;
					});
				});
				$timeout.flush();
				expect(result).toEqual(html);
			}));

		});

	});

	describe('type()', function() {
		it('should return the type of an object as a string', function() {
			var g = new Grid({id: 1});

			expect(gridUtil.type(g)).toEqual('Grid');
		});
	});

	describe('preEval should convert non-bracket portions of expressions to bracket notation', function() {
		it('should convert empty string', function() {
			expect(gridUtil.preEval('')).toEqual('');
		});

		it('should convert plain single variable reference', function() {
			expect(gridUtil.preEval('obj')).toEqual('obj');
		});

		it('should convert object with a property ', function() {
			expect(gridUtil.preEval('obj.prop')).toEqual('obj[\'prop\']');
		});

		it('should convert where object\'s property is a function', function() {
			expect(gridUtil.preEval('obj.f()')).toEqual('obj[\'f\']()');
		});

		it('should convert deeper complex property requiring bracket notation', function() {
			expect(gridUtil.preEval('obj.first-name.length')).toEqual('obj[\'first-name\'][\'length\']');
		});

		it('should convert recursively expression containing bracket notation', function() {
			expect(gridUtil.preEval('obj.first-name[ "already bracket ... with dots and \' single quote"].charAt(0)'))
				.toEqual('obj[\'first-name\'][ "already bracket ... with dots and \' single quote"][\'charAt\'](0)');
		});

		it('should convert array property', function() {
			expect(gridUtil.preEval('obj.first-name[0].charAt(0)'))
				.toEqual('obj[\'first-name\'][0][\'charAt\'](0)');
		});
	});

	describe('resetUids()', function() {
		it('should reset the UID index back to 000', function() {
			gridUtil.resetUids();

			for (var i = 0; i < 50; i++) {
				gridUtil.nextUid();
			}

			var uid = gridUtil.nextUid();

			expect(uid).toEqual('uiGrid-01F');

			gridUtil.resetUids();

			uid = gridUtil.nextUid();

			expect(uid).toEqual('uiGrid-001');
		});
	});

	describe('nextUid', function() {
		it('should generate an initial unique id', function() {
			gridUtil.resetUids();
			var uid = gridUtil.nextUid();

			expect(uid).toEqual('uiGrid-001');
		});

		it('should generate unique ids for each call', function() {
			gridUtil.resetUids();

			var uid1 = gridUtil.nextUid();
			var uid2 = gridUtil.nextUid();
			var uid3 = gridUtil.nextUid();

			expect(uid2).toEqual('uiGrid-002');
			expect(uid3).toEqual('uiGrid-003');
		});
	});

	describe('arrayContainsObjectWithProperty', function() {
		it('should return true if the array contains an object with the provided key and value, and false if not', function() {
			var array = [
				{name: 'Jonah', age: 12},
				{name: 'Alice', age: 33},
				{name: 'Joseph', age: 22}
			];

			var contains = gridUtil.arrayContainsObjectWithProperty(array, 'name', 'Alice');
			var notContains = gridUtil.arrayContainsObjectWithProperty(array, 'name', 'Mathias');
			expect(contains).toEqual(true);
			expect(notContains).toEqual(false);
		});
	});

	describe('postProcessTemplate', function() {
		it('should return unmodified template when interpolation symbols are the default values ( {{ / }} )', function() {
			var tmpl;
			gridUtil.getTemplate('ui-grid/ui-grid')
				.then(function(template) {
					tmpl = template;
				});

			$rootScope.$digest();

			expect(tmpl).toMatch(/\{\{/, 'template has default start interpolation symbols');
			expect(tmpl).toMatch(/\}\}/, 'template has default end interpolation symbols');
		});

		describe('with different interpolation symbols', function() {
			beforeEach(function() {
				$interpolateProvider.startSymbol('[[');
				$interpolateProvider.endSymbol(']]');
			});

			it('should alter templates already in $templateCache', function() {
				var tmpl;
				gridUtil.getTemplate('ui-grid/ui-grid')
					.then(function(template) {
						tmpl = template;
					});

				$rootScope.$digest();

				expect(tmpl).not.toMatch(/\{\{/, 'template does not have default start interpolation symbols');
				expect(tmpl).not.toMatch(/\}\}/, 'template does not have default end interpolation symbols');

				expect(tmpl).toMatch(/\[\[/, 'template has custom start interpolation symbols');
				expect(tmpl).toMatch(/\]\]/, 'template has custom end interpolation symbols');
			});

			it('should alter template that is just an element', function() {
				var tmpl;
				gridUtil.getTemplate('<div>{{ foo }}</div>')
					.then(function(template) {
						tmpl = template;
					});

				$rootScope.$digest();

				expect(tmpl).not.toMatch(/\{\{/, 'template does not have default start interpolation symbols');
				expect(tmpl).not.toMatch(/\}\}/, 'template does not have default end interpolation symbols');

				expect(tmpl).toMatch(/\[\[/, 'template has custom start interpolation symbols');
				expect(tmpl).toMatch(/\]\]/, 'template has custom end interpolation symbols');
			});

			it('should alter template that is a promise', function() {
				var p = $q.when('<div>{{ foo }}</div>');

				var tmpl;
				gridUtil.getTemplate(p)
					.then(function(template) {
						tmpl = template;
					});

				$rootScope.$digest();

				expect(tmpl).not.toMatch(/\{\{/, 'template does not have default start interpolation symbols');
				expect(tmpl).not.toMatch(/\}\}/, 'template does not have default end interpolation symbols');

				expect(tmpl).toMatch(/\[\[/, 'template has custom start interpolation symbols');
				expect(tmpl).toMatch(/\]\]/, 'template has custom end interpolation symbols');
			});

			it('should alter template fetched with $http', inject(function($httpBackend, $timeout) {
				var html = '<div>{{ foo }}</div>';
				var url = 'http://someUrl.html';
				$httpBackend.expectGET(url)
					.respond(html);

				var result;
				gridUtil.getTemplate(url).then(function(r) {
					result = r;
				});
				$httpBackend.flush();

				$httpBackend.verifyNoOutstandingRequest();

				expect(result).not.toMatch(/\{\{/, 'template does not have default start interpolation symbols');
				expect(result).not.toMatch(/\}\}/, 'template does not have default end interpolation symbols');

				expect(result).toMatch(/\[\[/, 'template has custom start interpolation symbols');
				expect(result).toMatch(/\]\]/, 'template has custom end interpolation symbols');
			}));
		});
	});

	describe('focus', function() {
		var $timeout;
		var elm;
		var button1, aButton1, button1classUnset = 'ui-grid-button1';
		var button2, aButton2, button2class = 'ui-grid-button2';
		beforeEach(inject(function(_$timeout_) {
			$timeout = _$timeout_;
			elm = document.createElement('div');

			/* Create Button1 */
			button1 = document.createElement('button');
			aButton1 = angular.element(button1);
			aButton1.attr('id', 'aButton1');
			aButton1.attr('type', 'button');
			// The class is not set here because it is set inside of tests if needed

			/* Create Button2 */
			button2 = document.createElement('button');
			aButton2 = angular.element(button1);
			aButton2.attr('id', 'aButton2');
			aButton2.attr('type', 'button');
			aButton2.addClass(button2class);

			elm.appendChild(button1);
			elm.appendChild(button2);
			document.body.appendChild(elm);
		}));

		afterEach(function() {
			if (document.activeElement !== document.body) {
				document.activeElement.blur();
			}
			document.body.innerHtml = '';
		});

		function expectFocused(element) {
			expect(element.innerHTML).toEqual(document.activeElement.innerHTML);
		}

		describe('byId', function() {
			describe('when the grid is not defined', function() {
				it('should focus on the element with the id passed', function() {
					gridUtil.focus.byId('aButton2');
					$timeout.flush();

					expectFocused(button2);
				});
			});
			describe('when the grid is defined', function() {
				it('should focus on the element with the grid id and the id passed', function() {
					var gridId = 'gridId';

					aButton2.attr('id', 'gridId-aButton2');
					gridUtil.focus.byId('aButton2', {id: gridId});
					$timeout.flush();

					expectFocused(button2);
				});
			});
			describe('when the id passed in is not in the dom', function() {
				it('should keep focus on the body', function() {
					document.body.focus();
					gridUtil.focus.byId('notAnElement');
					$timeout.flush();
					expectFocused(document.body);
				});
			});
		});
		describe('byElement', function() {
			describe('when argument passed is an element', function() {
				it('should focus on the element passed', function() {
					gridUtil.focus.byElement(button1);
					$timeout.flush();
					expectFocused(button1);
				});
			});
			describe('when argument passed is not an element', function() {
				it('should keep focus on the body', function() {
					document.body.focus();
					gridUtil.focus.byElement('');
					expectFocused(document.body);
				});
			});
		});
		describe('bySelector', function() {
			describe('when argument passed is not an element', function() {
				it('should throw an error', function(done) {
					try {
						gridUtil.focus.bySelector('');
					} catch (error) {
						expect(error.message).toEqual('The parent element is not an element.');
						done();
					}
				});
			});
			it('should focus on an elment using a selector', function() {
				gridUtil.focus.bySelector(elm, '.' + button2class);
				$timeout.flush();
				expectFocused(button2);
			});

			it('should focus on an elment using a selector asynchronysly', function() {
				gridUtil.focus.bySelector(elm, '.' + button1classUnset, true);
				aButton1.addClass(button1classUnset);

				$timeout.flush();
				expectFocused(button1);
			});
		});
		it('should return a rejected promise if canceled by another focus call', function() {
			// Given
			var focus1 = {
				callbackSuccess: function() {
				},
				callbackFailed: function(reason) {
				}
			};
			spyOn(focus1, 'callbackSuccess');
			spyOn(focus1, 'callbackFailed');

			var focus2 = {
				callbackSuccess: function() {
				},
				callbackFailed: function(reason) {
				}
			};
			spyOn(focus2, 'callbackSuccess');
			spyOn(focus2, 'callbackFailed');

			// When
			// Two focus events are queued
			gridUtil.focus.byElement(button1).then(focus1.callbackSuccess, focus1.callbackFailed);
			gridUtil.focus.byElement(button2).then(focus2.callbackSuccess, focus2.callbackFailed);
			$timeout.flush();

			// Then
			// The first callback will fail
			expect(focus1.callbackSuccess).not.toHaveBeenCalled();
			expect(focus1.callbackFailed).toHaveBeenCalledWith('canceled');
			expect(focus2.callbackSuccess).toHaveBeenCalled();
			expect(focus2.callbackFailed).not.toHaveBeenCalled();
		});
	});

	describe('rtlScrollType', function() {
		it('should not throw an exception', function() {
			// This was throwing an exception in IE because IE doesn't have a native <element>.remove() method.
			expect(function() {
				gridUtil.rtlScrollType();
			}).not.toThrow();
		});
	});

	describe('on.mousewheel', function() {
		it('should register a callback on a dom element', function() {
			var div = document.createElement('div');
			var $div = angular.element(div);
			var callback = function() {
			};
			gridUtil.on.mousewheel(div, callback);
			expect(Object.keys($div.data('mousewheel-callbacks')).length).toEqual(1);
		});
	});

	describe('off.mousewheel', function() {
		it('should deregister a callback on a dom element', function() {
			var div = document.createElement('div');
			var $div = angular.element(div);
			var callback1 = function() {
				return 1;
			};
			var callback2 = function() {
				return 2;
			};
			gridUtil.on.mousewheel(div, callback1);
			gridUtil.on.mousewheel(div, callback2);
			expect(Object.keys($div.data('mousewheel-callbacks')).length).toEqual(2);
			gridUtil.off.mousewheel(div, callback1);
			expect(Object.keys($div.data('mousewheel-callbacks')).length).toEqual(1);
			gridUtil.off.mousewheel(div, callback2);
			expect($div.data('mousewheel-callbacks')).toBe(undefined);
		});
	});
});

describe('px filter', function() {
	'use strict';

	var pxFilter;

	beforeEach(function() {
		module('ui.grid');

		inject(function(_pxFilter_) {
			pxFilter = _pxFilter_;
		});
	});

	it('should add px to a number text that does not have px at the end of it', function() {
		expect(pxFilter('100')).toEqual('100px');
	});

	it('should not add px to a number text that already has px at the end of it', function() {
		expect(pxFilter('200px')).toEqual('200px');
	});
});
