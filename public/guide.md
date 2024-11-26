# Guia Completo: ReactScript

Bem-vindo ao **ReactScript**, uma linguagem simples para prototipagem rápida de componentes React com sintaxe simplificada. Este guia oferece um passo a passo para aprender e usar ReactScript, desde os conceitos básicos até os limites de sua funcionalidade.

---

## **📚 O que é ReactScript?**
ReactScript é uma linguagem inspirada no React que simplifica a criação de componentes usando uma sintaxe enxuta. Ele permite declarar estados, efeitos e referências diretamente no componente, usando palavras-chave específicas.

---

## **🛠️ Palavras-chave e Sintaxe**
ReactScript introduz as seguintes palavras-chave:

### 1. **`component`**
Define um componente React. A estrutura é semelhante à de uma função, mas encapsula o componente como uma unidade lógica.

```javascript
component MeuComponente() {
  // Corpo do componente
}
```

---

### 2. **`state`**
Declara um estado React diretamente. O estado é usado para armazenar informações mutáveis no componente.

```javascript
state contador = 0;
```

Este exemplo cria um estado chamado `contador` com valor inicial `0`.

---

### 3. **`effect`**
Define um efeito colateral, equivalente ao `useEffect` no React.

```javascript
effect [contador] {
  console.log("Contador mudou para:", contador);
}
```

Este efeito será executado sempre que `contador` for atualizado.

---

### 4. **`ref`**
Cria uma referência mutável, equivalente ao `useRef` no React.

```javascript
ref inputRef = null;
```

---

### 5. **Funções no Componente**
Funções podem ser declaradas diretamente dentro do componente para encapsular lógica.

```javascript
function incrementar() {
  setContador(contador + 1);
}
```

---

## **👣 Passo a Passo para Aprender ReactScript**

### **1. Entenda a Estrutura de um Componente**
Um componente básico ReactScript tem:
- Declarações de estado (`state`).
- Referências (`ref`).
- Lógica com funções.
- Retorno de JSX.

Exemplo:

```javascript
component Exemplo() {
  state mensagem = "Olá, mundo!";
  
  return (
    <div>
      <h1>{mensagem}</h1>
    </div>
  );
}
```

---

### **2. Trabalhe com Estados**
Aprenda a usar `state` para gerenciar dados mutáveis.

```javascript
component Contador() {
  state contador = 0;

  return (
    <div>
      <h1>Contador: {contador}</h1>
      <button onClick={() => setContador(contador + 1)}>Incrementar</button>
    </div>
  );
}
```

---

### **3. Use Efeitos**
Adicione efeitos colaterais para sincronizar lógica externa.

```javascript
component EfeitoExemplo() {
  state mensagem = "Olá!";
  
  effect [mensagem] {
    console.log("Mensagem mudou para:", mensagem);
  }

  return (
    <div>
      <h1>{mensagem}</h1>
      <button onClick={() => setMensagem("Nova mensagem!")}>Atualizar</button>
    </div>
  );
}
```

---

### **4. Manipule Referências**
Use `ref` para interagir diretamente com elementos do DOM.

```javascript
component InputFocus() {
  ref inputRef = null;

  return (
    <div>
      <input ref={inputRef} placeholder="Digite algo" />
      <button onClick={() => inputRef.current.focus()}>Focar</button>
    </div>
  );
}
```

---

### **5. Combine Tudo**
Crie componentes complexos com múltiplos estados, referências e funções.

```javascript
component TodoList() {
  state tarefas = [];
  ref inputRef = null;

  return (
    <div>
      <input ref={inputRef} placeholder="Nova tarefa" />
      <button
        onClick={() => {
          if (inputRef.current.value) {
            tarefas.push(inputRef.current.value);
            inputRef.current.value = '';
          }
        }}
      >
        Adicionar
      </button>
      <ul>
        {tarefas.map((tarefa, index) => (
          <li key={index}>{tarefa}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## **💡 Boas Práticas**
- **Simplicidade:** Use ReactScript para protótipos ou componentes simples.
- **Clareza:** Nomeie funções, estados e referências de forma clara.
- **Encapsulamento:** Declare funções e lógica dentro do componente.

---

## **⚠️ Limitações**
1. **Transformação para React:**
   ReactScript depende de um transpilador para converter sua sintaxe em código React padrão.
   
2. **Sem Recursos Avançados:**
   Recursos como `useReducer` ou contextos React não são suportados diretamente.

3. **JSX Simples:**
   JSX deve ser estruturado corretamente, e funções anônimas complexas no `onClick` podem gerar problemas.

4. **Manutenção de Estados:**
   Atualizações de estados complexos requerem cuidado adicional, pois mutações diretas são permitidas.

---

## **📈 Dicas para Praticar**
1. **Comece Simples:** Crie componentes básicos como botões ou listas.
2. **Explore Estados e Efeitos:** Teste dependências diferentes no `effect`.
3. **Desafios Práticos:**
   - Contador.
   - Cronômetro.
   - Lista de Tarefas com exclusão.
4. **Teste Limites:** Experimente lógica complexa e identifique como adaptar para React padrão.

---

## **🔧 Ferramentas e Ambiente**
- **Editor:** Use o Monaco Editor com suporte a ReactScript.
- **Preview:** Implemente uma área de visualização para testar os componentes.

---

## **🎯 Conclusão**
ReactScript é ideal para prototipagem rápida e aprendizagem de conceitos fundamentais do React. Embora limitado para projetos complexos, sua sintaxe simplificada pode acelerar o desenvolvimento de interfaces interativas.

✨ Divirta-se explorando e criando com ReactScript!