// Detecting Building Damages over time.

var geometry2 = {
    "geodesic": false,
    "type": "Polygon",
    "coordinates": [
      [
        [
          23.32989305133208,
          46.18192421358463
        ],
        [
          38.66680711383208,
          46.18192421358463
        ],
        [
          38.66680711383208,
          52.081364449517274
        ],
        [
          23.32989305133208,
          52.081364449517274
        ],
        [
          23.32989305133208,
          46.18192421358463
        ]
      ]
    ]
  };
  
  
  
var IncomingGeometry = geometry2;
  
  
  var Today = new Date();
  var Past = new Date(Today);
  var Past1 = new Date(Today);
  var Past2 = new Date(Today);
  
  print(Today)
  print(Past)
  Past.setDate(Past.getDate() - 14); // Sets to 7 days in the past
  Past1.setDate(Past1.getDate() - 90); // Sets to 7 days in the past
  Past2.setDate(Past2.getDate() - 150); // Sets to 7 days in the past
  Past = Past.getFullYear() + "-" +  (Past.getMonth()+1) + "-" + Past.getDate();
  Today = Today.getFullYear() + "-" +  (Today.getMonth()+1) + "-" + Today.getDate();
  Past1 = Past1.getFullYear() + "-" +  (Past1.getMonth()+1) + "-" + Past1.getDate();
  Past2 = Past2.getFullYear() + "-" +  (Past2.getMonth()+1) + "-" + Past2.getDate();
  print(Past1)
  
  //var GenericFilter = ee.Filter.ls("CLOUDY_SHADOW_PERCENTAGE", 5) // Start and End date in the past scan
  
  
  var Sen2 = ee.ImageCollection("GOOGLE/DYNAMICWORLD/V1")
        .select("built", "water")
        .filterBounds(geometry2);
  
  var Sen2Filters = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .select("B2", "B3","B4", "B8", "B11", "B12", "TCI_G")
        .filterDate(Past,Today)
        .filterBounds(geometry2)
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 5))
        
        
        // .map(function(i){
        //   var output = i.unitScale(1500 , 2700)
        //   return output
        // })

  var Sen1Radar = ee.ImageCollection("COPERNICUS/S1_GRD")
  .select("VH" , "VV")
        .filterDate(Past,Today)
        .filterBounds(geometry2)
   
  
  var visuals = {min: 0 , max: 1};
  
  
  
// Sentinal-1 Light Only Filtering (Buildings based on light refelction)

var B2 = Sen2Filters.select("B2").mosaic().unitScale(4500,5500).clamp(0,1).ceil()// Buildings + green pickup
var B12 = Sen2Filters.select("B12").mosaic().unitScale(1000,1300).clamp(0,1).floor().not() // Black buildings only + some hash ground textures, good map to mask only buildings
Map.addLayer(B2, {min: 0, max:1}, "B2");
Map.addLayer(B12, {min: -0, max: 1}, "B12");
  






var NDBI2 = (B12.subtract(B2)).subtract((Sen2.filterDate(Past,Today).select("built").mosaic().clamp(0,1).round()).not());

  
var VV_Buildings = Sen1Radar.select("VV").mosaic().unitScale(-5, 19).clamp(0,1).ceil();
var VH_Buildings = Sen1Radar.select("VH").mosaic().unitScale(-15, -10).clamp(0,1);
  
  
  

  
var CombinedRadar = VH_Buildings.add(VV_Buildings)
var Highgreen = Sen2Filters.select("TCI_G").mosaic().unitScale(0,45).unitScale(0.377,2).round().clamp(0,1).floor()
//Map.addLayer(Highgreen, {min: 0, max: 1}, "Highgreen");
var Combined = CombinedRadar.add(NDBI2).subtract(Highgreen.not())

var NDBIRadarDiff = Combined.subtract(NDBI2.not())
Map.addLayer(NDBIRadarDiff, {min: 0, max:1}, "NDBIRadarDiff");
var Buildings = NDBI2.add((NDBI2.add(Combined.not())))

Map.addLayer(CombinedRadar, {min: 0, max:1}, "CombinedRadar");
Map.addLayer(Combined, {min: 0, max:1}, "Combined");
// Map.addLayer(Sen1Radar, {min: 0, max:1}, "Radar");
// Map.addLayer(VV_Buildings, {min: -0, max: 1}, "VV_Buildings");
// Map.addLayer(VH_Buildings, {min: -0, max: 1}, "VH_Buildings");
// Map.addLayer(Sen2Filters, {min: 287.8, max: 3352.16/*, Bands: ["B4", "B3", "B2"]*/}, "All Sentinal 2 Bands");
// Map.addLayer(Sen2Filters, {min: 287.8, max: 3352.16, Bands: ["B4", "B3", "B2"]}, "RGB");
// Map.addLayer(Sen2.filterDate(Past2, Past1), {min: 0, max: 1}, "Sentinal-2 Dynamic Past");
// Map.addLayer(Sen2.filterDate(Past, Today), {min: 0, max: 1}, "Sentinal-2 Dynamic Present");
Map.addLayer(NDBI2, {min: 0, max: 1}, "NDBI2");


Map.addLayer(Buildings, {min: 0, max: 1}, "Buildings");