describe('ui.grid.style', function() {
	'use strict';

	beforeEach(function() {
		module('ui.grid');
		module(function($sceProvider) {
			$sceProvider.enabled(true);
		});
	});

	describe('ui-grid-style', function() {
		var element, scope, compile, recompile;

		beforeEach(inject(function($compile, $rootScope) {
			scope = $rootScope;
			compile = $compile;

			recompile = function() {
				compile(element)(scope);
				scope.$digest();
			};
		}));

		it('allows style elements to have expressions', function() {
			element = angular.element('<style ui-grid-style>{{ foo }}</style>');
			scope.foo = '.bar { color: red }';
			recompile();

			expect(element.text()).toEqual(scope.foo);
		});

		it('does not create useless <br>s', function() {
			element = angular.element('<style ui-grid-style>{{ foo }}</style>');
			scope.foo = '\n.bar { color: red }\n';
			recompile();

			expect(element.html()).toEqual(scope.foo);
		});

		it('works when mixing text and expressions', function() {
			element = angular.element('<style ui-grid-style>.blah { color: {{ color }}; }</style>');
			scope.color = 'black';
			recompile();

			expect(element.html()).toEqual('.blah { color: black; }');
		});

		it('does not add styles when there are no styles to interpolate', function() {
			element = angular.element('<style ui-grid-style></style>');
			recompile();

			expect(element.html()).toEqual('');
		});
	});
});
