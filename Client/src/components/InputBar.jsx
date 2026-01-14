import "../Css/InputBar.css";

const InputBar = () => {
  return (
    <div className="input_wrapper">
      <form action="">
        <textarea name="" id="textArea_bar"></textarea>
        <button type="submit" id="submit_question" >Submit</button>
      </form>
    </div>
  );
};

export default InputBar;
