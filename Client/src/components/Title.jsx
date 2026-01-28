import { useState, useEffect } from "react";
import "../Css/Title.css";

const Title = () => {
  /* state that handles fade in fade out for title */
  const [fadeOut, setFadeOut] = useState(false);
  /* useEffect to render title 1 time */
  useEffect(() => {
    /* time variable that holds setTimeout() that changes state and returns unmounted SetTimeout */
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <div className={`span_wrapper ${fadeOut ? "fade-out" : ""} `}>
        <span id="span1">Welcome</span>
        <span id="span2">to</span>
        <span id="span3">ExplainThis.Dev</span>
      </div>
    </div>
  );
};

export default Title;
