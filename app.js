// ===== PARTE 1 – Manipulação e validação de dados =====
const pedidos = [
  { cliente: "Bia", valor: 120, status: "pago" },
  { cliente: "", valor: 50, status: "pago" },
  { cliente: "Caio", valor: -10, status: "pago" },
  { cliente: "Dani", valor: 80.5, status: "pendente" },
  { cliente: "Edu", valor: "abc", status: "pago" },
  { cliente: "Fabi", valor: 200.456, status: "pago" },
];

const pedidoValido = (p) =>
  typeof p.cliente === "string" &&
  p.cliente.trim() !== "" &&
  typeof p.valor === "number" &&
  Number.isFinite(p.valor) &&
  p.valor > 0;

const pedidosValidos = pedidos.filter(pedidoValido);
const pedidosPagos = pedidosValidos.filter((p) => p.status === "pago");
const totalFaturado = pedidosPagos.reduce((acc, p) => acc + p.valor, 0);
const textosPedidos = pedidosPagos.map((p) => `${p.cliente} — R$ ${p.valor.toFixed(2)}`);

console.log("Pedidos válidos:", pedidosValidos);
console.log("Pedidos pagos:", pedidosPagos);
console.log("Total faturado:", totalFaturado.toFixed(2));
textosPedidos.forEach((t) => console.log(t));

const listaPedidos = document.querySelector("#resultado-pedidos");
textosPedidos.forEach((t) => {
  const li = document.createElement("li");
  li.textContent = t;
  listaPedidos.append(li);
});
document.querySelector("#total-pedidos").textContent =
  `Total faturado: R$ ${totalFaturado.toFixed(2)}`;

// ===== Utilitário: estados da tela =====
function setStatus(el, mensagem, tipo = "") {
  el.textContent = mensagem;
  el.className = tipo ? `status ${tipo}` : "status";
}

// ===== PARTE 2 – Buscador de CEP =====
const formCep = document.querySelector("#form-cep");
const inputCep = document.querySelector("#cep");
const btnCep = document.querySelector("#btn-cep");
const statusCep = document.querySelector("#status-cep");
const resultadoCep = document.querySelector("#resultado-cep");
const historicoCepEl = document.querySelector("#historico-cep");
const historicoCep = []; // bônus: array de objetos

function renderizarHistorico() {
  historicoCepEl.replaceChildren();
  historicoCep.forEach((h) => {
    const li = document.createElement("li");
    li.textContent = `${h.cep} — ${h.cidade}/${h.uf}`;
    historicoCepEl.append(li);
  });
}

async function buscarCep(cep) {
  // Carregando
  setStatus(statusCep, "Buscando...");
  btnCep.disabled = true;
  resultadoCep.replaceChildren();

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const dados = await response.json();

    // Vazio / não encontrado
    if (dados.erro) {
      setStatus(statusCep, "CEP não encontrado", "vazio");
      return;
    }

    // Sucesso
    const campos = [
      ["Rua", dados.logradouro],
      ["Bairro", dados.bairro],
      ["Cidade", dados.localidade],
      ["UF", dados.uf],
    ];
    resultadoCep.replaceChildren();
    campos.forEach(([rotulo, valor]) => {
      const dt = document.createElement("dt");
      dt.textContent = rotulo;
      const dd = document.createElement("dd");
      dd.textContent = valor || "—";
      resultadoCep.append(dt, dd);
    });
    setStatus(statusCep, "");
    historicoCep.push({ cep, cidade: dados.localidade, uf: dados.uf });
    renderizarHistorico();
  } catch (erro) {
    // Erro de rede, timeout ou HTTP
    console.error(erro);
    setStatus(statusCep, "Falha na conexão. Tente novamente.", "erro");
  } finally {
    btnCep.disabled = false;
  }
}

formCep.addEventListener("submit", (e) => {
  e.preventDefault();
  const cep = inputCep.value.trim().replace(/[-.\s]/g, "");
  if (!/^\d{8}$/.test(cep)) {
    resultadoCep.replaceChildren();
    setStatus(statusCep, "CEP inválido: informe exatamente 8 dígitos.", "erro");
    return;
  }
  buscarCep(cep);
});

// ===== PARTE 3 – Mini Pokédex =====
const formPokemon = document.querySelector("#form-pokemon");
const inputPokemon = document.querySelector("#pokemon");
const btnPokemon = document.querySelector("#btn-pokemon");
const statusPokemon = document.querySelector("#status-pokemon");
const resultadoPokemon = document.querySelector("#resultado-pokemon");

async function buscarPokemon(nome) {
  setStatus(statusPokemon, "Buscando...");
  btnPokemon.disabled = true;
  resultadoPokemon.replaceChildren();

  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nome)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (response.status === 404) {
      setStatus(statusPokemon, "Pokémon não encontrado", "vazio");
      return;
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const dados = await response.json();

    const titulo = document.createElement("h3");
    titulo.textContent = dados.name;

    const img = document.createElement("img");
    img.src = dados.sprites.front_default ?? "";
    img.alt = `Sprite de ${dados.name}`;

    const tipos = document.createElement("p");
    tipos.textContent = `Tipos: ${dados.types.map((t) => t.type.name).join(", ")}`;

    resultadoPokemon.replaceChildren(titulo, img, tipos);
    setStatus(statusPokemon, "");
  } catch (erro) {
    console.error(erro);
    setStatus(statusPokemon, "Falha na conexão. Tente novamente.", "erro");
  } finally {
    btnPokemon.disabled = false;
  }
}

formPokemon.addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = inputPokemon.value.trim().toLowerCase();
  if (nome === "") {
    resultadoPokemon.replaceChildren();
    setStatus(statusPokemon, "Digite o nome de um Pokémon.", "erro");
    return;
  }
  buscarPokemon(nome);
});
