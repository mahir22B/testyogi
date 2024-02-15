import React, { useState } from "react";
import "./App.css";
import Prompt from "./Components/Prompt/Prompt";
import { Header } from "./Components/Header/Header";
import { useDispatch } from "react-redux";
import { increment, rate } from "./redux/slices/counterSlice";
import { ServerAPI } from "./API/ServerApi";

function App() {
  const dispatch = useDispatch();
  const [tests, setTests] = useState([
    { scenario: "", subScenarios: [], url: "", status: null, loading: false },
  ]);

  const runTest = async (index) => {
    let successCount = 0;

    updateTest(index, "loading", true);
    const currentTest = tests[index];
    let subPrompts = [];
    currentTest.subScenarios.forEach((x) => {
      subPrompts.push(x.scenario);
    });
    const scenarioString = [currentTest.scenario, ...subPrompts]
      .join(" then ")
      .trim();

    const data = await ServerAPI(
      JSON.stringify({
        ...currentTest,
        status: null,
        scenario: scenarioString,
        subScenarios: subPrompts,
      })
    );
    console.log(data?.results);

    const totalTests =
      tests[index]?.subScenarios?.length > 0
        ? 1 + tests[index]?.subScenarios?.length
        : 1;

    try {
      if (data.results && data.results.length > 0) {
        data.results.forEach((result, resIndex) => {
          const resultStatus = result == "Success" ? "success" : "failure";
          if (resIndex < 1) {
            updateTest(index, "status", resultStatus);
            if (resultStatus == "success") successCount += 1;
          } else if (resIndex >= 1) {
            updateSubStep(index, resIndex - 1, "status", resultStatus);
            if (resultStatus == "success") successCount += 1;
          }
        });

        const passRate = ((successCount / totalTests) * 100).toFixed(2);

        dispatch(rate({ rate: passRate }));
      } else {
        updateTest(index, "status", "failure");
      }

      if (tests[index]?.status == "success") {
        if (
          tests[index]?.subScenarios?.every(
            (element) => element?.status == "success"
          )
        ) {
          dispatch(increment());
        }
      }
    } catch (error) {
      console.error("Error running the test:", error);
      alert(`Error running test: ${error.message}`);
    } finally {
      updateTest(index, "loading", false);
    }
  };

  const addMoreTests = () => {
    setTests((tests) => [
      ...tests,
      { scenario: "", subScenarios: [], url: "", status: null, loading: false },
    ]);
  };

  const removeTest = (indexToRemove) => {
    setTests(tests.filter((_, index) => index !== indexToRemove));
  };

  const updateTest = (index, field, value) => {
    const newTests = [...tests];
    newTests[index][field] = value;
    setTests(newTests);
  };

  const addSubStepInput = (index) => {
    const newTests = [...tests];
    if (
      !newTests[index].subScenarios ||
      newTests[index].subScenarios.length === 0
    ) {
      newTests[index].subScenarios = [{}];
    } else {
      newTests[index].subScenarios.push({});
    }
    setTests(newTests);
  };

  const updateSubStep = (index, subIndex, field, value) => {
    const newTests = [...tests];
    newTests[index].subScenarios[subIndex][field] = value;
    setTests(newTests);
  };

  const removeSubStep = (index, subIndex) => {
    const newTests = [...tests];
    newTests[index].subScenarios.splice(subIndex, 1);
    setTests(newTests);
  };

  return (
    <>
      <Header />
      <div className="App">
        <div className="test-container">
          {tests.map((test, index) => (
            <Prompt
            key={index}
              tests={tests}
              index={index}
              test={test}
              updateTest={updateTest}
              runTest={runTest}
              removeTest={removeTest}
              addSubStepInput={addSubStepInput}
              updateSubStep={updateSubStep}
              removeSubStep={removeSubStep}
            />
          ))}
          <button onClick={addMoreTests}>Add More Tests</button>
        </div>
      </div>
    </>
  );
}

export default App;
