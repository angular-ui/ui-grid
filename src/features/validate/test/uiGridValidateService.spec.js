describe('ui.grid.validate uiGridValidateService', function() {
	var uiGridValidateService,
		$rootScope;

	beforeEach(module('ui.grid.validate'));

	beforeEach(inject(function(_uiGridValidateService_, _$rootScope_) {
		uiGridValidateService = _uiGridValidateService_;
		$rootScope = _$rootScope_;
	}));

	it('should create an empty validatorFactories object', function() {
		expect(angular.equals(uiGridValidateService.validatorFactories, {})).toBe(true);
	});

	it('should add a validator when calling setValidator', function() {
		uiGridValidateService.setValidator('test', angular.noop, angular.noop);
		expect(uiGridValidateService.validatorFactories.test).toBeDefined();
	});

	it('should return a validator function when calling getValidator with an argument', function() {
		function fooFactory(argument) {
			return function() {
				return 'foo' + argument;
			};
		}
		uiGridValidateService.setValidator('foo', fooFactory, angular.noop);
		expect(uiGridValidateService.getValidator('foo', 'bar')()).toBe('foobar');
	});

	it('should return a message function when calling getMessage with an argument', function() {
		function messageFunction(argument) {
			return 'message' + argument;
		}
		uiGridValidateService.setValidator('foo', angular.noop, messageFunction);
		expect(uiGridValidateService.getMessage('foo', 'bar')).toBe('messagebar');
	});

	it('should return true when calling isInvalid on an invalid cell', function() {
		var colDef = {name: 'foo'},
			entity = {'$$invalidfoo': true};

		expect(uiGridValidateService.isInvalid(entity, colDef)).toBe(true);
	});

	it('should return false when calling isInvalid on a valid cell', function() {
		var colDef = {name: 'foo'},
			entity = {'$$invalidfoo': false};

		expect(uiGridValidateService.isInvalid(entity, colDef)).toBeFalsy();

		colDef = {name: 'bar'};
		expect(uiGridValidateService.isInvalid(entity, colDef)).toBeFalsy();
	});

	it('should set a cell as invalid when calling setInvalid on a valid cell', function() {
		var colDef = {name: 'foo'},
			entity = {};

		uiGridValidateService.setInvalid(entity, colDef);
		expect(entity['$$invalidfoo']).toBe(true);

		entity = {'$$invalidfoo': false};

		uiGridValidateService.setInvalid(entity, colDef);
		expect(entity['$$invalidfoo']).toBe(true);
	});

	it('should set a cell as valid when calling setValid on an invalid cell', function() {
		var colDef = {name: 'foo'},
			entity = {'$$invalidfoo': true};

		uiGridValidateService.setValid(entity, colDef);

		expect(entity['$$invalidfoo']).toBeUndefined();
	});

	it('should add an error to a cell when calling setError on that cell', function() {
		var colDef = {name: 'foo'},
			entity = {};

		uiGridValidateService.setError(entity, colDef, 'bar');
		expect(entity['$$errorsfoo'].bar).toBe(true);

		entity['$$errorsfoo'].bar = false;

		uiGridValidateService.setError(entity, colDef, 'bar');
		expect(entity['$$errorsfoo'].bar).toBe(true);
	});

	it('should remove an error to a cell when calling clearError on that cell', function() {
		var colDef = {name: 'foo'},
			entity = {'$$errorsfoo': {bar: true}};

		uiGridValidateService.clearError(entity, colDef, 'bar');
		expect(entity['$$errorsfoo'].bar).toBeUndefined();
	});

	it('should return an array with all error messages (alphabetically sorted) when calling getErrorMessages on a cell', function() {
		var colDef = {name: 'test', validators: {foo: 'foo', bar: 'bar'}},
			entity = {'$$errorstest': {foo: true, bar: true}};

		function fooMessage(argument) {
			return argument + 'Message';
		}
		function barMessage(argument) {
			return argument + 'Message';
		}

		uiGridValidateService.setValidator('foo', angular.noop, fooMessage);
		uiGridValidateService.setValidator('bar', angular.noop, barMessage);

		var messages = uiGridValidateService.getErrorMessages(entity, colDef);

		expect(messages[0]).toBe('barMessage');
		expect(messages[1]).toBe('fooMessage');
	});

	it('should execute all validators when calling runValidators on a cell and set/clear errors', function() {
		var colDef = {name: 'test', validators: {foo: 'foo', bar: 'bar'}},
			entity = {};

		function validatorFactory(argument) {
			return function() {
				return argument === 'foo';
			};
		}

		uiGridValidateService.setValidator('foo', validatorFactory, angular.noop);
		uiGridValidateService.setValidator('bar', validatorFactory, angular.noop);

		uiGridValidateService.runValidators(entity, colDef, 1, 0);

		$rootScope.$apply();

		expect(entity['$$errorstest'].bar).toBe(true);
		expect(entity['$$invalidtest']).toBe(true);

		expect(entity['$$errorstest'].foo).toBeFalsy();
	});

	it('should return a promise when calling runValidators on a cell', function() {
		var colDef = {name: 'test', validators: {foo: 'foo', bar: 'bar'}},
			entity = {};

		function validatorFactory(argument) {
			return function() {
				return argument === 'foo';
			};
		}

		uiGridValidateService.setValidator('foo', validatorFactory, angular.noop);
		uiGridValidateService.setValidator('bar', validatorFactory, angular.noop);

		var promise = uiGridValidateService.runValidators(entity, colDef, 1, 0);

		expect(promise).toBeDefined();

		$rootScope.$apply();

		expect(entity['$$errorstest'].bar).toBe(true);
		expect(entity['$$invalidtest']).toBe(true);

		expect(entity['$$errorstest'].foo).toBeFalsy();
	});

	it('should not execute any validator when calling runValidators with newValue === oldValue', function() {
		var colDef = {name: 'test', validators: {foo: 'foo', bar: 'bar'}},
			entity = {};

		function validatorFactory(argument) {
			return function() {
				return argument === 'foo';
			};
		}

		uiGridValidateService.setValidator('foo', validatorFactory, angular.noop);
		uiGridValidateService.setValidator('bar', validatorFactory, angular.noop);

		uiGridValidateService.runValidators(entity, colDef, 1, 1);

		$rootScope.$apply();

		expect(entity['$$errorstest']).toBeUndefined();
		expect(entity['$$invalidtest']).toBeUndefined();
	});

	it('should run an external validator if an external validator factory is set', function() {
		var colDef = {name: 'test', validators: {foo: 'foo'}},
			entity = {};

		function externalFooValidator() {
			return function() {
				return false;
			};
		}
		function externalFactoryFunction(name) {
			if (name === 'foo') {
				return {validatorFactory: externalFooValidator, messageFunction: angular.noop};
			}
		}

		uiGridValidateService.setExternalFactoryFunction(externalFactoryFunction);

		function validatorFactory(argument) {
			return function() {
				return argument === 'foo';
			};
		}

		uiGridValidateService.setValidator('foo', validatorFactory, angular.noop);

		uiGridValidateService.runValidators(entity, colDef, 1, 0);

		$rootScope.$apply();

		expect(entity['$$errorstest'].foo).toBe(true);
		expect(entity['$$invalidtest']).toBe(true);
	});

	describe('should call setValidator three times when calling createDefaultValidators', function() {
		beforeEach(function() {
			spyOn(uiGridValidateService, 'setValidator');
		});

		it('', function() {
			uiGridValidateService.createDefaultValidators();

			expect(uiGridValidateService.setValidator.calls.count()).toBe(3);
		});
	});
});
