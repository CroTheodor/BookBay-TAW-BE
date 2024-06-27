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
    newListing.postingUser = req.auth.id;
    newListing.save().then(
        (l: listing.ListingDTO)=>res.status(200).json(new HttpResponse(true, "Listing created: "+l.id, l))
    ).catch(()=>res.status(500).json(new HttpResponse(false, "DB error", null)))
}

export const listingGetAll = async (req,res)=>{

    const titleFilter = req.query.title;
    const authorFilter = req.query.author;
    const publisherFilter = req.query.publisher;
    const courseFilter = req.query.course;

    let filter = {};

    if(titleFilter){
        filter = {...filter, "title":req.query.title};
    }

    if(authorFilter){
        filter = {...filter, "author":req.query.author};
    }

    if(publisherFilter){
        filter = {...filter, "publisher":req.query.publisher}
    }

    if(courseFilter){
        filter = {...filter, "course":req.query.course};
    }

    const page = req.query.page;
    const pageNumber = page ? Number.parseInt(page) : 1;
    const limit = page ? req.query.limit : 50000;
    const numberOfDocuments = await ListingModel.countDocuments().exec();
    const totalPages = numberOfDocuments / limit;

    ListingModel.find(filter)
            .limit(limit)
            .skip(pageNumber - 1)
            .sort({listingDate: -1})
            .populate("postingUser")
            .populate("bidingUser")
            .then(
                (el)=>console.log(el)
        )

}
