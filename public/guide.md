# Guia Completo: ReactScript

Bem-vindo ao **ReactScript**, uma linguagem simplificada para criar componentes React rapidamente. Com uma sintaxe amigável e prática, ReactScript é ideal para prototipagem, especialmente quando combinado com o poder do Tailwind CSS para estilização.

Neste guia, você aprenderá como usar ReactScript, explorar suas capacidades e compreender os limites do que ele oferece. 

---

## **📚 O que é ReactScript?**
ReactScript é uma linguagem voltada para a criação de interfaces React com uma sintaxe mais enxuta. Ele elimina a necessidade de código boilerplate para estados, efeitos e referências, permitindo que você foque na lógica e no design de seus componentes.

O ambiente de ReactScript já inclui:
- **Editor de texto** para digitar e editar seu código.
- **Preview interativo** para ver o resultado em tempo real.
- **Tailwind CSS integrado**, permitindo estilizar facilmente seus componentes usando classes Tailwind.

---

## **🛠️ Regras e Estrutura da Linguagem**

### **1. `component`: Definindo Componentes**
Todo código ReactScript deve conter ao menos um **`component App`**, que funciona como o ponto de entrada principal da aplicação. Sem isso, o código não será renderizado corretamente.

```javascript
component App() {
  return (
    <div>
      <h1>Bem-vindo ao ReactScript!</h1>
    </div>
  );
}
```

Componentes adicionais podem ser criados para modularizar o código.

---

### **2. `state`: Gerenciando Estados**
A palavra-chave **`state`** cria estados React diretamente no componente.

```javascript
state contador = 0;
```

- Estados podem ser acessados como variáveis no JSX.
- A atualização do estado é feita automaticamente usando o nome do estado precedido por `set`. Exemplo: `setContador(1)`.

---

### **3. `effect`: Trabalhando com Efeitos**
Efeitos colaterais são declarados com **`effect`**, semelhante ao `useEffect` do React. 

```javascript
effect [contador] {
  console.log("Contador mudou para:", contador);
}
```

- O array de dependências (como `[contador]`) define quando o efeito será executado.

---

### **4. `ref`: Criando Referências**
Use **`ref`** para criar referências mutáveis ao DOM, como em `useRef`.

```javascript
ref inputRef = null;
```

Referências podem ser usadas para interagir diretamente com elementos no JSX:

```javascript
<input ref={inputRef} />
```

---

## **💻 Exemplo Prático: Estrutura Básica**

Aqui está um exemplo básico que utiliza **estado**, **efeito** e **referência**:

```javascript
component App() {
  state contador = 0;
  ref inputRef = null;

  effect [contador] {
    console.log("Contador mudou:", contador);
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-blue-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-blue-600">
        Contador: {contador}
      </h1>
      <button
        onClick={() => setContador(contador + 1)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
      >
        Incrementar ➕
      </button>
      <input
        ref={inputRef}
        className="mt-4 px-4 py-2 border border-blue-300 rounded-lg shadow focus:outline-none"
        placeholder="Clique para focar"
      />
      <button
        onClick={() => inputRef.current.focus()}
        className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
      >
        Focar no Input
      </button>
    </div>
  );
}
```

---

## **🎨 Estilização com Tailwind**
O ambiente ReactScript inclui suporte completo ao **Tailwind CSS**, permitindo estilizar seus componentes facilmente usando classes Tailwind.

### Exemplo de Estilização:
```javascript
<div className="flex items-center justify-center bg-gray-100 h-screen">
  <h1 className="text-4xl font-bold text-blue-600">Olá, ReactScript!</h1>
</div>
```

Use qualquer classe do Tailwind para cores, fontes, espaçamentos e layouts.

---

## **👣 Passo a Passo: Criando Seu Primeiro Projeto**

1. **Defina o Componente `App`:** Sempre inicie com o componente `App`, pois ele é obrigatório para renderizar o código.

2. **Adicione Estados e Referências:**
   - Use `state` para gerenciar informações mutáveis.
   - Use `ref` para interagir diretamente com elementos do DOM.

3. **Implemente Efeitos (se necessário):**
   - Adicione lógica que precisa reagir a alterações de estado.

4. **Estilize com Tailwind:**
   - Utilize classes Tailwind para personalizar sua interface.

5. **Teste no Preview:** Veja suas alterações em tempo real no painel de preview.

---

## **⚠️ Limitações do ReactScript**

1. **Dependência de Preview:** ReactScript precisa de um ambiente específico para funcionar. Ele não será interpretado diretamente fora do editor com suporte ao transpilador.

2. **Funções Internas ao Componente:** Toda lógica de manipulação deve ser implementada dentro dos próprios componentes. Não há suporte para funções globais ou fora do escopo do componente.

3. **Estados e Atualizações Simples:** ReactScript suporta apenas estados gerenciados com `state` e `set`. Estados complexos ou `useReducer` não são compatíveis.

4. **JSX Estrito:** A sintaxe JSX deve ser bem formatada e obedecer às regras do React.

5. **Recursos Avançados:** Recursos como `useContext`, `useReducer` e `React.memo` não estão incluídos.

---

## **🛠️ Dicas de Uso**

- **Prototipagem:** Ideal para criar protótipos rapidamente sem configurar um ambiente React completo.
- **Exploração de Tailwind:** Teste diferentes classes e layouts com facilidade.
- **Aprendizado:** Uma excelente maneira de aprender os conceitos básicos de React de forma visual.

---

## **🎯 Conclusão**

ReactScript simplifica o desenvolvimento de componentes React, oferecendo uma experiência fluida e prática. Use-o para protótipos rápidos ou aprendizado inicial de React. Lembre-se de que ele não substitui o React em projetos completos, mas é uma ferramenta valiosa para criar e iterar ideias rapidamente.

🌟 Divirta-se criando com ReactScript e explore o poder do Tailwind para interfaces incríveis!