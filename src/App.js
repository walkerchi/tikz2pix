import React, { useState, useEffect, useCallback, useRef } from 'react';
import AceEditor from 'react-ace';
import { debounce } from 'lodash';
import './App.css'; // Import the CSS file

// Import necessary Ace Editor parts
import 'ace-builds/src-noconflict/mode-latex';
import 'ace-builds/src-noconflict/theme-github';
// import tikzjaxJs from './tikzjax.js';
// import { TikZJax } from "./TikzJax";
import { downloadPDF, downloadSVG, downloadPNG } from './download';


// TODO:
// 1. first render the tikz onload 
// 2. Add PDF support



function App() {


  const [tikzCode, setTikzCode] = useState(`\\def \\n {5}
\\def \\radius {3cm}
\\def \\margin {8} % margin in angles, depends on the radius

\\foreach \\s in {1,...,\\n}
{
  \\node[draw, circle] at ({360/\\n * (\\s - 1)}:\\radius) {$\\s$};
  \\draw[->, >=latex] ({360/\\n * (\\s - 1)+\\margin}:\\radius) 
    arc ({360/\\n * (\\s - 1)+\\margin}:{360/\\n * (\\s)-\\margin}:\\radius);
}
      `);

  const [isTikzLoaded, setIsTikzLoaded] = useState(false);

  const [downloadFormat, setDownloadFormat] = useState("png");

  const [backgroundColor, setBackgroundColor] = useState("transparent");

  const [scale, setSCale] = useState(8)

  const containerRef = useRef();

  const tikzScriptsOnload = useCallback(async () => {
    setIsTikzLoaded(true);
    console.log(`after tikzjax loaded...  ${isTikzLoaded}`);
    handleCompile();
  }, [])

  useEffect(() => {
    const tikzjaxScript = document.createElement('script');
      tikzjaxScript.type = "application/javascript"
      tikzjaxScript.src = '/tikzjax.js';
      tikzjaxScript.async = true;
      tikzjaxScript.defer = true;
    document.head.appendChild(tikzjaxScript)

    tikzjaxScript.onload = () =>{
      console.log(`Is Tikz Loaded ${isTikzLoaded}`);
      setIsTikzLoaded(true);
      handleCompile();
    };

  
  }, [tikzScriptsOnload]);
  

  // Memoize handleCompile to avoid unnecessary re-renders
  const handleCompile = useCallback(() => {
    console.log(`handle compile, isTikzLoaded：${isTikzLoaded}`)
    if(isTikzLoaded){
      const tikzContainer = document.getElementById('tikz-container');

      // Clear existing content in the container
      tikzContainer.innerHTML = '';
  
      // Create a new script element
      const script = document.createElement('script');
      script.setAttribute('type','text/tikz');
      script.textContent = `
    \\begin{tikzpicture}
    ${tikzCode}
    \\end{tikzpicture}
      `;
      
      
      // Append the script inside the container
      tikzContainer.innerHTML = ''
      tikzContainer.appendChild(script);
      window.process_tikz(script);
      
    }
  
  
  }, [tikzCode]); // Dependency array ensures this function is only recreated when tikzCode changes

  useEffect(() => {
    if (tikzCode) {
      const debouncedHandleCompile = debounce(() => {
        if (tikzCode) {
          handleCompile();
        }
      }, 300); // 300ms debounce delay
  
      debouncedHandleCompile();
  
      // Cleanup function to cancel the debounce on unmount
      return () => {
        debouncedHandleCompile.cancel();
      };
  
    }
  }, [tikzCode, handleCompile, tikzScriptsOnload]); // Adding handleCompile as a dependency

  const download = (e)=>{
    console.log(`Download: Format(${downloadFormat}) backgroundColor(${backgroundColor}) scale(${scale})`)
    if(downloadFormat === "svg"){
      downloadSVG(containerRef);
    }else if(downloadFormat === "png"){
      downloadPNG(containerRef, backgroundColor, scale);
    }else if(downloadFormat === "pdf"){
      downloadPDF(containerRef);
    }
  }
  

  return (
    <div 
      className="app-container"
    // style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}
    >
      <h1
      className="app-title" 
      // style={{ textAlign: 'center', margin: '20px 0' }}
      >TikZ 2 Pix</h1>
      <div 
      className="editor-container"
      // style={{ display: 'flex', flex: 1 }}
      >
        <div 
        className="editor-wrapper"
        // style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          <AceEditor        
            mode="latex"
            theme="github"
            onChange={(newValue) => setTikzCode(newValue)}
            name="TIKZ_EDITOR"
            editorProps={{ $blockScrolling: true }}
            value={tikzCode}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: true,
              showGutter: true,
              highlightActiveLine: true,
            }}
            className="ace-editor"
            style={{ width: '100%', height: '70vh' }} 
            // Customize size
          />
        </div>
        <div id="tikz-container" 
        className="tikz-container"
        ref={containerRef}
        // style={{ flex: 1, padding: '20px', border: '1px solid #ccc' }}
        >
          {/* TikZ output will be rendered here */}
        </div>
      </div>
      <div className="controls-container">
        <select
           className="select"
            value={scale}
            onChange={(e) => setSCale(e.target.value)}
          >
            <option value={1}>x1</option>
            <option value={2}>x2</option>
            <option value={4}>x4</option>
            <option value={8}>x8</option>
            <option value={16}>x16</option>
          </select>
        <select
           className="select"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          >
            <option value="white">White</option>
            <option value="transparent">Transparent</option>
          </select>
        <select 
            className="select"
            value={downloadFormat} 
            onChange={(e) => setDownloadFormat(e.target.value)} 
            style={{ marginRight: '10px' }}
          >
            <option value="pdf">PDF</option>
            <option value="png">PNG</option>
            <option value="svg">SVG</option>
            {/* Add more formats as needed */}
          </select>
          <button className="button" onClick={download}>Download</button>
          
      </div>
    </div>
  );
}

export default App;
