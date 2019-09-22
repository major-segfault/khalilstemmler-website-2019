
import axios from 'axios';
import { appUtils } from '../utils/appUtils';


// export interface ContactProps {
//   email: string;
//   sourceId: SourceId;
//   isSubscriber?: boolean;
//   firstName?: string;
//   lastName?: string;
//   dddCourseSubscriber?: boolean;
//   ncsDownloaded?: boolean;
//   solidBookSubscriber?: boolean;
//   solidBookBought?: boolean;
//   contactID?: number;
// }

const SourceIdType = {
  SUBSCRIBE_FORM: 'subscribe-form',
  SOLID_BOOK: 'solid-book',
  SOLID_BOOK_AND_NEWSLETTER: 'solid-book-and-newsletter',
  NCS_BOOK: 'ncs-book',
  NCS_BOOK_AND_NEWSLETTER: 'ncs-book-and-newsletter',
  COURSE_SUBSCRIBER: 'course-subscriber'
}

class ContactService {

  constructor () {

  }

  getSourceIdTypes () {
    return Object.keys(SourceIdType).map((key) => {
      return SourceIdType[key];
    })
  }

  isValidSourceId (sourceId) {
    const found = this.getSourceIdTypes().find((id) => id === sourceId);
    if (found) return true;
    return false;
  }

  createOrUpdateContact (email, sourceIdType, additionalProps) {
    if (!!email === false) throw new Error("Need to provide an email");
    if (!this.isValidSourceId(sourceIdType)) throw new Error("Source id not valid");

    const apiURL = appUtils.getAPIUrl();
    additionalProps = !!additionalProps === true ? additionalProps : {};

    return axios({
      method: 'POST',
      url: `${apiURL}/marketing/contact`,
      data: {
        ...additionalProps,
        email,
        sourceId: sourceIdType,
      }
    });
  }
}

const contactService = new ContactService();

export {
  contactService
}