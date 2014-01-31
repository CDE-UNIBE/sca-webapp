// Enable bootstrap alerts
$(".alert").alert();

// Parse the DOM for Mustache templates
$.Mustache.addFromDom();

// Global variable for the marker
var marker;

// Global layer names, must be the same as in BufferStatistics web processing service
var landcover_layername = "Land Cover", accessibility_layername = "Accessibility", popdensity_layername = "Population Density";

/**
 * Helper method that shows an alert on top of the page
 */
function showAlert(msg){
    // Remove first exisiting alerts
    $("#alert-row").detach();
    // Set up the new alert using a template
    $($.Mustache.render('alert-template', {msg: msg})).insertAfter("#location-input-row");
}

/*
 * Populates the data returned from the Web Processing Service to the Mustache
 * templates.
 */
function populateTemplates(data){
    $.each(data['layers'], function(index, layer){
        var data = {
            layername: layer['layername']
        };

        switch (layer["layername"].toLowerCase()) {
            case popdensity_layername.toLowerCase():

                // Append the average value:
                for(var i = 0; i < layer['statistics'].length; i++){
                    if(layer['statistics'][i]['name'].toLowerCase() == "mean"){
                        data.mean = Math.round(layer['statistics'][i]['value'] * 10.) / 10.
                    }
                    if(layer['statistics'][i]['name'].toLowerCase() == "minimum"){
                        data.minimum = parseInt(layer['statistics'][i]['value']);
                    }
                    if(layer['statistics'][i]['name'].toLowerCase() == "maximum"){
                        data.maximum = parseInt(layer['statistics'][i]['value']);
                    }
                    if(layer['statistics'][i]['name'].toLowerCase() == "standard deviation"){
                        data.standarddeviation = Math.round(layer['statistics'][i].value + 100.) / 100.;
                    }
                }

                $("div.content-wrapper").append($.Mustache.render('landscan-template', data));

                break;

            case landcover_layername.toLowerCase():

                data.classes = [];

                /*
                 *  Sort the data, see also:
                 *  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
                 */
                layer['classes'].sort(function(a, b){
                    if (a.areashare > b.areashare)
                        return -1;
                    if (a.areashare < b.areashare)
                        return 1;
                    // a must be equal to b
                    return 0;
                });

                for(var i = 0; i < layer['classes'].length; i++){
                    data.classes.push({
                        areashare: Math.round(layer['classes'][i].areashare * 10.)/10.,
                        name: layer['classes'][i].name
                    });
                }

                // Append the rendered template to the content wrapper division
                $("div.content-wrapper").append($.Mustache.render("landcover-template", data));

                break;

            case accessibility_layername.toLowerCase():
                data.classes = [];

                // Sort the data
                layer['classes'].sort(function(a, b){
                    if (a.areashare > b.areashare)
                        return -1;
                    if (a.areashare < b.areashare)
                        return 1;
                    // a must be equal to b
                    return 0;
                });

                for(var i = 0; i < layer['classes'].length; i++){
                    data.classes.push({
                        areashare: Math.round(layer['classes'][i].areashare * 10.)/10.,
                        name: layer['classes'][i].name
                    });
                }

                $("div.content-wrapper").append($.Mustache.render("accessibility-template", data));

                break;

            default:
                break;
        }

        // Highlights even rows
        $(".row.stats-data-row:even > div").addClass("darker");
    });
}

/**
 * Reads the latitude and longitude input fields and request the web processing
 * service for this location.
 */
function getStatistics(){
    $("div.loading").detach();
    $("div.stats-data").detach();
    $("#alert-row").detach();

    var lon = $("#longitude-input").val();
    var lat = $("#latitude-input").val();

    if(lon == "" && lat == ""){
        showAlert("Add first a location on the map or enter geographic coordinates manually.");
        return null;
    }

    if(!map.hasLayer(marker)){
        setMarker(lon, lat);
    }

    map.panTo(L.latLng(lat, lon), {
        animate: true
    });

    var innerHtml = "<div class=\"row loading\"><div class=\"col-md-1 col-md-offset-5\"><p><i class=\"fa fa-cog fa-4x fa-spin\"></i></p></div></div>";

    $("div.content-wrapper").append(innerHtml);

    // Get the buffer size
    var buffer = $("#buffer-select > option:selected")[0].value;

    /*
     * Request the following Web Processing Service:
     * http://localhost/devel/sca-webapp/wps.json?Version=1.0.0&DataInputs=lon=35.848388671875;lat=-6.0968598188879355;epsg=4326&Service=WPS&RawDataOutput=bufferstatistics&ServiceProvider=&metapath=&Identifier=BufferStatistics2&Request=Execute
     *
     */

    $.ajax({
        url: "wps.json",
        data: {
            RawDataOutput: "bufferstatistics",
            ServiceProvider: "",
            metapath: "",
            Service: "WPS",
            Request: "Execute",
            Version: "1.0.0",
            Identifier: "BufferStatistics",
            DataInputs: "lon=" + lon + ";lat=" + lat + ";epsg=4326;buffer=" + buffer
        },
        success: function(data, textStatus, jqXHR){

            $("div.loading").detach();
            $("div.stats-data").detach();

            try {
                populateTemplates(data);
            } catch (e) {
                showAlert("Oops, could not find any data!");
            }

        }
    });

    return null;
}

