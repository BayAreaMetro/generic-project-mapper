import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';
import uuid from 'uuid';

export class MainController {

    awesomeThings = [];
    newThing = '';


    /*@ngInject*/
    constructor($http, Auth, $scope, $state) {
        this.$http = $http;
        this.isLoggedIn = Auth.isLoggedInSync;
        this.isAdmin = Auth.isAdminSync;
        this.getCurrentUser = Auth.getCurrentUserSync;
        this.singlePoint = [];
        this.multiPoint = [];
        this.singleLine = [];
        this.multiLine = [];
        this.singlePoly = [];
        this.multiPoly = [];
        this.editType = null;
        this.$scope = $scope;
        this.multiPartFeatures = [];
        this.selectedWkt = null;
        this.multiPartWkt = null;
        this.projectId = null;
        this.project = {};
        this.$state = $state;
        this.marker1 = null;
        this.marker2 = null;
        // this.uuid = uuid;

    }

    $onInit() {
        // console.log(this.$http);
        //Query database for currently mapped projects
        this.$http.get('/api/projects')
            .then(response => {
                console.log(response);
                this.mappedProjects = response.data;
                for (var index = 0; index < this.mappedProjects.length; index++) {
                    var object = mapIt(this.mappedProjects[index].WKT, this.mappedProjects[index], this.$http, this.$state);
                    // object.addListener('click', function(event) {
                    //     console.log(event);
                    // });
                    // console.log(object);

                }
            });

        var gmap;

        this.initMap = function() {


            var multiPartWkt;
            var routeFeature = false;
            var fromAddress;
            var toAddress;
            var marker1, marker2;



            //Create initial map object
            gmap = new google.maps.Map(document.getElementById('canvas'), {
                center: new google.maps.LatLng(37.796966, -122.275051),
                defaults: {
                    //icon: '/assets/images/GenericBlueStop16.png',
                    //shadow: 'dot_shadow.png',                    
                    editable: false,
                    strokeColor: 'red',
                    fillColor: '#2196f3',
                    fillOpacity: 0.6,
                    strokeWeight: 7

                },
                disableDefaultUI: true,
                mapTypeControl: true,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                mapTypeControlOptions: {
                    position: google.maps.ControlPosition.TOP_LEFT,
                    style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
                },
                panControl: true,
                streetViewControl: true,
                zoom: 10,
                zoomControl: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.LEFT_TOP,
                    style: google.maps.ZoomControlStyle.SMALL
                }
            });

            var layerToggle = document.getElementById("layerToggleDiv");
            gmap.controls[google.maps.ControlPosition.TOP_RIGHT].push(layerToggle);

            var citySearch = document.getElementById("citySearch_Div");
            gmap.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(citySearch);

            //Add toggle layer functions for PDAs
            $('#pdaToggle').change(function() {
                $('#pdaSpinner').addClass('fa-spinner fa-spin');
                var status = ($(this).prop('checked'));
                if (status) {
                    // console.log('add pdas');
                    var getPDALayer = function() {
                        var pdaLayer = new google.maps.Data();
                        $.getJSON("/assets/js/pdas.json", function(data) {
                            // console.log(data);
                            var geoJsonObject;
                            geoJsonObject = topojson.feature(data, data.objects.pdas);
                            pdaLayer.addGeoJson(geoJsonObject);
                            pdaLayer.setStyle(function(feature) {

                                return {
                                    fillColor: 'orange',
                                    strokeColor: 'orange',
                                    fillOpacity: 0.2,
                                    strokeWeight: 1

                                };
                            });

                        });
                        $('#pdaSpinner').removeClass('fa-spinner fa-spin');
                        return pdaLayer;
                    };

                    this.pdaLayer = getPDALayer();
                    this.pdaLayer.setMap(gmap);
                } else if (!status) {
                    // console.log('remove pdas');
                    this.pdaLayer.setMap(null);
                    $('#pdaSpinner').removeClass('fa-spinner fa-spin');
                }
            });

            //Add toggle layer functions for TPAs
            $('#tpaToggle').change(function() {
                $('#tpaSpinner').addClass('fa-spinner fa-spin');
                var status = ($(this).prop('checked'));
                if (status) {
                    // console.log('add pdas');
                    var getPDALayer = function() {
                        var pdaLayer = new google.maps.Data();
                        $.getJSON("/assets/js/tpas_dissolved.json", function(data) {
                            // console.log(data);
                            var geoJsonObject;
                            geoJsonObject = topojson.feature(data, data.objects.tpas_dissolved);
                            pdaLayer.addGeoJson(geoJsonObject);
                            pdaLayer.setStyle(function(feature) {

                                return {
                                    fillColor: 'purple',
                                    strokeColor: 'purple',
                                    fillOpacity: 0.1,
                                    strokeWeight: 1,
                                    strokeOpacity: 0.6,

                                };
                            });

                        });
                        $('#tpaSpinner').removeClass('fa-spinner fa-spin');
                        return pdaLayer;
                    };

                    this.pdaLayer = getPDALayer();
                    this.pdaLayer.setMap(gmap);
                } else if (!status) {
                    // console.log('remove pdas');
                    this.pdaLayer.setMap(null);
                    $('#tpaSpinner').removeClass('fa-spinner fa-spin');
                }
            });

            //Add toggle layer functions for COCs
            $('#cocToggle').change(function() {
                $('#cocSpinner').addClass('fa-spinner fa-spin');
                var status = ($(this).prop('checked'));
                if (status) {
                    // console.log('add pdas');
                    var getPDALayer = function() {
                        var pdaLayer = new google.maps.Data();
                        $.getJSON("/assets/js/cocs_dissolved.json", function(data) {
                            // console.log(data);
                            var geoJsonObject;
                            geoJsonObject = topojson.feature(data, data.objects.cocs_dissolved);
                            pdaLayer.addGeoJson(geoJsonObject);
                            pdaLayer.setStyle(function(feature) {

                                return {
                                    fillColor: 'pink',
                                    strokeColor: 'pink',
                                    fillOpacity: 0.2,
                                    strokeWeight: 1,
                                    strokeOpacity: 0.9
                                };
                            });

                        });
                        $('#cocSpinner').removeClass('fa-spinner fa-spin');
                        return pdaLayer;
                    };

                    this.pdaLayer = getPDALayer();
                    this.pdaLayer.setMap(gmap);
                    // $('#cocSpinner').removeClass('fa-spinner fa-spin');
                } else if (!status) {
                    // console.log('remove pdas');
                    this.pdaLayer.setMap(null);
                    $('#cocSpinner').removeClass('fa-spinner fa-spin');
                }
            });

            //Add toggle layer functions for COCs
            $('#cityToggle').change(function() {
                $('#citySpinner').addClass('fa-spinner fa-spin');
                var status = ($(this).prop('checked'));
                if (status) {
                    // console.log('add pdas');
                    var getPDALayer = function() {
                        var pdaLayer = new google.maps.Data();
                        $.getJSON("/assets/js/Places2.json", function(data) {
                            // console.log(data);
                            var geoJsonObject;
                            geoJsonObject = topojson.feature(data, data.objects.Places2);
                            pdaLayer.addGeoJson(geoJsonObject);
                            pdaLayer.setStyle(function(feature) {

                                return {
                                    fillColor: 'gray',
                                    strokeColor: 'gray',
                                    fillOpacity: 0.2,
                                    strokeWeight: 1,
                                    strokeOpacity: 0.9
                                };
                            });

                        });
                        $('#citySpinner').removeClass('fa-spinner fa-spin');
                        return pdaLayer;
                    };

                    this.pdaLayer = getPDALayer();
                    this.pdaLayer.setMap(gmap);
                } else if (!status) {
                    // console.log('remove pdas');
                    this.pdaLayer.setMap(null);
                    $('#citySpinner').removeClass('fa-spinner fa-spin');
                }
            });

            //Add toggle layer functions for federal aid roads
            $('#fedAidToggle').change(function() {
                // $('#citySpinner').addClass('fa-spinner fa-spin');
                var status = ($(this).prop('checked'));
                if (status) {
                    // console.log('add fedaidroads');
                    var getFedAidLayer = function() {
                        var fedAidLayer = new google.maps.Data();
                        $.getJSON("/assets/js/HPMS_FedAidRoads_BayArea_2014_Dissolve.json", function(data) {
                            console.log(data);
                            var geoJsonObject;
                            geoJsonObject = topojson.feature(data, data.objects.HPMS_FedAidRoads_BayArea_2014_Dissolve);
                            fedAidLayer.addGeoJson(geoJsonObject);
                            fedAidLayer.setStyle(function(feature) {

                                return {
                                    strokeColor: 'purple',
                                    strokeWeight: 3,
                                    strokeOpacity: 0.9
                                };
                            });

                        });
                        // $('#citySpinner').removeClass('fa-spinner fa-spin');
                        return fedAidLayer;
                    };

                    this.fedAidLayer = getFedAidLayer();
                    this.fedAidLayer.setMap(gmap);
                } else if (!status) {
                    // console.log('remove fedaidroads');
                    this.fedAidLayer.setMap(null);
                    $('#citySpinner').removeClass('fa-spinner fa-spin');
                }
            });

            var allOverlays = [];

            //CITY LIMITS SEARCH 
            //Based on https://github.com/pgkelley4/city-boundaries-google-maps
            var loadCityLimits = document.getElementById('cityTextInput_Btn');
            loadCityLimits.addEventListener('click', function() {
                var faSpinner = $('#faSpinner').addClass('fa').addClass('fa-spinner').addClass('fa-spin');

                var BOUNDARY_COLORS = ['FF0000'];
                var BOUNDARY_COLOR_COORDINATES_PARAM = 0;


                console.log('button clicked');
                // clear any previous polygons
                while (allOverlays[0]) {
                    allOverlays.pop().setMap(null);
                }


                var cityText = document.getElementById('cityTextInput');
                var splitCity = cityText.value.split(",");
                if (splitCity.length != 2) {
                    alert("Must enter a city in the format: CITY, STATE.");
                    return;
                }

                var city = toTitleCase(splitCity[0].trim());
                var state = splitCity[1].trim().toUpperCase();


                var params = [];
                params[BOUNDARY_COLOR_COORDINATES_PARAM] = BOUNDARY_COLORS[0];
                getRequestJSON(getOSMAreaForCityURL(city, state), processCityArea, params);

                function getOSMAreaForCityURL(cityName, stateName) {
                    return "http://overpass-api.de/api/interpreter?data=[out:json];area[name=%22" + cityName +
                        "%22][%22is_in:state_code%22=%22" + stateName + "%22];foreach(out;);node[name=%22" + cityName +
                        "%22][%22is_in%22~%22" + stateName + "%22];foreach(out;is_in;out;);";
                    // case insensitive, really slow!
                    // area[name~%22" + cityName +
                    // "%22, i][%22is_in:state_code%22~%22" + stateName + "%22, i];foreach(out;);node[name~%22" + cityName +
                    // "%22, i][%22is_in%22~%22" + stateName + "%22];foreach(out;is_in;out;);
                    // could directly ping for relation
                    //rel[name=Boston]["is_in:state_code"~MA];foreach(out;);
                }

                function processCityArea(areaJSON, params) {
                    for (var x in areaJSON.elements) {
                        // if find something that is level 8
                        // if find something labelled city
                        // if find something that has the exact name
                        if ((areaJSON.elements[x].tags.admin_level == "8" &&
                                areaJSON.elements[x].tags.border_type == null) ||
                            areaJSON.elements[x].tags.border_type == "city") {
                            var areaID = areaJSON.elements[x].id;
                            // transform to relation id, and get relation
                            var relationID = areaID - 3600000000;

                            getRelationInOrder(relationID, constructMapFromBoundaries, params);
                            return;
                        }
                    }

                    //Notification
                    $.notify({
                        // options
                        icon: 'glyphicon glyphicon-warning-sign',
                        message: "&nbsp;&nbsp;Couldn't retrieve the city limits for a city, they are either missing from OpenStreetMap, not labeled " +
                            "consistently or the city entered is not valid. "

                    }, {
                        type: "danger",
                        allow_dismiss: true,
                        placement: {
                            from: "top",
                            align: "center"
                        },
                        offset: 20,
                        spacing: 10,
                        z_index: 1031,
                        delay: 5000,
                        timer: 1000,
                        animate: {
                            enter: 'animated fadeInDown',
                            exit: 'animated fadeOutUp'
                        },
                        icon_type: 'class'

                    });
                    var faSpinner = $('#faSpinner').removeClass('fa').removeClass('fa-spinner').removeClass('fa-spin');
                    console.log("Failed to find city border from OSM.");
                }

                function constructMapFromBoundaries(paths, params) {
                    var color = params[BOUNDARY_COLOR_COORDINATES_PARAM];

                    for (var i in paths) {
                        var path = paths[i];
                        for (var j in path) {
                            var node = path[j];
                            path[j] = new google.maps.LatLng(node.lat, node.lon);
                        }
                    }

                    // google maps api can create multiple polygons with one create call
                    // and returns one object. Also can handle inner ways (holes)
                    var polygon = createPolygon(paths, color);

                    // set map zoom and location to new polygons
                    gmap.fitBounds(polygon.getBounds());
                    var faSpinner = $('#faSpinner').removeClass('fa').removeClass('fa-spinner').removeClass('fa-spin');
                }



                function createPolygon(paths, color) {
                    var newPolygon = new google.maps.Polygon({
                        paths: paths,
                        strokeColor: "blue",
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: "yellow",
                        fillOpacity: 0.2,
                        draggable: false
                            // geodisc: true
                    });

                    newPolygon.setMap(gmap);

                    allOverlays.push(newPolygon);

                    return newPolygon;
                }

                function getOSMCityRelationURL(relationID) {
                    return "http://overpass-api.de/api/interpreter?data=[out:json];(relation(" + relationID + ");>;);out;";
                }


                function getRelationInOrder(relationID, callback, params) {
                    params.push(callback);
                    getRequestJSON(getOSMCityRelationURL(relationID), constructRelationInOrder, params);
                }

                /**
                 * Get the OpenStreetMap URL for a specific relation as a String.
                 *
                 * @param {String} relationID ID of the relation to retrieve
                 */
                function getOSMRelationURL(relationID) {
                    return "http://overpass-api.de/api/interpreter?data=[out:json];(relation(" + relationID + ");>;);out;";
                }



            });
            //END CITY LIMITS SEARCH

            /**
             * GOOGLE MAPS DIRECTIONS
             * 
             */
            gmap.routing = {};
            gmap.routing.directionsService = new google.maps.DirectionsService;
            gmap.routing.directionsDisplay = new google.maps.DirectionsRenderer({
                draggable: true,
                map: gmap

            });
            var directionsService = new google.maps.DirectionsService;
            var directionsDisplay = new google.maps.DirectionsRenderer({
                draggable: true,
                map: gmap

            });
            // gmap.newNetworkLine = null;

            //Directions changed event. Triggers when route is dragged/edited
            gmap.routing.directionsDisplay.addListener('directions_changed', function() {
                // computeEditedRoute(directionsDisplay.getDirections());
                console.log('you edited the route');
                console.log(gmap.editedRoute);
                computeEditedRoute(gmap.routing.directionsDisplay.getDirections(), gmap.editedRoute);

            });


            //Takes the generated route, adds it to multi-part array and calculates the wkt string
            function computeEditedRoute(result, editedRoute) {
                gmap.multiPartFeatures.pop();
                console.log(editedRoute);

                if (editedRoute) {
                    console.log(result);
                    console.log('re-calculated');
                    var i = 0;
                    var j = 0;
                    //console.log(response);
                    var pointsArray = result.routes[0].overview_path;
                    var finalArray = [];

                    //Create an array of Lat/Lngs from response overview_path
                    for (j = 0; j < pointsArray.length; j++) {
                        finalArray[i] = pointsArray[j].lng() + ' ' + pointsArray[j].lat();
                        i++;

                    }

                    //Build WKT string from lat/lngs
                    var lineString = '';
                    for (var t = 0; t < finalArray.length; t++) {
                        lineString += finalArray[t] + ',';
                    }

                    //Remove final , and add closing )
                    lineString = lineString.slice(0, -1);
                    gmap.networkString = lineString;
                    // lineString = lineString + ')';

                    //Remove last value from array and re-add the edited value
                    // console.log(gmap.multiPartFeatures.length);
                    // gmap.multiPartFeatures.pop();
                    // console.log(gmap.multiPartFeatures.length);
                    // gmap.multiPartFeatures.push(lineString.slice(11));
                    // gmap.networkString = 
                    // console.log(gmap.multiPartFeatures.length);
                    console.log('added value from edit route event');

                    var decodedPath = google.maps.geometry.encoding.decodePath(result.routes[0].overview_polyline);
                    // var decodedLevels = decodeLevels("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB");
                    // var newNetworkLine;
                    gmap.newNetworkLine.setMap(null);
                    gmap.newNetworkLine = null;
                    gmap.newNetworkLine = new google.maps.Polyline({
                        path: decodedPath,
                        // levels: decodedLevels,
                        strokeColor: '#2196f3',
                        fillColor: '#2196f3',
                        fillOpacity: 0.6,
                        strokeWeight: 14,
                        map: gmap
                    });


                    //Set update parameters
                    // $scope.routeFeatureWkt = lineString;
                    // if ($scope.multiPartFeatures.length > 1) {
                    //     $scope.routeFeatureWkt = $scope.multiPartWkt;
                    // }
                    // $scope.idPrefix = 'LN-';
                    // $scope.shape = 'Line';
                }
            }




            gmap.editedRoute = false;

            //Google maps drawing configuration
            gmap.drawingManager = new google.maps.drawing.DrawingManager({
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    // drawingModes: [
                    //     google.maps.drawing.OverlayType.MARKER,
                    //     google.maps.drawing.OverlayType.POLYLINE,
                    //     google.maps.drawing.OverlayType.POLYGON
                    // ]
                },
                markerOptions: gmap.defaults,
                polygonOptions: gmap.defaults,
                polylineOptions: gmap.defaults,
                rectangleOptions: gmap.defaults
            });
            // gmap.drawingManager.setMap(gmap);
            gmap.enableKeyDragZoom();

