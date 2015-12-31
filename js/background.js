// -- Constructor (set up windows etc) --
var BackgroundPage = function() {
  
  // -- Data --
  this.source = {};
  this.display = null;
  this.timeout = null;
  
  // -- Windows --
	this.displayWindow = null;
	this.optionsWindow = null;
	this.connectivityWindow = null;
  
  // -- Screen Bounds --
	this.fullScreenBounds = {
		width: Math.round(screen.availWidth),
		height: Math.round(screen.availHeight),
		left: 0,
		top: 0
	};
  
}


// -- Display Window --
BackgroundPage.prototype.handleDisplayWindowCreated = function(win) {
	win.contentWindow.gBackgroundPage = this;
	if (!win.isFullscreen()) win.fullscreen();
	this.displayWindow = win;
	win.onClosed.addListener(this.handleDisplayWindowClose.bind(this));
  
  if (this.optionsWindow) this.optionsWindow.close();
  if (this.connectivityWindow) this.connectivityWindow.close();
  
}

BackgroundPage.prototype.handleDisplayWindowClose = function() {
	this.displayWindow = null;
}
// -- Display Window --


// -- Options Window --
BackgroundPage.prototype.handleOptionsWindowCreated = function(win) {
	win.contentWindow.gBackgroundPage = this;
	this.optionsWindow = win;
	win.onClosed.addListener(this.handleOptionsWindowClose.bind(this));
}

BackgroundPage.prototype.handleOptionsWindowClose = function() {
  if (!this.displayWindow) this.tryConfigure();
	this.optionsWindow = null;
}
// -- Options Window --


// -- Connectivity Window --
BackgroundPage.prototype.handleConnectivityWindowCreated = function(win) {
	win.contentWindow.gBackgroundPage = this;
	this.connectivityWindow = win;
	win.onClosed.addListener(this.handleConnectivityWindowClose.bind(this));
}

BackgroundPage.prototype.handleConnectivityWindowClose = function() {

  if (!this.displayWindow) {
    if (this.display) {

      // Hand over to the Display Window
      chrome.app.window.create("display.html", 
        {frame : "none", id : "display", bounds: this.fullScreenBounds}, this.handleDisplayWindowCreated.bind(this));

    } else {

      this.tryDisplay();

    }
  }

  this.connectivityWindow = null;
  
}
// -- Connectivity Window --


// -- General Functions --
BackgroundPage.prototype.reTry = function() {
   if (this.display) {

    // Hand over to the Display Window
    chrome.app.window.create("display.html", 
      {frame : "none", id : "display", bounds: this.fullScreenBounds}, this.handleDisplayWindowCreated.bind(this));
    
  } else {
    
    this.tryDisplay();
    
  }
}
BackgroundPage.prototype.showOptions = function() {
	
	// Close Display Window (if open)
	if (this.displayWindow) this.displayWindow.close();
	this.displayWindow = null;
  
	// Close Connectivity Window (if open)
	if (this.connectivityWindow) this.connectivityWindow.close();
	this.connectivityWindow = null;
	
	chrome.app.window.create("options.html", {id : "options"}, this.handleOptionsWindowCreated.bind(this));
}
// -- General Functions --


// -- Handle General Events --
BackgroundPage.prototype.handleContextClick = function(info) {
  if(info.menuItemId == "options") {
    this.showOptions();
  }
}

BackgroundPage.prototype.handleClose = function() {
	chrome.power.releaseKeepAwake();
	if (this.displayWindow) this.displayWindow.close();
	this.displayWindow = null;
}

BackgroundPage.prototype.handleLaunch = function() {
	// Set the power status to always on!
	chrome.power.requestKeepAwake("display");
  
  // Set the default storage area to managed (for policy configuration)
  chromeStorage.defaultArea = "managed";

  this.tryConfigure();
}

BackgroundPage.prototype.tryConfigure = function() {
  var context = this;
  
  // Need to get the Policy Settings ...
  chromeStorage.get(["Google_Source", "Connectivity_Timeout"])
    .then(items => {
      if (items.Connectivity_Timeout) {
        context.timeout = items.Connectivity_Timeout;
      } else {
        context.timeout = 30;
      }
      if (!items.Google_Source) {
        // No Policy settings, so let's try Local
        chromeStorage.get("Google_Source", "local")
          .then(items => {
          if (items.Google_Source) {
            this.source.Google = items.Google_Source;
          }
          this.tryDisplay();
        });
      } else {
        // Used the Managed Policy / lSettings
        this.source.Google = items.Google_Source;
        this.tryDisplay();
      }
  });
}

BackgroundPage.prototype.tryDisplay = function() {
  
  var context = this;
  
  // Q1: Are we configured?
  if (!context.source || !context.source.Google) {

    // No: Throw up the 'options' window and let it handle app flow.
    if (!context.display)
      chrome.app.window.create("options.html", {id : "options"}, this.handleOptionsWindowCreated.bind(this)); 
    
  } else {
    
    // Yes: Q2: Try to grab and iterate data from configured source, matching IP address.
    tabletops(context.source.Google).then(function(values) {
      
      netInterfaces().then(function(interfaces) {
        
        $.each(values, function(i, value) {
          
          $.each(interfaces, function(j, interface) {
            
              // Yes: We have a match, so store it!
              if (interface.address == value.IP) {
                context.display = value;
                return false;
              }
            
            });
          
          if (context.display) return false;
          
        });
        
      })
      
     }).then(function() {

      // Hand over to the Connectivity Window
      if (!this.connectivityWindow)
        chrome.app.window.create("connectivity.html", 
          {frame : "none", id : "connectivity", bounds : context.fullScreenBounds}, context.handleConnectivityWindowCreated.bind(context));

    });

  }
}
// -- Handle General Events --


// -- Set Up Handlers -- //
var gBackgroundPage = new BackgroundPage();

chrome.app.runtime.onLaunched.addListener(gBackgroundPage.handleLaunch.bind(gBackgroundPage));

chrome.runtime.onSuspend.addListener(gBackgroundPage.handleClose.bind(gBackgroundPage));

chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({ id: "options", title: "Options", contexts: ["launcher"] })
})

chrome.contextMenus.onClicked.addListener(gBackgroundPage.handleContextClick.bind(gBackgroundPage))