describe('Utils Test', function () {

    describe('evalProperty', function () {
        var res;
        beforeEach(function() {
            var obj = { foo: { bar: { hello: { world: "foundme" } } } };
            res = ng.utils.evalProperty(obj, "foo.bar.hello.world");
        });
        
        it('should find the right property given a heirarchy', function () {
            expect(res).toEqual("foundme");
        });
        
    });
    
});