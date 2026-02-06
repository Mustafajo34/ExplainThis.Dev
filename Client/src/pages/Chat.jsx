import React from "react";
import Title from "../components/Title";
const Chat = ({ explanation, loading, error }) => {
  return (
    <div>
      <main>
        <div className="new-chat">
          <Title />
        </div>
        {/* loading sign */}
        {loading && (
          <p className="loading" aria-live="polite">
            <span className="loading-dots">
              <span className="loading-dot loading-dot--1"></span>
              <span className="loading-dot loading-dot--2"></span>
              <span className="loading-dot loading-dot--3"></span>
            </span>
          </p>
        )}
        {/* error notify if loading unsuccessful */}
        {error && <p className="error">{error}</p>}
        {/* render fetched explanation */}

        {explanation && (
          <section className="explanation-output">
            {/* Language */}

            {/* Summary */}
            {explanation.summary && (
              <div className="section summary">
                <h3 className="section-title">Summary</h3>
                <p className="section-text">{explanation.summary}</p>
              </div>
            )}

            {/* Breakdown */}
            {explanation.breakdown && (
              <div className="section breakdown">
                <h3 className="section-title">Breakdown</h3>
                <p className="section-list">{explanation.breakdown}</p>
              </div>
            )}

            {/* Key Points */}
            {explanation.key_points?.length && (
              <div className="section key-points">
                <h3 className="section-title">Key Points</h3>
                <p className="section-list">{explanation.key_points}</p>
              </div>
            )}

            {/* Limitations */}
            {explanation.limitations && (
              <div className="section limitations">
                <h3 className="section-title">Limitations</h3>
                <p className="section-list">{explanation.limitations}</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Chat;
