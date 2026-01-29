import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/pics/ExplainThis.png";
import "../Css/Nav.css";

const Nav = ({ savedInput, setInput }) => {
  const [toggle, setToggle] = useState(false);

  const handleToggle = () => setToggle((prev) => !prev);
  const handleLinkClick = () => {
    setToggle(false);
    if (setInput) setInput(""); // reset input when navigating
  };

  return (
    <nav className="main-nav">
      <div className="nav-header">
        <span onClick={handleToggle} id="hamburger_sign">
          {toggle ? "✖" : "☰"}
        </span>
        <img src={logo} alt="Explain This logo" className="nav-logo" />
      </div>

      <ul className={toggle ? "open" : "close"}>
        <div id="link_wrapper">
          <Link
            to="/new"
            onClick={() => {
              handleLinkClick(); // existing toggle + optional input reset
              if (onNewChat) onNewChat(); // reset state & navigate
            }}
          >
            New Chat
          </Link>
        </div>

        {savedInput.length === 0 ? (
          <p className="no-chats">No saved chats</p>
        ) : (
          savedInput.map((item) => (
            <li key={item.id}>
              <NavLink
                to={`/item/${item.id}`}
                className={({ isActive }) =>
                  isActive ? "saved-item active" : "saved-item"
                }
                onClick={handleLinkClick}
              >
                {item.text.length > 25
                  ? item.text.slice(0, 25) + "..."
                  : item.text}
              </NavLink>
            </li>
          ))
        )}
      </ul>
    </nav>
  );
};

export default Nav;
