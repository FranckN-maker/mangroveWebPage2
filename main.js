import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/Tile.js';
import TileWMS from 'ol/source/TileWMS.js';
import View from 'ol/View.js';
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM.js';
import './style.css';
import "ol/ol.css";
import "ol-ext/dist/ol-ext.css";
import LayerSwitcher from 'ol-layerswitcher'
import GroupLayer from 'ol/layer/Group.js'
import CtrlMousPos from 'ol/control/MousePosition.js'
import ScaleLin from 'ol/control/ScaleLine.js'
import { format } from 'ol/coordinate.js'
import Overlay from 'ol/Overlay.js';
import { toStringHDMS } from 'ol/coordinate.js';
import { toLonLat } from 'ol/proj.js';
import 'ol/proj.js'
import 'ol/dist/ol.js'
import XYZ from 'ol/source/XYZ.js';
import Draw from 'ol/interaction/Draw.js';



var container = document.getElementById('popup');

var content = document.getElementById('popup-content');

var closer = document.getElementById('popup-closer');

// var panel = new OpenLayers.Control.Panel({ defaultControl: btnHiLite });

// panel.addControls([btnHiLite]);

//  * Create an overlay to anchor the popup to the map.
//  */

var popup = new Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
      duration: 250,
    },
});

// /**
//  * Add a click handler to hide the popup.
//  * @return {boolean} Don't follow the href.
//  */
closer.onclick = function () {
  popup.setPosition(undefined);
  closer.blur();
  return false;
};

export var mapView = new View({
  center: fromLonLat([165.76, -21.53]),
  zoom: 9
});

var map = new Map({
  target: 'map',
  view: mapView
});

var noneTile = new TileLayer({
    title : 'None',
    type : 'base',
    visible: false
})


var osmTile = new TileLayer({
    title: 'Open Street Map',
    visible: true,
    type : 'base',
    source: new OSM()
});

var satTile = new TileLayer({
  title: 'ESRI Map Arcgis',
  type: 'base',
    source: new XYZ({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    })
});


// map.addLayer(osmTile);

var baseGroup = new GroupLayer({
    title: 'Base Maps',
    fold : true,
    layers: [osmTile, satTile, noneTile]
});

map.addLayer(baseGroup);

var wmsSourceFVC = new TileLayer({
    title: "Fractionnal Vegetation Index",
    source: new TileWMS({  
    url: 'http://localhost:8080/geoserver/wms',
    // url: 'http://mangrove-dev.ird.nc/geoserver/wms',
    // params: { 'LAYERS': 'MangroveFirstIrdNc:FVCGeoserv', 'TILED': true },
    params: { 'LAYERS': 'MangroveFirst:FVCGeoserv', 'TILED': true },
    serverType: 'geoserver',
    ratio: 1,
  })
});

var wmsSourceLAI = new TileLayer({
    title: "Leaf Area Index ",
    source: new TileWMS({ 
    url: 'http://localhost:8080/geoserver/wms',
    // url: 'http://mangrove-dev.ird.nc/geoserver/wms',
      params: { 'LAYERS': 'MangroveFirstIrdNc:LAIGeoserv', 'TILED': true },
    params: { 'LAYERS': 'MangroveFirst:LAIGeoserv', 'TILED': true},
    serverType: 'geoserver',
    ratio: 1
  })
});

var wmsSourceAGB = new TileLayer({
    title: "Above Ground Biomass",
    source: new TileWMS({ 
    url: 'http://localhost:8080/geoserver/wms',
    // url: 'http://mangrove-dev.ird.nc/geoserver/wms',
      // params: { 'LAYERS': 'MangroveFirstIrdNc:AGBGeoserv', 'TILED': true },
    params: { 'LAYERS': 'MangroveFirst:AGBGeoserv', 'TILED': true},
    serverType: 'geoserver',
    ratio: 1
  })
});

var wmsSourceCarbone = new TileLayer({
    title: "Carbone",
    source: new TileWMS({  
    url: 'http://localhost:8080/geoserver/wms',
    // url: 'http://mangrove-dev.ird.nc/geoserver/wms',
    // params: { 'LAYERS': 'MangroveFirstIrdNc:CarboneGeoserv', 'TILED': true },
    params: { 'LAYERS': 'MangroveFirst:CarboneGeoserv', 'TILED': true },
    serverType: 'geoserver',
    ratio: 1
  })
});


var wmsSourceMAP = new TileLayer({
    title: "Carte Mangrove",
    source : new TileWMS({  
    url: 'http://localhost:8080/geoserver/wms',
    // url: 'http://mangrove-dev.ird.nc/geoserver/wms',
    params: { 'LAYERS': 'MangroveFirst:MangroveKMEANS_2', 'TILED': true},
    serverType: 'geoserver',
    ratio: 1
  })
});


var overlayGroup = new GroupLayer({
  title: 'Overlays',
  fold : true,
  layers: [wmsSourceMAP, wmsSourceFVC, wmsSourceLAI, wmsSourceAGB, wmsSourceCarbone]

})


map.addLayer(overlayGroup);
map.addOverlay(popup);


var layerSwitcher = new LayerSwitcher({
    activationMode : 'click',
    startActive : false,
    groupSelectStyle: 'children'
});

map.addControl(layerSwitcher)

layerSwitcher.showPanel();

var mousePosition = new CtrlMousPos({
    className: 'mousePosition',
    projection: 'EPSG:4326',
    coordinateFormat: function(coordinate){return format(coordinate, '{y}, {x}', 6);}
});

map.addControl(mousePosition);

var scaleControl = new ScaleLin({
  bar: true,
  text: true

});
map.addControl(scaleControl);

