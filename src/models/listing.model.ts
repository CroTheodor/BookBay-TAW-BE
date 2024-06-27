import { Document, model, Model, Schema, SchemaTypes } from "mongoose";
import { BookDTO, bookSchema } from "./book-info.model";
import moment from "moment";

export interface ListingDTO extends Document{
    id: Schema.Types.ObjectId;
    postingUser: Schema.Types.ObjectId;
    book: BookDTO;
    minBid: number;
    auctionDuration: number;
    currentBid?: number;
    bidingUser?: Schema.Types.ObjectId;
    numberOfBids?: number;
    listingDate: Date;
    endDate: Date;
    listingCompleted?: boolean;
    paymentCompleted?: boolean;
    placeBid: (amount: number, bidingUser: string)=>boolean;
    isAuctionOver: ()=>boolean;
    setupDates: (auctionTime: number)=>void;
}

const listingSchema = new Schema<ListingDTO>({
    postingUser:{
        type: SchemaTypes.ObjectId,
        required: true,
        ref: "User"
    },
    book:{
        type: bookSchema,
        required: true
    },
    minBid:{
        type: SchemaTypes.Number,
        required:true
    },
    auctionDuration:{
        type: SchemaTypes.Number,
        required:true
    },
    currentBid:{
        type: SchemaTypes.Number,
        required:false,
        validate: {
            validator: function(v: number){
                return v > this.minBid;
            }
        }
    },
    bidingUser:{
        type: SchemaTypes.ObjectId,
        required:false,
    },
    numberOfBids:{
        type: SchemaTypes.Number,
        required: false,
    },
    listingDate:{
        type: SchemaTypes.Date,
        required: true
    },
    endDate:{
        type: SchemaTypes.Date,
        required: true,
    },
    listingCompleted:{
        type: SchemaTypes.Boolean,
        required:false
    },
    paymentCompleted: {
        type: SchemaTypes.Boolean,
        required:false
    }
})

// Using this method ensures the integrity of the information regarding a bid
listingSchema.methods.placeBid = function(amount: number, bidingUser: string){
    if(this.currentBid && this.currentBid >= amount)
        return false;
    this.currentBid = amount;
    this.bidingUser = bidingUser;
    this.numberOfBids = this.numberOfBids ? this.numberOfBids + 1 : 1;
    return true;
}

listingSchema.methods.isAuctionOver = function(){
    const now = moment();
    const end = moment(this.endDate);
    return now.isBefore(end);
}

listingSchema.methods.setupDates = function(duration: number){
    const today = moment();
    const endDate = moment(today).add(duration, "hours");
    console.log(today)
    console.log(endDate);
    this.listingDate = today;
    this.endDate = endDate
}

export function getSchema(){
    return listingSchema;
}

let listingModel: Model<ListingDTO>;

export function getModel(): Model<ListingDTO>{
    if(!listingModel){
        listingModel = model('Listing', getSchema());
    }
    return listingModel;
}

export function newListing( data: any ): ListingDTO {
    let _listingModel = getModel();
    let listing = new _listingModel(data);
    return listing;
}
