import { useState } from "react";
import { Play } from "lucide-react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { toast } from "react-toastify";

const LANGUAGES = {
  javascript: {
    id: 63,
    name: "JavaScript",
    monaco: "javascript",
    template:
      '// JavaScript Example\nconsole.log("Hello, World!");\n\n// Function example\nfunction factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}\n\nconsole.log("Factorial of 5:", factorial(5));',
  },
  python: {
    id: 71,
    name: "Python",
    monaco: "python",
    template:
      '# Python Example\nprint("Hello, World!")\n\n# Function example\ndef factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint("Factorial of 5:", factorial(5))',
  },
  cpp: {
    id: 54,
    name: "C++",
    monaco: "cpp",
    template:
      '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
  },
  java: {
    id: 62,
    name: "Java",
    monaco: "java",
    template:
      'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  },
};

const CodeWorkspaceNew = () => {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(LANGUAGES.javascript.template);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [status, setStatus] = useState("");

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(LANGUAGES[newLang].template);
    setOutput("");
    setExecutionTime(null);
    setStatus("");
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("Running code...");
    setStatus("");

    try {
      const startTime = Date.now();

      const response = await axios.post(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
        }/api/code/run`,
        {
          language: language,
          sourceCode: code,
          input: input || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem("token") || sessionStorage.getItem("token")
            }`,
            "Content-Type": "application/json",
          },
        }
      );

      const endTime = Date.now();
      const time = ((endTime - startTime) / 1000).toFixed(3);
      setExecutionTime(time);

      if (response.data.success) {
        const result = response.data.result;
        let outputText = "";

        if (result.stdout) {
          outputText += result.stdout;
        }
        if (result.stderr) {
          outputText += "\n❌ Error:\n" + result.stderr;
        }
        if (result.compile_output) {
          outputText += "\n⚠️ Compilation:\n" + result.compile_output;
        }

        setOutput(outputText || "No output");
        setStatus(result.status?.description || "Accepted");
      } else {
        setOutput("❌ Error: " + response.data.error);
        setStatus("Error");
      }
    } catch (error) {
      console.error("Execution error:", error);
      setOutput("❌ Error: " + (error.response?.data?.error || error.message));
      setExecutionTime(null);
      setStatus("Error");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            <h1 className="text-xl font-bold text-gray-900">Code Playground</h1>
          </div>

          <p className="text-sm text-gray-500">
            Practice coding with instant feedback • Learn by doing
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50">
            Save
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50">
            Share
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50">
            Example
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700">
              Code Editor
            </span>
          </div>

          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(LANGUAGES).map(([key, lang]) => (
              <option key={key} value={key}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleRunCode}
          disabled={isRunning}
          className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          <Play className="h-4 w-4" fill="currentColor" />
          <span>{isRunning ? "Running..." : "Run Code"}</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor */}
        <div className="flex-1 bg-gray-900">
          <Editor
            height="100%"
            language={LANGUAGES[language].monaco}
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              automaticLayout: true,
              tabSize: 2,
              lineNumbers: "on",
              roundedSelection: false,
              padding: { top: 16 },
            }}
          />
        </div>

        {/* Right Panel - Input/Output */}
        <div className="w-96 flex flex-col bg-white border-l border-gray-200">
          {/* Input Section */}
          <div className="border-b border-gray-200">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">Input</h3>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input for your program..."
              className="w-full h-32 p-4 text-sm font-mono resize-none focus:outline-none border-none"
            />
          </div>

          {/* Output Section */}
          <div className="flex-1 flex flex-col">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Output</h3>
              {executionTime && (
                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-gray-600">{executionTime}ms</span>
                  <span
                    className={`px-2 py-1 rounded ${
                      status === "Accepted"
                        ? "bg-green-100 text-green-800"
                        : status === "Error"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {status || "Ready"}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-900">
              <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">
                {output || "Run your code to see output here..."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeWorkspaceNew;
