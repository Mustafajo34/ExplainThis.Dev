import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/pics/ExplainThis.png";
import "../Css/Nav.css";

const Nav = ({ savedInput }) => {
  const [toggle, setToggle] = useState(false);
  const navigate = useNavigate();
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
            <div id="link_wrapper">
              {/* link to create new chat */}
              <span>New Chat</span>
            </div>
            {/* savedInput disclaimer if no chats */}
            {savedInput.length === 0 ? (
              <p>No new Chats</p>
            ) : (
              /* list saveInput using navLink to dynamically link through id */
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
