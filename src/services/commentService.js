
import axios from 'axios'
import uuid from 'uuid';
import sanitizeHtml from 'sanitize-html'
import { stripTrailingSlash } from '../utils/stripTrailingSlash'
import { appUtils } from '../utils/appUtils';

class CommentService {

  async getComments (url) {
    const apiUrl = appUtils.getAPIUrl();

    try {
      const response = await axios({
        method: 'GET',
        url: `${apiUrl}/comments`,
        params: {
          url
        }
      });
      const comments = response.data.comments;

      // Remove any saved comments that have been approved
      let submittedComments = this.getSubmitttedCommentsFromLocalStorage();

      submittedComments = submittedComments.filter((submitted) => {
        const commentFromAPIResponse = comments.find(
          (comment) => comment.id === submitted.id)

        if (!!commentFromAPIResponse === false || commentFromAPIResponse.approved === true) {
          return false;
        } else {
          return true; // keep in list
        }
      });

      // Replace
      this.replaceSubmittedComments(submittedComments);

      const approvedComments = comments.filter((c) => c.approved);
      return approvedComments.concat(submittedComments);

    } catch (err) {
      console.error(err);
      return [];
    }
  }

  makeComment (name, comment) {
    const commentObject = { 
      name, 
      comment: sanitizeHtml(comment),
      id: uuid(), 
      createdAt: new Date(),
      approved: false,
      url: stripTrailingSlash(window.location.pathname)
    };
    
    return commentObject;  
  } 

  async submitComment (commentObject) {
    const apiUrl = appUtils.getAPIUrl();

    try {
      await axios({
        method: 'POST',
        url: `${apiUrl}/comments`,
        data: commentObject
      });

      this.saveSubmittedCommentToLocalStorage(commentObject);

    } catch (err) {
      console.error(err);
    }
  }

  getSubmitttedCommentsFromLocalStorage () {
    let comments = [];
    let url = stripTrailingSlash(window.location.pathname)
    const raw = window.localStorage.getItem(`submitted-comments/${url}`);

    if (raw) {
      try {
        comments = JSON.parse(raw);
      } catch (err) {
        console.error(err);
      }
    }

    return comments.map((c) => ({
      ...c,
      createdAt: new Date(c.createdAt)
    }))
  }

  replaceSubmittedComments (comments) {
    let url = stripTrailingSlash(window.location.pathname)
    window.localStorage.setItem(`submitted-comments/${url}`, JSON.stringify(comments));
  }

  saveSubmittedCommentToLocalStorage (commentObject) {
    const comments = this.getSubmitttedCommentsFromLocalStorage();
    let url = stripTrailingSlash(commentObject.url)

    const exists = comments.find((c) => c.id === commentObject.id);

    if (!exists) {
      comments.push(commentObject);
    }

    window.localStorage.setItem(`submitted-comments/${url}`, JSON.stringify(comments));
  }
}

const commentService = new CommentService();

export {
  commentService
}