map.on('pointermove', function (evt) {
  if (evt.dragging) {
    return;
  }
  const data = wmsSourceFVC.getData(evt.pixel);
  const hit = data && data[3] > 0; // transparent pixels have zero for data[3]
  map.getTargetElement().style.cursor = hit ? 'pointer' : '';
});





map.on('singleclick', function (evt) {
  document.getElementById('info').innerHTML = '';
  document.getElementById('ToDisplayFVC').innerHTML = '';
  document.getElementById('ToDisplayAGB').innerHTML = '';
  document.getElementById('ToDisplayLAI').innerHTML = '';
  document.getElementById('ToDisplayCAR').innerHTML = '';
  const viewResolution = /** @type {number} */ (mapView.getResolution());
  const viewProjection = /** @type {number} */ (mapView.getProjection());
  const urlFVC = wmsSourceFVC.getSource().getFeatureInfoUrl(
    evt.coordinate,
    viewResolution,
    viewProjection,
    // {'INFO_FORMAT': 'application/json'},
    {
      'INFO_FORMAT': 'application/json',
      // 'QUERY_LAYERS': 'MangroveFirst:FVCGeoserv',
      // 'LAYERS': 'MangroveFirst:FVCGeoserv'
    },
  );
  const urlLAI = wmsSourceLAI.getSource().getFeatureInfoUrl(
    evt.coordinate,
    viewResolution,
    viewProjection,
    // {'INFO_FORMAT': 'application/json'},
    {
      'INFO_FORMAT': 'application/json',
      // 'QUERY_LAYERS': 'MangroveFirst:FVCGeoserv',
      // 'LAYERS': 'MangroveFirst:FVCGeoserv'
    },
  );
  const urlAGB = wmsSourceAGB.getSource().getFeatureInfoUrl(
    evt.coordinate,
    viewResolution,
    viewProjection,
    // {'INFO_FORMAT': 'application/json'},
    {
      'INFO_FORMAT': 'application/json',
      // 'QUERY_LAYERS': 'MangroveFirst:FVCGeoserv',
      // 'LAYERS': 'MangroveFirst:FVCGeoserv'
    },
  );
  const urlCAR = wmsSourceCarbone.getSource().getFeatureInfoUrl(
    evt.coordinate,
    viewResolution,
    viewProjection,
    // {'INFO_FORMAT': 'application/json'},
    {
      'INFO_FORMAT': 'application/json',
      // 'QUERY_LAYERS': 'MangroveFirst:FVCGeoserv',
      // 'LAYERS': 'MangroveFirst:FVCGeoserv'
    },
  );
 
  // console.log(urlFVC);
  // console.log(viewResolution);
  // console.log(evt.coordinate);
  
  
  if (urlFVC) {

  
    fetch(urlFVC, {
      method: "GET",
      // credentials: "same-origin",
      headers: {"content-Type": "application/json",
      },
    })
      // .then((response) => console.log(response))
      .then(response => {
        // console.log(response)
        return response.json();
           })
      .then(json => {
            // console.log(json.features[0].properties.GRAY_INDEX)
            document.getElementById('ToDisplayFVC').innerHTML = "<h1>FVC Value is : \"" + parseFloat(json.features[0].properties.GRAY_INDEX.toFixed(4).replace(",",".")) + "\"&nbsp&nbsp SU<h1>";
          // value.push(jsonObject.features[0].properties.GRAY_INDEX);
          });
          

  }

  if (urlLAI) {

  
    fetch(urlLAI, {
      method: "GET",
      // credentials: "same-origin",
      headers: {"content-Type": "application/json",
      },
    })
      // .then((response) => console.log(response))
      .then(response => {
        // console.log(response)
        return response.json();
           })
      .then(json => {
        // console.log(json.features[0].properties.GRAY_INDEX)
        document.getElementById('ToDisplayLAI').innerHTML = "<h1>LAI Value is : \"" + parseFloat(json.features[0].properties.GRAY_INDEX.toFixed(4).replace(",", ".")) + "\"&nbsp&nbsp SU<h1>";
          // value.push(jsonObject.features[0].properties.GRAY_INDEX);
          });
          

  }

   if (urlAGB) {

  
    fetch(urlAGB,{
      method: "GET",
      // credentials: "same-origin",
      headers: {"content-Type": "application/json",
      },
    })
      // .then((response) => console.log(response))
      .then(response => {
        // console.log(response)
        return response.json();
           })
      .then(json => {
            // console.log(json.features[0].properties.GRAY_INDEX)
            document.getElementById('ToDisplayAGB').innerHTML = "<h1>AGB Value is : \"" + parseFloat(json.features[0].properties.GRAY_INDEX.toFixed(4).replace(",",".")) + "\"&nbsp&nbsp T/ha<h1>";
          // value.push(jsonObject.features[0].properties.GRAY_INDEX);
          });
          

   }
  
   if (urlCAR) {

  
    fetch(urlCAR, {
      method: "GET",
      credentials: "same-origin",
      headers: {"content-Type": "application/json",
      },
    })
      // .then((response) => console.log(response))
      .then(response => {
        // console.log(response)
        return response.json();
           })
      .then(json => {
            console.log(viewResolution)
            // console.log(json.features[0].properties.GRAY_INDEX)
            document.getElementById('ToDisplayCAR').innerHTML = "<h1>CAR Value is : \"" + parseFloat(json.features[0].properties.GRAY_INDEX.toFixed(4).replace(",",".")) + "\"&nbsp&nbsp T/ha<h1>";
          // value.push(jsonObject.features[0].properties.GRAY_INDEX);
          });
          

  }
  
  
});











