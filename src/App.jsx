import { useEffect } from "react";
import minimaLogo from './minima_logo.png';
import './App.css';
//import Balance from './Balance';
//import Nft from './Nft';
import CreateTokenButton from "./CreateTokenButton";

function App() {
  useEffect(() => {
    window.MDS.init();
  }, []);

  return (
    <div className="App">
      <section className="container">
        <img src={minimaLogo} className="logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code>.
        </p>
        <CreateTokenButton />
      </section>
    </div>
  );
}

export default App;