// Enable bootstrap alerts
$(".alert").alert();

// Parse the DOM for Mustache templates
$.Mustache.addFromDom();

// Global variable for the marker
var marker;

/**
 * Helper method that shows an alert above the map
 */
function showAlert(msg){
    var html = "<div id=\"alert-div\" class=\"alert alert-warning alert-dismissable\">";
    html += "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-hidden=\"true\">&times;</button>";
    html += msg;
    html += "</div>";
    $(html).insertBefore("#map");
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
            case "landscan population density 2011":

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

            case "global land cover map 2009":

                data.classes = [];

                for(var i = 0; i < layer['classes'].length; i++){
                    data.classes.push({
                        areashare: Math.round(layer['classes'][i].areashare * 10.)/10.,
                        name: layer['classes'][i].name
                    });
                }

                $("div.content-wrapper").append($.Mustache.render("landcover-template", data));

                break;

            case "accessibility: travel time to major cities":
                data.classes = [];

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

function setLocation(lon, lat){
    $("div.loading").detach();
    $("div.stats-data").detach();
    if(map.hasLayer(marker)){
        map.removeLayer(marker);
    }
    
    var innerHtml = "<div class=\"row loading\"><div class=\"col-md-1 col-md-offset-5\"><img width=\"36\" height=\"39\" src=\"img/spinner.gif\" alt=\"Loading ...\"></img></div></div>";

    $("div.content-wrapper").append(innerHtml);

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

            //console.log(data);

            $("div.loading").detach();
            $("div.stats-data").detach();

            try {
                populateTemplates(data);

            } catch (e) {
                showAlert("Oops, could not find any data!");
            }
           
        }
    });
}

function mapOnClick(event){
    var lat = event.latlng.lat;
    var lon = event.latlng.lng;
    setLocation(lon, lat);
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
                    setLocation(coords.longitude, coords.latitude);
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

L.control.layers({},{
    "Global landcover": globcover_2009,
    "Population density": population_density,
    "Accessibility": accessibility
}).addTo(map);

// Check if an inital marker is set. If yes, set the marker and fill in the
// coordinates input fields
if(typeof mlat != 'undefined' && typeof mlon != 'undefined'){
    setLocation(mlon, mlat);
}

map.on('click', mapOnClick);

$("#location-input-button").click(function(e){
    var lon = $("#longitude-input").val();
    var lat = $("#latitude-input").val();
    setLocation(lon, lat);
    map.panTo(L.latLng(lat, lon), {
        animate: true
    });
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
