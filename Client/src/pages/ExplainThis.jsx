import Nav from "../components/Nav.jsx";
import Title from "../components/Title.jsx";
import InputBar from "../components/InputBar";

import "../Css/ExplainThis.css";

const ExplainThis = () => {
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
};

export default ExplainThis;
