import React, { Component } from "react";
import socketIOClient from "socket.io-client";
class App extends Component {
  constructor() {
    super();
    this.state = {
      response: false,
      endpoint: "http://127.0.0.1:4001",
      backgroundcolor: ''
    };
  }
  componentDidMount() {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    socket.on("FromAPI", data => {
      console.log(data)
      this.setState({ response: data })
    });
  }
  render() {
    const { response } = this.state;
    return (
      <div style={{ textAlign: "center" }}>
        <p>
          Random Star wars character: {JSON.stringify(response)}
        </p>
      </div>
    );
  }
}
export default App;
