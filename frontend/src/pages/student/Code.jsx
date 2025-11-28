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
  const [editorWidth, setEditorWidth] = useState(50); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const editorRef = useRef(null);
  const containerRef = useRef(null);

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

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const handleMouseMove = (e) => {
    if (!isResizing || !containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    if (newWidth > 20 && newWidth < 80) {
      setEditorWidth(newWidth);
    }
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResizing]);

  return (
    <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <h1 className="text-white font-semibold text-sm">Code Workspace</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
          >
            {isRunning ? <Loader className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>
          <button
            onClick={handleSaveSubmission}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700 transition-colors text-sm"
          >
            <Save className="h-4 w-4" />
            <span>Submit</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <select
            value={selectedAssignment || ''}
            onChange={(e) => setSelectedAssignment(e.target.value)}
            className="bg-gray-700 text-white text-sm border-none rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Assignment</option>
            {getActiveAssignments().map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-gray-700 text-white text-sm border-none rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>
      </div>

      {/* Editor and Output */}
      <div ref={containerRef} className="flex-1 flex gap-0 min-h-0 overflow-hidden" style={{ userSelect: isResizing ? 'none' : 'auto' }}>
        {/* Code Editor */}
        <div className="bg-gray-900 border-r border-gray-700 overflow-hidden flex flex-col" style={{ width: `${editorWidth}%` }}>
          <div className="px-4 py-2 border-b border-gray-700 flex items-center justify-between bg-gray-800">
            <div className="flex items-center space-x-2">
              <Code2 className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-200">Code Editor</span>
            </div>
            <span className="text-xs text-gray-400 uppercase">{language}</span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
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

        {/* Resize Handle */}
        <div
          className="w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors"
          onMouseDown={handleMouseDown}
          style={{ userSelect: 'none' }}
        />

        {/* Output Panel */}
        <div className="bg-gray-900 overflow-hidden flex flex-col" style={{ width: `${100 - editorWidth}%` }}>
          <div className="px-4 py-2 border-b border-gray-700 flex items-center space-x-2 bg-gray-800">
            <FileText className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-200">Output</span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto bg-gray-900">
            {output ? (
              <pre className="p-4 font-mono text-sm whitespace-pre-wrap text-gray-100">
                {output}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-sm text-gray-400">Run your code to see output here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default StudentCode;
