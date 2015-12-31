$(function() {
	
  // Set the default storage area to managed (for policy configuration)
  chromeStorage.defaultArea = "local";
  
	request("provider_creds.json").then(function(value) {
		
		$.each(value, function(key, value) {
			
			var storageKey = key + "_Source";
			
			var id_Box = $("<input />", {id : key + "_Input", type : "text"});
			
      chromeStorage.get(storageKey)
        .then(items => {
        if (items[storageKey]) {
          id_Box.val(items[storageKey]);
        }
      });
      
			$("<div />", {id : key + "_Provider", class : "provider"})
					.append($("<img />", {src : value.LOGO, class : "logo"}))
					.append($("<h3 />", {text : "Data Source"}).append($("<a />", {for : key, text : "?", title : "Show More Details ...", href : "#", class : "trigger-help"})
						.click(function() {$("#" + $(this).attr("for") + "-help").toggle();})))
					.append($("<div />", {id : key + "-help", text : "Further INFO will go here", class : "gray help"}))
					.append(id_Box)
					.append($("<button />", {id : key + "_Set", text : "Set"}).click(function() {
						var set_Box = $("#" + key + "_Input");
						if (set_Box) {
							var input_Val = set_Box.val();
							if (input_Val) {
								chromeStorage.set(storageKey, getIdFromUrl(input_Val))
									.then( () => console.log(chromeStorage.get(storageKey)))
							}
						}
					}))
					.append($("<button />", {id : key + "_Clear", text : "Clear"}).click(function() {
						var set_Box = $("#" + key + "_Input");
						if (set_Box) {
							var input_Val = set_Box.val();
							if (input_Val) {
								console.log(getIdFromUrl(input_Val));
								chrome.storage.sync.set({storageKey : getIdFromUrl(input_Val)}, function() {
									if (!chrome.runtime.lastError) {
										console.log("SUCCEEDED");
									} else {
										console.log("ERRORED");
										console.log(chrome.runtime.lastError);
									}
								});
							}
						}
					}))
					.appendTo($("body"));
		})

	});

});