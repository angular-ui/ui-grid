'use strict';

/* jasmine specs for services go here */

describe('Utility Service', function () {
    var service;
    beforeEach(module('ngGrid.services'));
    beforeEach(inject(function ($utilityService) {
        service = $utilityService;
    }));
    // evalProperty
    describe('evalProperty should find the right property given a heirarchy.', function () {
        // foundme
        it('returns foundme', function() {
            var obj = { foo: { bar: { hello: { world: "foundme" } } } };
            expect(service.evalProperty(obj, "foo.bar.hello.world")).toEqual("foundme");
        });
        // undefined
        it('returns undefined', function () {
            var obj = { foo: { bar: { hello: { world: "foundme" } } } };
            expect(service.evalProperty(obj, "foo.bar.omg")).toEqual(undefined);
        });
    });
    // visualLength
    describe('visualLength should return the correct visual length of text.', function () {
        it('returns integer', function() {
            var node = angular.element('<div style="width: 30px;">The quick brown fox jumped over the lazy dog.</div>');
            expect(service.visualLength(node)).toEqual(298);
        });
    });
    // forIn
    describe('forIn should execute the function for each key in an object.', function() {
        it('executes some code', function () {
            var obj = {
                foo: "foo",
                bar: "bar",
                hello: "hello",
                world: "world"
            };

            service.forIn(obj, function(val, key) {
                obj[key] = "foundme";
            });
            expect(obj.foo).toEqual("foundme");
            expect(obj.bar).toEqual("foundme");
            expect(obj.hello).toEqual("foundme");
            expect(obj.world).toEqual("foundme");
        });
    });
    // endsWith
    describe('endsWith should return true or false based on the last character in a string', function () {
        var str = "Peter Piper picked a peck of pickeled peppers";
        it('returns true', function() {
            
            expect(service.endsWith(str, "peppers")).toEqual(true);
        });
        it('returns false', function () {
            expect(service.endsWith(str, "peter")).toEqual(false);
        });
    });
    // isNullOrUndefined
    describe('isNullOrUndefined return true or false based on wherer or not a given reference is explucitly null or undefined', function () {
        it('returns true', function () {
            var hello; 
            expect(service.isNullOrUndefined(hello)).toEqual(true);
            var hello = null;
            expect(service.isNullOrUndefined(hello)).toEqual(true);
            var hello = undefined;
            expect(service.isNullOrUndefined(hello)).toEqual(true);
            expect(service.isNullOrUndefined(null)).toEqual(true);
            expect(service.isNullOrUndefined(undefined)).toEqual(true);
        });
        it('returns false', function () {
            expect(service.isNullOrUndefined("foundme")).toEqual(false);
            expect(service.isNullOrUndefined("")).toEqual(false);
            expect(service.isNullOrUndefined(0)).toEqual(false);
        });
    });
});
