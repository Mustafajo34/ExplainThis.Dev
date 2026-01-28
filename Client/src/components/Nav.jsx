import { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/pics/ExplainThis.png";
import "../Css/Nav.css";

const Nav = ({ savedInput }) => {
  const [toggle, setToggle] = useState(false);
  // toggle function hangling true false value for open close action
  const handleToggle = () => {
    setToggle((prev) => !prev);
  };

  return (
    <div>
      <nav>
        <div>
          {/* span toggle ternary open close */}
          <span onClick={handleToggle} id="hamburger_sign">
            {toggle ? "✖" : "☰"}
          </span>
          {/* toggle state classname Open || Close */}
          <ul className={toggle ? "open" : "close"}>
            <h3 id="top_list">New Chat</h3>
            {savedInput.length === 0 ? (
              <p>No new Chats</p>
            ) : (
              savedInput.map((item) => (
                <li key={item.id}>
                  <NavLink
                    to={`/item/${item.id}`}
                    className={({ isActive }) =>
                      isActive ? "saved-item active" : "saved-item"
                    }
                  >
                    {item.text.length > 25
                      ? item.text.slice(0, 15) + "..."
                      : item.text}
                  </NavLink>
                </li>
              ))
            )}
          </ul>
        </div>
        {/* <h1>ExplainThis.Dev</h1> */}

        <img src={logo} alt="Explain This logo" className="nav-logo" />
      </nav>
    </div>
  );
};

export default Nav;
