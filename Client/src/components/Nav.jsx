import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/pics/ExplainThis.png";

import "../Css/Nav.css";

const Nav = ({
  onNewChat,
  onDelete,
  savedInput,
  setInput,
  dailyCapReached,
}) => {
  //! --state--
  const [toggle, setToggle] = useState(false);
  //! handle toggle functions
  const handleToggle = () => setToggle((prev) => !prev);
  //! handle click function
  const handleLinkClick = () => {
    setToggle(false);
    if (setInput) setInput("");
  };

  return (
    <nav className="main-nav">
      <div className="nav-header">
        {/* Toggle */}
        <span onClick={handleToggle} id="hamburger_sign">
          {toggle ? "✖" : "☰"}
        </span>
        <img src={logo} alt="Explain This logo" className="nav-logo" />
      </div>
      <ul className={toggle ? "open" : "close"}>
        {/* daily cap reached */}
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
        {/* savedInput check  */}
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
                  {/* input display length on Nav */}
                  {item.text?.length > 15
                    ? item.text.slice(0, 15) + "..."
                    : item.text}
                </NavLink>
                {/* delete symbol " x " */}
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
