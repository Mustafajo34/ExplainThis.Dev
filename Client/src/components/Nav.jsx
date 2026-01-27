import { useState } from "react";
import logo from "../assets/pics/ExplainThis.png";
import "../Css/Nav.css";

const Nav = () => {
  const [toggle, setToggle] = useState(false);
  // toggle function hangling true false value for open close action
  const handleToggle = () => {
    setToggle((prev) => !prev);
  };

  return (
    <div>
      <section className="vertical_nav"></section>
      <nav>
        <div>
          {/* span toggle ternary open close */}
          <span onClick={handleToggle} id="hamburger_sign">
            {toggle ? "✖" : "☰"}
          </span>
          {/* toggle state classname Open || Close */}
          <ul className={toggle ? "open" : "close"}>
            <li id="top_list">New Chat</li>
          </ul>
        </div>
        {/* <h1>ExplainThis.Dev</h1> */}

        <img src={logo} alt="Explain This logo" className="nav-logo" />
      </nav>
    </div>
  );
};

export default Nav;
