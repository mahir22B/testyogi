<h1>TestYogi</h1>

TestYogi is an automated testing application that integrates with Selenium WebDriver and OpenAI's GPT models to interpret natural language instructions for automated web testing scenarios. It allows users to define test scenarios in plain English, which are then executed against specified web applications, making automated testing a breeze.

At its core, the application utilizes OpenAI's GPT models for Natural Language Processing, enabling it to understand and interpret test scenarios described in plain English. This feature is coupled with the robustness of Selenium WebDriver, which takes these interpreted commands and executes them. As a result, users can perform a variety of actions such as clicking buttons, entering text, selecting items from dropdowns, and explicitly waiting for elements—all articulated in simple language. The application is designed with extensibility in mind, promising future enhancements to support a broader spectrum of testing functionalities.

<h2>Demo</h2>

Here's the link for the demo

https://www.youtube.com/watch?v=IBmZ90OjFtM

<h2>Getting Started</h2>

This guide will walk you through setting up and running the application. It covers both the backend, built with Flask and leveraging OpenAI's GPT models, and the frontend, created with React.

<h3>Prerequisites</h3>
OpenAI api key<br>
Python 3 or higher<br>
Node.js and npm (Node Package Manager)

<h3>Setup and Execution</h3>

1) Clone the repo
   
2) Navigate to the project directory
   
3) Install the required Python packages:
   ```pip install -r requirements.txt```

4) API Key Configuration*<br>
   To securely manage your OpenAI API key, create a .env file in the root directory and add your API key:
   ```OPENAI_API_KEY=your_api_key_here```

   
6) Run the flask app:
   ```python app.py```
   
7) Navigate to root directory of React app and install npm dependencies:
   ```npm install```

8) Start the React App:
   ```npm start```
   

<h3>*Security Note.</h3>
 
Directly embedding API keys in source code is strongly discouraged as it poses significant security risks. The use of environment variables, as outlined above, is a best practice for managing sensitive information and is crucial in maintaining the security integrity of your application. Always ensure your .env file is included in your .gitignore to prevent accidental exposure.
 







