import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, Code2, FileText, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import apiClient from '../../utils/apiClient';

const CODE_TEMPLATES = {
  python: `# Python Code
def main():
    print("Hello from Python!")
    
if __name__ == "__main__":
    main()
`,
  cpp: `// C++ Code
#include <iostream>
using namespace std;

int main() {
    cout << "Hello from C++!" << endl;
    return 0;
}
`,
  java: `// Java Code
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
    }
}
`,
  javascript: `// JavaScript Code
console.log("Hello from JavaScript!");
`,
};

const LANGUAGE_IDS = {
  python: 71,
  cpp: 54,
  java: 62,
  javascript: 63,
};

const StudentCode = () => {
  const [code, setCode] = useState(CODE_TEMPLATES.python);
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const response = await apiClient.get('/api/student/assignments');
      setAssignments(response.data.assignments || response.data || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setCode(CODE_TEMPLATES[newLanguage]);
    setOutput('');
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!');
      return;
    }

    setIsRunning(true);
    setOutput('Running code...\n');

    try {
      const response = await apiClient.post('/api/code/run', {
        language: language,
        sourceCode: code,
      });

      const result = response.data;
      
      if (result.status === 'success') {
        setOutput(`✓ Execution successful\n\n${result.output || 'No output'}`);
        toast.success('Code executed successfully!');
      } else if (result.status === 'error') {
        setOutput(`✗ Error:\n\n${result.error || result.message || 'Unknown error'}`);
        toast.error('Execution failed');
      } else {
        // Handle Judge0 response format
        if (result.stdout) {
          setOutput(`✓ Output:\n\n${result.stdout}`);
          toast.success('Code executed successfully!');
        } else if (result.stderr) {
          setOutput(`✗ Error:\n\n${result.stderr}`);
          toast.error('Execution error');
        } else if (result.compile_output) {
          setOutput(`✗ Compilation Error:\n\n${result.compile_output}`);
          toast.error('Compilation failed');
        } else {
          setOutput('Code executed. No output.');
        }
      }
    } catch (error) {
      console.error('Error running code:', error);
      setOutput(`✗ Error:\n\n${error.response?.data?.message || error.message || 'Failed to execute code'}`);
      toast.error('Failed to run code');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveSubmission = async () => {
    if (!selectedAssignment) {
      toast.error('Please select an assignment first!');
      return;
    }

    if (!code.trim()) {
      toast.error('Please write some code first!');
      return;
    }

    try {
      toast.info('Saving submission...');
      await apiClient.post('/api/student/submissions', {
        assignmentId: selectedAssignment,
        submittedCode: {
          language: language,
          code: code,
        },
      });
      toast.success('Submission saved successfully!');
    } catch (error) {
      console.error('Error saving submission:', error);
      toast.error(error.response?.data?.message || 'Failed to save submission');
    }
  };

  const getActiveAssignments = () => {
    return assignments.filter((a) => new Date(a.dueDate) > new Date());
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Code Workspace</h1>
          <p className="text-sm text-gray-600 mt-1">Write, run, and submit your code</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? <Loader className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>
          <button
            onClick={handleSaveSubmission}
            className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Submission</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Programming Language
            </label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment (Optional)
            </label>
            <select
              value={selectedAssignment || ''}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">Select Assignment</option>
              {getActiveAssignments().map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.title} - Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Editor and Output */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Code Editor */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center space-x-2">
              <Code2 className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Code Editor</span>
            </div>
            <span className="text-xs text-gray-500 uppercase">{language}</span>
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: true,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on',
              }}
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center space-x-2 bg-gray-50">
            <FileText className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Output</span>
          </div>
          <div className="flex-1 min-h-0 overflow-auto">
            {output ? (
              <pre className="p-4 font-mono text-sm whitespace-pre-wrap text-gray-900">
                {output}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">Run your code to see output here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Tips:</strong> Write your code in the editor, click "Run Code" to test it, 
          and use "Save Submission" to submit for an assignment. Select an assignment from the dropdown above.
        </p>
      </div>
    </div>
  );
};

export default StudentCode;
