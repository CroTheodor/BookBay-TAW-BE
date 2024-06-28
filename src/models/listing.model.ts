import { Document, model, Model, Schema, SchemaTypes } from "mongoose";
import { BookDTO, bookSchema } from "./book-info.model";
import moment from "moment";

export interface ListingDTO extends Document {
    id: Schema.Types.ObjectId;
    postingUser: Schema.Types.ObjectId;
    book: BookDTO;
    minBid: number;
    auctionDuration: number;
    currentBid?: number;
    bidingUser?: Schema.Types.ObjectId;
    bids?: BidDTO[];
    listingDate: Date;
    endDate: Date;
    listingCompleted?: boolean;
    paymentCompleted?: boolean;
    placeBid: (amount: number, bidingUser: string) => boolean;
    isAuctionOver: () => boolean;
    setupDates: (auctionTime: number) => void;
}

export interface BidDTO {
    amount: number;
    biderId: Schema.Types.ObjectId;
    date: Date;
}

const bidSchema = new Schema<BidDTO>({
    amount: { type: SchemaTypes.Number, required: true },
    biderId: { type: SchemaTypes.ObjectId, required: true },
    date: { type: SchemaTypes.Date, required: true }
})

const listingSchema = new Schema<ListingDTO>({
    postingUser: {
        type: SchemaTypes.ObjectId,
        required: true,
        ref: "User"
    },
    book: {
        type: bookSchema,
        required: true
    },
    minBid: {
        type: SchemaTypes.Number,
        required: true
    },
    auctionDuration: {
        type: SchemaTypes.Number,
        required: true
    },
    currentBid: {
        type: SchemaTypes.Number,
        required: false,
    },
    bidingUser: {
        type: SchemaTypes.ObjectId,
        required: false,
        ref: "User",
        validate: {
            validator: function(v: Schema.Types.ObjectId) {
                return this.postingUser !== v;
            }
        }
    },
    bids: {
        type: [bidSchema],
        required: false,
    },
    listingDate: {
        type: SchemaTypes.Date,
        required: true
    },
    endDate: {
        type: SchemaTypes.Date,
        required: true,
    },
    listingCompleted: {
        type: SchemaTypes.Boolean,
        required: false
    },
    paymentCompleted: {
        type: SchemaTypes.Boolean,
        required: false
    }
})

// Using this method ensures the integrity of the information regarding a bid
listingSchema.methods.placeBid = function(amount: number, bidingUser: string) {
    if (this.currentBid && this.currentBid >= amount)
        return false;
    this.currentBid = amount;
    this.bidingUser = bidingUser;
    if (!this.bids) {
        this.bids = [];
    }
    this.bids.push({ amount: amount, biderId: bidingUser, date: moment().toDate() })
    return true;
}

listingSchema.methods.isAuctionOver = function() {
    const now = moment();
    const end = moment(this.endDate);
    return now.isBefore(end);
}

listingSchema.methods.setupDates = function(duration: number) {
    const today = moment();
    const endDate = moment(today).add(duration, "hours");
    this.listingDate = today;
    this.endDate = endDate
}

export function getSchema() {
    return listingSchema;
}

let listingModel: Model<ListingDTO>;

export function getModel(): Model<ListingDTO> {
    if (!listingModel) {
        listingModel = model('Listing', getSchema());
    }
    return listingModel;
}

export function newListing(data: any): ListingDTO {
    let _listingModel = getModel();
    let listing = new _listingModel(data);
    return listing;
}
