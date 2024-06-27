import { model, Model, Schema, SchemaTypes } from "mongoose";
import { BookDTO, bookSchema } from "./book-info.model";

export interface ListingDTO{
    id: Schema.Types.ObjectId;
    userId: Schema.Types.ObjectId;
    book: BookDTO;
    minBid: number;
    currentBid?: number;
    biderId?: Schema.Types.ObjectId;
    listingDate: Date;
}

const listingSchema = new Schema<ListingDTO>({
    userId:{
        type: SchemaTypes.ObjectId,
        required: true
    },
    book:{
        type: bookSchema,
        required: true
    },
    minBid:{
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
    biderId:{
        type: SchemaTypes.ObjectId,
        required:false
    },
    listingDate:{
        type: SchemaTypes.Date,
        required: true
    }
})

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
