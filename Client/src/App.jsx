import Title from "./components/Title";
import Nav from "./components/Nav";
import InputBar from "./components/InputBar";


import "./App.css";

function App() {
  return (
    <div className="App">
      <nav>
        <Nav />
      </nav>
      <header>
        <Title />
      </header>
      <main></main>
      <footer>
        <div>
          <InputBar />
        </div>
      </footer>
    </div>
  );
}

export default App;
