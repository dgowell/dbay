import { useEffect } from "react";
import minimaLogo from './minima_logo.png';
import './App.css';
import CreateTokenButton from "./CreateTokenButton";
import TokenList from "./TokenList";

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
        <TokenList />
      </section>
    </div>
  );
}

export default App;