function setMarker(lon, lat){
    if(map.hasLayer(marker)){
        map.removeLayer(marker);
    }
    // Update also the input fields
    $("#longitude-input").val(Math.round(lon*10000)/10000);
    $("#latitude-input").val(Math.round(lat*10000)/10000);
    marker = L.marker(L.latLng(lat, lon));
    marker.on('click', function(e){
        map.removeLayer(marker);
        $("div.loading").detach();
        $("div.stats-data").detach();
        $("#longitude-input").val("");
        $("#latitude-input").val("");
        marker = undefined;
    });
    marker.addTo(map);
}

function mapOnClick(event){
    var lat = event.latlng.lat;
    var lon = event.latlng.lng;
    setMarker(lon, lat);
}

var map = L.map('map')
if(typeof lat != 'undefined' && typeof lon != 'undefined' && typeof zoom != 'undefined'){
    map.setView([lat, lon], zoom);
}
else if(typeof mlat != 'undefined' && typeof mlon != 'undefined'){
    map.setView([mlat, mlon], 10);
} else {
    map.setView([0, 0], 2);
}

// OpenStreetMap base layer
var baselayer = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg', {
    attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">',
    maxZoom: 17,
    subdomains: [1,2,3,4]
});
baselayer.addTo(map);

var globcover_2009 = L.tileLayer('http://cdetux2.unibe.ch/geoserver/gwc/service/tms/1.0.0/lo:globcover_2009@EPSG:900913@png/{z}/{x}/{y}.png', {
    opacity: 0.6,
    tms: true,
    maxZoom: 17
});

var accessibility = L.tileLayer('http://cdetux2.unibe.ch/geoserver/gwc/service/tms/1.0.0/lo:accessability@EPSG:900913@jpeg/{z}/{x}/{y}.png', {
    opacity: 0.6,
    tms: true,
    maxZoom: 17
});

var population_density = L.tileLayer('http://cdetux2.unibe.ch/geoserver/gwc/service/tms/1.0.0/lo%3Alspop_2008@EPSG%3A900913@png/{z}/{x}/{y}.png', {
    opacity: 0.6,
    tms: true,
    maxZoom: 17
});

var GetCurrentLocationControl = L.Control.extend({
    options: {
        position: 'topright'
    },

    onAdd: function (map) {
        // create the control container with a particular class name
        var container = L.DomUtil.create('div', 'get-location-control');

        //$(".my-custom-control").html("<span>test</span>");
        var link = L.DomUtil.create("a", 'get-location', container);
        link.href = "#";

        L.DomEvent.on(container, "click", function(e){
            map.off("click", mapOnClick);
            if("geolocation" in navigator){
                navigator.geolocation.getCurrentPosition(function(p){
                    var coords = p.coords;
                    map.panTo([coords.latitude, coords.longitude]);
                    setMarker(coords.longitude, coords.latitude);
                }, function(error){
                    showAlert(error.message);
                }, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 100000
                });
            } else {
                showAlert("Geolocation is not available in your browser");
            }
            
        });

        L.DomEvent.on(container, "mouseout", function(e){
            map.on("click", mapOnClick);
        });

        return container;
    }
});

map.addControl(new GetCurrentLocationControl());

var ShareControl = L.Control.extend({
    options: {
        position: 'topright'
    },

    onAdd: function (map) {
        // create the control container with a particular class name
        var container = L.DomUtil.create('div', 'share-control');
        var link = L.DomUtil.create("a", '', container);
        link.href = "#";

        L.DomEvent.on(container, "click", function(e){
            map.off("click", mapOnClick);
            if(typeof marker != 'undefined'){
                var m = marker.getLatLng();
                var encodedCoords = Fgh.encode(m.lat, m.lng, 52);
                var url = encodedCoords;
                document.location.href = url;
            } else {
                showAlert("Add first a location! Click the map to set the location or input coordinates in the form below the map.");
            }
            
        });

        L.DomEvent.on(container, "mouseout", function(e){
            map.on("click", mapOnClick);
        });

        return container;
    }
});

map.addControl(new ShareControl());

var layers_control = L.control.layers();
layers_control.addOverlay(globcover_2009,
    landcover_layername + "&nbsp;<a href=\"#\"><i class=\"fa fa-info-circle fa-lg\" data-layer=\"lo:globcover_2009\" data-title=\"" + landcover_layername + "\"></i></a>");
