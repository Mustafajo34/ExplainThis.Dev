import { useState, useEffect } from "react";
import "../Css/Title.css";

const Title = () => {
  const TITLES = [
    ["Welcome", "to", "ExplainThis.Dev"],
    ["Learn", "to", "Code"],
    ["How", "Can", "I", "Help"],
    ["Build", "Smarter", "Apps"],
  ];
  /* state that handles fade in fade out for title */
  const [fadeOut, setFadeOut] = useState(false);

  // Pick random title only ONCE per page load
  const [title] = useState(() => {
    return TITLES[Math.floor(Math.random() * TITLES.length)];
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <div className={`span_wrapper ${fadeOut ? "fade-out" : ""}`}>
        <span id="span1">{title[0]}</span>
        <span id="span2">{title[1]}</span>
        <span id="span3">{title[2]}</span>
      </div>
    </div>
  );
};

export default Title;
