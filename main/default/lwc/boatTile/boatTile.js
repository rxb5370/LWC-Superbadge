import { LightningElement, api } from 'lwc';
import { getSObjectValue } from '@salesforce/apex';

import NAME_FIELD from '@salesforce/schema/Boat__c.Name';
import OWNER_FIELD from '@salesforce/schema/Boat__c.contact__r.Name';
import PRICE_FIELD from '@salesforce/schema/Boat__c.price__c';
import LENGTH_FIELD from '@salesforce/schema/Boat__c.length__c';
import TYPE_FIELD from '@salesforce/schema/Boat__c.boattype__r.Name';

// imports
const TILE_WRAPPER_SELECTED_CLASS = 'tile-wrapper selected';
const TILE_WRAPPER_UNSELECTED_CLASS = 'tile-wrapper';
export default class BoatTile extends LightningElement {
    @api boat;
    @api selectedBoatId;
    
    // Getter for dynamically setting the background image for the picture
    get backgroundStyle() { 
        return 'background-image:url(' + this.boat.Picture__c + ')';
    }
    
    // Getter for dynamically setting the tile class based on whether the
    // current boat is selected
    get tileClass() {
        if (this.selectedBoatId == this.boat.Id) {
            return  TILE_WRAPPER_SELECTED_CLASS;
        }
        return TILE_WRAPPER_UNSELECTED_CLASS;
     }
    
    // Fires event with the Id of the boat that has been selected.
    selectBoat() {
        const boatSelect = new CustomEvent('boatselect', {detail: {boatId: this.boat.Id}});
        this.dispatchEvent(boatSelect);
     }

    get name() {
        return this.boat ? getSObjectValue(this.boat, NAME_FIELD) : '';
    }
    
    get owner() {
        return this.boat ? getSObjectValue(this.boat, OWNER_FIELD) : '';
    }
    
    get price() {
        return this.boat ? getSObjectValue(this.boat, PRICE_FIELD) : '';
    }

    get length() {
        return this.boat ? getSObjectValue(this.boat, LENGTH_FIELD) : '';
    }

    get type() {
        return this.boat ? getSObjectValue(this.boat, TYPE_FIELD) : '';
    }
  }
  