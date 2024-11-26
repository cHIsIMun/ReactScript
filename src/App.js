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
    <div className="flex flex-col items-center gap-4 p-6 bg-blue-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-blue-600">
        🖩 Contador: <span className="text-blue-800">{contador}</span>
      </h1>
      <button
        onClick={() => setContador(contador + 1)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
      >
        Incrementar ➕
      </button>
    </div>
  );
}

component App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div>
        <h1 className="text-4xl font-bold text-gray-700 mb-6">Exemplo de Contador</h1>
        <Contador />
      </div>
    </div>
  );
}
`,
    },
    {
      nome: '📋 Lista de Tarefas',
      codigo: `component TodoList() {
  state tarefas = [];
  state concluidas = []; // Array para armazenar tarefas riscadas
  ref inputRef = null;

  return (
    <div className="max-w-lg mx-auto p-6 bg-green-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-green-600 mb-4">📋 Lista de Tarefas</h1>
      <div className="flex gap-2 mb-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="Nova tarefa"
          className="flex-grow px-4 py-2 border border-green-300 rounded-lg shadow focus:outline-none"
        />
        <button
          onClick={() => {
            if (inputRef.current.value) {
              setTarefas([...tarefas, inputRef.current.value]);
              setConcluidas([...concluidas, false]); // Adiciona um estado de "não riscado" para a nova tarefa
              inputRef.current.value = '';
            }
          }}
          className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
        >
          Adicionar ➕
        </button>
      </div>
      <ul className="list-disc list-inside text-green-800">
        {tarefas.map((tarefa, index) => (
          <li
            key={index}
            onClick={() => {
              const novasConcluidas = [...concluidas];
              novasConcluidas[index] = !novasConcluidas[index];
              setConcluidas(novasConcluidas);
            }}
            className={
              "cursor-pointer" +
              (concluidas[index] ? " line-through text-gray-500" : "")
            }
          >
            {tarefa}
          </li>
        ))}
      </ul>
    </div>
  );
}

component App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <TodoList />
    </div>
  );
}

`,
    },
    {
      nome: '⏱️ Cronômetro',
      codigo: `component Cronometro() {
  state tempo = 0;
  state ativo = false;
  ref intervalId = null;

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-red-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-red-600">
        ⏱️ Cronômetro: <span className="text-red-800">{tempo}s</span>
      </h1>
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (!ativo) {
              setAtivo(true);
              intervalId.current = setInterval(() => {
                setTempo((prevTempo) => prevTempo + 1);
              }, 1000);
            }
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        >
          Iniciar ▶️
        </button>
        <button
          onClick={() => {
            if (ativo) {
              setAtivo(false);
              clearInterval(intervalId.current);
            }
          }}
          className="px-4 py-2 bg-red-400 text-white rounded-lg shadow hover:bg-red-500 transition"
        >
          Pausar ⏸️
        </button>
        <button
          onClick={() => {
            setTempo(0);
            if (ativo) {
              setAtivo(false);
              clearInterval(intervalId.current);
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
        >
          Resetar 🔄
        </button>
      </div>
    </div>
  );
}

component App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Cronometro />
    </div>
  );
}
`,
    },
    {
      nome:'📝 Notas Simples',
      codigo: `component Notas() {
  state notas = [];
  ref inputRef = null;

  return (
    <div className="max-w-md mx-auto p-6 bg-purple-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-purple-600 mb-4">📝 Minhas Notas</h1>
      <div className="flex gap-2 mb-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="Escreva uma nota..."
          className="flex-grow px-4 py-2 border border-purple-300 rounded-lg shadow focus:outline-none"
        />
        <button
          onClick={() => {
            if (inputRef.current.value) {
              setNotas([...notas, inputRef.current.value]);
              inputRef.current.value = '';
            }
          }}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 transition"
        >
          Adicionar ➕
        </button>
      </div>
      <ul className="list-decimal list-inside text-purple-800">
        {notas.map((nota, index) => (
          <li key={index} className="mb-1">{nota}</li>
        ))}
      </ul>
    </div>
  );
}

component App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Notas />
    </div>
  );
}
`
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
