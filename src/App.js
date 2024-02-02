import React, { useState } from 'react';
import './App.css';

function App() {
    const [tests, setTests] = useState([
        { scenario: '', subScenarios: [], url: '', status: null, loading: false }
    ]);

    const API_BASE_URL = "http://127.0.0.1:5000/";

    const runTest = async (index) => {
        const currentTest = tests[index];
        const scenarioString = [currentTest.scenario, ...currentTest.subScenarios].join(' then ').trim();
    
        updateTest(index, 'loading', true);
    
        try {
            let response = await fetch(`${API_BASE_URL}/run-test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...currentTest, scenario: scenarioString })
            });
    
            if (!response.ok) {
                throw new Error(`HTTP status ${response.status}`);
            }
    
            let data = await response.json();
            console.log(data);
            if (data.results && data.results.length > 0) {
                const resultStatus = data.results[0] === "Success" ? "success" : "failed";
                updateTest(index, 'status', resultStatus);
            } else {
                updateTest(index, 'status', 'failed'); // If there are no results, mark as failed
            }
        } catch (error) {
            console.error("Error running the test:", error);
            alert(`Error running test: ${error.message}`);
        } finally {
            updateTest(index, 'loading', false);
        }
    };
    

    const addMoreTests = () => {
        setTests(tests => [...tests, { scenario: '', subScenarios: [], url: '', status: null, loading:false }]);
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
        if (!newTests[index].subScenarios || newTests[index].subScenarios.length === 0) {
            newTests[index].subScenarios = [''];
        } else {
            newTests[index].subScenarios.push('');
        }
        setTests(newTests);
    };

    const updateSubStep = (index, subIndex, value) => {
        const newTests = [...tests];
        newTests[index].subScenarios[subIndex] = value;
        setTests(newTests);
    };

    const removeSubStep = (index, subIndex) => {
        const newTests = [...tests];
        newTests[index].subScenarios.splice(subIndex, 1);
        setTests(newTests);
    };

    const getStatusCounts = () => {
        let successful = 0, failed = 0, yetToTest = 0;
        tests.forEach((test) => {
            if (test.status === "success") {
                successful++;
            } else if (test.status === "failed") {
                failed++;
            } else {
                yetToTest++;
            }
        });
        return { successful, failed, yetToTest };
    };

    const { successful, failed, yetToTest } = getStatusCounts();

    return (
        <>
            {/* <header className="test-header">
                <div>Successful: <span className="successful-count">{successful}</span></div>
                <div>Failed: <span className="failed-count">{failed}</span></div>
                <div>Yet to Test: <span className="yetToTest-count">{yetToTest}</span></div>
            </header> */}
            <div className="App">
                <div className="test-container">
                    {tests.map((test, index) => (
                        <div key={index} className="test">
                            <div className="test-row">
                                <input
                                    type="text"
                                    placeholder="Main Scenario"
                                    value={test.scenario}
                                    onChange={(e) => updateTest(index, 'scenario', e.target.value)}
                                    className='main-input'
                                />
                                <input
                                    type="text"
                                    placeholder="URL"
                                    value={test.url}
                                    onChange={(e) => updateTest(index, 'url', e.target.value)}
                                    className='main-input'
                                />
                                <button onClick={() => runTest(index)}>
                                    {test.loading ? 'Testing...' : (test.status === "success" ? "Re-Test" : "Test Now")}
                                </button>
                                {/* {tests.length > 1 && <button onClick={() => removeTest(index)} className="remove-button">X</button>} */}
                            {test.status === "success" && <span className="success-tick">&#10004;</span>}
                            {test.status === "failed" && <span className="failure-x">&#10008;</span>}
                            {!test.status && !test.loading && <div className="clock-symbol"></div>}
                                {tests.length > 1 && (
                                    <button onClick={() => removeTest(index)} className="remove-button">X</button>
                                )}
                            </div>
                            {test.subScenarios.length > 0 && test.subScenarios.map((subScenario, subIndex) => (
                                <div key={`sub-${index}-${subIndex}`} className="sub-scenario-input">
                                    <input
                                        type="text"
                                        placeholder="Then..."
                                        value={subScenario}
                                        onChange={(e) => updateSubStep(index, subIndex, e.target.value)}
                                        className='sub-text-box'
                                    />
                                    <button onClick={() => removeSubStep(index, subIndex)} className="remove-step-button">-</button>
                                </div>
                            ))}
                            <button onClick={() => addSubStepInput(index)} className="add-step-button">+</button>
                           
                        </div>
                    ))}
                    <button onClick={addMoreTests}>Add More Tests</button>
                </div>
            </div>
        </>);
}

export default App;