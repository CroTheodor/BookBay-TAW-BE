import * as listing from "../models/listing.model";
import { checkBodyRequest } from "../utility/helper-functions";
import { HttpResponse, PaginatedList } from "../models/http-response.model";
import { Logger } from "../utility/logger";
import moment from "moment";
import { ios } from "../server";

const ListingModel = listing.getModel();

export const listingCreate = (req, res) => {
  const missingField = checkBodyRequest(req.body, [
    "book",
    "minBid",
    "actionDuration",
  ]);
  if (missingField) {
    Logger.error(`${missingField} field is missing.`);
    return res
      .status(500)
      .json(new HttpResponse(false, `${missingField} field is missing.`, null));
  }
  let newListing = listing.newListing(req.body);
  newListing.setupDates(newListing.auctionDuration);
  newListing.postingUser = req.auth._id;
  newListing
    .save()
    .then((l: listing.ListingDTO) =>
      res
        .status(200)
        .json(new HttpResponse(true, "Listing created: " + l.id, l)),
    )
    .catch((error) => {
      console.log(error);
      return res.status(500).json(new HttpResponse(false, "DB error", null));
    });
};

export const listingGetAll = async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 0;
  const limit = req.query.page
    ? req.query.limit
      ? req.query.limit
      : process.env.DEFAULT_LIMIT
    : 5000;
  const docCount = await ListingModel.countDocuments().exec();

  ListingModel.find({})
    .skip(page * limit)
    .limit(limit)
    .then((listingList: listing.ListingDTO[]) =>
      res
        .status(200)
        .json(
          new HttpResponse(
            false,
            "Retrieved the list of listings",
            new PaginatedList(page, limit, docCount, listingList),
          ),
        ),
    )
    .catch(() =>
      res.status(500).json(new HttpResponse(false, "DB error", null)),
    );
};

export const listingGetActive = async (req, res) => {
  const titleFilter = req.query.title;
  const authorFilter = req.query.author;
  const publisherFilter = req.query.publisher;
  const courseFilter = req.query.course;

  let filter: any = { endDate: { $gte: moment().toDate() } };

  if (titleFilter) {
    filter = { ...filter, "book.title": new RegExp(titleFilter, "i")};
  }

  if (authorFilter) {
    filter = { ...filter, "book.author": new RegExp(authorFilter, "i")};
  }

  if (publisherFilter) {
    filter = { ...filter, "book.publisher": new RegExp(publisherFilter, "i")};
  }

  if (courseFilter) {
    filter = { ...filter, "book.course": new RegExp(publisherFilter, "i") };
  }

    console.log(filter);

  const page = req.query.page;
  const pageNumber = page ? Number.parseInt(page) : 0;
  const limit = page ? req.query.limit : 50000;
  let numberOfDocuments;
  try {
    numberOfDocuments = await ListingModel.countDocuments(filter).exec();
  } catch (error) {
    Logger.log(error);
  }

  ListingModel.find(filter)
    .sort({ listingDate: -1 })
    .skip(pageNumber * limit)
    .limit(limit)
    .populate({ path: "postingUser", select: "-salt -digest" })
    .populate({ path: "bidingUser", select: "-salt -digest" })
    .then((listings: any) => {
      return res
        .status(200)
        .json(
          new HttpResponse(
            true,
            "Retrieved the list of listings",
            new PaginatedList(pageNumber, limit, numberOfDocuments, listings),
          ),
        );
    })
    .catch((err) => {
      Logger.log(err);
      res.status(500).json(new HttpResponse(false, "DB error", null));
    });
};

export const listingGetById = (req, res) => {
  ListingModel.findById(req.params.id)
    .populate({ path: "postingUser", select: "-salt -digest" })
    .populate({ path: "bidingUser", select: "-salt -digest" })
    .then((listings: any) => {
      return res
        .status(200)
        .json(
          new HttpResponse(true, "Retrieved the list of listings", listings),
        );
    })
    .catch(() =>
      res.status(500).json(new HttpResponse(false, "DB error", null)),
    );
};

