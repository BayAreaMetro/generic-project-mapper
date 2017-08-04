import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

export class MainController {

    awesomeThings = [];
    newThing = '';

    /*@ngInject*/
    constructor($http, Auth) {
        this.$http = $http;
        this.isLoggedIn = Auth.isLoggedInSync;
        this.isAdmin = Auth.isAdminSync;
        this.getCurrentUser = Auth.getCurrentUserSync;
    }

    $onInit() {
        this.$http.get('/api/things')
            .then(response => {
                this.awesomeThings = response.data;

            });

        var gmap;

        function initMap() {
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
            this.onChange = function() {
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

                        this.multiPartFeatures.push(lineString.slice(11));
                        console.log('added value from click event');
                        // //console.log(this.multiPartFeatures);
                        var latLngString = '';
                        for (i = 0; i < this.multiPartFeatures.length; i++) {
                            latLngString = latLngString + this.multiPartFeatures[i] + ',';
                            // //console.log(latLngString);
                        }
                        latLngString = latLngString.slice(0, -1);
                        this.multiPartWkt = 'MULTILINESTRING (' + latLngString + ')';
                        // //console.log(this.multiPartWkt);
                        this.featureLength = this.multiPartFeatures.length;
                        this.$apply();

                        //Set update parameters
                        this.routeFeatureWkt = lineString;
                        if (this.multiPartFeatures.length > 1) {
                            this.routeFeatureWkt = this.multiPartWkt;
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
                $scope.clearMap();

                // Set the drawing mode to "pan" (the hand) so users can immediately edit
                this.setDrawingMode(null);

                //Set shape type to update FMS and prefix for MapId
                if (event.type === google.maps.drawing.OverlayType.POLYGON) {
                    $scope.shape = 'Polygon';
                    $scope.idPrefix = 'PY-';
                } else if (event.type === google.maps.drawing.OverlayType.POLYLINE) {
                    $scope.shape = 'Line';
                    $scope.idPrefix = 'LN-';
                } else if (event.type === google.maps.drawing.OverlayType.MARKER) {
                    $scope.shape = 'Point';
                    $scope.idPrefix = 'PT-';

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

                //Create wkt object and add currently drawn feature
                wkt = new Wkt.Wkt();
                wkt.fromObject(event.overlay);

                //Set variable to hold original wkt feature
                $scope.previousSelectedWkt = $scope.selectedWkt;
                $scope.selectedWkt = wkt.toString();

                var latLngs;
                var latLngString;
                var i;

                //Add to multi-part if necessary
                if ($scope.shape === 'Point') {
                    latLngs = $scope.selectedWkt.slice(6);
                    latLngs = latLngs.slice(0, -1);
                    $scope.multiPartFeatures.push(latLngs);
                    latLngString = '';
                    for (i = 0; i < $scope.multiPartFeatures.length; i++) {
                        latLngString = latLngString + $scope.multiPartFeatures[i] + ',';
                    }
                    latLngString = latLngString.slice(0, -1);

                    $scope.multiPartWkt = 'MULTIPOINT (' + latLngString + ')';
                    $scope.featureLength = $scope.multiPartFeatures.length;
                    $scope.$apply();
                    if ($scope.multiPartFeatures.length > 1) {
                        $scope.selectedWkt = $scope.multiPartWkt;
                    }
                } else if ($scope.shape === 'Line') {
                    latLngs = $scope.selectedWkt.slice(10);
                    $scope.multiPartFeatures.push(latLngs);
                    latLngString = '';
                    for (i = 0; i < $scope.multiPartFeatures.length; i++) {
                        latLngString = latLngString + $scope.multiPartFeatures[i] + ',';
                    }
                    latLngString = latLngString.slice(0, -1);
                    $scope.multiPartWkt = 'MULTILINESTRING (' + latLngString + ')';
                    $scope.featureLength = $scope.multiPartFeatures.length;
                    $scope.$apply();

                    if ($scope.multiPartFeatures.length > 1) {
                        $scope.selectedWkt = $scope.multiPartWkt;
                    }
                } else if ($scope.shape === 'Polygon') {
                    latLngs = $scope.selectedWkt.slice(7);
                    $scope.multiPartFeatures.push(latLngs);
                    latLngString = '';
                    for (i = 0; i < $scope.multiPartFeatures.length; i++) {
                        latLngString = latLngString + $scope.multiPartFeatures[i] + ',';
                    }
                    latLngString = latLngString.slice(0, -1);
                    $scope.multiPartWkt = 'MULTIPOLYGON (' + latLngString + ')';
                    $scope.featureLength = $scope.multiPartFeatures.length;
                    $scope.$apply();
                    if ($scope.multiPartFeatures.length > 1) {
                        $scope.selectedWkt = $scope.multiPartWkt;
                    }
                }


            });

        }

        initMap();
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