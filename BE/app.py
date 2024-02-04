from flask import Flask, request, jsonify
from flask_cors import CORS
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import openai
import re

app = Flask(__name__)
CORS(app, resources={r"/run-test": {"origins": "http://localhost:3000"}})
openai.api_key = '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'

class TestExecutor:
    def __init__(self, headless=True):
        options = webdriver.ChromeOptions()
        options.headless = headless
        self.driver = webdriver.Chrome(options=options)

    def execute_command(self, action, selector_type, selector_value, expected_text=None):
        try:
            element = None
            if selector_type == "id":
                element = self.driver.find_element(by=By.ID, value=selector_value)
            elif selector_type == "class":
                element = self.driver.find_element(by=By.CLASS_NAME, value=selector_value)
            elif selector_type == "name":
                element = self.driver.find_element(by=By.NAME, value=selector_value)
            elif selector_type == "text":
                element = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, f"//button[contains(., '{selector_value}')]"))
                )

            if action == "Click" and element:
                element.click()
                return "Success"
            elif action == "Check":
                element_text = element.text if element else ""
                if expected_text and expected_text == element_text:
                    return "Success"
                elif expected_text:
                    return f"Failure: Text '{element_text}' does not match expected '{expected_text}'"
                else:
                    return "Success: Text found"
            else:
                return f"Failure: Unsupported action '{action}' or element not found"

        except NoSuchElementException:
            return f"Failure: Could not find element with {selector_type}='{selector_value}'"
        except TimeoutException:
            return f"Failure: Timeout while waiting for element with {selector_type}='{selector_value}'"
        except Exception as e:
            return f"Failure: {str(e)}"

def interpret_scenario(scenario):
    steps = scenario.split(' then ')
    commands = []

    for step in steps:
        response = openai.Completion.create(
            model="gpt-3.5-turbo-instruct",
            prompt=(
                f"Translate the following user story into structured commands for a test automation script:\n\n"
                f"'{step}'\n\n"
                "Provide the type of action (Click or Check), the selector method (id, class, name), "
                "the selector's value, and any expected text if applicable. Write each piece of information "
                "on a new line."
            ),
            max_tokens=150,
        )
        response_text = response.choices[0].text.strip().split("\n")
        
        # Debugging output
        print(f"Response text for '{step}': {response_text}")

        if len(response_text) >= 3:  # Expecting at least action, selector type, and selector value
            action = response_text[0].replace('Action:', '').strip()
            selector_type = response_text[1].strip()
            selector_value = response_text[2].strip()
            expected_text = response_text[3].strip() if len(response_text) > 3 else None

            command = {
                "action": action,
                "selector_type": selector_type,
                "selector_value": selector_value,
                "expected_text": expected_text
            }
            commands.append(command)
        else:
            print(f"Could not interpret the step: {step}")
            commands.append({"error": "Could not interpret the step", "original_text": step})

    return commands

@app.route('/run-test', methods=['POST'])
@app.route('/run-test', methods=['POST'])
def run_test():
    data = request.json
    scenario = data["scenario"]
    url = data["url"]

    tester = TestExecutor(headless=False)
    tester.driver.get(url)
    results = []

    try:
        for command in interpret_scenario(scenario):
            if "error" in command:
                # If there's an error in the command, append it to the results and possibly stop processing further commands.
                results.append({"error": command["error"], "original_text": command["original_text"]})
                print(f"Error in command: {command['error']}")
                break
            else:
                # If there's no error, execute the command normally.
                result = tester.execute_command(**command)
                results.append(result)
                if "Failure" in result:
                    break  # Stop the sequence upon the first failure.
    finally:
        tester.driver.quit()
    
    return jsonify({"results": results})

if __name__ == "__main__":
    app.run(debug=True)