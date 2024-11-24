# Guia do ReactScript

Bem-vindo ao **ReactScript**, uma linguagem que facilita a compreensão do React!

## Introdução

O ReactScript permite que você escreva componentes de forma mais simples e intuitiva.

## Sintaxe Básica

- **component**: Define um novo componente.
- **state**: Declara um estado interno.
- **effect**: Cria um efeito colateral semelhante ao `useEffect`.

## Exemplo

```reactscript
component Contador() {
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
