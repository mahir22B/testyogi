import React from "react";
import SubPrompt from "../SubPrompt/SubPrompt";
import { ReactComponent as PendingIcon } from "../../media/pending.svg";

const Prompt = ({
  tests,
  index,
  test,
  updateTest,
  runTest,
  removeTest,
  addSubStepInput,
  updateSubStep,
  removeSubStep,
}) => {
  return (
    <div key={index} className="test">
      <div className="test-row">
        <input
          type="text"
          placeholder="Main Scenario"
          value={test.scenario}
          onChange={(e) => updateTest(index, "scenario", e.target.value)}
          className="main-input"
        />
        <input
          type="text"
          placeholder="URL"
          value={test.url}
          onChange={(e) => updateTest(index, "url", e.target.value)}
          className="main-input"
        />
        <button onClick={() => runTest(index)}>
          {test.loading
            ? "Testing..."
            : test.status === "success"
            ? "Re-Test"
            : "Test Now"}
        </button>
        {test.status == "success" && (
          <span className="success-tick">&#10004;</span>
        )}
        {test.status == "failure" && (
          <span className="failure-x">&#10008;</span>
        )}
        {!test.status && !test.loading && (
          <PendingIcon width={25} height={25} />
        )}
        {tests.length > 1 && (
          <button onClick={() => removeTest(index)} className="remove-button">
            X
          </button>
        )}
      </div>
      {test.subScenarios.length > 0 &&
        test.subScenarios.map((subScenario, subIndex) => (
          <SubPrompt
            test={test}
            index={index}
            subIndex={subIndex}
            subScenario={subScenario}
            updateSubStep={updateSubStep}
            removeSubStep={removeSubStep}
          />
        ))}
      <button
        onClick={() => addSubStepInput(index)}
        className="add-step-button"
      >
        +
      </button>
    </div>
  );
};

export default Prompt;
