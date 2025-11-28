import { useState, useEffect } from 'react';
import { Play, Send, ChevronDown, Eye, CheckCircle, XCircle } from 'lucide-react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as studentService from '../../services/studentService';
import { validateTestCases, formatTestResults } from '../../utils/testCaseValidator';

const LANGUAGES = {
  javascript: { id: 63, name: 'JavaScript', monaco: 'javascript', template: 'console.log("Hello World!");' },
  python: { id: 71, name: 'Python', monaco: 'python', template: 'print("Hello World!")' },
  cpp: { id: 54, name: 'C++', monaco: 'cpp', template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World!" << endl;\n    return 0;\n}' },
  java: { id: 62, name: 'Java', monaco: 'java', template: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}' },
  c: { id: 50, name: 'C', monaco: 'c', template: '#include <stdio.h>\n\nint main() {\n    printf("Hello World!\\n");\n    return 0;\n}' },
};

const CodeWorkspace = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(LANGUAGES.javascript.template);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('output'); // output, input, testcases
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [testsPassed, setTestsPassed] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const response = await studentService.getAssignments();
      // Backend returns { success: true, data: [...] }
      const data = response?.data?.data || response?.data || response?.assignments || response || [];
      setAssignments(Array.isArray(data) ? data : []);
      if (data.length > 0) {
        setSelectedAssignment(data[0]);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast.error('Failed to load assignments');
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(LANGUAGES[newLang].template);
    setOutput('');
    setExecutionTime(null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    setActiveTab('output');
    
    try {
      const startTime = Date.now();
      
      const response = await axios.post('http://localhost:3000/api/code/run', {
        language: language,
        sourceCode: code,
        input: input || undefined
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const endTime = Date.now();
      const time = ((endTime - startTime) / 1000).toFixed(2);
      setExecutionTime(time);

      if (response.data.success) {
        const result = response.data.result;
        let outputText = '';
        
        if (result.stdout) {
          outputText += result.stdout;
        }
        if (result.stderr) {
          outputText += '\n❌ Error:\n' + result.stderr;
        }
        if (result.compile_output) {
          outputText += '\n⚠️ Compilation:\n' + result.compile_output;
        }
        if (result.message) {
          outputText += '\nℹ️ Status: ' + result.message;
        }
        
        setOutput(outputText || 'No output');
      } else {
        setOutput('❌ Error: ' + response.data.error);
      }
    } catch (error) {
      console.error('Execution error:', error);
      setOutput('❌ Error: ' + (error.response?.data?.error || error.message));
      setExecutionTime(null);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunTests = () => {
    if (!selectedAssignment || !selectedAssignment.testCases) {
      toast.error('No test cases available for this assignment');
      return;
    }

    try {
      const result = validateTestCases(code, selectedAssignment.testCases, language);
      setTestResults(result);
      setTestsPassed(result.passed);
      setActiveTab('testcases');
      
      if (result.passed) {
        toast.success('All test cases passed! You can now submit.');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Error running test cases: ' + error.message);
      setTestsPassed(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssignment) {
      toast.error('Please select an assignment');
      return;
    }

    // Check if test cases exist and must pass
    if (selectedAssignment.testCases && selectedAssignment.testCases.length > 0) {
      if (!testsPassed) {
        toast.error('Please run and pass all test cases before submitting!');
        handleRunTests(); // Run tests automatically
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await studentService.submitAssignment({
        assignmentId: selectedAssignment.id,
        submittedCode: {
          language,
          code
        }
      });
      toast.success('Assignment submitted successfully!');
      setTestsPassed(false); // Reset for next submission
      setTestResults(null);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-white font-semibold text-sm">Browser Lab</h1>
          
          {/* Assignment Selector */}
          <select
            value={selectedAssignment?.id || ''}
            onChange={(e) => {
              const assignment = assignments.find(a => a.id === e.target.value);
              setSelectedAssignment(assignment);
            }}
            className="bg-gray-700 text-white text-sm border-none rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Assignment</option>
            {assignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2 text-gray-400 text-sm">
          <span className="text-white">⏱️ {executionTime ? `${executionTime}s` : '00:00'}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            {selectedAssignment ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedAssignment.title}
                  </h2>
                  <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Hide Problem
                  </button>
                </div>

                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedAssignment.description || 'No description provided.'}
                  </p>

                  {selectedAssignment.starterCode && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Starter Code:</h3>
                      <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                        <code>{JSON.stringify(selectedAssignment.starterCode, null, 2)}</code>
                      </pre>
                    </div>
                  )}

                  {selectedAssignment.dueDate && (
                    <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                      <p className="text-sm text-yellow-800">
                        <strong>Due:</strong> {new Date(selectedAssignment.dueDate).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Select an assignment to start coding</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="flex-1 flex flex-col">
          {/* Editor Toolbar */}
          <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <button className="text-gray-400 hover:text-white px-2 py-1 text-xs">
                <Eye className="h-4 w-4 inline mr-1" />
                Hide Problem
              </button>
            </div>

            <div className="flex items-center space-x-3">
              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-gray-700 text-white text-sm border-none rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(LANGUAGES).map(([key, lang]) => (
                  <option key={key} value={key}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 bg-gray-900">
            <Editor
              height="100%"
              language={LANGUAGES[language].monaco}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
                tabSize: 2,
                lineNumbers: 'on',
                roundedSelection: false,
                padding: { top: 16 },
              }}
            />
          </div>

          {/* Bottom Tabs Panel */}
          <div className="h-64 bg-white border-t border-gray-200 flex flex-col min-h-0">
            {/* Tabs */}
            <div className="flex items-center border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setActiveTab('input')}
                className={`px-4 py-2 text-sm font-medium border-r border-gray-200 ${
                  activeTab === 'input'
                    ? 'bg-white text-gray-900 border-b-2 border-blue-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Custom Input
              </button>
              <button
                onClick={() => setActiveTab('output')}
                className={`px-4 py-2 text-sm font-medium border-r border-gray-200 ${
                  activeTab === 'output'
                    ? 'bg-white text-gray-900 border-b-2 border-blue-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Output
              </button>
              <button
                onClick={() => setActiveTab('testcases')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'testcases'
                    ? 'bg-white text-gray-900 border-b-2 border-blue-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Test Cases
              </button>

              {/* Action Buttons */}
              <div className="ml-auto flex items-center space-x-2 px-4">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                >
                  <Play className="h-4 w-4" />
                  <span>{isRunning ? 'Running...' : 'Run Code'}</span>
                </button>
                {selectedAssignment?.testCases && selectedAssignment.testCases.length > 0 && (
                  <button
                    onClick={handleRunTests}
                    className={`flex items-center space-x-2 px-4 py-1.5 rounded transition-colors text-sm ${
                      testsPassed 
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {testsPassed ? <CheckCircle className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    <span>{testsPassed ? 'Tests Passed' : 'Run Tests'}</span>
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !selectedAssignment || (selectedAssignment?.testCases?.length > 0 && !testsPassed)}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto p-4 min-h-0">
              {activeTab === 'input' && (
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter input here (if needed)..."
                  className="w-full h-full bg-gray-50 border border-gray-200 rounded p-3 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}

              {activeTab === 'output' && (
                <div className="font-mono text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200 min-h-full overflow-auto">
                  {output || 'Run your code to see output here...'}
                </div>
              )}

              {activeTab === 'testcases' && (
                <div className="space-y-3">
                  {!testResults && selectedAssignment?.testCases ? (
                    <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded p-4">
                      <p className="font-medium mb-2">📝 Test Cases Available</p>
                      <p>Click "Run Tests" to validate your code against {selectedAssignment.testCases.length} test case(s).</p>
                      <p className="mt-2 text-xs text-gray-500">Note: You must pass all tests before submitting.</p>
                    </div>
                  ) : !testResults && !selectedAssignment?.testCases ? (
                    <div className="text-sm text-gray-600">
                      <p>No test cases available for this assignment.</p>
                    </div>
                  ) : null}
                  
                  {testResults && (
                    <div className="space-y-2">
                      <div className={`p-3 rounded border ${testResults.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <p className={`font-semibold ${testResults.passed ? 'text-green-700' : 'text-red-700'}`}>
                          {testResults.message}
                        </p>
                      </div>
                      
                      {formatTestResults(testResults.results).map((result) => (
                        <div 
                          key={result.index}
                          className={`p-3 rounded border ${result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                        >
                          <div className="flex items-start space-x-2">
                            {result.passed ? (
                              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 text-sm">
                              <p className="font-medium text-gray-900">Test #{result.index}: {result.description}</p>
                              <div className="mt-1 space-y-1 text-xs font-mono">
                                <p><span className="text-gray-600">Input:</span> {result.input}</p>
                                <p><span className="text-gray-600">Expected:</span> {result.expected}</p>
                                <p className={result.passed ? 'text-green-700' : 'text-red-700'}>
                                  <span className="text-gray-600">Got:</span> {result.actual}
                                </p>
                                {result.error && (
                                  <p className="text-red-600">Error: {result.error}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeWorkspace;
