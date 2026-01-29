import React from 'react'
import { NavLink } from "react-router-dom";

const SavedChat = ({savedInput}) => {
  return (
    <div>
      <h2>Saved Chats</h2>
      <ul>
        {savedInput.length === 0 ? (
          <p>No saved chats yet.</p>
        ) : (
          savedInput.map((item) => (
            <li key={item.id}>
              <NavLink to={`/item/${item.id}`}>
                {item.text.length > 25 ? item.text.slice(0, 25) + "..." : item.text}
              </NavLink>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

export default SavedChat