            // Set map for directions display
            directionsDisplay.setMap(gmap);


            //GOOGLE SEARCH
            var googleSearchInputBox = document.getElementById('pac-input');

            // Create the search box and link it to the UI element.
            var searchBox = new google.maps.places.SearchBox(googleSearchInputBox);
            gmap.controls[google.maps.ControlPosition.TOP_LEFT].push(googleSearchInputBox);

            // Bias the SearchBox results towards current map's viewport.
            gmap.addListener('bounds_changed', function() {
                searchBox.setBounds(gmap.getBounds());
            });



            var markers = [];
            gmap.features = [];
            // Listen for the event fired when the user selects a prediction and retrieve
            // more details for that place.
            searchBox.addListener('places_changed', function() {
                var places = searchBox.getPlaces();
                // //console.log(places);

                if (places.length === 0) {
                    return;
                }

                // Clear out the old markers.
                markers.forEach(function(marker) {
                    marker.setMap(null);
                });
                markers = [];

                // For each place, get the icon, name and location.
                var bounds = new google.maps.LatLngBounds();
                places.forEach(function(place) {
                    var icon = {
                        url: place.icon,
                        size: new google.maps.Size(71, 71),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(17, 34),
                        scaledSize: new google.maps.Size(25, 25)
                    };

                    // Create a marker for each place.
                    markers.push(new google.maps.Marker({
                        map: gmap,
                        icon: icon,
                        title: place.name,
                        position: place.geometry.location
                    }));

                    if (place.geometry.viewport) {
                        // Only geocodes have viewport.
                        bounds.union(place.geometry.viewport);
                    } else {
                        bounds.extend(place.geometry.location);
                    }
                });
                gmap.fitBounds(bounds);
            });


