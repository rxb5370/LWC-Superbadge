import { LightningElement, api, wire, track } from 'lwc';
// import BOATMC from the message channel
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
// Declare the const LONGITUDE_FIELD for the boat's Longitude__s
import { getRecord } from 'lightning/uiRecordApi';
import {
  subscribe,
  unsubscribe,
  APPLICATION_SCOPE,
  MessageContext
} from 'lightning/messageService';
// Declare the const BOAT_FIELDS as a list of [LONGITUDE_FIELD, LATITUDE_FIELD];
const LONGITUDE_FIELD = 'Boat__c.Geolocation__Longitude__s';
const LATITUDE_FIELD = 'Boat__c.Geolocation__Latitude__s';
const BOAT_FIELDS = [LONGITUDE_FIELD, LATITUDE_FIELD];
export default class BoatMap extends LightningElement {
  // private
  subscription = null;
  @track boatId;

  // Getter and Setter to allow for logic to run on recordId change
  // this getter must be public
  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.setAttribute('boatId', value);
    this.boatId = value;
  }

  //public
  @api error = undefined;
  @api mapMarkers = [];
  // Initialize messageContext for Message Service
  @wire(MessageContext)
    messageContext;

  // Getting record's location to construct map markers using recordId
  // Wire the getRecord method using ('$boatId')
  @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS})
  wiredRecord({error, data}) {
    // Error handling
    if (data) {
      this.error = undefined;
      const longitude = data.fields.Geolocation__Longitude__s.value;
      const latitude = data.fields.Geolocation__Latitude__s.value;
      this.updateMap(longitude, latitude);
    } else if (error) {
      this.error = error;
      this.boatId = undefined;
      this.mapMarkers = [];
    }
  }

  // Subscribe to the message channel
  subscribeMC() {
    // local boatId must receive the recordId from the message
    // Subscribe to the message channel to retrieve the recordID and assign it to boatId.
    this.subscription = subscribe(
      this.messageContext, 
      BOATMC, 
      (message) => this.boatId = message.recordId, 
      {scope: APPLICATION_SCOPE}
    );
  }

  // Runs when component is connected, subscribes to BoatMC
  connectedCallback() {
    // recordId is populated on Record Pages, and this component
    // should not update when this component is on a record page.
    if (this.subscription || this.recordId) {
      return;
    }

    this.subscribeMC();
  }

  disconnectedCallback() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  // Creates the map markers array with the current boat's location for the map.
  updateMap(Longitude, Latitude) {
    this.mapMarkers = [{
      location: {
          Latitude: Latitude,
          Longitude: Longitude
      }
    }];
  }

  // Getter method for displaying the map component, or a helper method.
  @api
  get showMap() {
    return this.mapMarkers.length > 0;
  }
}