import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/pics/ExplainThis.png";

import "../Css/Nav.css";

const Nav = ({ onNewChat, onDelete, savedInput, setInput, dailyCapReached }) => {
   const [toggle, setToggle] = useState(false);

  const handleToggle = () => setToggle((prev) => !prev);

  const handleLinkClick = () => {
    setToggle(false);
    if (setInput) setInput("");
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
            id="link_text"
            className={dailyCapReached ? "disabled-link" : ""}
            onClick={(e) => {
              if (dailyCapReached) {
                e.preventDefault(); // prevent navigation if cap hit
                alert("Daily limit reached. Try again tomorrow.");
                return;
              }
              handleLinkClick();
              onNewChat?.();
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
              <div className="map_wrapper">
                <NavLink
                  to={`/item/${item.id}`}
                  className={({ isActive }) =>
                    isActive ? "saved-item active" : "saved-item"
                  }
                  onClick={handleLinkClick}
                >
                  {item.text?.length > 15
                    ? item.text.slice(0, 15) + "..."
                    : item.text}
                </NavLink>

                <span
                  id="delete_symbol"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                >
                  ✕
                </span>
              </div>
            </li>
          ))
        )}
      </ul>
    </nav>
  );
};

export default Nav;
