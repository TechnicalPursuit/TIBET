'use strict';

/* eslint-disable class-methods-use-this,no-console */
class SampleInput extends React.Component {

    constructor(props) {
        super(props);
        this.state = {value: ''};
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        console.log('got to SampleInput componentDidMount');
    }

    componentDidUpdate(prevProps, prevState) {
        console.log('got to SampleInput componentDidUpdate');
    }

    componentWillUnmount() {
        console.log('got to SampleInput componentWillUnmount');
    }

    handleBlur(evt) {
        this.handleChange(evt);
    }

    handleChange(evt) {
        this.setState({value: evt.target.value});
    }

    handleFocus(evt) {
        console.log('got to SampleInput focus');
    }

    render() {
        return React.createElement(
            'input',
            {
                type: 'text',
                value: this.state.value,
                onBlur: this.handleBlur.bind(this),
                onChange: this.handleChange.bind(this),
                onFocus: this.handleFocus.bind(this)
            }
        );
    }
}

window.SampleInput = SampleInput;
/* eslint-enable class-methods-use-this,no-console */
