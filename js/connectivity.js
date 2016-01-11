var loaded;

$(function() {

  displayIPAddresses();

  $(document).bind("keypress", "d", function () {
		gBackgroundPage.reTry().bind(gBackgroundPage);
  });

  $(document).bind("keypress", "o", function () {
		gBackgroundPage.showOptions().bind(gBackgroundPage);
  });
  
});

function displayIPAddresses() {
  
  $("body").empty();
    
  netInterfaces().then(function(interfaces) {
    var container = $("<div />", {class : "centered"});
    $.each(interfaces, function(i, interface) {
      $("<div />", {
        class : "address"
      }).append(
        $("<h1 />")
        .append(
          $("<span />", {class : "lighter", text : interface.name + " "})
        ).append(
          $("<span />", {class : "darker", text : interface.address})
        ).append(
          $("<span />", {class : "lighter", text : "/" + interface.prefixLength})
        )).appendTo(container);
    })
    container.appendTo("body");

    if (gBackgroundPage.timeout)
      setTimeout(gBackgroundPage.reTry.bind(gBackgroundPage), gBackgroundPage.timeout * 1000);

  });
  
}