var getIdFromUrl = function(url) { return url.match(/[-\w]{25,}/); };

var randomString = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

//Make an object a string that evaluates to an equivalent object
//  Note that eval() seems tricky and sometimes you have to do
//  something like eval("a = " + yourString), then use the value
//  of a.
//
//  Also this leaves extra commas after everything, but JavaScript
//  ignores them.
var convertToText = function(obj) {
    //create an array that will later be joined into a string.
    var string = [];

    //is object
    //    Both arrays and objects seem to return "object"
    //    when typeof(obj) is applied to them. So instead
    //    I am checking to see if they have the property
    //    join, which normal objects don't have but
    //    arrays do.
    if (typeof(obj) == "object" && (obj.join === undefined)) {
        string.push("{");
        for (var p1 in obj) {
            string.push(p1, ": ", convertToText(obj[p1]), ",");
        }
        string.push("}");

    //is array
    } else if (typeof(obj) == "object" && (obj.join !== undefined)) {
        string.push("[");
        for(var p2 in obj) {
            string.push(convertToText(obj[p2]), ",");
        }
        string.push("]");

    //is function
    } else if (typeof(obj) == "function") {
        string.push(obj.toString());

    //all other values can be done with JSON.stringify
    } else {
        string.push(JSON.stringify(obj));
    }

    return string.join("");
}


// -- Request Promise -- //
var request = function(url) {
  
	return new Promise(function(resolve, reject) {

		var r = new XMLHttpRequest();

    if (url && url.endsWith(".json")) {
      r.responseType = "json";
    }

		r.open('GET', url, true);

    r.onload = function() {

      if (r.readyState == 4 && r.status == 200) {

				resolve(r.response);
				
			} else {

				reject(Error(r.statusText));

			}

    };

    r.onerror = function() {
			
			if (r.statusText) {
				reject(Error(r.statusText));
			} else {
				reject(Error("Network Error"));
			}

    };

		r.send();
		
  });

}
// -- Request Promise -- //


// -- Tabletop Promise -- //
var tabletops = function(key) {
  
	return new Promise(function(resolve, reject) {

    Tabletop.init({
      key: key,
      callback: function(data, tabletop) {
        if (data) {
				  resolve(data);
          // resolve(data, tabletop);
			  } else {
				  reject(Error());
			  }
      },
      simpleSheet: true
    });
		
  });

}
// -- Tabletop Promise -- //


// -- Network Interfaces Promise -- //
var netInterfaces = function() {
  
	return new Promise(function(resolve, reject) {

    chrome.system.network.getNetworkInterfaces(function(interfaces) {
      if (interfaces) {
        resolve(interfaces);
      } else {
        reject(Error());
      }
    })
		
  });

}
// -- Network Interfaces Promise -- //