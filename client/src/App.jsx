import { useState, useEffect, useCallback } from "react";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from "axios";
import { FiSun, FiMoon, FiCopy } from "react-icons/fi";
import "./App.css";

function App() {
  const [code, setCode] = useState(`function sum(a, b) {
  // Calculate the sum of two numbers
  return a + b;
}`);

  const [review, setReview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    prism.highlightAll();
  }, [review]);

  const reviewCode = useCallback(async () => {
    if (!code.trim()) {
      setError("Please enter some code to review");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.post("https://code-sense-backend.onrender.com/ai/get-review", {
        code,
      });
      setReview(response.data);
    } catch (err) {
      setError("Failed to get review. Please try again.");
      console.error("Review error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [code]);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`app-container ${darkMode ? "dark" : "light"}`}>
      <header className="app-header">
        <div className="logo">
          <div className="logo-mark">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 8l4 4-4 4m6-8l4 4-4 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="logo-wordmark">
            <span className="logo-primary">Code</span>
            <span className="logo-secondary">Sense</span>
          </h1>
        </div>
        <div className="header-controls">
          <button onClick={copyCode} className="icon-button" title="Copy code">
            <FiCopy size={20} />
            {copied && <span className="copy-tooltip">Copied!</span>}
          </button>
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
        </div>
      </header>

      <main>
        <div className="left-panel">
          <div className="panel-header">
            <h2>Code Editor</h2>
          </div>
          <div className="editor-container">
            <Editor
              value={code}
              onValueChange={setCode}
              highlight={(code) =>
                prism.highlight(code, prism.languages.javascript, "javascript")
              }
              padding={16}
              style={{
                fontFamily: '"Fira Code", "Fira Mono", monospace',
                fontSize: 14,
                height: "100%",
                width: "100%",
              }}
              textareaClassName="code-textarea"
              preClassName="code-pre"
            />
          </div>
          <button
            onClick={reviewCode}
            className="review-button"
            disabled={isLoading}
          >
            {isLoading ? <span className="spinner"></span> : "Get Code Review"}
          </button>
        </div>

        <div className="right-panel">
          <div className="panel-header">
            <h2>Review</h2>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="markdown-container">
            <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
