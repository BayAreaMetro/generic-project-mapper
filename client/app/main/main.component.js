import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

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

    }

    $onInit() {
        // console.log(this.multiPartFeatures);
        this.$http.get('/api/things')
            .then(response => {
                this.awesomeThings = response.data;

            });

        var gmap;

        function initMap(multiPartFeatures) {
            var features = [];
            var multiPartWkt;

            /**
             * GOOGLE MAPS DIRECTIONS
             * 
             */
            var directionsService = new google.maps.DirectionsService;
            var directionsDisplay = new google.maps.DirectionsRenderer({
                draggable: true,
                map: gmap

            });

            gmap = new google.maps.Map(document.getElementById('canvas'), {
                center: new google.maps.LatLng(37.796966, -122.275051),
                defaults: {
                    //icon: '/assets/images/GenericBlueStop16.png',
                    //shadow: 'dot_shadow.png',                    
                    editable: false,
                    strokeColor: '#2196f3',
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
            var wrappedQueryResult = document.getElementById('pac-input');

            // Create the search box and link it to the UI element.
            var searchBox = new google.maps.places.SearchBox(wrappedQueryResult);
            gmap.controls[google.maps.ControlPosition.TOP_LEFT].push(wrappedQueryResult);

            // Bias the SearchBox results towards current map's viewport.
            gmap.addListener('bounds_changed', function() {
                searchBox.setBounds(gmap.getBounds());
            });

            var markers = [];
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

            // GOOGLE ROUTING
            //Calculate route on input change
            var onChange = function() {
                // //console.log('changed');
                this.routeFeature = true;
                calculateAndDisplayRoute(directionsService, directionsDisplay);
            };

            /**
             * [calculateAndDisplayRoute description]
             * @param  {[type]} directionsService [google parameter]
             * @param  {[type]} directionsDisplay [google parameter]
             * @param  {[type]} directions [start and end values]
             * 
             */
            function calculateAndDisplayRoute(directionsService, directionsDisplay) {
                directionsService.route({
                    origin: this.directions.start,
                    destination: this.directions.end,
                    travelMode: google.maps.TravelMode.DRIVING
                }, function(response, status) {
                    if (status === google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);

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

                        //Build WKT string from lat/lngs
                        var lineString = 'LINESTRING (';
                        for (var t = 0; t < finalArray.length; t++) {
                            lineString += finalArray[t] + ',';
                        }

                        //Remove final , and add closing )
                        lineString = lineString.slice(0, -1);
                        lineString = lineString + ')';

                        multiPartFeatures.push(lineString.slice(11));
                        console.log('added value from click event');
                        // //console.log(multiPartFeatures);
                        var latLngString = '';
                        for (i = 0; i < multiPartFeatures.length; i++) {
                            latLngString = latLngString + multiPartFeatures[i] + ',';
                            // //console.log(latLngString);
                        }
                        latLngString = latLngString.slice(0, -1);
                        multiPartWkt = 'MULTILINESTRING (' + latLngString + ')';
                        // //console.log(multiPartWkt);
                        this.featureLength = multiPartFeatures.length;
                        // this.$apply();

                        //Set update parameters
                        this.routeFeatureWkt = lineString;
                        if (multiPartFeatures.length > 1) {
                            this.routeFeatureWkt = multiPartWkt;
                        }
                        this.idPrefix = 'LN-';
                        this.shape = 'Line';

                        this.editedRoute = true;

                    } else {
                        window.alert('Directions request failed due to ' + status);
                    }
                });
            }

            //END GOOGLE ROUTING

            //Google maps drawing overlay complete event
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

                features.push(event.overlay);
                console.log(features);

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
                    multiPartFeatures.push(latLngs);
                    latLngString = '';
                    for (i = 0; i < multiPartFeatures.length; i++) {
                        latLngString = latLngString + multiPartFeatures[i] + ',';
                    }
                    latLngString = latLngString.slice(0, -1);

                    multiPartWkt = 'MULTIPOINT (' + latLngString + ')';
                    this.featureLength = multiPartFeatures.length;
                    // this.$apply();
                    if (multiPartFeatures.length > 1) {
                        this.selectedWkt = multiPartWkt;
                    }

                } else if (this.shape === 'Line') {
                    latLngs = this.selectedWkt.slice(10);
                    multiPartFeatures.push(latLngs);
                    latLngString = '';
                    for (i = 0; i < multiPartFeatures.length; i++) {
                        latLngString = latLngString + multiPartFeatures[i] + ',';
                    }
                    latLngString = latLngString.slice(0, -1);
                    multiPartWkt = 'MULTILINESTRING (' + latLngString + ')';
                    this.featureLength = multiPartFeatures.length;
                    // this.$apply();

                    if (multiPartFeatures.length > 1) {
                        this.selectedWkt = multiPartWkt;
                    }
                } else if (this.shape === 'Polygon') {
                    latLngs = this.selectedWkt.slice(7);
                    multiPartFeatures.push(latLngs);
                    latLngString = '';
                    for (i = 0; i < multiPartFeatures.length; i++) {
                        latLngString = latLngString + multiPartFeatures[i] + ',';
                    }
                    latLngString = latLngString.slice(0, -1);
                    multiPartWkt = 'MULTIPOLYGON (' + latLngString + ')';
                    this.featureLength = multiPartFeatures.length;
                    // this.$apply();
                    if (this.multiPartFeatures.length > 1) {
                        this.selectedWkt = multiPartWkt;
                    }
                }
                this.multiPartFeatures = multiPartFeatures;
                this.multiPartWkt = multiPartWkt;

                console.log(this.multiPartWkt);
                console.log(this.multiPartFeatures);

            });

        }

        initMap(this.multiPartFeatures);
    }

    setEditType(editType) {
        this.editType = editType;
        console.log(this.editType);
    }

    saveFeatures() {
        console.log(this.editType);
        console.log(this.multiPartFeatures);

        //Add to multi-part if necessary
        if (this.editType === 'multiPoint') {

            var latLngString = '';
            for (var i = 0; i < this.multiPartFeatures.length; i++) {
                latLngString = latLngString + this.multiPartFeatures[i] + ',';
            }
            latLngString = latLngString.slice(0, -1);

            var multiPartWkt = 'MULTIPOINT (' + latLngString + ')';
            console.log(multiPartWkt);


        }
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
}

export default angular.module('projectMapperApp.main', [uiRouter])
    .config(routing)
    .component('main', {
        template: require('./main.html'),
        controller: MainController
    })
    .name;