            //END GOOGLE SEARCH


            // GOOGLE AUTOCOMPLETE
            // Autocomplete directions
            fromAddress = document.getElementById('fromAddress');
            toAddress = document.getElementById('toAddress');

            var autocomplete1 = new google.maps.places.Autocomplete(fromAddress);
            var autocomplete2 = new google.maps.places.Autocomplete(toAddress);

            autocomplete1.bindTo('bounds', gmap);
            autocomplete2.bindTo('bounds', gmap);

            //From Address Autocomplete
            autocomplete1.addListener('place_changed', function() {
                console.log(this.toAddress);
                // infowindow.close();
                marker1 = new google.maps.Marker({
                    map: gmap,
                    anchorPoint: new google.maps.Point(0, -29)
                });
                marker1.setVisible(false);

                var place = autocomplete1.getPlace();
                if (!place.geometry) {
                    // User entered the name of a Place that was not suggested and
                    // pressed the Enter key, or the Place Details request failed.
                    window.alert("No details available for input: '" + place.name + "'");
                    return;
                }

                // If the place has a geometry, then present it on a map.
                if (place.geometry.viewport) {
                    gmap.fitBounds(place.geometry.viewport);
                } else {
                    gmap.setCenter(place.geometry.location);
                    gmap.setZoom(17); // Why 17? Because it looks good.
                }
                marker1.setPosition(place.geometry.location);
                marker1.setVisible(true);

                var address = '';
                if (place.address_components) {
                    address = [
                        (place.address_components[0] && place.address_components[0].short_name || ''),
                        (place.address_components[1] && place.address_components[1].short_name || ''),
                        (place.address_components[2] && place.address_components[2].short_name || '')
                    ].join(' ');
                }

                // infowindowContent.children['place-icon'].src = place.icon;
                // infowindowContent.children['place-name'].textContent = place.name;
                // infowindowContent.children['place-address'].textContent = address;
                console.log(address);
                gmap.fromAddress = address;
                gmap.toAddress = '';
                toAddress.value = '';
                // infowindow.open(map, marker);
            });

            // To Address Autocomplete
            autocomplete2.addListener('place_changed', function() {
                // infowindow.close();
                marker2 = new google.maps.Marker({
                    map: gmap,
                    anchorPoint: new google.maps.Point(0, -29)
                });
                marker2.setVisible(false);

                var place = autocomplete2.getPlace();
                if (!place.geometry) {
                    // User entered the name of a Place that was not suggested and
                    // pressed the Enter key, or the Place Details request failed.
                    window.alert("No details available for input: '" + place.name + "'");
                    return;
                }

                // If the place has a geometry, then present it on a map.
                if (place.geometry.viewport) {
                    gmap.fitBounds(place.geometry.viewport);
                } else {
                    gmap.setCenter(place.geometry.location);
                    gmap.setZoom(17); // Why 17? Because it looks good.
                }
                marker2.setPosition(place.geometry.location);
                marker2.setVisible(true);

                var address = '';
                if (place.address_components) {
                    address = [
                        (place.address_components[0] && place.address_components[0].short_name || ''),
                        (place.address_components[1] && place.address_components[1].short_name || ''),
                        (place.address_components[2] && place.address_components[2].short_name || '')
                    ].join(' ');
                }

                // infowindowContent.children['place-icon'].src = place.icon;
                // infowindowContent.children['place-name'].textContent = place.name;
                // infowindowContent.children['place-address'].textContent = address;
                console.log(address);
                gmap.toAddress = address;

                gmap.onChange();
                // infowindow.open(map, marker);
            });



