import { useState, useEffect } from "react";
import "../Css/Title.css";

const Title = () => {
  const [fadeOut, setFadeOut] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);
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
