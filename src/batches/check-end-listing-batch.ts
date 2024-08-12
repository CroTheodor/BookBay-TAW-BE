import moment from "moment";
import { getModel } from "../models/listing.model";
import { NotificationServiceFactory } from "../utility/notification.service";

const listingModel = getModel();

export const launchListingExpirationChecker = async () => {
  const listingsToCheck = await listingModel.find({
    $or: [{ listingCompleted: false }, { listingCompleted: null }],
  });
  const notificationService = NotificationServiceFactory.getInstance();
  let soonestToExpire = moment().add(1, "h").toDate();
  for (let listing of listingsToCheck) {
    if (listing.endDate < moment().toDate()) {
      if (listing.bidingUser && listing.currentBid) {
        notificationService.sendNotification(
          listing.postingUser.toString(),
          listing._id.toString(),
          `Your listing has sold for ${listing.currentBid.toFixed(2)} €. You will be notified when the winner will complete the payment.`,
        );
        notificationService.sendNotification(
          listing.bidingUser.toString(),
          listing._id.toString(),
          `Congratulations, your bid for the book: \"${listing.book.title}\" by ${listing.book.author} has won. You can complete the payment by going to "My Listings" in the "Won auctions" area. Don't forget that you have 3 days to complete the payment or the win will be voided.`,
        );
      } else {
        notificationService.sendNotification(
          listing.postingUser.toString(),
          listing._id.toString(),
          "Your listing did not get any bids.",
        );
      }
      listing.listingCompleted = true;
      listing.save();
    } else {
      soonestToExpire =
        listing.endDate < soonestToExpire! ? listing.endDate : soonestToExpire;
    }
  }
  const timeDiff = moment(soonestToExpire).diff(moment());
  setTimeout(()=>{
    launchListingExpirationChecker();
  }, timeDiff);
};
