import { useEffect, useState } from "react";
import minimaLogo from './minima_logo.png';
import './App.css';
import Transaction from "./Transaction";
import ReceiveTransaction from "./ReceiveTransaction";
import CreateTokenForm from "./CreateTokenForm";

function App() {
  const [data, setData] = useState();
  useEffect(() => {
    window.MDS.init((msg) => {
      if (msg.event === 'MAXIMA') {
        console.log(msg);
        if (msg.data.data) {
          //TODO: you could check here for correct application
          setData(msg.data.data);
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
        <CreateTokenForm />
        {data ? <ReceiveTransaction data={data} /> : ''}
      </section>
    </div>
  );
}

export default App;