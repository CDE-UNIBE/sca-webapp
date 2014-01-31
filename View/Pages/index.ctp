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

<div class="row" id="intro-row">
    <div class="col-md-8">
        <p class="text-info" style="margin-top:50px">This tool is designed to provide users with basic statistical information on accessibility, population density, and land cover at any location worldwide. To get started, place the cursor anywhere on the map or enter direct geographic coordinates.</p>
    </div>
    <div class="col-md-2" id="logo-div">
        <p>
            <a href="http://www.cde.unibe.ch/">
                <?php
                echo $this->Html->image("logos/cde_132px.png");
                ?>
            </a>
        </p>
    </div>
</div>

<div class="row">
    <div class="col-md-10">
        <div id="map" style="height: 400px; margin-bottom: 20px; margin-top: 20px;">

        </div>
    </div>
</div>

<!--div class="row" id="location-input-row">
    <div class="col-md-10 form-group">
        <form class="form-inline" role="form">
            <div class="form-group">
                <label class="sr-only" for="longitude-input">Longitude</label>
                <input type="number" class="form-control" id="longitude-input" placeholder="Longitude">
            </div>
            <div class="form-group">
                <label class="sr-only" for="latitude-input">Latitude</label>
                <input type="number" class="form-control" id="latitude-input" placeholder="Latitude">
            </div>
            <div class="form-group">
                <select class="form-control" id="buffer-select">
                    <option value="100">Sample radius: 100 meters</option>
                    <option selected value="500">Sample radius: 500 meters</option>
                    <option value="5000">Sample radius: 5 km</option>
                    <option value="50000">Sample radius: 50 km</option>
                    <option value="500000">Sample radius: 500 km</option>
                </select>
            </div>
            <div class="form-group">
                <button type="button" id="location-input-button" class="btn btn-default"><i class="fa fa-bar-chart-o"></i>&nbsp;Get Areal Statistics</button>
            </div>
        </form>
    </div>
</div-->

<div class="row" id="location-input-row">
    <div class="col-md-2">
        <p>
            <label class="sr-only" for="latitude-input">Latitude</label>
            <input type="number" class="form-control" id="longitude-input" placeholder="Longitude">
        </p>
    </div>
    <div class="col-md-2">
        <p>
            <label class="sr-only" for="latitude-input">Latitude</label>
            <input type="number" class="form-control" id="latitude-input" placeholder="Latitude">
        </p>
    </div>
    <div class="col-md-3">
        <p>
            <select class="form-control" id="buffer-select">
                <option value="100">Sample radius: 100 meters</option>
                <option value="500">Sample radius: 500 meters</option>
                <option selected value="5000">Sample radius: 5 km</option>
                <option value="50000">Sample radius: 50 km</option>
            </select>
        </p>
    </div>
    <div class="col-md-3">
        <button type="button" id="location-input-button" class="btn btn-primary"><i class="fa fa-bar-chart-o"></i>&nbsp;Get Areal Statistics</button>
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

<!-- Legend modal -->
<div class="modal fade" id="legend-modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div id="legend-modal-content" class="modal-content">
        </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
</div><!-- /.modal -->

<!-- Legend dialog template -->
<script type="text/html" id="legend-template">
    <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h4 class="modal-title" id="legend-modal-label">{{layertitle}}</h4>
    </div>
    <div class="modal-body">
        <img alt="WMS Legend" src="http://cdetux2.unibe.ch/geoserver/lo/wms?service=WMS&version=1.1.0&request=GetLegendGraphic&layer={{layername}}&width=25&height=25&format=image/png"/>
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
    </div>
</script>

<!-- Landscan population density template -->
<script type="text/html" id="landscan-template">
    <div class="row stats-data">
        <div class="col-md-10">
            <h2>{{layername}}</h2>
        </div>
    </div>
    <div class="row stats-data description">
        <div class="col-md-10">
            Landscan population density layer 2011 from the <a class="external" href="http://web.ornl.gov/sci/landscan/">Oak Ridge National Laboratory</a>.
        </div>
    </div>
    <div class="row stats-data stats-data-row">
        <div class="col-md-3">
            Average population density
        </div>
        <div class="col-md-7">
            {{mean}} pers / km<sup>2</sup>
        </div>
    </div>
    <div class="row stats-data stats-data-row">
        <div class="col-md-3">
            Minimum population density
        </div>
        <div class="col-md-7">{{minimum}} pers / km<sup>2</sup></div>
    </div>
    <div class="row stats-data stats-data-row">
        <div class="col-md-3">
            Maximum population density
        </div>
        <div class="col-md-7">{{maximum}} pers / km<sup>2</sup></div>
    </div>
    <!--div class="row stats-data stats-data-row">
        <div class="col-md-3">
            Standard deviation
        </div>
        <div class="col-md-7">{{standarddeviation}} pers / km<sup>2</sup></div>
    </div-->
</script>

<!-- Landcover template -->
<script type="text/html" id="landcover-template">
    <div class="row stats-data">
        <div class="col-md-10">
            <h2>{{layername}}</h2>
        </div>
    </div>
    <div class="row stats-data description">
        <div class="col-md-10">
            <a class="external" href="http://due.esrin.esa.int/globcover/">Global Land Cover Map 2009</a> from the European Space Agency.
        </div>
    </div>
    {{#classes}}
    <div class="row stats-data stats-data-row">
        <div class="col-md-3">{{areashare}}% area share:</div>
        <div class="col-md-7">{{name}}</div>
    </div>
    {{/classes}}
</script>

<!-- Accessibility template -->
<script type="text/html" id="accessibility-template">
    <div class="row stats-data">
        <div class="col-md-10"><h2>{{layername}}</h2></div>
    </div>
    <div class="row stats-data description">
        <div class="col-md-10">
            Travel time to major cities: A global map of Accessibility from the <a class="external" href="http://bioval.jrc.ec.europa.eu/products/gam/index.htm">Joint Reserch Centre of the European Commission</a>.
        </div>
    </div>
    {{#classes}}
    <div class="row stats-data stats-data-row">
        <div class="col-md-3">{{areashare}}% accessible within</div>
        <div class="col-md-7">{{name}}</div>
    </div>
    {{/classes}}
</script>

<!-- Alert template -->
<script type="text/html" id="alert-template">
    <div id="alert-row" class="row">
        <div class="col-md-10"><div id="alert-div" class="alert alert-warning alert-dismissable">
                <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
                {{msg}}
            </div>
        </div>
    </div>
</script>

<?php
                $date = date_create();
                if (Configure::read("debug") == 0) {
                    echo $this->Html->script("map.js");
                } else {
                    echo $this->Html->script("map-debug.js?_dc=" . date_timestamp_get($date));
                }
?>
