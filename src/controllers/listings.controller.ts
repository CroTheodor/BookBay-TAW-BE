import { Request, Response } from "express";
import * as listing from "../models/listing.model";
import { checkBodyRequest } from "../utility/helper-functions";
import { HttpResponse } from "../models/http-response.model";
import { Logger } from "../utility/logger";

const ListingModel = listing.getModel();

export const listingCreate = (req, res)=>{
    const missingField = checkBodyRequest(req.body, ["book","minBid","actionDuration"]);
    if(missingField){
        Logger.error(`${missingField} field is missing.`);
        return res.status(500).json(new HttpResponse(false, `${missingField} field is missing.`, null));
    }
    let newListing = listing.newListing(req.body);
    newListing.setupDates(newListing.auctionDuration);
    newListing.userId = req.auth.id;
    newListing.save().then(
        (l: listing.ListingDTO)=>res.status(200).json(new HttpResponse(true, "Listing created: "+l.id, l))
    ).catch(()=>res.status(500).json(new HttpResponse(false, "DB error", null)))
}
