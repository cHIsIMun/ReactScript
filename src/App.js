// src/App.js
import React, { useState, useEffect } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import Preview from './Preview';

function App() {
  // Estado para o código

  const exemplos = [
    {
      nome: 'Contador Funcional',
      codigo: `component Contador() {
  state contador = 0;

  effect [contador] {
    console.log("Contador atualizado:", contador);
  }

  return (
    <div>
      <h1>Contador: {contador}</h1>
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
      nome: 'Contador',
      codigo: `component Contador() {
  state contador = 0;

  effect [contador] {
    console.log("Contador atualizado:", contador);
  }

  return (
    <div>
      <h1>Contador: {contador}</h1>
      <button onClick={() => contador++}>Incrementar</button>
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
      nome: 'Lista de Tarefas',
      codigo: `component TodoList() {
  state tarefas = [];
  ref inputRef = null;

  function adicionarTarefa() {
    if (inputRef.value) {
      tarefas.push(inputRef.value);
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
      nome: 'Cronômetro',
      codigo: `component Cronometro() {
  state tempo = 0;
  state ativo = false;
  ref intervalId = null;

  function iniciar() {
    if (!ativo) {
      ativo = true;
      intervalId = setInterval(() => tempo++, 1000);
    }
  }

  function pausar() {
    if (ativo) {
      ativo = false;
      clearInterval(intervalId);
    }
  }

  function resetar() {
    tempo = 0;
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

  // Estado para controlar a exibição do guia
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    loader.init().then((monaco) => {
      monaco.languages.register({ id: 'reactscript' });

      monaco.languages.setMonarchTokensProvider('reactscript', {
        tokenizer: {
          root: [
            // Palavras-chave
            [/\b(component|state|effect|ref|return|function)\b/, 'keyword'],
            // Números
            [/\b\d+(\.\d+)?\b/, 'number'],
            // Strings
            [/"([^"\\]|\\.)*"/, 'string'],
            [/'([^'\\]|\\.)*'/, 'string'],
            // Comentários
            [/\/\/.*$/, 'comment'],
            [/\/\*[\s\S]*?\*\//, 'comment'],
            // Brackets
            [/[{}()[\]]/, '@brackets'],
            // Operadores
            [/[-=+\/*<>!%&|^~]+/, 'operator'],
            // Delimitadores
            [/[;,.]/, 'delimiter'],
            // Identificadores
            [/[A-Z][\w\$]*/, 'type.identifier'], // Nomes de componentes
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

  // Função para atualizar o código quando um exemplo é selecionado
  const handleExampleChange = (event) => {
    const selectedExample = exemplos.find((ex) => ex.nome === event.target.value);
    if (selectedExample) {
      setCode(selectedExample.codigo);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Cabeçalho */}
      <header className="bg-zinc-950 text-white p-4">
        <h1 className="text-2xl font-bold">ReactScript Editor</h1>
        {/* Títulos: Código e Preview */}
        <div className="grid grid-cols-2 w-full mt-4">
          <div className="flex justify-between px-4">
            <h2 className="font-semibold">Código</h2>
            {/* Select com exemplos */}
            <select
              onChange={handleExampleChange}
              className="bg-zinc-800 text-white px-2 py-1 rounded"
            >
              {exemplos.map((exemplo) => (
                <option key={exemplo.nome} value={exemplo.nome}>
                  {exemplo.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-between px-4">
            <h2 className="font-semibold">Preview</h2>
            <button
              className="bg-zinc-800 hover:bg-zinc-900 text-white font-bold py-1 px-4 rounded"
              onClick={() => setShowGuide(!showGuide)}
            >
              {showGuide ? 'Ocultar Guia' : 'Exibir Guia'}
            </button>
          </div>
        </div>
      </header>
      {/* Conteúdo principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor de Código */}
        <div className="w-1/2">
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
        <div className="w-1/2 border-l border-gray-700 flex flex-col overflow-hidden">
          <Preview code={code} showGuide={showGuide} />
        </div>
      </div>
    </div>
  );
}

export default App;