            // GOOGLE ROUTING
            //Calculate route on input change
            gmap.onChange = function() {
                // //console.log('changed');
                gmap.routeFeature = true;
                gmap.calculateAndDisplayRoute(gmap.routing.directionsService, gmap.routing.directionsDisplay);
            };

            /**
             * [calculateAndDisplayRoute description]
             * @param  {[type]} directionsService [google parameter]
             * @param  {[type]} directionsDisplay [google parameter]
             * @param  {[type]} directions [start and end values]
             * 
             */
            gmap.calculateAndDisplayRoute = function(directionsService, directionsDisplay) {
                // marker1.setVisible(false);
                // marker2.setVisible(false);

                var saveAndContinue_Btn = $('#saveAndContinue_Btn');
                var removeLast = $('#removeLastFeature_Btn');
                saveAndContinue_Btn.removeClass('hidden');
                removeLast.removeClass('hidden');
                var routeFeatureWkt, shape, idPrefix;

                directionsService.route({
                    origin: gmap.fromAddress,
                    destination: gmap.toAddress,
                    travelMode: google.maps.TravelMode.DRIVING
                }, function(response, status) {
                    if (status === google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                        // console.log(response);
                        var i = 0;
                        var j = 0;
                        //console.log(response);
                        var pointsArray = response.routes[0].overview_path;
                        var finalArray = [];

                        //Create an array of Lat/Lngs from response overview_path
                        for (j = 0; j < pointsArray.length; j++) {
                            finalArray[i] = pointsArray[j].lng() + ' ' + pointsArray[j].lat();
                            i++;

                        }

                        console.log('changed');


                        var decodedPath = google.maps.geometry.encoding.decodePath(response.routes[0].overview_polyline);
                        // var decodedLevels = decodeLevels("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB");
                        // var newNetworkLine;
                        gmap.newNetworkLine = new google.maps.Polyline({
                            path: decodedPath,
                            // levels: decodedLevels,
                            strokeColor: '#2196f3',
                            fillColor: '#2196f3',
                            fillOpacity: 0.6,
                            strokeWeight: 14,
                            map: gmap
                        });




                        //Build WKT string from lat/lngs
                        var networkString = 'LINESTRING (';
                        networkString = '';
                        for (var t = 0; t < finalArray.length; t++) {
                            networkString += finalArray[t] + ',';
                        }

                        //Remove final , and add closing )
                        networkString = networkString.slice(0, -1);
                        // lineString = lineString + ')';
                        // console.log(networkString);
                        gmap.networkString = networkString;

                        // gmap.multiPartFeatures.push(lineString);
                        // console.log(gmap.multiPartFeatures);
                        // console.log('added value from click event');
                        // //console.log(multiPartFeatures);
                        var latLngString = '';
                        for (i = 0; i < gmap.multiPartFeatures.length; i++) {
                            latLngString = latLngString + gmap.multiPartFeatures[i] + ',';
                            // //console.log(latLngString);
                        }
                        latLngString = latLngString.slice(0, -1);
                        multiPartWkt = 'MULTILINESTRING (' + latLngString + ')';
                        // console.log('the wkt');
                        // console.log(multiPartWkt);
                        gmap.featureLength = gmap.multiPartFeatures.length;
                        // this.$apply();

                        //Set update parameters
                        routeFeatureWkt = networkString;
                        if (gmap.multiPartFeatures.length > 1) {
                            routeFeatureWkt = multiPartWkt;
                        }
                        idPrefix = 'LN-';
                        shape = 'Line';

                        gmap.editedRoute = true;

                    } else {
                        window.alert('Directions request failed due to ' + status);
                    }
                });

                directionsDisplay = gmap.routing.directionsDisplay;
                directionsService = gmap.routing.directionsService;
            }

            //END GOOGLE ROUTING

            //Google maps drawing overlay complete event
            gmap.multiPartFeatures = [];
            google.maps.event.addListener(gmap.drawingManager, 'overlaycomplete', function(event) {
                var wkt;
                // $scope.clearMap();

                // Set the drawing mode to "pan" (the hand) so users can immediately edit
                this.setDrawingMode(null);

                //Set shape type to update FMS and prefix for MapId
                if (event.type === google.maps.drawing.OverlayType.POLYGON) {
                    this.shape = 'Polygon';
                    this.idPrefix = 'PY-';
                } else if (event.type === google.maps.drawing.OverlayType.POLYLINE) {
                    this.shape = 'Line';
                    this.idPrefix = 'LN-';
                } else if (event.type === google.maps.drawing.OverlayType.MARKER) {
                    this.shape = 'Point';
                    this.idPrefix = 'PT-';

                }

                // Polygon drawn
                if (event.type === google.maps.drawing.OverlayType.POLYGON || event.type === google.maps.drawing.OverlayType.POLYLINE) {
                    // New vertex is inserted
                    google.maps.event.addListener(event.overlay.getPath(), 'insert_at', function(n) {

                    });

                    // Existing vertex is removed (insertion is undone)
                    google.maps.event.addListener(event.overlay.getPath(), 'remove_at', function(n) {
                        // app.updateText();
                    });

                    // Existing vertex is moved (set elsewhere)
                    google.maps.event.addListener(event.overlay.getPath(), 'set_at', function(n) {

                    });
                } else if (event.type === google.maps.drawing.OverlayType.RECTANGLE) { // Rectangle drawn
                    // Listen for the 'bounds_changed' event and update the geometry
                    google.maps.event.addListener(event.overlay, 'bounds_changed', function() {
                        // app.updateText();
                    });
                }

                gmap.features.push(event.overlay);
                console.log('overlay', event.overlay);
                console.log(gmap.features);

                //Create wkt object and add currently drawn feature
                wkt = new Wkt.Wkt();
                wkt.fromObject(event.overlay);

                //Set variable to hold original wkt feature
                this.previousSelectedWkt = this.selectedWkt;
                this.selectedWkt = wkt.toString();
                console.log(this.selectedWkt);


                var latLngs;
                var latLngString;
                var i;

                console.log(this.shape);

                //Add to multi-part if necessary
                if (this.shape === 'Point') {
                    latLngs = this.selectedWkt.slice(6);
                    latLngs = latLngs.slice(0, -1);
                    gmap.multiPartFeatures.push(latLngs);
                    latLngString = '';
                    for (i = 0; i < gmap.multiPartFeatures.length; i++) {
                        latLngString = latLngString + gmap.multiPartFeatures[i] + ',';
                    }
                    latLngString = latLngString.slice(0, -1);

                    multiPartWkt = 'MULTIPOINT (' + latLngString + ')';
                    this.featureLength = gmap.multiPartFeatures.length;
                    // this.$apply();
                    if (gmap.multiPartFeatures.length > 1) {
                        this.selectedWkt = multiPartWkt;
                    }

                } else if (this.shape === 'Line') {
                    latLngs = this.selectedWkt.slice(10);
                    console.log(latLngs);
                    latLngs = latLngs.substring(1);
                    latLngs = latLngs.substring(0, latLngs.length - 1);
                    console.log(latLngs);
                    gmap.multiPartFeatures.push(latLngs);
                    latLngString = '';
                    for (i = 0; i < gmap.multiPartFeatures.length; i++) {
                        latLngString = latLngString + gmap.multiPartFeatures[i] + ',';
                    }
                    latLngString = latLngString.slice(0, -1);
                    multiPartWkt = 'MULTILINESTRING (' + latLngString + ')';
                    this.featureLength = gmap.multiPartFeatures.length;
                    // this.$apply();

                    if (gmap.multiPartFeatures.length > 1) {
                        this.selectedWkt = multiPartWkt;
                    }
                } else if (this.shape === 'Polygon') {
                    latLngs = this.selectedWkt.slice(7);
                    // latLngs = latLngs.substring(1);
                    // latLngs = latLngs.substring(0, latLngs.length - 1);
                    console.log(latLngs);
                    gmap.multiPartFeatures.push(latLngs);
                    latLngString = '';
                    for (i = 0; i < gmap.multiPartFeatures.length; i++) {
                        latLngString = latLngString + gmap.multiPartFeatures[i] + ',';
                    }
                    latLngString = latLngString.slice(0, -1);
                    multiPartWkt = 'MULTIPOLYGON (' + latLngString + ')';
                    this.featureLength = gmap.multiPartFeatures.length;
                    // this.$apply();
                    if (gmap.multiPartFeatures.length > 1) {
                        this.selectedWkt = multiPartWkt;
                    }
                }

                gmap.multiPartWkt = multiPartWkt;

                console.log(gmap.multiPartWkt);
                console.log(gmap.multiPartFeatures);

            });

