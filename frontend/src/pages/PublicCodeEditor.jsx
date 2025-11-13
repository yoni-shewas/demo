import { useState } from 'react';
import { Play, Copy, Download, Share2, Settings } from 'lucide-react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const LANGUAGES = {
  javascript: { id: 63, name: 'JavaScript', defaultCode: 'console.log("Hello World!");' },
  python: { id: 71, name: 'Python', defaultCode: 'print("Hello World!")' },
  cpp: { id: 54, name: 'C++', defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World!" << endl;\n    return 0;\n}' },
  java: { id: 62, name: 'Java', defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}' },
  c: { id: 50, name: 'C', defaultCode: '#include <stdio.h>\n\nint main() {\n    printf("Hello World!\\n");\n    return 0;\n}' },
};

const PublicCodeEditor = () => {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(LANGUAGES.javascript.defaultCode);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [theme, setTheme] = useState('vs-dark');

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(LANGUAGES[newLang].defaultCode);
    setOutput('');
    setExecutionTime(null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    
    try {
      const startTime = Date.now();
      
      // Direct call to Judge0 API (you can also proxy through your backend)
      const response = await axios.post('http://localhost:3000/api/code/run', {
        language: language,
        sourceCode: code,
        input: input || undefined
      }, {
        headers: {
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
          outputText += '\n[Error]\n' + result.stderr;
        }
        if (result.compile_output) {
          outputText += '\n[Compilation]\n' + result.compile_output;
        }
        if (result.message) {
          outputText += '\n[Status]\n' + result.message;
        }
        
        setOutput(outputText || 'No output');
      } else {
        setOutput('Error: ' + response.data.error);
      }
    } catch (error) {
      console.error('Execution error:', error);
      setOutput('Error: ' + (error.response?.data?.error || error.message));
      setExecutionTime(null);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  const handleDownloadCode = () => {
    const ext = {
      javascript: 'js',
      python: 'py',
      cpp: 'cpp',
      java: 'java',
      c: 'c'
    }[language];
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareCode = () => {
    // Encode code to base64 for URL sharing
    const encoded = btoa(unescape(encodeURIComponent(code)));
    const shareUrl = `${window.location.origin}/code?lang=${language}&code=${encoded}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    } else {
      prompt('Copy this link:', shareUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">CodeLan Editor</h1>
            <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">
              Public Beta
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(LANGUAGES).map(([key, lang]) => (
                <option key={key} value={key}>
                  {lang.name}
                </option>
              ))}
            </select>

            {/* Theme Selector */}
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="vs-dark">Dark</option>
              <option value="light">Light</option>
              <option value="hc-black">High Contrast</option>
            </select>

            {/* Action Buttons */}
            <button
              onClick={handleCopyCode}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Copy Code"
            >
              <Copy className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleDownloadCode}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Download Code"
            >
              <Download className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleShareCode}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Share Code"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        <div className="flex-1 flex flex-col">
          <div className="bg-gray-800 px-6 py-2 flex items-center justify-between border-b border-gray-700">
            <span className="text-sm text-gray-400">Editor</span>
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4" />
              <span>{isRunning ? 'Running...' : 'Run Code'}</span>
            </button>
          </div>
          
          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme={theme}
              options={{
                fontSize: 14,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </div>
        </div>

        {/* Right Panel - Input/Output */}
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Input Section */}
          <div className="flex-1 flex flex-col border-b border-gray-700">
            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
              <span className="text-sm text-gray-400">Input</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input here (if needed)..."
              className="flex-1 bg-gray-900 text-gray-200 p-4 font-mono text-sm resize-none focus:outline-none"
            />
          </div>

          {/* Output Section */}
          <div className="flex-1 flex flex-col">
            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
              <span className="text-sm text-gray-400">Output</span>
              {executionTime && (
                <span className="text-xs text-green-400">
                  Executed in {executionTime}s
                </span>
              )}
            </div>
            <div className="flex-1 bg-gray-900 text-gray-200 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap">
              {output || 'Run your code to see output here...'}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-400">
          <div>
            <span>Powered by CodeLan LMS</span>
            <span className="mx-2">•</span>
            <a href="/login" className="text-blue-400 hover:text-blue-300">
              Sign in for more features
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <span>Supports: {Object.values(LANGUAGES).map(l => l.name).join(', ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicCodeEditor;
