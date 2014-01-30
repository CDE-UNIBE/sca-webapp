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
    <div class="col-md-10 col-md-offset-1 form-group">
        <form class="form-inline" role="form">
            <div class="form-group">
                <label class="sr-only" for="longitude-input">Longitude</label>
                <input type="number" class="form-control" id="longitude-input" placeholder="Longitude">
            </div>
            <div class="form-group">
                <label class="sr-only" for="latitude-input">Latitude</label>
                <input type="number" class="form-control" id="latitude-input" placeholder="Latitude">
            </div>
            <button type="button" id="location-input-button" class="btn btn-default">Set location</button>
        </form>
    </div>
</div>

<div class="row">
    <div class="col-md-2 col-md-offset-1">
        Sample radius:
    </div>
    <div class="col-md-2">
        <form class="form-inline" role="form" id="buffer-size-form" style="margin-bottom: 20px;">
            <select class="form-control" id="buffer-select">
                <option value="100">100 meters</option>
                <option value="500">500 meters</option>
                <option value="5000">5 km</option>
                <option value="50000">50 km</option>
                <option value="500000">500 km</option>
            </select>
        </form>
    </div>
</div>

<div class="content-wrapper">

</div>

<!-- placeholder row -->
<div class="row" style="height: 50px;">
    <div class="col-md-12">
        &nbsp;
    </div>
</div>

<!-- Landscan population density template -->
<script type="text/html" id="landscan-template">
    <div class="row stats-data">
        <div class="col-md-10 col-md-offset-1">
            <h2>{{layername}}</h2>
        </div>
    </div>
    <div class="row stats-data description">
        <div class="col-md-10 col-md-offset-1">
            Landscan population density layer 2011 from the <a class="external" href="http://web.ornl.gov/sci/landscan/">Oak Ridge National Laboratory</a>.
        </div>
    </div>
    <div class="row stats-data stats-data-row">
        <div class="col-md-5 col-md-offset-1">
            Average population density
        </div>
        <div class="col-md-5">
            {{mean}} pers / km<sup>2</sup>
        </div>
    </div>
    <div class="row stats-data stats-data-row">
        <div class="col-md-5 col-md-offset-1">
            Minimum
        </div>
        <div class="col-md-5">{{minimum}} pers / km<sup>2</sup></div>
    </div>
    <div class="row stats-data stats-data-row">
        <div class="col-md-5 col-md-offset-1">
            Maximum
        </div>
        <div class="col-md-5">{{maximum}} pers / km<sup>2</sup></div>
    </div>
    <div class="row stats-data stats-data-row">
        <div class="col-md-5 col-md-offset-1">
            Standard deviation
        </div>
        <div class="col-md-5">{{standarddeviation}} pers / km<sup>2</sup></div>
    </div>
</script>

<!-- Landcover template -->
<script type="text/html" id="landcover-template">
    <div class="row stats-data">
        <div class="col-md-10 col-md-offset-1">
            <h2>{{layername}}</h2>
        </div>
    </div>
    <div class="row stats-data description">
        <div class="col-md-10 col-md-offset-1">
            <a class="external" href="http://due.esrin.esa.int/globcover/">Global Land Cover Map 2009</a> from the European Space Agency.
        </div>
    </div>
    {{#classes}}
    <div class="row stats-data stats-data-row">
        <div class="col-md-3 col-md-offset-1">{{areashare}}% area share:</div>
        <div class="col-md-7">{{name}}</div>
    </div>
    {{/classes}}
</script>

<!-- Accessibility template -->
<script type="text/html" id="accessibility-template">
    <div class="row stats-data">
        <div class="col-md-10 col-md-offset-1"><h2>{{layername}}</h2></div>
    </div>
    <div class="row stats-data description">
        <div class="col-md-10 col-md-offset-1">
            Travel time to major cities: A global map of Accessibility from the <a class="external" href="http://bioval.jrc.ec.europa.eu/products/gam/index.htm">Joint Reserch Centre of the European Commission</a>.
        </div>
    </div>
    {{#classes}}
    <div class="row stats-data stats-data-row">
        <div class="col-md-3 col-md-offset-1">{{areashare}}% accessible within</div>
        <div class="col-md-7">{{name}}</div>
    </div>
    {{/classes}}
</script>

<?php
$date = date_create();
if (Configure::read("debug") == 0) {
    echo $this->Html->script("map.js?_dc=" . date_timestamp_get($date));
} else {
    echo $this->Html->script("map-debug.js?_dc=" . date_timestamp_get($date));
}
?>
