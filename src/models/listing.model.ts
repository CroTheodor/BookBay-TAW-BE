import { Schema, SchemaType, SchemaTypes } from "mongoose";
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
            validator: function(v){
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
