import React, { useState, useEffect } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import Preview from './Preview';

function App() {
  const exemplos = [
    {
      nome: '🖩 Contador com Botão',
      codigo: `component Contador() {
  state contador = 0;

  effect [contador] {
    console.log("Contador atualizado:", contador);
  }

  return (
    <div>
      <h1>Contador: {contador}</h1>
      <button onClick={() => setContador(contador + 1)}>Incrementar</button>
    </div>
  );
}

component App() {
  return (
    <div>
      <h1>Exemplo de Contador</h1>
      <Contador />
    </div>
  );
}`,
    },
    {
      nome: '📋 Lista de Tarefas',
      codigo: `component TodoList() {
  state tarefas = [];
  ref inputRef = null;

  function adicionarTarefa() {
    if (inputRef.value) {
      setTarefas([...tarefas, inputRef.value]);
      inputRef.value = '';
    }
  }

  return (
    <div>
      <h1>Lista de Tarefas</h1>
      <input ref={inputRef} type="text" placeholder="Nova tarefa" />
      <button onClick={adicionarTarefa}>Adicionar</button>
      <ul>
        {tarefas.map(tarefa => (
          <li key={tarefa}>{tarefa}</li>
        ))}
      </ul>
    </div>
  );
}

component App() {
  return (
    <div>
      <TodoList />
    </div>
  );
}`,
    },
    {
      nome: '⏱️ Cronômetro',
      codigo: `component Cronometro() {
  state tempo = 0;
  state ativo = false;
  ref intervalId = null;

  function iniciar() {
    if (!ativo) {
      setAtivo(true);
      intervalId = setInterval(() => setTempo(tempo + 1), 1000);
    }
  }

  function pausar() {
    if (ativo) {
      setAtivo(false);
      clearInterval(intervalId);
    }
  }

  function resetar() {
    setTempo(0);
    pausar();
  }

  return (
    <div>
      <h1>Cronômetro: {tempo}s</h1>
      <button onClick={iniciar}>Iniciar</button>
      <button onClick={pausar}>Pausar</button>
      <button onClick={resetar}>Resetar</button>
    </div>
  );
}

component App() {
  return (
    <div>
      <Cronometro />
    </div>
  );
}`,
    },
  ];

  const [code, setCode] = useState(exemplos[0].codigo);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    loader.init().then((monaco) => {
      monaco.languages.register({ id: 'reactscript' });
      monaco.languages.setMonarchTokensProvider('reactscript', {
        tokenizer: {
          root: [
            [/\b(component|state|effect|ref|return|function)\b/, 'keyword'],
            [/\b\d+(\.\d+)?\b/, 'number'],
            [/"([^"\\]|\\.)*"/, 'string'],
            [/'([^'\\]|\\.)*'/, 'string'],
            [/\/\/.*$/, 'comment'],
            [/\/\*[\s\S]*?\*\//, 'comment'],
            [/[{}()[\]]/, '@brackets'],
            [/[-=+\/*<>!%&|^~]+/, 'operator'],
            [/[;,.]/, 'delimiter'],
            [/[A-Z][\w\$]*/, 'type.identifier'],
            [/[a-zA-Z_$][\w$]*/, 'identifier'],
          ],
        },
      });
      monaco.editor.defineTheme('reactscriptDark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6A9955' },
          { token: 'keyword', foreground: 'C586C0' },
          { token: 'number', foreground: 'B5CEA8' },
          { token: 'string', foreground: 'CE9178' },
          { token: 'operator', foreground: 'D4D4D4' },
          { token: 'delimiter', foreground: 'D4D4D4' },
          { token: 'identifier', foreground: '9CDCFE' },
          { token: 'type.identifier', foreground: '4EC9B0' },
          { token: '@brackets', foreground: 'D4D4D4' },
        ],
        colors: {
          'editor.background': '#1E1E1E',
        },
      });
    });
  }, []);

  const handleExampleChange = (event) => {
    const selectedExample = exemplos.find((ex) => ex.nome === event.target.value);
    if (selectedExample) {
      setCode(selectedExample.codigo);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            ✨ ReactScript Playground
          </h1>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="bg-blue-700 hover:bg-blue-600 transition px-4 py-2 rounded text-white text-sm font-semibold"
          >
            {showGuide ? '📖 Ocultar Guia' : '📘 Exibir Guia'}
          </button>
        </div>
        <div className="flex justify-between items-center px-4 py-2 bg-gray-700 border-t border-gray-600">
          <h2 className="font-medium text-lg">🛠️ Editor de Código</h2>
          <select
            onChange={handleExampleChange}
            className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 hover:border-gray-500 transition"
          >
            {exemplos.map((exemplo) => (
              <option key={exemplo.nome} value={exemplo.nome}>
                {exemplo.nome}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Code Editor */}
        <div className="w-1/2 border-r border-gray-700">
          <Editor
            height="100%"
            defaultLanguage="reactscript"
            value={code}
            onChange={(value) => setCode(value)}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
            }}
          />
        </div>

        {/* Preview */}
        <div className="w-1/2 bg-white flex flex-col overflow-auto">
          <Preview code={code} showGuide={showGuide} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-center py-3 border-t border-gray-700">
        <p className="text-sm text-gray-400">
          🌌 Desenvolvido com 💻 e ☕ | ReactScript Playground
        </p>
      </footer>
    </div>
  );
}

export default App;
