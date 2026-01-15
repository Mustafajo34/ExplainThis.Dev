import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import "../Css/InputBar.css";

const InputBar = () => {
  return (
    <div className="input_wrapper">
      {/* Fontawesome Icons single icon */}
      <FontAwesomeIcon
        icon={faImage}
        id="image_icon"
        size="xl"
        style={{ color: "#777879" }}
      />
      <FontAwesomeIcon
        icon={faMicrophone}
        id="mic_icon"
        size="xl"
        style={{ color: "#858585" }}
      />
      {/* form for textarea input */}
      <form action="">
        <textarea
          name=""
          id="textArea_bar"
          placeholder="How May i Help You..."
        ></textarea>
        {/* submit button */}
        <button type="submit" id="submit_question">
          Let's Code
        </button>
      </form>
    </div>
  );
};

export default InputBar;
