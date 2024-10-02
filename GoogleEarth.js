// Detecting Building Damages over time.

var Ukraine = {
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

var Gaza = {
  "geodesic": false,
  "type": "Polygon",
  "coordinates": [
    [
      [34.281418764703915,31.161562347574517],
      [34.58766266118829,31.541541281809828],
      [34.49153229009454,31.608230377233596],
      [34.20863434087579,31.327112208340928],
      [34.281418764703915,31.161562347574517]
    ]
  ]
}; 

var IncomingGeometry = Ukraine;


var Today = new Date();
var Past = new Date(Today);
var Past1 = new Date(Today);
var Past2 = new Date(Today);

Past.setDate(Past.getDate() - 14); // Sets to 7 days in the past
Past1.setDate(Past1.getDate() - 90); // Sets to 7 days in the past
Past2.setDate(Past2.getDate() - 150); // Sets to 7 days in the past
Past = Past.getFullYear() + "-" +  (Past.getMonth()+1) + "-" + Past.getDate();
Today = Today.getFullYear() + "-" +  (Today.getMonth()+1) + "-" + Today.getDate();
Past1 = Past1.getFullYear() + "-" +  (Past1.getMonth()+1) + "-" + Past1.getDate();
Past2 = Past2.getFullYear() + "-" +  (Past2.getMonth()+1) + "-" + Past2.getDate();

Past = Past2
Today = Past1
//var GenericFilter = ee.Filter.ls("CLOUDY_SHADOW_PERCENTAGE", 5) // Start and End date in the past scan


var Sen2 = ee.ImageCollection("GOOGLE/DYNAMICWORLD/V1")
      .select("built", "water")
      .filterDate(Past,Today)
      .filterBounds(IncomingGeometry);

var Sen2Filters = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
.select("B2", "B3","B4", "B8", "B11", "B12", "TCI_G", "TCI_R")
      .filterDate(Past,Today)
      .filterBounds(IncomingGeometry)
      .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 1))
      
      
      // .map(function(i){
      //   var output = i.unitScale(1500 , 2700)
      //   return output
      // })

var Sen1Radar = ee.ImageCollection("COPERNICUS/S1_GRD")
.select("VH" , "VV")
      .filterDate(Past,Today)
      .filterBounds(IncomingGeometry)
 

var visuals = {min: 0 , max: 1};



// Sentinal-1 Light Only Filtering (Buildings based on light refelction)



var B2 = Sen2Filters.select("B2").mosaic().unitScale(500,1000).clamp(0,1)// Black Trees, White buildings + green pickup                     Rounding() removed to provide better clarity
var B12 = Sen2Filters.select("B12").mosaic().unitScale(1,1300).clamp(0,1).not() // Black Trees / plant areas .not() to add to B2 in NDBI    Floor() removed to provide better clarity
Map.addLayer(B12, {min: -0, max: 1}, "B12");
Map.addLayer(B2, {min: -0, max: 1}, "B2");


var NDBI = (B2.subtract(B12)).clamp(0,1).round().not();
Map.addLayer(NDBI, {min: -0, max: 1}, "NDBI");

var VV_Buildings = Sen1Radar.select("VV").mosaic().unitScale(-5, 19).clamp(0,1).ceil();
var VH_Buildings = Sen1Radar.select("VH").mosaic().unitScale(-15, -10).clamp(0,1);





var CombinedRadar = (VH_Buildings.add(VV_Buildings)).unitScale(1,2).clamp(0,1).ceil()
var Highgreen = Sen2Filters.select("TCI_G").mosaic().unitScale(0, 100).clamp(0,1).floor()
Map.addLayer(Highgreen, {min: 0, max: 1}, "Highgreen");

var HighRed = Sen2Filters.select("TCI_R")//.mosaic().unitScale(0, 100).clamp(0,1).floor()
Map.addLayer(HighRed, {min: 0, max: 1}, "HighRed");

var Combined = (CombinedRadar.add((NDBI2.add(Highgreen.not())).not())).clamp(0,1)

var ColourDiff = NDBI2.add(Highgreen.not()).clamp(0,1)
var Buildings = NDBI2.add((NDBI2.add(Combined.not())))

Map.addLayer(CombinedRadar, {min: 0, max:1}, "CombinedRadar");
Map.addLayer(Combined, {min: 0, max:1}, "Combined");
// Map.addLayer(Sen1Radar, {min: 0, max:1}, "Radar");
Map.addLayer(VV_Buildings, {min: -0, max: 1}, "VV_Buildings");
Map.addLayer(VH_Buildings, {min: -0, max: 1}, "VH_Buildings");
// Map.addLayer(Sen2Filters, {min: 287.8, max: 3352.16/*, Bands: ["B4", "B3", "B2"]*/}, "All Sentinal 2 Bands");
// Map.addLayer(Sen2Filters, {min: 287.8, max: 3352.16, Bands: ["B4", "B3", "B2"]}, "RGB");
// Map.addLayer(Sen2.filterDate(Past2, Past1), {min: 0, max: 1}, "Sentinal-2 Dynamic Past");
// Map.addLayer(Sen2.filterDate(Past, Today), {min: 0, max: 1}, "Sentinal-2 Dynamic Present");
Map.addLayer(NDBI2, {min: 0, max: 1}, "NDBI2");


Map.addLayer(Buildings, {min: 0, max: 1}, "Buildings");

