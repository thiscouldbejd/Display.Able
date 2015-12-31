$(function() {

  $("body").empty();
  
  $("<webview />", {
    name : "contentFrame",
    id : "contentFrame",
    src : gBackgroundPage.display.URL,
    width : "100%",
    height : "100%"
  }).appendTo("body");
    
  setInterval(function() {
    document.getElementById("contentFrame").reload();
  }, gBackgroundPage.display.Refresh * 1000);
  
});