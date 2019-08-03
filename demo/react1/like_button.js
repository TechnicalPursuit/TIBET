'use strict';

/* eslint-disable class-methods-use-this,no-console */
class LikeButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {liked: false};
    }

    componentDidMount() {
        console.log('got to LikeButton componentDidMount');
    }

    componentDidUpdate(prevProps, prevState) {
        console.log('got to LikeButton componentDidUpdate');
    }

    componentWillUnmount() {
        console.log('got to LikeButton componentWillUnmount');
    }

    render() {
        if (this.state.liked) {
            return 'You liked this.';
        }

        return React.createElement(
          'button', {
              onClick: () => {
                  this.setState({liked: true});
              }
          },
          'Like'
        );
    }
}

window.LikeButton = LikeButton;
/* eslint-enable class-methods-use-this,no-console */
