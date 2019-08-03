class Greeting extends React.Component {
    componentDidMount() {
        console.log('got to Greeting componentDidMount');
    }

    componentDidUpdate(prevProps, prevState) {
        console.log('got to Greeting componentDidUpdate');
    }

    componentWillUnmount() {
        console.log('got to Greeting componentWillUnmount');
    }

    render() {
        return (<p>Hello there Bill!</p>);
    }
}
ReactDOM.render(
    <Greeting />,
    document.getElementById('root')
);
