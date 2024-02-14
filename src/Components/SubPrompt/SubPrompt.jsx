import React from "react";
import { ReactComponent as PendingIcon } from "../../media/pending.svg";

const SubPrompt = ({
  test,
  index,
  subIndex,
  subScenario,
  updateSubStep,
  removeSubStep,
}) => {
  return (
    <div key={`sub-${index}-${subIndex}`} className="sub-scenario-input">
      <input
        type="text"
        placeholder="Then..."
        value={subScenario?.scenario}
        onChange={(e) =>
          updateSubStep(index, subIndex, "scenario", e.target.value)
        }
        className="sub-text-box"
      />
      {subScenario?.status == "success" && (
        <span className="success-tick">&#10004;</span>
      )}
      {subScenario?.status == "failure" && (
        <span className="failure-x">&#10008;</span>
      )}
      {!subScenario?.status && !subScenario?.loading && (
        <PendingIcon width={25} height={25} />
      )}
      <button
        onClick={() => removeSubStep(index, subIndex)}
        className="remove-step-button"
      >
        -
      </button>
    </div>
  );
};

export default SubPrompt;
