import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';
import uuid from 'uuid';

export class MainController {

    awesomeThings = [];
    newThing = '';


    /*@ngInject*/
    constructor($http, Auth, $scope) {
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
        this.editType;
        this.$scope = $scope;
        this.multiPartFeatures = [];
        this.selectedWkt;
        this.multiPartWkt;
        this.projectId = '';
        this.project = {};
        // this.uuid = uuid;

    }

    $onInit() {
        // console.log(this.multiPartFeatures);
        this.$http.get('/api/things')
            .then(response => {
                this.awesomeThings = response.data;

            });

        var gmap;
        // gmap.multiPartFeatures = [];

        this.initMap = function() {


            var multiPartWkt;
            var routeFeature = false;
            var fromAddress;
            var toAddress;
            var marker1, marker2;

            gmap = new google.maps.Map(document.getElementById('canvas'), {
                center: new google.maps.LatLng(37.796966, -122.275051),
                defaults: {
                    //icon: '/assets/images/GenericBlueStop16.png',
                    //shadow: 'dot_shadow.png',                    
                    editable: false,
                    strokeColor: 'red',
                    fillColor: '#2196f3',
                    fillOpacity: 0.6,
                    strokeWeight: 14

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


            //Directions changed event. Triggers when route is dragged/edited
            gmap.routing.directionsDisplay.addListener('directions_changed', function() {
                // computeEditedRoute(directionsDisplay.getDirections());
                console.log(gmap.editedRoute);
                computeEditedRoute(gmap.routing.directionsDisplay.getDirections(), gmap.editedRoute);

            });

            //Takes the generated route, adds it to multi-part array and calculates the wkt string
            function computeEditedRoute(result, editedRoute) {


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
                    drawingModes: [
                        google.maps.drawing.OverlayType.MARKER,
                        google.maps.drawing.OverlayType.POLYLINE,
                        google.maps.drawing.OverlayType.POLYGON
                    ]
                },
                markerOptions: gmap.defaults,
                polygonOptions: gmap.defaults,
                polylineOptions: gmap.defaults,
                rectangleOptions: gmap.defaults
            });
            gmap.drawingManager.setMap(gmap);
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
            var fromAddress = document.getElementById('fromAddress');
            var toAddress = document.getElementById('toAddress');

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
                marker1.setVisible(false);
                marker2.setVisible(false);

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
                        var networkString = '';
                        for (var t = 0; t < finalArray.length; t++) {
                            networkString += finalArray[t] + ',';
                        }

                        //Remove final , and add closing )
                        networkString = networkString.slice(0, -1);
                        // lineString = lineString + ')';
                        console.log(networkString);
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
                        console.log('the wkt');
                        console.log(multiPartWkt);
                        gmap.featureLength = gmap.multiPartFeatures.length;
                        // this.$apply();

                        //Set update parameters
                        this.routeFeatureWkt = networkString;
                        if (gmap.multiPartFeatures.length > 1) {
                            this.routeFeatureWkt = multiPartWkt;
                        }
                        this.idPrefix = 'LN-';
                        this.shape = 'Line';

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

        }

        this.gmap = this.initMap();
    }

    setEditType(editType) {
        this.editType = editType;
        console.log(this.editType);
        this.gmap.editType = editType;
        // console.log(this.gmap);
    }

    saveFeatures() {
        // console.log(document.getElementById('toAddress').value);
        // console.log(document.getElementById('toAddress').value);
        console.log(this.gmap);
        //Add to multi-part if necessary
        if (this.editType === 'multiPoint') {

            var latLngString = '';
            for (var i = 0; i < this.gmap.multiPartFeatures.length; i++) {
                latLngString = latLngString + this.gmap.multiPartFeatures[i] + ',';
            }
            latLngString = latLngString.slice(0, -1);

            var multiPartWkt = 'MULTIPOINT (' + latLngString + ')';
            // console.log(multiPartWkt);


        } else if (this.editType === 'multiLine') {
            var latLngString = '';
            for (var i = 0; i < this.gmap.multiPartFeatures.length; i++) {
                latLngString = latLngString + '(' + this.gmap.multiPartFeatures[i] + '),';
            }
            latLngString = latLngString.slice(0, -1);

            var multiPartWkt = 'MULTILINESTRING (' + latLngString + ')';
            this.mapIt(multiPartWkt);
            // console.log(multiPartWkt);

        } else if (this.editType === 'multiPolygon') {
            var latLngString = '';
            for (var i = 0; i < this.gmap.multiPartFeatures.length; i++) {
                latLngString = latLngString + this.gmap.multiPartFeatures[i] + ',';
            }
            latLngString = latLngString.slice(0, -1);

            var multiPartWkt = 'MULTIPOLYGON (' + latLngString + ')';
            // console.log(multiPartWkt);

        } else if (this.editType === 'singlePoint') {
            var latLngString = '';
            for (var i = 0; i < this.gmap.multiPartFeatures.length; i++) {
                latLngString = latLngString + this.gmap.multiPartFeatures[i] + ',';
            }
            latLngString = latLngString.slice(0, -1);

            var multiPartWkt = 'POINT (' + latLngString + ')';
            // console.log(multiPartWkt);

        } else if (this.editType === 'singleLine') {
            var latLngString = '';
            for (var i = 0; i < this.gmap.multiPartFeatures.length; i++) {
                latLngString = latLngString + this.gmap.multiPartFeatures[i] + ',';
            }
            latLngString = latLngString.slice(0, -1);

            var multiPartWkt = 'LINESTRING (' + latLngString + ')';
            // console.log(multiPartWkt);

        } else if (this.editType === 'singlePolygon') {
            var latLngString = '';
            for (var i = 0; i < this.gmap.multiPartFeatures.length; i++) {
                latLngString = latLngString + this.gmap.multiPartFeatures[i] + ',';
            }
            latLngString = latLngString.slice(0, -1);

            var multiPartWkt = 'POLYGON (' + latLngString + ')';
            // console.log(multiPartWkt);

        }

        var mapInfo = {
            name: this.project.name,
            Id: this.project.Id,
            wkt: multiPartWkt
        }
        console.log(mapInfo);
        this.$http.post('/api/projects/map', mapInfo)
            .then(results => {
                console.log(results);
                this.initMap();
            })
            .catch(err => {
                console.log(err);
            });
    }

    generateID() {
        console.log(uuid.v1());
        console.log('clicked');
        this.project.Id = uuid.v1();

    }

    resetMap() {
        for (var i in this.gmap.features) {
            if (this.gmap.features.hasOwnProperty(i)) {
                this.gmap.features[i].setMap(null);
            }
        }
        this.gmap.features.length = 0;
        this.gmap.multiPartFeatures = [];
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


        this.gmap.multiPartFeatures.push(this.gmap.networkString);
        this.gmap.networkString = '';
        console.log(this.gmap.multiPartFeatures.length);
        this.toAddress = null;
        this.fromAddress = null;
        this.gmap.toAddress = null;
        this.gmap.fromAddress = null;

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