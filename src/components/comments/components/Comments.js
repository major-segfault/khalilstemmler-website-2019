
import React from 'react';
import Editor from './Editor';
import Comment from './Comment';
import { TextInput } from '../../shared/text-input';
import { SubmitButton } from '../../shared/buttons';
import "../styles/Comments.sass"
import { commentService } from '../../../services/commentService';

export class Comments extends React.Component {
  constructor (props) {
    super(props);

    this.maxCommentLength = 3000;
    this.minCommentLength = 10;

    this.state = {
      isFetchingComments: true, 
      comments: [],
      name: '',
      commentText: '',
      commentSubmitted: false,
    }
  }

  async submitComment () {
    if (this.isFormReady()) {
      const { name, commentText } = this.state;
      try {
        const comment = commentService.makeComment(name, commentText);

        await commentService.submitComment(comment);

        this.setState({ 
          ...this.state, 
          commentSubmitted: true,
          name: '',
          comments: this.state
            .comments
            .concat(comment),
          commentText: ''
        });

      } catch (err) {
        alert("Couldn't submit that comment :(, damn.")
      }
    }
  }

  async getComments () {
    try {
      const url = window.location.pathname;
      this.setState({ ...this.state, isFetchingComments: true });
      const comments = await commentService.getComments(url);
      this.setState({ ...this.state, isFetchingComments: false, comments });
    } catch (err) {
      this.setState({ ...this.setState, isFetchingComments: false, comments: [] })
    }
  }

  componentDidMount () {
    this.getComments();
  }

  getRawTextLength (tags) {
    return tags.replace(/<[^>]*>?/gm, '').length;
  }

  isFormReady () {
    const { name, commentText } = this.state;
    const nameIsPresent = !!name === true;
    const commentTextLength = this.getRawTextLength(commentText);
    const commentIsOK = !!commentText === true 
      && commentTextLength < this.maxCommentLength
      && commentTextLength > this.minCommentLength;

    return nameIsPresent && commentIsOK;
  }

  updateFormField (fieldName, value) {
    this.setState({
      ...this.state,
      [fieldName]: value
    })
  }

  sortComments (a, b) {
    return new Date(a.createdAt) - new Date(b.createdAt)
  }

  isReply (comment) {
    return !!comment.parentCommentId === true;
  }

  presentComments () {
    let { comments } = this.state;
    const replies = comments.filter((c) => this.isReply(c));
    
    comments = comments
      .filter((c) => !this.isReply(c))
      .map((c) => {
        const commentReplies = replies.filter((r) => r.parentCommentId === c.id);
        if (commentReplies.length !== 0) {
          c.replies = commentReplies.sort(this.sortComments);
        };
        return c;
      })

    return comments
      .sort(this.sortComments)
  }

  render () {
    const comments = this.presentComments();
    const { commentText } = this.state;
    const numComments = comments.length;
    const hasComments = numComments !== 0;

    return (
      <div className="comments-container">
        <h3>{numComments} {numComments === 1 ? 'Comment' : 'Comments'}</h3>
        {!hasComments ? <p>Be the first to leave a comment</p> : ''}
        <TextInput
          placeholder="Name"
          value={this.state.name}
          onChange={(e) => this.updateFormField('name', e)}
        />
        <Editor 
          text={commentText}
          handleChange={(e) => this.updateFormField('commentText', e)}
          maxLength={3000}
          placeholder="Comment"
        />
        <SubmitButton
          text="Submit"
          // icon
          onClick={() => this.submitComment()}
          loading={false}
          disabled={!this.isFormReady()}
        />
        {comments.map((c, i) => <Comment {...c} key={i}/>)}
      </div>
    )
  }
}