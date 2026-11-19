const campoBusca = document.getElementById("buscar-chamados");
const containerLista = document.getElementById("lista-chamados");
const mensagemVazia = document.getElementById("mensagem-vazia");
const filtroStatus = document.getElementById("filtro-status");
const ordenarChamados = document.getElementById("ordenar-chamados");

// Renderiza os chamados ao abrir a página.
renderizarLista();

// Atualiza a lista quando o filtro muda.
campoBusca.addEventListener("input", renderizarLista);
filtroStatus.addEventListener("change", renderizarLista);
ordenarChamados.addEventListener("change", renderizarLista);

function renderizarLista() {

    const statusSelecionado = filtroStatus.value;
    const ordenacaoSelecionada = ordenarChamados.value;

    const termo = campoBusca.value;

    const resultadoBusca = buscarChamadosPorTexto(termo);

    const chamados = resultadoBusca.filter(chamado => {

        return (
            statusSelecionado === "Todos" ||
            chamado.status === statusSelecionado
        );

    });

    containerLista.innerHTML = "";

    if (chamados.length === 0) {
        mensagemVazia.hidden = false;
        return;
    }

    mensagemVazia.hidden = true;

    // Cria uma cópia para não modificar a lista original.
    const chamadosOrdenados = [...chamados];

    // Ordenação por data ou prioridade.
    chamadosOrdenados.sort((a, b) => {

        if (ordenacaoSelecionada === "recente") {
            return new Date(b.dataCriacao) - new Date(a.dataCriacao);
        }

        if (ordenacaoSelecionada === "antigo") {
            return new Date(a.dataCriacao) - new Date(b.dataCriacao);
        }

        if (ordenacaoSelecionada === "prioridade") {

            const pesos = {
                "Alta": 3,
                "Média": 2,
                "Baixa": 1
            };

            return pesos[b.prioridade] - pesos[a.prioridade];
        }

        return 0;

    });

    chamadosOrdenados.forEach(chamado => {

        containerLista.appendChild(
            criarCartaoChamado(chamado)
        );

    });

}

// Cria um elemento HTML com texto seguro.
function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) {
        elemento.className = classe;
    }

    if (texto !== undefined) {
        elemento.textContent = texto;
    }

    return elemento;
}

// Cria o cartão de um chamado.
function criarCartaoChamado(chamado) {
    const cartao = criarElemento("article", "cartao-chamado");

    // Cabeçalho.
    const topo = criarElemento("div", "cartao-chamado-topo");

    const numero = criarElemento(
        "span",
        "numero-chamado",
        `#${chamado.id}`
    );

    const prioridade = criarElemento(
        "span",
        `badge-prioridade prioridade-${chamado.prioridade.toLowerCase()}`,
        chamado.prioridade
    );

    topo.append(numero, prioridade);

    // Informações.
    const solicitante = criarElemento(
        "p",
        "info-solicitante",
        `Solicitante: ${chamado.solicitante || "Não informado"}`
    );

    const titulo = criarElemento(
        "h2",
        "titulo-chamado",
        `Local: ${chamado.setor}`
    );

    const descricao = criarElemento(
        "p",
        "descricao-chamado",
        chamado.descricao
    );

    const data = criarElemento(
        "span",
        "data-chamado",
        `Criado em: ${formatarData(chamado.dataCriacao)}`
    );

    // Rodapé e alteração de status.
    const rodape = criarElemento("div", "rodape-chamado");

    const label = criarElemento(
        "label",
        "rotulo-status",
        "Status:"
    );

    const seletorStatus = document.createElement("select");
    seletorStatus.className = "select-status";
    seletorStatus.dataset.id = chamado.id;

    seletorStatus.setAttribute(
        "aria-label",
        `Status do chamado ${chamado.id}`
    );

    STATUS_DISPONIVEIS.forEach(status => {
        const opcao = document.createElement("option");

        opcao.value = status;
        opcao.textContent = status;

        if (status === chamado.status) {
            opcao.selected = true;
        }

        seletorStatus.appendChild(opcao);
    });

    seletorStatus.addEventListener("change", aoMudarStatus);

    label.htmlFor = `status-${chamado.id}`;
    seletorStatus.id = `status-${chamado.id}`;

    // Botão de excluir chamado.
    const botaoExcluir = criarElemento(
        "button",
        "botao-excluir",
        "Exluir"
    );

    botaoExcluir.type = "button";

    botaoExcluir.addEventListener("click", () => {
        aoExcluirChamado(chamado.id);
    });

    rodape.append(label, seletorStatus, botaoExcluir);

    cartao.append(
        topo,
        titulo,
        solicitante,
        descricao,
        data,
        rodape
    );

    return cartao;
}

// Executada quando o usuário altera o status.
function aoMudarStatus(evento) {
    const id = Number(evento.target.dataset.id);
    const novoStatus = evento.target.value;

    const sucesso = atualizarStatus(id, novoStatus);

    if (!sucesso) {
        alert("Não foi possível atualizar o status desse chamado.");
        return;
    }

    renderizarLista();
}

// Executada quando o usuário solicita a exclusão.
function aoExcluirChamado(id) {

    const confirmou = confirm(
        `Tem certeza de que deseja excluir o chamado #${id}?`
    );

    if (!confirmou) {
        return;
    }

    const sucesso = removerChamado(id);

    if (!sucesso) {
        alert("Não foi possível excluir esse chamado.");
        return;
    }

    renderizarLista();

}

// Formata a data para DD/MM/AAAA HH:MM.
function formatarData(dataISO) {
    const data = new Date(dataISO);

    if (Number.isNaN(data.getTime())) {
        return "Data indisponível";
    }

    return data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}