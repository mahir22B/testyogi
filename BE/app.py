from flask import Flask, request, jsonify
from flask_cors import CORS
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from openai import OpenAI

client = OpenAI(api_key='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')
import re

app = Flask(__name__)
CORS(app, resources={r"/run-test": {"origins": ["http://localhost:3000"]}})

class TestExecutor:
    def __init__(self, headless=True):
        options = webdriver.ChromeOptions()
        options.headless = headless
        self.driver = webdriver.Chrome(options=options)

    def verify_navigation(self, expected_url):
        current_url = self.driver.current_url
        if current_url == expected_url:
            return "Success"
        else:
            return f"Failure: Current URL ({current_url}) does not match expected URL ({expected_url})"
    

    def execute_command(self, action, selector_type, selector_value, expected_text=None):
        print(f"Action received: {action}") 
        if action.lower() == "verify navigation":
            return self.verify_navigation(expected_text)   
        try:
            print("Attempting to find element...")
            element = None
            if selector_type == "id" or "ID":
                element = self.driver.find_element(By.ID, selector_value)
            elif selector_type == "class":
                element = self.driver.find_element(By.CLASS_NAME, selector_value)
            elif selector_type == "name":
                element = self.driver.find_element(By.NAME, selector_value)
            elif selector_type == "xpath":
                element = self.driver.find_element(By.XPATH, selector_value)
            else:
                return f"Failure: Unsupported selector type '{selector_type}'"

            if element is not None:    
           # Perform the specified action
                if action.lower() == "click":
                    element.click()
                    return "Success"
                elif action.lower() == "Open URL":
                    url = selector_value.strip('"').strip("'")
                    self.driver.get(url)
                    return "Success"
                elif action.lower() in ["get text"]: 
                    actual_text = element.text
                    if expected_text and actual_text == expected_text:  
                        return "Success"
                    else:
                        return f"Failure: Text '{actual_text}' does not match expected '{expected_text}'" 
            else:
                return f"Failure: Unsupported action '{action}'"

        except NoSuchElementException:
            return f"Failure: Could not find element with {selector_type}='{selector_value}'"
        except Exception as e:
            return f"Failure: {str(e)}"        
        

def interpret_scenario(scenario):
    steps = scenario.split(' then ')
    commands = []

    for step in steps:
        if "should navigate to" in step:
            expected_url = step.split("should navigate to ")[1].strip()
            commands.append({
                "action": "verify navigation",
                "selector_type": "",  # Not applicable for navigation, but included for consistency
                "selector_value": "",  # Not applicable for navigation, but included for consistency
                "expected_text": expected_url,
            })
            continue
        else:    
            detailed_prompt = (
            f"Translate the following user story into Selenium WebDriver Python commands in a structured format:\n\n"
            f"'{step}'\n\n"
            "Format the response as follows:\n"
            "- Action: [The action to be performed]\n"
            "- Selector method: [id/class/name/xpath]\n"
            "- Selector value: [The value of the selector]\n"
            "- Expected text: [The expected text, if applicable]\n"
            "Provide the information in a list format, one item per line."
            """Example of what to do:
            User story: 'Click on the button with id max'
            - Action: Click
            - Selector method: id
            - Selector value: max
            - Expected text:

            Example of what to do:
            User story: 'the text with id value-new should be Got it'
            - Action: Get text
            - Selector method: id
            - Selector value: value-new
            - Expected text: Got it
            Please follow these formats strictly."""
            
        )
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant who can translate natural language into Selenium WebDriver Python commands."},
                    {"role": "user", "content": detailed_prompt}
                ]
            )

            if response.choices:
                response_text = response.choices[0].message.content.strip().split("\n")
            else:
                response_text = ["No choices in response."]
            
            print(f"Response text for '{step}': {response_text}")

            command = {}
            for line in response_text:
                if line.startswith('- Action:'):
                    command['action'] = line.split(':', 1)[1].strip()
                elif line.startswith('- Selector method:'):
                    command['selector_type'] = line.split(':', 1)[1].strip()
                elif line.startswith("- Selector value:"):
                    command['selector_value'] = line.split(':', 1)[1].strip()
                elif line.startswith('- Expected text:'):
                    command['expected_text'] = line.split(':', 1)[1].strip().strip('"')

        # Ensure all required keys are present
        if all(key in command for key in ['action', 'selector_type', 'selector_value']):
            commands.append(command)
        else:
            print(f"Could not fully interpret the step: {step}")
            commands.append({"error": "Could not interpret the step", "original_text": step})

    return commands

def adjust_ai_output_based_on_user_input(user_input, ai_generated_commands):
    steps = user_input.split(" then ")

    action_mappings = {
        "text": "Get text",
        "click" : "Click",
        # Add more mappings
    }

    for i, step in enumerate(steps):
        for key_phrase, expected_action in action_mappings.items():
            if key_phrase in step:
                # Ensure we have a corresponding AI command for this step
                if i < len(ai_generated_commands) and ai_generated_commands[i]['action'].lower() != expected_action.lower():
                    print(f"Step {i+1}: Adjusting action from {ai_generated_commands[i]['action']} to {expected_action}")
                    ai_generated_commands[i]['action'] = expected_action
                break

    return ai_generated_commands


@app.route('/run-test', methods=['POST'])
@app.route('/run-test', methods=['POST'])

def run_test():
    data = request.json
    scenario = data.get("scenario")
    url = data.get("url")

    tester = TestExecutor(headless=False) 
    results = []

    try:
        tester.driver.get(url)
        commands = interpret_scenario(scenario)
        adjusted_commands = adjust_ai_output_based_on_user_input(scenario, commands)

        print("scenario", scenario, "commands", commands)
        
        for command in adjusted_commands:
            if "error" in command:
                # Log the error and append "Failure" instead of the entire error object
                print(f"Error in command: {command['error']}")
                results.append("Failure")
                break 
            else:
                print("Final commands to execute:", adjusted_commands)
                # Execute the command
                result = tester.execute_command(**command)
                print(f"Command result: {result}")
                # Append "Success" or "Failure" based on command execution outcome
                results.append("Success" if result.startswith("Success") else "Failure")
                if result.startswith("Failure"):
                    break  # Stop on first failure
    except Exception as e:
        # Handle any exceptions that occur during test execution
        print(f"Exception during test execution: {str(e)}")
        results.append("Failure") 
    finally:
        tester.driver.quit()
    
    return jsonify({"results": results})

if __name__ == "__main__":
    app.run(debug=True)