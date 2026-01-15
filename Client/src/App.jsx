import Title from "./components/Title";
import Nav from "./components/Nav";
import InputBar from "./components/InputBar";

import "./App.css";

function App() {
  return (
    <div className="App">
      {/* nav components */}
      <nav>
        <Nav />
      </nav>
      {/* header comnponent area */}
      <header>
        <Title />
      </header>
      {/* main component area */}
      <main></main>
      {/* footer component area */}
      <footer>
        <div>
          <InputBar />
        </div>
      </footer>
    </div>
  );
}

export default App;
