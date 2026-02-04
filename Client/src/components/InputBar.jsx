import { useState, useEffect } from "react";

import "../Css/InputBar.css";

const InputBar = ({value, onChange, onSubmit, dailyCapReached, lockTimer}) => {
 return (
    <div className="input_wrapper">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        {/* text area */}
        <textarea
          id="textArea_bar"
          placeholder="How May I Help You..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={dailyCapReached} // disable input if cooldown active
        ></textarea>
        {/* lock timer implementation */}
        {lockTimer > 0 && (
          <p className="lock-message">
            Please wait {lockTimer} second{lockTimer > 1 ? "s" : ""} before submitting.
          </p>
        )}
        {/* Submit button */}
        <button type="submit" id="submit_question" disabled={dailyCapReached}>
          Let's Code
        </button>
      </form>
    </div>
  );
    
};

export default InputBar;
