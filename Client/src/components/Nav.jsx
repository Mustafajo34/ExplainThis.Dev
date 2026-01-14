import { useState } from "react";
import logo from "../assets/pics/ExplainThis.png";
import "../Css/Nav.css";

const Nav = () => {
  const [toggle, setToggle] = useState(false);

  const handleToggle = () => {
    setToggle((prev) => !prev);
  };

  return (
    <div>
      <nav>
        <div>
          <span onClick={handleToggle} id="hamburger_sign">
            {toggle ? "✖" : "☰"}
          </span>
          <ul className={toggle ? "open" : "close"}>
            <li id="top_list">New Chat</li>
            <li>Images</li>
            <li>Projects</li>
          </ul>
        </div>

        <img src={logo} alt="Explain This logo" className="nav-logo" />
      </nav>
    </div>
  );
};

export default Nav;