layers_control.addOverlay(population_density,
    popdensity_layername + "&nbsp;<a href=\"#\"><i class=\"fa fa-info-circle fa-lg\" data-layer=\"lo:lspop_2008\" data-title=\"" + popdensity_layername + "\"></i></a>");
layers_control.addOverlay(accessibility,
    accessibility_layername + "&nbsp;<a href=\"#\"><i class=\"fa fa-info-circle fa-lg\" data-layer=\"lo:accessability\" data-title=\"" + accessibility_layername + "\"></i></a>");
layers_control.addTo(map);

// Check if an inital marker is set. If yes, set the marker and fill in the
// coordinates input fields
if(typeof mlat != 'undefined' && typeof mlon != 'undefined'){
    setMarker(mlon, mlat);
    getStatistics();
}

// Append events to map and "Get Areal Statistics" button
map.on('click', mapOnClick);
$("#location-input-button").click(getStatistics);

$(".fa-info-circle").click(function(e){
    $("#legend-modal-content").children().detach();
    $("#legend-modal-content").append($.Mustache.render('legend-template', {
        layertitle: $(this).attr("data-title"),
        layername: $(this).attr("data-layer")
    }));
    $("#legend-modal").modal();
});

/* (C) 2009 Ivan Boldyrev <lispnik@gmail.com>
 *
 * Fgh is a fast GeoHash implementation in JavaScript.
 *
 * Fgh is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * Fgh is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this software; if not, see <http://www.gnu.org/licenses/>.
 */
(function () {
    var _tr = "0123456789bcdefghjkmnpqrstuvwxyz";
    /* This is a table of i => "even bits of i combined".  For example:
     * #b10101 => #b111
     * #b01111 => #b011
     * #bABCDE => #bACE
     */
    var _dm = [0, 1, 0, 1, 2, 3, 2, 3, 0, 1, 0, 1, 2, 3, 2, 3,
    4, 5, 4, 5, 6, 7, 6, 7, 4, 5, 4, 5, 6, 7, 6, 7];

    /* This is an opposit of _tr table: it maps #bABCDE to
     * #bA0B0C0D0E.
     */
    var _dr = [0, 1, 4, 5, 16, 17, 20, 21, 64, 65, 68, 69, 80,
    81, 84, 85, 256, 257, 260, 261, 272, 273, 276, 277,
    320, 321, 324, 325, 336, 337, 340, 341];

    function _cmb (str, pos) {
        return (_tr.indexOf(str.charAt(pos)) << 5) | (_tr.indexOf(str.charAt(pos+1)));
    }

    function _unp(v) {
        return _dm[v & 0x1F] | (_dm[(v >> 6) & 0xF] << 3);
    }

    function _sparse (val) {
        var acc = 0, off = 0;

        while (val > 0) {
            low = val & 0xFF;
            acc |= _dr[low] << off;
            val >>= 8;
            off += 16;
        }
        return acc;
    }

    window['Fgh'] = {
        decode: function (str) {
            var L = str.length, i, w, ln = 0.0, lt = 0.0;

            // Get word; handle odd size of string.
            if (L & 1) {
                w = (_tr.indexOf(str.charAt(L-1)) << 5);
            } else {
                w = _cmb(str, L-2);
            }
            lt = (_unp(w)) / 32.0;
            ln = (_unp(w >> 1)) / 32.0;
            
            for (i=(L-2) & ~0x1; i>=0; i-=2) {
                w = _cmb(str, i);
                lt = (_unp(w) + lt) / 32.0;
                ln = (_unp(w>>1) + ln) / 32.0;
            }
            return {
                lat:  180.0*(lt-0.5),
                lon: 360.0*(ln-0.5)
            };
        },
        
        encode: function (lat, lon, bits) {
            lat = lat/180.0+0.5;
            lon = lon/360.0+0.5;
            
            /* We generate two symbols per iteration; each symbol is 5
             * bits; so we divide by 2*5 == 10.
             */
            var r = '', l = Math.ceil(bits/10), hlt, hln, b2, hi, lo, i;

            for (i = 0; i < l; ++i) {
                lat *= 0x20;
                lon *= 0x20;

                hlt = Math.min(0x1F, Math.floor(lat));
                hln = Math.min(0x1F, Math.floor(lon));
                
                lat -= hlt;
                lon -= hln;
                
                b2 = _sparse(hlt) | (_sparse(hln) << 1);
                
                hi = b2 >> 5;
                lo = b2 & 0x1F;

                r += _tr.charAt(hi) + _tr.charAt(lo);
            }
            
            r = r.substr(0, Math.ceil(bits/5));
            return r;
        },
    
        checkValid: function(str) {
            return !!str.match(/^[0-9b-hjkmnp-z]+$/);
        }
    }
})();
