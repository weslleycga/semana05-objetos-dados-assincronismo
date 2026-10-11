# Semana 05 – Objetos, Dados e Assincronismo

Mini projeto em JavaScript puro (`index.html` + `app.js`) que valida dados, consome APIs com `fetch` + `async/await` e renderiza o resultado no DOM tratando os quatro estados da tela. Abra o `index.html` no navegador (Console com F12 para ver a Parte 1).

## Partes

1. **Pedidos**: valida cada pedido (cliente não vazio, valor numérico > 0), filtra os de status `"pago"`, soma com `reduce` e formata textos como `Bia — R$ 120.00` com `toFixed(2)`.
2. **Buscador de CEP** (ViaCEP): valida com `trim()` + regex `/^\d{8}$/`, usa `AbortSignal.timeout(5000)` e guarda o histórico de buscas (bônus).
3. **Mini Pokédex** (PokéAPI): busca por nome (não vazio, minúsculo) e exibe nome, imagem e tipos.

## Os quatro estados da tela

| Estado | Comportamento |
| --- | --- |
| Carregando | Mostra "Buscando..." e desabilita o botão |
| Erro | Falha de rede, timeout ou `!response.ok` → mensagem de falha na conexão |
| Vazio | ViaCEP com chave `erro` → "CEP não encontrado"; PokéAPI 404 → "Pokémon não encontrado" |
| Sucesso | `replaceChildren()` + `createElement`/`textContent` para exibir os dados |

O `fetch` só rejeita em erro de rede; erros HTTP (404, 500) exigem checar `response.ok`. Dados de APIs externas são inseridos só com `textContent`, nunca `innerHTML`, evitando XSS.

## Para pensar: por que `Promise.all` pode ser mais rápido que vários `await` seguidos?

Com `await` sequencial, cada requisição só começa depois que a anterior termina, então o tempo total é a **soma** dos tempos. Com `Promise.all`, todas as requisições são disparadas ao mesmo tempo (em paralelo) e o código espera todas terminarem juntas, então o tempo total se aproxima do da **mais lenta**. Isso aproveita melhor o tempo de rede, desde que as requisições sejam independentes entre si.

```js
// Sequencial: ~ t1 + t2
const a = await fetch(urlA);
const b = await fetch(urlB);

// Paralelo: ~ max(t1, t2)
const [a, b] = await Promise.all([fetch(urlA), fetch(urlB)]);
```
