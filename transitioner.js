// sits in front of the router and provides 'currentPage' and 'nextPage',
// whilst setting the correct classes on the body to allow transitions, namely:
//
//   body.transitioning.from_X.to_Y

(function() {
  var Transitioner = function() {
    this._currentPage = null;
    this._currentPageListeners = new Meteor.deps._ContextSet();
    this._nextPage = null;
    this._nextPageListeners = new Meteor.deps._ContextSet();
    this._options = {}
  }
  Transitioner.prototype._transitionEvents = [
    'webkitTransitionEnd', 
    'oTransitionEnd', 
    'transitionEnd', 
    'msTransitionEnd',
    'transitionend'];
  
  Transitioner.prototype._transitionClasses = function() {
    return [
      "fx",
      "from-" + this._currentPage,
      "to-" + this._nextPage
    ].join(" ")
  }
  
  Transitioner.prototype.setOptions = function(options) {
    _.extend(this._options, options);
  }
  
  Transitioner.prototype.currentPage = function() {
    this._currentPageListeners.addCurrentContext();
    return this._currentPage;
  }
  
  Transitioner.prototype._setCurrentPage = function(page) {
    this._currentPage = page;
    this._currentPageListeners.invalidateAll();
  }
  
  Transitioner.prototype.nextPage = function() {
    this._nextPageListeners.addCurrentContext();
    return this._nextPage;
  }
  
  Transitioner.prototype._setNextPage = function(page) {
    this._nextPage = page;
    this._nextPageListeners.invalidateAll();
  }
  
  Transitioner.prototype.listen = function() {
    var self = this;
    
    Meteor.autorun(function() {
      self.transition(Meteor.Router.page());
    });
  }
  
  // do a transition to newPage, if we are already set and there already
  //
  // note: this is called inside an autorun, so we need to take care to not 
  // do anything reactive.
  Transitioner.prototype.transition = function(newPage) {
    var self = this;
    newPage = newPage instanceof Object ? newPage.page : newPage;
    
    // this is our first page? don't do a transition
    if (!self._currentPage)
      return self._setCurrentPage(newPage);
    
    // if we are transitioning already, quickly finish that transition
    if (self._nextPage)
      self.endTransition();
    
    // if we are transitioning to the page we are already on, no-op
    if (self._currentPage === newPage)
      return;
    
    // Start the transition -- first tell any listeners to re-draw themselves
    self._setNextPage(newPage);
    // wait until they are done/doing:
    Meteor._atFlush(function() {
      
      self._options.before && self._options.before();
      
      // Listen to the main element to finish transitions. Browser vendor 
      // specificities are taken into account. The "body" element is arbitrary
      // set here to hold transition classes.
      var _b = document.body;
      for (var i = self._transitionEvents.length - 1; i >= 0; i--) {
        _b.addEventListener(self._transitionEvents[i], function (e) {
          self.endTransition();
        });
      };
      _b.className = _b.className.replace(/(from|to)\-[^\s]+/ig, "");
      _b.className = [_b.className, self._transitionClasses()].join(" ").trim();

    })
  }
  
  Transitioner.prototype.endTransition = function() {
    var self = this;
    
    // if nextPage isn't set, something weird is going on, bail
    if (! self._nextPage)
      return;
    
    // Update current and next pages.
    self._setCurrentPage(self._nextPage);
    self._setNextPage(null);
    
    // Clean up transitional class addition.
    Meteor._atFlush(function() {
      var _b = document.body;
      var _cls = self._transitionClasses().split(" ");
      for (var i = _cls.length - 1; i >= 0; i--) {
        _b.className = _b.className.replace(_cls[i], "");
      };
      _b.className = _b.className.trim();

      self._options.after && self._options.after();
    });
  }
  
  Meteor.Transitioner = new Transitioner();
  Meteor.startup(function() {
    Meteor.Transitioner.listen();
  });
}());
