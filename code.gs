function getPhotos() {
  var hashtag = "YOUR HASHTAG";
  
  var url = "https://www.instagram.com/explore/tags/"+hashtag+"/?__a=1";
  var dataAll = JSON.parse(UrlFetchApp.fetch(url));
  var data = dataAll.graphql.hashtag.edge_hashtag_to_media.edges;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetConfig = ss.getSheetByName("Config");
  var rangeConfig = sheetConfig.getRange(2,1);
  var lastUpdate = rangeConfig.getValue();
      
  for(var i in data) { 
    var locationId = "";
    var locationName = "";
    var locationAddress = "";
    var city_name = "";
    var is_video = "";
    var latlng = "";
    var formatted_address = "";
    
    var idPhoto = data[i].node.shortcode
    var urlPhoto = "https://www.instagram.com/p/" + idPhoto + "/?__a=1";
    
    var getDataFoto = JSON.parse(UrlFetchApp.fetch(urlPhoto));
    
    var username = getDataFoto.graphql.shortcode_media.owner.username;
    var timestamp = getDataFoto.graphql.shortcode_media.taken_at_timestamp;
    var display_url = getDataFoto.graphql.shortcode_media.display_url;
    var accessibility_caption = getDataFoto.graphql.shortcode_media.accessibility_caption;
    var text = getDataFoto.graphql.shortcode_media.edge_media_to_caption.edges[0].node.text;
    if (getDataFoto.graphql.shortcode_media.is_vieo) { 
      is_video = getDataFoto.graphql.shortcode_media.is_video; 
    }
    
    if (getDataFoto.graphql.shortcode_media.location != null) {
      console.log("location info " + "de " + urlPhoto + ": ");
      console.log(getDataFoto.graphql.shortcode_media.location);
      
      locationId = getDataFoto.graphql.shortcode_media.location.id;
      locationName = getDataFoto.graphql.shortcode_media.location.name;
      locationAddress = JSON.parse(getDataFoto.graphql.shortcode_media.location.address_json).street_address;
      city_name = JSON.parse(getDataFoto.graphql.shortcode_media.location.address_json).city_name;
      try {
        var response = Maps.newGeocoder().geocode(locationAddress + " " + city_name);
        latlng = response.results[0].geometry.location.lat + "," + response.results[0].geometry.location.lng;
        formatted_address = response.results[0].formatted_address;
      }
      catch(err) {
        console.log(err);
        saveFoto(ss,rangeConfig,username,timestamp,urlPhoto,display_url,accessibility_caption,text,locationId,locationName,locationAddress,formatted_address,latlng,city_name,is_video);
      }
    }
    
    if (timestamp > lastUpdate) {
      saveFoto(ss,rangeConfig,username,timestamp,urlPhoto,display_url,accessibility_caption,text,locationId,locationName,locationAddress,formatted_address,latlng,city_name,is_video)
    }
  }
}

function saveFoto(ss,rangeConfig,username,timestamp,urlPhoto,display_url,accessibility_caption,text,locationId,locationName,locationAddress,formatted_address,latlng,city_name,is_video) {
  var now = Date.now() / 1000;
  var sheet = ss.getSheetByName("Fotos");
  sheet.appendRow([username,timestamp,urlPhoto,display_url,accessibility_caption,text,locationId,locationName,locationAddress,formatted_address,latlng,city_name,is_video,now]);
  rangeConfig.setValue(now);
}
