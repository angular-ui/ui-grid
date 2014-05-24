(function () {

  angular.module('ui.grid')
  .service('GridPubSub', [function () {
    function GridPubSub(id) {
      this.id = id;
      this.cache = {};
    }

    GridPubSub.prototype.subscribe = function subscribe(topic, callback) {
      var self = this;

      if (!self.cache[topic]) {
        self.cache[topic] = [];
      }
      self.cache[topic].push(callback);
      return [topic, callback]; // Array
    };

    GridPubSub.prototype.unsubscribe = function subscribe(handle, callback) {
      var self = this;

      var subs = self.cache[callback ? handle : handle[0]],
          len = subs ? subs.length : 0;

      callback = callback || handle[1];

      while (len--) {
        if (subs[len] === callback) {
          subs.splice(len, 1);
        }
      }
    };

    GridPubSub.prototype.publish = function subscribe(topic, args) {
      var self = this;

      var subs = self.cache[topic],
      len = subs ? subs.length : 0;

      // Can change loop or reverse array if the order matters
      while (len--) {
        subs[len].apply(self, args || []);
      }
    };

    return GridPubSub;
  }]);

})();