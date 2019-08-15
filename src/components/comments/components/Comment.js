
import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment';
import "../styles/Comment.sass"

const Comment = (props) => (
  <div className={`comment ${!!props.parentCommentId ? 'reply' : ''}`}>
    <section>
      <div className="comment-author">{props.name}</div>
      <div className="comment-time">{moment(props.createdAt).fromNow()}</div>
    </section>
    <p dangerouslySetInnerHTML={{__html: props.comment}}/>
    {/* {!props.approved ? <div className="approval">Awaiting approval</div> : ''} */}
    {props.replies && props.replies.length !== 0 
      ? props.replies.map((r, i) => <Comment {...r} key={i}/>)
      : ''}
  </div>
)

Comment.propTypes = {
  createdAt: PropTypes.any,
  name: PropTypes.string.isRequired,
  comment: PropTypes.string.isRequired,
  approved: PropTypes.bool,
  replies: PropTypes.shape({
    createdAt: PropTypes.any,
    name: PropTypes.string.isRequired,
    comment: PropTypes.string.isRequired,
    approved: PropTypes.bool,
  })
}

export default Comment;