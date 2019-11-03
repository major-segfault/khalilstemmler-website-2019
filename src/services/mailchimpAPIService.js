
import axios from 'axios'
import bugsnag from '../services/bugsnag'

export const EmailAudienceTags = {
  NCS_BOOK_LEAD: 'Downloaded Names Construct Structure Book',
  DDD_COURSE_LEAD: 'DDD Course Lead'
}

export const MailChimpAPIService = {
  tagContact: async (email, tag) => {
    try {
      await axios({
        url: 'https://khalilstemmler-mailchimp.stemmlerjs.now.sh/functions/add_tag_to_subscriber.ts',
        method: 'POST',
        data: {
          email,
          tag
        }
      })
    } catch (err) {
      bugsnag.bugsnagClient.notify(err);
    }
  }
}

