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

        var map;

        function initMap() {
            map = new google.maps.Map(document.getElementById('canvas'), {
                center: { lat: -34.397, lng: 150.644 },
                zoom: 8
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