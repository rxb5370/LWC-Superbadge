// imports
import {LightningElement, wire, api, track} from 'lwc';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';
export default class BoatsNearMe extends LightningElement {
    @api boatTypeId;
    @api mapMarkers = [];
    isLoading = true;
    isRendered;
    @track latitude;
    @track longitude;
  
    // Add the wired method from the Apex Class
    // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
    // Handle the result and calls createMapMarkers
    @wire(getBoatsByLocation, {latitude: '$latitude', longitude: '$longitude', boatTypeId: '$boatTypeId'})
    wiredBoatsJSON({error, data}) { 
        if (data) {
            this.createMapMarkers(JSON.parse(data));
        } else if(error) {
            this.isLoading = false;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: error,
                    variant: ERROR_VARIANT
                })
            );
        }
    }

    // Controls the isRendered property
    // Calls getLocationFromBrowser()
    renderedCallback() { 
        if (this.isRendered) {
            return;
        }
        this.getLocationFromBrowser();
        this.isRendered = true;
    }

    // Gets the location from the Browser
    // position => {latitude and longitude}
    getLocationFromBrowser() { 
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                                                        this.latitude = position.coords.latitude;
                                                        this.longitude = position.coords.longitude;
                                                    });
            } else { 
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: ERROR_TITLE,
                        message: 'Geolocation is not supported by this browser',
                        variant: ERROR_VARIANT
                    })
                );
            }
    }
  
    // Creates the map markers
    createMapMarkers(boatData) {
        const newMarkers = boatData.map(boat => {
            return {
                title: boat.Name,
                location: {
                    Longitude: boat.Geolocation__Longitude__s,
                    Latitude: boat.Geolocation__Latitude__s,
                }
            }
        });
        newMarkers.unshift({
            title: LABEL_YOU_ARE_HERE, 
            icon: ICON_STANDARD_USER,
            location: {
                Latitude: this.latitude, 
                Longitude: this.longitude
            } 
        });
        this.mapMarkers = newMarkers;
        this.isLoading = false;
    }
}