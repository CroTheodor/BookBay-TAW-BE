import moment from "moment";
import { getModel } from "../models/listing.model";
import { NotificationServiceFactory } from "../utility/notification.service";

const listingModel = getModel();

export const launchListingPaymentChecker = async () => {
  const listingsToCheck = await listingModel.find({
    $and: [
      { listingCompleted: true },
      { paymentCompleted: null },
      { bidingUser: { $ne: null } },
    ],
  });
  const notificationService = NotificationServiceFactory.getInstance();
  let soonestToExpire = moment().add(6, "h").toDate();
  for (let listing of listingsToCheck) {
    if (listing.endDate < moment().add(3, "d").toDate()) {
      notificationService.sendNotification(
        listing.bidingUser.toString(),
        listing._id.toString(),
        "You have failed to complete the payment and won't be available to do so again",
      );
      notificationService.sendNotification(
        listing.postingUser.toString(),
        listing._id.toString(),
        "The buyer has failed to provide a payment in time. Please relist your book.",
      );
      listing.paymentCompleted = false;
      listing.save();
    } else {
      soonestToExpire =
        listing.endDate < soonestToExpire! ? listing.endDate : soonestToExpire;
    }
  }
  const timeDiff = moment(soonestToExpire).diff(moment());
  setTimeout(() => {
    launchListingPaymentChecker();
  }, timeDiff);
};