export const listingsDeleteById = (req, res) => {
  ListingModel.findByIdAndDelete(req.params.id)
    .then(() => res.sendStatus(200))
    .catch(() =>
      res.status(500).json(new HttpResponse(false, "DB error", null)),
    );
};

export const listingUpdateById = (req, res) => {
  const bookUpdatableFiels = ["author", "title", "publisher", "course"];
  ListingModel.findById(req.params.id).then((listing: listing.ListingDTO) => {
    const minBid = req.body.minBid;
    if (minBid > listing.currentBid) {
      listing.currentBid = null;
      listing.bidingUser = null;
      listing.bids = null;
    }

    const auctionDuration = req.body.auctionDuration;
    if (
      auctionDuration &&
      moment(listing.listingDate)
        .add(auctionDuration, "hours")
        .isBefore(moment())
    ) {
      return res
        .status(500)
        .json(
          new HttpResponse(
            false,
            "Error: the new duration sets the ending date in the past",
            null,
          ),
        );
    }
    listing.auctionDuration = auctionDuration;
    listing.endDate = moment(listing.listingDate)
      .add(auctionDuration, "hours")
      .toDate();

    if (req.body.book) {
      Object.keys(req.body.book).forEach((key) => {
        if (bookUpdatableFiels.includes(key)) {
          listing.book[key] = req.body.book[key];
        }
      });
    }
    listing
      .save()
      .then(() =>
        res
          .status(200)
          .json(
            new HttpResponse(
              true,
              "The listing has been successfully updated",
              null,
            ),
          ),
      )
      .catch(() =>
        res
          .status(500)
          .json(new HttpResponse(false, "Failed to update the listing", null)),
      );
  });
};

export const listingsBid = (req, res) => {
  const id = req.params.id;
  const amount = req.body.amount;
  const biderId = req.auth._id;

  if (!id || !amount) {
    return res
      .status(500)
      .json(new HttpResponse(false, "Field 'amount' missing", null));
  }

  ListingModel.findById(id)
    .then((l: listing.ListingDTO) => {
      if (biderId === l.postingUser.toString()) {
        return res
          .status(500)
          .json(
            new HttpResponse(
              false,
              "A bid cannot be placed by the owner of the book",
              null,
            ),
          );
      }
      const updated = l.placeBid(amount, biderId);
      if (!updated) {
        return res
          .status(500)
          .json(
            new HttpResponse(
              false,
              "The biding amount cannot be inferior to the actual bid",
              null,
            ),
          );
      }
      l.save()
        .then(() => {
          res
            .status(200)
            .json(new HttpResponse(true, "Successfully placed bid", l));
          ios.emit("bid", {
            currentBid: l.currentBid,
            bids: l.bids,
          });
        })
        .catch((error) => {
          Logger.error(error);
          return res
            .status(500)
            .json(new HttpResponse(false, "DB error", null));
        });
    })
    .catch(() => {
      return res
        .status(404)
        .json(false, "Impossible to retrieve listing from DB", null);
    });
};

export const listingStatisticExpiredNoBids = async (req, res) => {
  const filter = {
    endDate: { $lt: moment().toDate() },
    bidingUser: null,
  };

  const page = req.query.page ? parseInt(req.query.page) : 0;
  const limit = req.query.page
    ? req.query.limit
      ? req.query.limit
      : process.env.DEFAULT_LIMIT
    : 5000;
  const docCount = await ListingModel.countDocuments(filter).exec();

  ListingModel.find(filter)
    .skip(page * limit)
    .limit(limit)
    .populate({ path: "bidingUser", select: "-salt -digets" })
    .populate({ path: "postingUser", select: "-salt -digest" })
    .then((listingList: listing.ListingDTO[]) => {
      res
        .status(200)
        .json(
          new HttpResponse(
            true,
            "Retrieved user's listings",
            new PaginatedList(page, limit, docCount, listingList),
          ),
        );
    })
    .catch(() =>
      res.status(404).json(new HttpResponse(false, "Not found", null)),
    );
};
