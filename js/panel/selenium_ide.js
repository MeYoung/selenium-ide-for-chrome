// Generated by CoffeeScript 1.6.2
(function() {
  "use strict";
  var SeleniumAjax, SeleniumIDE;

  this.SeleniumIDE = SeleniumIDE = (function() {
    function SeleniumIDE() {}

    SeleniumIDE.prototype.init = function(param) {
      var _ref, _ref1, _ref2, _ref3, _ref4;

      if (param == null) {
        param = {};
      }
      this.speed = 0;
      this.ajax = new SeleniumAjax((_ref = param.server) != null ? _ref : 'http://localhost:9515');
      this.desiredCapabilities = (_ref1 = param.desiredCapabilities) != null ? _ref1 : {};
      this.requiredCapabilities = (_ref2 = param.requiredCapabilities) != null ? _ref2 : {};
      this.windowName = (_ref3 = param.windowName) != null ? _ref3 : '';
      this.sessionId = (_ref4 = param.sessionId) != null ? _ref4 : '';
      return this;
    };

    SeleniumIDE.prototype.setSpeed = function(speed) {
      this.speed = speed;
    };

    SeleniumIDE.prototype.getSessionId = function() {
      var _this = this;

      if (this.sessionId) {
        return Deferred.connect(function(call) {
          return call({
            'sessionId': _this.sessionId
          });
        })();
      }
      return this.ajax.post('/session', {
        'desiredCapabilities': this.desiredCapabilities,
        'requiredCapabilities': this.requiredCapabilities
      });
    };

    SeleniumIDE.prototype.setWindowName = function(name) {
      if (!name) {
        return;
      }
      return this.ajax.post("/session/" + this.sessionId + "/window", {
        'name': name
      });
    };

    SeleniumIDE.prototype.setURL = function(url) {
      if (!url) {
        return;
      }
      return this.ajax.post("/session/" + this.sessionId + "/url", {
        'url': url
      });
    };

    SeleniumIDE.prototype.connectionError = function() {
      alert('Connection Error.\nPlease start the selenium server.');
      return chrome.tabs.query({
        'active': true,
        'windowType': 'normal'
      }, function(tabs) {
        return chrome.tabs.executeScript(tabs[0].id, {
          'code': 'window.open("https://code.google.com/p/chromedriver/downloads/list")'
        });
      });
    };

    SeleniumIDE.prototype.send = function(param) {
      var _this = this;

      return this.getSessionId().next(function(data) {
        return _this.sessionId = data.sessionId;
      }).error(this.connectionError.bind(this)).next(this.setWindowName.bind(this, this.windowName)).next(this.setURL.bind(this, param.baseURL)).next(this.executeTest.bind(this, param.tests));
    };

    SeleniumIDE.prototype.executeTest = function(tests) {
      var _this = this;

      if (!tests) {
        return;
      }
      return Deferred.loop(tests.length, function(i) {
        _this.execute(tests[i]);
        return Deferred.wait(_this.speed * 30);
      });
    };

    SeleniumIDE.prototype.quit = function() {
      var _this = this;

      return this.ajax["delete"]("/session/" + this.sessionId).next(function() {
        return _this.sessionId = void 0;
      });
    };

    SeleniumIDE.prototype.execute = function(test) {
      return this.getElementId(test.selector).next(this.executeTarget.bind(this, test));
    };

    SeleniumIDE.prototype.getElementId = function(selector) {
      return this.ajax.post("/session/" + this.sessionId + "/element", {
        'using': 'css selector',
        'value': selector
      });
    };

    SeleniumIDE.prototype.executeTarget = function(test, data) {
      var id;

      id = data.value.ELEMENT;
      if (test.name === 'click') {
        return this.clickElement(id);
      } else {
        return this.textElement(id, test.value);
      }
    };

    SeleniumIDE.prototype.clickElement = function(elementId) {
      return this.ajax.post("/session/" + this.sessionId + "/element/" + elementId + "/click");
    };

    SeleniumIDE.prototype.textElement = function(elementId, value) {
      return this.ajax.post("/session/" + this.sessionId + "/element/" + elementId + "/value", {
        'value': value.split(/(?:)/)
      });
    };

    return SeleniumIDE;

  })();

  SeleniumAjax = (function() {
    function SeleniumAjax(server) {
      this.server = server;
    }

    SeleniumAjax.prototype.ajax = function(param) {
      var defer, xhr,
        _this = this;

      if (typeof param.data !== 'string') {
        param.data = JSON.stringify(param.data);
      }
      defer = Deferred();
      xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) {
          return;
        }
        if (xhr.status !== 200) {
          return;
        }
        return defer.call(JSON.parse(xhr.responseText));
      };
      xhr.onerror = function() {
        return defer.fail({
          'type': 'error.call'
        });
      };
      xhr.open(param.method, this.server + param.url);
      xhr.send(param.data);
      return defer;
    };

    SeleniumAjax.prototype.post = function(url, param) {
      if (param == null) {
        param = '';
      }
      return this.ajax({
        'url': url,
        'data': param,
        'method': 'POST'
      });
    };

    SeleniumAjax.prototype.get = function(url) {
      return this.ajax({
        'url': url,
        'method': 'GET'
      });
    };

    SeleniumAjax.prototype["delete"] = function(url, param) {
      if (param == null) {
        param = '';
      }
      return this.ajax({
        'url': url,
        'data': param,
        'method': 'DELETE'
      });
    };

    return SeleniumAjax;

  })();

}).call(this);