            gmap.testFunction = function() {
                console.log('testing gmap function');
            }

            gmap.directionsDisplay = directionsDisplay;
            gmap.directionsService = directionsService;


            return gmap;

        };

        function mapIt(wktValue, object, $http, $state) {
            /**
             * Maps the current contents of the textarea.
             * @return  {Object}    Some sort of geometry object
             */

            var el, obj, wkt, i;

            // el = document.getElementById('wkt');
            wkt = new Wkt.Wkt();



            try { // Catch any malformed WKT strings
                wkt.read(wktValue);
            } catch (e1) {
                try {
                    wkt.read(wktValue.replace('\n', '').replace('\r', '').replace('\t', ''));
                } catch (e2) {
                    if (e2.name === 'WKTError') {
                        alert('Wicket could not understand the WKT string you entered. Check that you have parentheses balanced, and try removing tabs and newline characters.');
                        return;
                    }
                }
            }
            // console.log(object.ID);
            obj = wkt.toObject(gmap.defaults); // Make an object


            // Add listeners for overlay editing events
            if (!Wkt.isArray(obj) && wkt.type !== 'point') {
                // New vertex is inserted
                google.maps.event.addListener(obj.getPath(), 'insert_at', function(n) {
                    app.updateText();
                });
                // Existing vertex is removed (insertion is undone)
                google.maps.event.addListener(obj.getPath(), 'remove_at', function(n) {
                    app.updateText();
                });
                // Existing vertex is moved (set elsewhere)
                google.maps.event.addListener(obj.getPath(), 'set_at', function(n) {
                    app.updateText();
                });
            } else {
                if (obj.setEditable) { obj.setEditable(false); }
            }

            var bounds = new google.maps.LatLngBounds();
            gmap.infowindow = new google.maps.InfoWindow;
            if (Wkt.isArray(obj)) { // Distinguish multigeometries (Arrays) from objects
                for (i in obj) {
                    if (obj.hasOwnProperty(i) && !Wkt.isArray(obj[i])) {
                        obj[i].setMap(gmap);
                        obj[i].Project = object.Project;
                        obj[i].ID = object.ID;
                        var ID = object.ID;
                        google.maps.event.addListener(obj[i], 'click', function(event) {
                            if (gmap.infowindow) {
                                gmap.infowindow.close();
                            }
                            var contentString = '<div>' +
                                '<table class="table">' +
                                '<thead style="background-color:blue;color:white;">' +
                                '<h5>' + this.Project + '</h5>' +
                                '  </thead>' +
                                '<tbody>' +
                                '<tr>' +
                                '<td>' +
                                'Project ID:' +
                                '</td>' +
                                '<td> ' +
                                this.ID +
                                '</td>' +
                                '</tr>' +
                                '<tr>' +
                                '<td>' +
                                ' <button id="delete_Btn" type="submit" class="btn btn-danger" ng-click="console.log(\'clicked\')"> <i class="fa fa-trash-o"></i>&nbsp;&nbsp;Delete</button>' +
                                '</td>' +
                                '</tr>' +
                                '</tbody>' +
                                '</table>' +
                                '</div>' +
                                '<div id="chart_div"></div>';
                            var position = {
                                lat: event.latLng.lat(),
                                lng: event.latLng.lng()
                            };
                            console.log(position);
                            gmap.infowindow.setPosition(position);
                            gmap.infowindow.setContent(contentString);
                            gmap.infowindow.open(gmap);

                            document.getElementById("delete_Btn").addEventListener("click", function() {
                                $http.delete('/api/projects/' + ID)
                                    .then(response => {
                                        console.log(response);
                                        //Notification
                                        $.notify({
                                            // options
                                            icon: 'glyphicon glyphicon-warning-sign',
                                            message: '&nbsp;&nbsp;Project Deleted from Database! '

                                        }, {
                                            type: "danger",
                                            allow_dismiss: true,
                                            placement: {
                                                from: "top",
                                                align: "center"
                                            },
                                            offset: 20,
                                            spacing: 10,
                                            z_index: 1031,
                                            delay: 5000,
                                            timer: 1000,
                                            animate: {
                                                enter: 'animated fadeInDown',
                                                exit: 'animated fadeOutUp'
                                            },
                                            icon_type: 'class'

                                        });
                                        $state.reload();
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        //Notification
                                        $.notify({
                                            // options
                                            icon: 'glyphicon glyphicon-warning-sign',
                                            message: '&nbsp;&nbsp;An error occurred trying to delete this project! '

                                        }, {
                                            type: "danger",
                                            allow_dismiss: true,
                                            placement: {
                                                from: "top",
                                                align: "center"
                                            },
                                            offset: 20,
                                            spacing: 10,
                                            z_index: 1031,
                                            delay: 5000,
                                            timer: 1000,
                                            animate: {
                                                enter: 'animated fadeInDown',
                                                exit: 'animated fadeOutUp'
                                            },
                                            icon_type: 'class'

                                        });

                                    });

                                console.log("Project Deleted: " + ID);
                            });
                        });
                        gmap.features.push(obj[i]);

                        if (wkt.type === 'point' || wkt.type === 'multipoint')
                            bounds.extend(obj[i].getPosition());
                        else
                            obj[i].getPath().forEach(function(element, index) { bounds.extend(element) });
                    }
                }

                gmap.features = gmap.features.concat(obj);
            } else {
                obj.setMap(gmap);
                obj.Project = object.Project;
                obj.ID = object.ID;
                google.maps.event.addListener(obj, 'click', function(event) {
                    if (gmap.infowindow) {
                        gmap.infowindow.close();
                    }
                    var ID = this.ID;
                    var contentString = '<div>' +
                        '<table class="table">' +
                        '<thead style="background-color:blue;color:white;">' +
                        '<h5>' + this.Project + '</h5>' +
                        '  </thead>' +
                        '<tbody>' +
                        '<tr>' +
                        '<td>' +
                        'Project ID:' +
                        '</td>' +
                        '<td> ' +
                        this.ID +
                        '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td>' +
                        ' <button id="delete_Btn" type="submit" class="btn btn-danger"> <i class="fa fa-trash-o"></i>&nbsp;&nbsp;Delete</button>' +
                        '</td>' +
                        '</tr>' +
                        '</tbody>' +
                        '</table>' +
                        '</div>' +
                        '<div id="chart_div"></div>';
                    var position = {
                        lat: event.latLng.lat(),
                        lng: event.latLng.lng()
                    };
                    console.log(position);
                    gmap.infowindow.setPosition(position);
                    gmap.infowindow.setContent(contentString);
                    gmap.infowindow.open(gmap);
                    // console.log(this.$http);
                    // var http = this.$http;
                    // console.log(http);
                    document.getElementById("delete_Btn").addEventListener("click", function() {
                        $http.delete('/api/projects/' + ID)
                            .then(response => {
                                console.log(response);
                                //Notification
                                $.notify({
                                    // options
                                    icon: 'glyphicon glyphicon-warning-sign',
                                    message: '&nbsp;&nbsp;Project Deleted from Database! '

                                }, {
                                    type: "danger",
                                    allow_dismiss: true,
                                    placement: {
                                        from: "top",
                                        align: "center"
                                    },
                                    offset: 20,
                                    spacing: 10,
                                    z_index: 1031,
                                    delay: 5000,
                                    timer: 1000,
                                    animate: {
                                        enter: 'animated fadeInDown',
                                        exit: 'animated fadeOutUp'
                                    },
                                    icon_type: 'class'

                                });
                                $state.reload();
                            })
                            .catch(err => {
                                console.log(err);
                                //Notification
                                $.notify({
                                    // options
                                    icon: 'glyphicon glyphicon-warning-sign',
                                    message: '&nbsp;&nbsp;An error occurred trying to delete this project! '

                                }, {
                                    type: "danger",
                                    allow_dismiss: true,
                                    placement: {
                                        from: "top",
                                        align: "center"
                                    },
                                    offset: 20,
                                    spacing: 10,
                                    z_index: 1031,
                                    delay: 5000,
                                    timer: 1000,
                                    animate: {
                                        enter: 'animated fadeInDown',
                                        exit: 'animated fadeOutUp'
                                    },
                                    icon_type: 'class'

                                });

                            });

                        console.log("Project Deleted: " + ID);
                    });
                });
                // obj.addListener('click', function(event) {
                //     console.log(event);
                // });
                // Add it to the map
                gmap.features.push(obj);

                if (wkt.type === 'point' || wkt.type === 'multipoint')
                    bounds.extend(obj.getPosition());
                else
                    obj.getPath().forEach(function(element, index) { bounds.extend(element) });
            }

            // Pan the map to the feature
            // gmap.fitBounds(bounds);


            return obj;

        }

        this.gmap = this.initMap();
    }

    setEditType(editType) {
        var routeInfoDiv = $('#routeInfoDiv');

        this.gmap.drawingManager.drawingControlOptions.drawingModes = [];
        this.editType = editType;
        console.log(this.editType);
        this.gmap.editType = editType;
        if (editType === 'multiLine' || editType === 'singleLine') {
            this.gmap.drawingManager.drawingControlOptions.drawingModes = [
                google.maps.drawing.OverlayType.POLYLINE
            ];
            this.gmap.drawingManager.setMap(this.gmap);
            routeInfoDiv.removeClass('hidden');

        } else if (editType === 'singlePoint' || editType === 'multiPoint') {
            this.gmap.drawingManager.drawingControlOptions.drawingModes = [
                google.maps.drawing.OverlayType.MARKER
            ];
            this.gmap.drawingManager.setMap(this.gmap);
        } else if (editType === 'singlePoly' || editType === 'multiPoly') {
            this.gmap.drawingManager.drawingControlOptions.drawingModes = [
                google.maps.drawing.OverlayType.POLYGON
            ];
            this.gmap.drawingManager.setMap(this.gmap);
        }
        console.log(this.gmap);


    }

    submitFeatures() {
        // console.log(document.getElementById('toAddress').value);
        // console.log(document.getElementById('toAddress').value);
        console.log(this.gmap);
        var multiPartWkt, i;
        var latLngString;

        var mapInfo = {
            name: this.project.name,
            Id: this.project.Id
        };
        console.log(mapInfo);
        console.log(this.editType);

        if (!this.project.Id || !this.project.name || !this.editType) {
            //Notification
            $.notify({
                // options
                icon: 'glyphicon glyphicon-warning-sign',
                message: '&nbsp;&nbsp;Please select a project name, project Id and shape type! '

            }, {
                type: "danger",
                allow_dismiss: true,
                placement: {
                    from: "top",
                    align: "center"
                },
                offset: 20,
                spacing: 10,
                z_index: 1031,
                delay: 5000,
                timer: 1000,
                animate: {
                    enter: 'animated fadeInDown',
                    exit: 'animated fadeOutUp'
                },
                icon_type: 'class'

            });
        }

        //Add to multi-part if necessary
        if (this.editType === 'multiPoint') {

            var latLngString = '';
            for (var i = 0; i < this.gmap.multiPartFeatures.length; i++) {
                latLngString = latLngString + this.gmap.multiPartFeatures[i] + ',';
            }
            latLngString = latLngString.slice(0, -1);

            multiPartWkt = 'MULTIPOINT (' + latLngString + ')';
            mapInfo.wkt = multiPartWkt;
            postProject(mapInfo, this.$http, this.gmap, this.$state);


        } else if (this.editType === 'multiLine') {
            var latLngString = '';
            for (i = 0; i < this.gmap.multiPartFeatures.length; i++) {
                latLngString = latLngString + '(' + this.gmap.multiPartFeatures[i] + '),';
            }
            latLngString = latLngString.slice(0, -1);

            multiPartWkt = 'MULTILINESTRING (' + latLngString + ')';
            this.mapIt(multiPartWkt);
            mapInfo.wkt = multiPartWkt;
            postProject(mapInfo, this.$http, this.gmap, this.$state);

        } else if (this.editType === 'multiPoly') {
            var latLngString = '';
            console.log(latLngString);
            console.log(this.gmap.multiPartFeatures);
            for (i = 0; i < this.gmap.multiPartFeatures.length; i++) {
                latLngString += this.gmap.multiPartFeatures[i] + ',';
                console.log(latLngString);
            }
            latLngString = latLngString.slice(0, -1);

            multiPartWkt = 'MULTIPOLYGON (' + latLngString + ')';
            console.log(multiPartWkt);
            mapInfo.wkt = multiPartWkt;
            postProject(mapInfo, this.$http, this.gmap, this.$state);

        } else if (this.editType === 'singlePoint') {
            console.log(this.gmap.multiPartFeatures[0]);
            var latLngString = '';
            latLngString = this.gmap.multiPartFeatures[0];
            console.log(latLngString);
            multiPartWkt = 'POINT (' + latLngString + ')';
            mapInfo.wkt = multiPartWkt;
            postProject(mapInfo, this.$http, this.gmap, this.$state);

        } else if (this.editType === 'singleLine') {
            // var latlngString = '';
            latLngString = this.gmap.multiPartFeatures[0];
            multiPartWkt = 'LINESTRING (' + latLngString + ')';
            console.log(multiPartWkt);
            mapInfo.wkt = multiPartWkt;
            postProject(mapInfo, this.$http, this.gmap, this.$state);

        } else if (this.editType === 'singlePoly') {
            // var latLngString = '';
            latLngString = this.gmap.multiPartFeatures[0];
            multiPartWkt = 'POLYGON ' + latLngString;
            console.log(multiPartWkt);
            mapInfo.wkt = multiPartWkt;
            postProject(mapInfo, this.$http, this.gmap, this.$state);

        }




        function postProject(mapInfo, $http, gmap, $state) {
            $http.post('/api/projects/map', mapInfo)
                .then(results => {
                    console.log(results);
                    var saveAndContinue_Btn = $('#saveAndContinue_Btn');
                    saveAndContinue_Btn.addClass('hidden');
                    var removeLastFeature_Btn = $('#removeLastFeature_Btn');
                    removeLastFeature_Btn.addClass('hidden');
                    gmap.multiPartFeatures = [];
                    // gmap.editRoute = false;
                    //Notification
                    $.notify({
                        // options
                        icon: 'glyphicon glyphicon-warning-sign',
                        message: '&nbsp;&nbsp;Project Saved '

                    }, {
                        type: "success",
                        allow_dismiss: true,
                        placement: {
                            from: "top",
                            align: "center"
                        },
                        offset: 20,
                        spacing: 10,
                        z_index: 1031,
                        delay: 5000,
                        timer: 1000,
                        animate: {
                            enter: 'animated fadeInDown',
                            exit: 'animated fadeOutUp'
                        },
                        icon_type: 'class'

                    });


                    gmap.routing = {};
                    gmap.routing.directionsService = new google.maps.DirectionsService;
                    gmap.routing.directionsDisplay = new google.maps.DirectionsRenderer({
                        draggable: true,
                        map: gmap

                    });
                    var directionsService = new google.maps.DirectionsService;
                    var directionsDisplay = new google.maps.DirectionsRenderer({
                        draggable: true,
                        map: gmap

                    });
                    gmap.newNetworkLine = null;
                    gmap.editRoute = false;

                    $state.reload();
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }

    generateID() {
        this.project.Id = uuid.v1();
    }

    resetMap() {
        this.$state.reload();
    }

    removeLastFeature() {
        this.gmap.features.pop();
        this.gmap.multiPartFeatures.pop();


        // this.gmap.directionsDisplay.setMap(null);
        // this.gmap.routing.directionsDisplay = null;

        this.gmap.routing.directionsDisplay.setMap(null);
        this.gmap.routing.directionsDisplay = new google.maps.DirectionsRenderer({
            draggable: true,
            map: this.gmap

        });

        this.gmap.newNetworkLine.setMap(null);
        this.toAddress = null;
        this.fromAddress = null;
        this.gmap.toAddress = null;
        this.gmap.fromAddress = null;

        $.notify({
            // options
            icon: 'glyphicon glyphicon-warning-sign',
            message: '&nbsp;&nbsp;Feature Removed '

        }, {
            type: "info",
            allow_dismiss: true,
            placement: {
                from: "top",
                align: "center"
            },
            offset: 20,
            spacing: 10,
            z_index: 1031,
            delay: 5000,
            timer: 1000,
            animate: {
                enter: 'animated fadeInDown',
                exit: 'animated fadeOutUp'
            },
            icon_type: 'class'

        });


    }

    test() {
        console.log('nice one');
    }

    addThing() {
        if (this.newThing) {
            this.$http.post('/api/things', {
                name: this.newThing
            });
            this.newThing = '';
        }
    }

    deleteThing(thing) {
        this.$http.delete(`/api/things/${thing._id}`);
    }

    saveAddNextNetworkRoute() {
        console.log(this.gmap);
        this.gmap.features.push(this.gmap.newNetworkLine);
        console.log(this.gmap.features);
        // console.log(this.gmap.directionsDisplay);
        this.gmap.routing.directionsDisplay.setMap(null);
        this.gmap.routing.directionsDisplay = new google.maps.DirectionsRenderer({
            draggable: true,
            map: this.gmap

        });

        this.gmap.multiPartFeatures.pop();
        this.gmap.multiPartFeatures.push(this.gmap.networkString);
        this.gmap.networkString = '';
        console.log(this.gmap.multiPartFeatures.length);
        this.toAddress = null;
        this.fromAddress = null;
        this.gmap.toAddress = null;
        this.gmap.fromAddress = null;
        this.gmap.editedRoute = false;

        $.notify({
            // options
            icon: 'glyphicon glyphicon-warning-sign',
            title: '&nbsp;&nbsp;Feature Added<br>',
            message: '&nbsp;&nbsp;&nbsp;Project has ' + this.gmap.multiPartFeatures.length + ' feature(s)'

        }, {
            type: "info",
            allow_dismiss: true,
            placement: {
                from: "top",
                align: "center"
            },
            offset: 20,
            spacing: 10,
            z_index: 1031,
            delay: 5000,
            timer: 1000,
            animate: {
                enter: 'animated fadeInDown',
                exit: 'animated fadeOutUp'
            },
            icon_type: 'class'

        });
        var gmap = this.gmap;
        gmap.routing = {};
        gmap.routing.directionsService = new google.maps.DirectionsService;
        gmap.routing.directionsDisplay = new google.maps.DirectionsRenderer({
            draggable: true,
            map: gmap

        });
        var directionsService = new google.maps.DirectionsService;
        var directionsDisplay = new google.maps.DirectionsRenderer({
            draggable: true,
            map: gmap

        });
        // gmap.newNetworkLine = null;
        gmap.editedRoute = false;

        //Directions changed event. Triggers when route is dragged/edited
        gmap.routing.directionsDisplay.addListener('directions_changed', function() {
            // computeEditedRoute(directionsDisplay.getDirections());
            console.log('you edited the route');
            console.log(gmap.editedRoute);
            computeEditedRoute(gmap.routing.directionsDisplay.getDirections(), gmap.editedRoute);

        });


        //Takes the generated route, adds it to multi-part array and calculates the wkt string
        function computeEditedRoute(result, editedRoute) {

            console.log(editedRoute);

            if (editedRoute) {
                gmap.multiPartFeatures.pop();
                console.log(result);
                console.log('re-calculated');
                var i = 0;
                var j = 0;
                //console.log(response);
                var pointsArray = result.routes[0].overview_path;
                var finalArray = [];

                //Create an array of Lat/Lngs from response overview_path
                for (j = 0; j < pointsArray.length; j++) {
                    finalArray[i] = pointsArray[j].lng() + ' ' + pointsArray[j].lat();
                    i++;

                }

                //Build WKT string from lat/lngs
                var lineString = '';
                for (var t = 0; t < finalArray.length; t++) {
                    lineString += finalArray[t] + ',';
                }

                //Remove final , and add closing )
                lineString = lineString.slice(0, -1);
                gmap.networkString = lineString;
                gmap.multiPartFeatures.push(gmap.networkString);
                // lineString = lineString + ')';

                //Remove last value from array and re-add the edited value
                // console.log(gmap.multiPartFeatures.length);
                // gmap.multiPartFeatures.pop();
                // console.log(gmap.multiPartFeatures.length);
                // gmap.multiPartFeatures.push(lineString.slice(11));
                // gmap.networkString = 
                // console.log(gmap.multiPartFeatures.length);
                console.log('added value from edit route event');

                var decodedPath = google.maps.geometry.encoding.decodePath(result.routes[0].overview_polyline);
                // var decodedLevels = decodeLevels("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB");
                // var newNetworkLine;
                gmap.newNetworkLine.setMap(null);
                gmap.newNetworkLine = null;
                gmap.newNetworkLine = new google.maps.Polyline({
                    path: decodedPath,
                    // levels: decodedLevels,
                    strokeColor: '#2196f3',
                    fillColor: '#2196f3',
                    fillOpacity: 0.6,
                    strokeWeight: 14,
                    map: gmap
                });


                //Set update parameters
                // $scope.routeFeatureWkt = lineString;
                // if ($scope.multiPartFeatures.length > 1) {
                //     $scope.routeFeatureWkt = $scope.multiPartWkt;
                // }
                // $scope.idPrefix = 'LN-';
                // $scope.shape = 'Line';
            }
        }






    }

    setToAddress() {
        // console.log(this.gmap);
        var gmap = this.gmap;
        console.log('seeting to address');
        gmap.setOptions({ draggableCursor: 'crosshair' });

        google.maps.event.addListener(gmap, 'click', function(event) {
            // alert("Latitude: " + event.latLng.lat() + " " + ", longitude: " + event.latLng.lng());
            var latlng = { lat: event.latLng.lat(), lng: event.latLng.lng() };
            var geocoder = new google.maps.Geocoder;
            geocoder.geocode({ 'location': latlng }, function(results, status) {
                if (status === 'OK') {
                    console.log(results);
                    if (results[0]) {
                        var toAddress = document.getElementById('toAddress');
                        toAddress.value = results[0].formatted_address;
                        // gmap.setZoom(11);
                        var marker = new google.maps.Marker({
                            position: latlng,
                            map: gmap
                        });
                        // infowindow.setContent(results[0].formatted_address);
                        // infowindow.open(map, marker);
                        google.maps.event.clearListeners(gmap, 'click');
                        gmap.setOptions({ draggableCursor: 'default' });

                    } else {
                        window.alert('No results found');
                        google.maps.event.clearListeners(gmap, 'click');
                        gmap.setOptions({ draggableCursor: 'default' });
                    }
                } else {
                    window.alert('Geocoder failed due to: ' + status);
                    google.maps.event.clearListeners(gmap, 'click');
                    gmap.setOptions({ draggableCursor: 'default' });
                }
            });
        });
        // console.log('testing');


    }

    setFromAddress() {
        var gmap = this.gmap;
        console.log('seeting to address');
        gmap.setOptions({ draggableCursor: 'crosshair' });
        google.maps.event.addListener(gmap, 'click', function(event) {

            // alert("Latitude: " + event.latLng.lat() + " " + ", longitude: " + event.latLng.lng());
            var latlng = { lat: event.latLng.lat(), lng: event.latLng.lng() };
            var geocoder = new google.maps.Geocoder;
            geocoder.geocode({ 'location': latlng }, function(results, status) {
                if (status === 'OK') {
                    console.log(results);
                    if (results[0]) {
                        var fromAddress = document.getElementById('fromAddress');
                        fromAddress.value = results[0].formatted_address;
                        // gmap.setZoom(11);
                        var marker = new google.maps.Marker({
                            position: latlng,
                            map: gmap
                        });
                        // infowindow.setContent(results[0].formatted_address);
                        // infowindow.open(map, marker);
                        google.maps.event.clearListeners(gmap, 'click');
                        gmap.setOptions({ draggableCursor: 'default' });
                    } else {
                        window.alert('No results found');
                        google.maps.event.clearListeners(gmap, 'click');
                        gmap.setOptions({ draggableCursor: 'default' });
                    }
                } else {
                    window.alert('Geocoder failed due to: ' + status);
                    google.maps.event.clearListeners(gmap, 'click');
                    gmap.setOptions({ draggableCursor: 'default' });
                }
            });
        });
    }

    deleteFeature(id) {
        console.log(id);
        this.$http.post('/api/projects/remove/' + id)
            .then(response => {
                console.log(response);
                //Alert message
                //Notification
                $.notify({
                    // options
                    icon: 'glyphicon glyphicon-warning-sign',
                    message: '&nbsp;&nbsp;Project successfully removed from database! '

                }, {
                    type: "success",
                    allow_dismiss: true,
                    placement: {
                        from: "top",
                        align: "center"
                    },
                    offset: 20,
                    spacing: 10,
                    z_index: 1031,
                    delay: 5000,
                    timer: 1000,
                    animate: {
                        enter: 'animated fadeInDown',
                        exit: 'animated fadeOutUp'
                    },
                    icon_type: 'class'

                });
                //Reload state
                this.$state.reload();
            })
            .catch(err => {
                console.log(err);
            });
    }

    calculateRoute() {
        var fromAddress = document.getElementById('fromAddress').value;
        var toAddress = document.getElementById('toAddress').value;

        console.log(fromAddress);
        console.log(toAddress);
        var gmap = this.gmap;
        var multiPartWkt;
        var routeFeatureWkt, idPrefix, shape;

        var saveAndContinue_Btn = $('#saveAndContinue_Btn');
        var removeLast = $('#removeLastFeature_Btn');
        saveAndContinue_Btn.removeClass('hidden');
        removeLast.removeClass('hidden');

        gmap.routing.directionsService.route({
            origin: fromAddress,
            destination: toAddress,
            travelMode: google.maps.TravelMode.DRIVING
        }, function(response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                gmap.routing.directionsDisplay.setDirections(response);
                // console.log(response);
                var i = 0;
                var j = 0;
                //console.log(response);
                var pointsArray = response.routes[0].overview_path;
                var finalArray = [];

                //Create an array of Lat/Lngs from response overview_path
                for (j = 0; j < pointsArray.length; j++) {
                    finalArray[i] = pointsArray[j].lng() + ' ' + pointsArray[j].lat();
                    i++;

                }

                console.log('changed');


                var decodedPath = google.maps.geometry.encoding.decodePath(response.routes[0].overview_polyline);
                // var decodedLevels = decodeLevels("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB");
                // var newNetworkLine;
                gmap.newNetworkLine = new google.maps.Polyline({
                    path: decodedPath,
                    // levels: decodedLevels,
                    strokeColor: '#2196f3',
                    fillColor: '#2196f3',
                    fillOpacity: 0.6,
                    strokeWeight: 14,
                    map: gmap
                });




                //Build WKT string from lat/lngs
                var networkString = 'LINESTRING (';
                networkString = '';
                for (var t = 0; t < finalArray.length; t++) {
                    networkString += finalArray[t] + ',';
                }

                //Remove final , and add closing )
                networkString = networkString.slice(0, -1);
                // lineString = lineString + ')';
                // console.log(networkString);
                gmap.networkString = networkString;

                gmap.multiPartFeatures.push(finalArray);
                // console.log(gmap.multiPartFeatures);
                // console.log('added value from click event');
                // //console.log(multiPartFeatures);
                var latLngString = '';
                for (i = 0; i < gmap.multiPartFeatures.length; i++) {
                    latLngString = latLngString + gmap.multiPartFeatures[i] + ',';
                    // //console.log(latLngString);
                }
                latLngString = latLngString.slice(0, -1);
                multiPartWkt = 'MULTILINESTRING (' + latLngString + ')';
                // console.log('the wkt');
                // console.log(multiPartWkt);
                gmap.featureLength = gmap.multiPartFeatures.length;
                // this.$apply();

                //Set update parameters
                routeFeatureWkt = networkString;
                if (gmap.multiPartFeatures.length > 1) {
                    routeFeatureWkt = multiPartWkt;
                }
                idPrefix = 'LN-';
                shape = 'Line';

                gmap.editedRoute = true;
                console.log(gmap.editedRoute, ' the edited route');

            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }

    mapIt(wktValue) {
        /**
         * Maps the current contents of the textarea.
         * @return  {Object}    Some sort of geometry object
         */

        var el, obj, wkt, i;

        // el = document.getElementById('wkt');
        wkt = new Wkt.Wkt();



        try { // Catch any malformed WKT strings
            wkt.read(wktValue);
        } catch (e1) {
            try {
                wkt.read(wktValue.replace('\n', '').replace('\r', '').replace('\t', ''));
            } catch (e2) {
                if (e2.name === 'WKTError') {
                    alert('Wicket could not understand the WKT string you entered. Check that you have parentheses balanced, and try removing tabs and newline characters.');
                    return;
                }
            }
        }

        obj = wkt.toObject(this.gmap.defaults); // Make an object

        // Add listeners for overlay editing events
        if (!Wkt.isArray(obj) && wkt.type !== 'point') {
            // New vertex is inserted
            google.maps.event.addListener(obj.getPath(), 'insert_at', function(n) {
                app.updateText();
            });
            // Existing vertex is removed (insertion is undone)
            google.maps.event.addListener(obj.getPath(), 'remove_at', function(n) {
                app.updateText();
            });
            // Existing vertex is moved (set elsewhere)
            google.maps.event.addListener(obj.getPath(), 'set_at', function(n) {
                app.updateText();
            });
        } else {
            if (obj.setEditable) { obj.setEditable(false); }
        }

        var bounds = new google.maps.LatLngBounds();

        if (Wkt.isArray(obj)) { // Distinguish multigeometries (Arrays) from objects
            for (i in obj) {
                if (obj.hasOwnProperty(i) && !Wkt.isArray(obj[i])) {
                    obj[i].setMap(this.gmap);
                    this.gmap.features.push(obj[i]);

                    if (wkt.type === 'point' || wkt.type === 'multipoint')
                        bounds.extend(obj[i].getPosition());
                    else
                        obj[i].getPath().forEach(function(element, index) { bounds.extend(element) });
                }
            }

            this.gmap.features = this.gmap.features.concat(obj);
        } else {
            obj.setMap(this.gmap); // Add it to the map
            this.gmap.features.push(obj);


            if (wkt.type === 'point' || wkt.type === 'multipoint')
                bounds.extend(obj.getPosition());
            else
                obj.getPath().forEach(function(element, index) { bounds.extend(element) });
        }

        // Pan the map to the feature
        this.gmap.fitBounds(bounds);

        return obj;

    }
}

export default angular.module('projectMapperApp.main', [uiRouter])
    .config(routing)
    .component('main', {
        template: require('./main.html'),
        controller: MainController
    })
    .name;