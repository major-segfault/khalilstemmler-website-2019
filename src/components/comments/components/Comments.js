
import React from 'react';

class CommentService {
  getComments (url) {
    return new Promise((resolve, reject) => {
      return resolve([])
    })
  }
}

const commentService = new CommentService();

export class Comments extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      isFetchingComments: true, 
      comments: [],
      name: '',
      comment: '',
    }
  }

  submitComment () {

  }

  async getComments () {
    try {
      const url = window.location.href;
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

  render () {
    const { comments } = this.state;
    const numComments = comments.length;
    const hasComments = numComments !== 0;
    
    return (
      <div>

      </div>
    )
  }
}