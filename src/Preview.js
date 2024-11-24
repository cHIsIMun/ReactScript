import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import * as Babel from 'babel-standalone';
import antlr4 from 'antlr4';
import JavaScriptLexer from './Transpiler/Grammar/JavaScriptLexer.js';
import JavaScriptParser from './Transpiler/Grammar/JavaScriptParser.js';
import ReactScriptTranspiler from './Transpiler/ReactScriptTranspiler.js';

const Preview = ({ code, showGuide }) => {
  const iframeRef = useRef(null);
  const [guideContent, setGuideContent] = useState('');

  useEffect(() => {
    if (showGuide) {
      // Busca o conteúdo do guia a partir da pasta public
      fetch('/Guide.md')
        .then((response) => response.text())
        .then((text) => {
          setGuideContent(text);
        })
        .catch((error) => {
          console.error('Erro ao carregar o guia:', error);
          setGuideContent('# Erro ao carregar o guia');
        });
      return; // Sai antecipadamente, pois não precisamos transpilar o código
    }

    const transpileCode = () => {
      try {
        // Transpilar o código ReactScript para React
        const chars = new antlr4.InputStream(code);
        const lexer = new JavaScriptLexer(chars);
        const tokens = new antlr4.CommonTokenStream(lexer);
        const parser = new JavaScriptParser(tokens);
        const tree = parser.program();

        const visitor = new ReactScriptTranspiler();
        const out = visitor.visit(tree);
        console.log('Transpiled React code:', out);

        const codeWithReact = `
          const { useState, useEffect, useRef } = React;
          ${out}
        `;

        const transformedCode = Babel.transform(codeWithReact, {
          presets: ['es2015', 'react'],
          plugins: ['transform-object-rest-spread'],
        }).code;

        // Escapa o código transformado para evitar injeção
        const escapedCode = transformedCode.replace(/<\/script>/g, '<\\/script>');

        const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Preview</title>
  <!-- Include Tailwind CSS via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Tailwind configuration -->
  <script>
    tailwind.config = {
      theme: {
        extend: {},
      },
      corePlugins: {
        preflight: false,
      },
    }
  </script>
</head>
<body class="p-4">
  <div id="root"></div>
  <script crossorigin src="https://unpkg.com/react@17/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
  <!-- Error handling script -->
  <script>
    window.addEventListener('error', function(event) {
      const errorMsg = document.createElement('div');
      errorMsg.style.color = 'red';
      errorMsg.innerHTML = '<h4>Error:</h4><pre>' +
        event.message + '\\n' +
        event.filename + ':' + event.lineno + ':' + event.colno + '\\n' +
        (event.error && event.error.stack ? event.error.stack : '') +
        '</pre>';
      document.body.innerHTML = '';
      document.body.appendChild(errorMsg);
      console.error(event);
    });
  </script>
  <script type="text/javascript">
    try {
      ${escapedCode}
      ReactDOM.render(React.createElement(App), document.getElementById('root'));
    } catch (error) {
      const errorMsg = document.createElement('div');
      errorMsg.style.color = 'red';
      errorMsg.innerHTML = '<h4>Runtime Error:</h4><pre>' +
        error.message + '\\n' +
        error.stack +
        '</pre>';
      document.body.innerHTML = '';
      document.body.appendChild(errorMsg);
      console.error(error);
    }
  </script>
</body>
</html>
`;

        const iframe = iframeRef.current;
        iframe.srcdoc = html;
      } catch (err) {
        console.error('Compilation Error:', err);
        const errorHtml = `
          <div style="color: red; padding: 20px;">
            <h4>Compilation Error:</h4>
            <pre>${err.message || err}\n${err.stack || ''}</pre>
          </div>
        `;
        const iframe = iframeRef.current;
        iframe.srcdoc = errorHtml;
      }
    };

    transpileCode();
  }, [code, showGuide]);

  if (showGuide) {
    return (
      <div className="h-full p-8 prose prose-lg">
        <ReactMarkdown>{guideContent}</ReactMarkdown>
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full bg-white"
      title="Preview"
      sandbox="allow-scripts"
    />
  );
};

export default Preview;
