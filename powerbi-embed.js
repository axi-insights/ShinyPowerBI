let loadedResolve, reportLoaded = new Promise((res, rej) => { loadedResolve = res; });
let renderedResolve, reportRendered = new Promise((res, rej) => { renderedResolve = res; });

Shiny.addCustomMessageHandler("callApi", function(parameters) {
  
  Shiny.setInputValue("logevent", "API called in Javascript", {priority: "event"});
  
  
  // Read embed application token
  let accessToken = parameters.token;

  // Read embed URL
  let embedUrl = parameters.url;
  Shiny.setInputValue("logevent", embedUrl, {priority: "event"});
  
  // Read report Id
  let embedReportId = parameters.reportID;

  // Get models. models contains enums that can be used.
  let models = window["powerbi-client"].models;
  
  // Read embed type from radio
  let tokenType = models.TokenType.Embed;
  
  // We give All permissions to demonstrate switching between View and Edit mode and saving report.
  let permissions = models.Permissions.All;
  
  // Create the embed configuration object for the report
  // For more information see https://go.microsoft.com/fwlink/?linkid=2153590
  let config = {
    type: "report",
    tokenType: tokenType == "0" ? models.TokenType.Aad : models.TokenType.Embed,
    accessToken: accessToken,
    embedUrl: embedUrl,
    id: embedReportId,
    pageView: 'fitToWidth',
    permissions: permissions,
    
    // show action bar (only available in user owns data scenario)
    embedUrl: embedUrl + "&actionBarEnabled=true",
    
    settings: {
      background: models.BackgroundType.Transparent,
      panes: {
        filters: {
          visible: false
        },
        pageNavigation: {
          visible: true
        }
      }
    }
  };
  
  // Get a reference to the embedded report HTML element
  var embedContainer = $(parameters.container)[0];
  
  // Embed the report and display it within the div container.
  var report = powerbi.embed(embedContainer, config);
  
  // Report.off removes a given event handler if it exists.
  report.off("loaded");
  
  // Report.on will add an event handler which prints to Log window.
  report.on("loaded", function () {
    Shiny.setInputValue("logevent", "Loaded", {priority: "event"});
    Shiny.setInputValue("reportRendered", parameters.report+".FALSE");
  });
  
  // Report.off removes a given event handler if it exists.
  report.off("rendered");
  
  // Report.on will add an event handler which prints to Log window.
  report.on("rendered", function () {
    Shiny.setInputValue("logevent", "Rendered", {priority: "event"});
    Shiny.setInputValue("logevent", parameters.report, {priority: "event"});
    Shiny.setInputValue("logevent", parameters.container, {priority: "event"});
    Shiny.setInputValue(parameters.report, "TRUE");
  });
  
  report.on("error", function (event) {
    Shiny.setInputValue("logevent", event.detail, {priority: "event"});
    report.off("error");
    Shiny.setInputValue(parameters.report, "FALSE");
  });
  
  report.off("saved");
  report.on("saved", function (event) {
    Shiny.setInputValue("logevent", event.detail, {priority: "event"});
    if (event.detail.saveAs) {
      Shiny.setInputValue("logevent", "In order to interact with the new report, create a new token and load the new report", {priority: "event"});
    }
  })
})
