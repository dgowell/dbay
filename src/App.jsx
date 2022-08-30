import { useEffect } from "react";
import minimaLogo from './minima_logo.png';
import './App.css';
import Transaction from "./Transaction";
import receiveTransaction from "./receiveTransaction";

function App() {
  useEffect(() => {
    window.MDS.init((msg) => {
      if (msg.event === 'MAXIMA') {
        console.log(msg);
        if (msg.data.application === 'stampd') {
          receiveTransaction(msg.data.data);
        }
      }
    });
  }, []);

  return (
    <div className="App">
      <section className="container">
        <img src={minimaLogo} className="logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code>.
        </p>
        <Transaction />
      </section>
    </div>
  );
}

export default App;