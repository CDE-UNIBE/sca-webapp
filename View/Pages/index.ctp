<?php
echo $this->Html->meta("viewport", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no");
echo $this->Html->script("leaflet-0.6.4/leaflet.js", array('inline' => false));
echo $this->Html->css("leaflet-0.6.4/leaflet.css", array('inline' => false));
echo $this->Html->css("index.css", array('inline' => false));

if (isset($mlat) && isset($mlon)) {
    $script = "var mlat = $mlat, mlon = $mlon;";
    echo $this->Html->scriptBlock($script, array('inline' => false));
}
if (isset($lat) && isset($lon) && isset($zoom)) {
    $script = "var lat = $lat, lon = $lon, zoom = $zoom;";
    echo $this->Html->scriptBlock($script, array('inline' => false));
}
?>

<div class="row">
    <div class="col-md-10 col-md-offset-1">
        <div id="map" style="height: 400px; margin-bottom: 20px; margin-top: 20px;">

        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-10 col-md-offset-1">
        <form class="form-inline" role="form" style="margin-bottom: 20px;">
            <div class="form-group">
                <label class="sr-only" for="longitude-input">Longitude</label>
                <input type="number" class="form-control" id="longitude-input" placeholder="Longitude">
            </div>
            <div class="form-group">
                <label class="sr-only" for="latitude-input">Latitude</label>
                <input type="number" class="form-control" id="latitude-input" placeholder="Latitude">
            </div>
            <button type="button" id="location-input-button" class="btn btn-default">Set location</button>
            <!--button type="button" id="permalink-input-button" class="btn btn-default">Permanent link</button-->
        </form>
    </div>
</div>

<!--div class="row hidden hidden-at-start">
    <div class="col-md-10 col-md-offset-1">
        <div id="diagram-preview-container">
            <div id="raw-values-preview-div" class="panel panel-default">
            </div>
        </div>
    </div>
</div-->

<?php
$date = date_create();
if (Configure::read("debug") == 0) {
    echo $this->Html->script("map.js?_dc=" . date_timestamp_get($date));
} else {
    echo $this->Html->script("map-debug.js?_dc=" . date_timestamp_get($date));
}
?>
