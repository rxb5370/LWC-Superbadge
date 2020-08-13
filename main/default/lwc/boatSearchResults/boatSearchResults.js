import { LightningElement, api, wire, track } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import BOAT_NAME from '@salesforce/schema/Boat__c.Name';
import BOAT_TYPE from '@salesforce/schema/Boat__c.BoatType__c';
import BOAT_LENGTH from '@salesforce/schema/Boat__c.Length__c';
import BOAT_PICTURE from '@salesforce/schema/Boat__c.Picture__c';
import BOAT_PRICE from '@salesforce/schema/Boat__c.Price__c';
import getBoats from '@salesforce/apex/BoatDataService.getBoats'
import { publish, MessageContext } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

const FIELDS = [BOAT_NAME, BOAT_TYPE, BOAT_LENGTH, BOAT_PICTURE, BOAT_PRICE];

const SUCCESS_VARIANT = 'success';
const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship It!';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';

export default class BoatSearchResults extends LightningElement {
    // public method called from boatSearch parent
    @track boats;
    wiredResult;
    boatTypeId = '';
    @track draftValues = [];
    selectedBoatId = '';
    error;
    isLoading = false;
    columns = [
        { label: 'Name', fieldName: 'Name', type: 'text', editable: 'true'  },
        { label: 'Length', fieldName: 'Length__c', type: 'number', editable: 'true' },
        { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: 'true' },
        { label: 'Description', fieldName: 'Description__c', type: 'text', editable: 'true' }
    ];
    @wire(MessageContext) messageContext;

    @api
    searchBoats(typeId) {
        //this.isLoading = true;
        //this.notifyLoading(true);
        this.boatTypeId = typeId;
    }

    @wire(getBoats, {boatTypeId: '$boatTypeId'})
    wiredBoats(result) {
        this.boats = result;
        if (result.error) {
            this.boats = undefined;
            this.error = 'Unknown error';
            if (Array.isArray(error.body)) {
                this.error = error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                this.error = error.body.message;
            }
        }
        this.isLoading = false;
        this.notifyLoading(this.isLoading);
    }

    @api
    async refresh() {
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        await refreshApex(this.boats);
        this.isLoading = false;
        this.notifyLoading(this.isLoading);
    }

    updateSelectedTile(event) {
        this.selectedBoatId = event.detail.boatId;
        this.sendMessageService(this.selectedBoatId);
    }

    sendMessageService(boatId) { 
        const payload = {recordId: boatId};
        publish(this.messageContext, BOATMC, payload);
    }

    handleSave(event) {
        this.notifyLoading(true);
        const recordInputs = event.detail.draftValues.slice().map(draft=>{
            const fields = Object.assign({}, draft);
            return {fields};
        });

        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: SUCCESS_TITLE,
                    message: MESSAGE_SHIP_IT,
                    variant: SUCCESS_VARIANT
                })
            );
            this.draftValues = [];
            return this.refresh();
        }).catch(error => {
            this.error = error;
            this.dispatchEvent(
                    new ShowToastEvent({
                        title: ERROR_TITLE,
                        message: 'Contact System Admin!',
                        variant: ERROR_VARIANT
                    })
                );
                this.notifyLoading(false);
        }).finally(() => {
                this.draftValues = [];
            });
    }

    notifyLoading(isLoading) {
        // dispatch doneLoading or loading events based on the status of isLoading
        // this.isLoading = isLoading;
        if (isLoading) {
            const loading = new CustomEvent("loading");
            this.dispatchEvent(loading);
        } else {
            const doneLoading = new CustomEvent("doneloading");
            this.dispatchEvent(doneLoading);
        }
    }
}