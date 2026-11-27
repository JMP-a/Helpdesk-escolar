const campoBusca = document.getElementById("buscar-chamados");
const containerLista = document.getElementById("lista-chamados");
const mensagemVazia = document.getElementById("mensagem-vazia");
const filtroStatus = document.getElementById("filtro-status");
const ordenarChamados = document.getElementById("ordenar-chamados");

const STATUS_DISPONIVEIS = [
    "Aberto",
    "Em andamento",
    "Resolvido"
];

// Lista recebida do Supabase
let chamadosBanco = [];

// Carrega os chamados ao abrir a página
carregarChamados();

campoBusca.addEventListener("input", renderizarLista);
filtroStatus.addEventListener("change", renderizarLista);
ordenarChamados.addEventListener("change", renderizarLista);

// Busca os chamados no Supabase
async function carregarChamados() {

    const { data, error } = await supabaseClient
        .from("chamados")
        .select("*")
        .order("criado_em", { ascending: false });

    if (error) {
        console.error("Erro ao buscar chamados:", error);
        alert("Não foi possível carregar os chamados.");
        return;
    }

    // Adapta os dados do banco para o formato usado nos cartões
    chamadosBanco = data.map(chamado => ({
        id: chamado.id,
        solicitante_id: chamado.solicitante_id,
        solicitante: chamado.solicitante,
        setor: chamado.setor,
        descricao: chamado.descricao,

        prioridade: {
            baixa: "Baixa",
            media: "Média",
            alta: "Alta"
        }[chamado.prioridade] || chamado.prioridade,

        status: {
            "aberto": "Aberto",
            "em andamento": "Em andamento",
            "concluido": "Resolvido"
        }[chamado.status] || chamado.status,

        dataCriacao: chamado.criado_em
    }));

    renderizarLista();
}

// Renderiza os chamados
function renderizarLista() {

    const statusSelecionado = filtroStatus.value;
    const ordenacaoSelecionada = ordenarChamados.value;
    const termo = campoBusca.value.toLowerCase().trim();

    // Pesquisa pelo nome ou descrição
    const resultadoBusca = chamadosBanco.filter(chamado => {

        return (
            chamado.solicitante.toLowerCase().includes(termo) ||
            chamado.descricao.toLowerCase().includes(termo)
        );

    });

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

    const chamadosOrdenados = [...chamados];

    // Ordenação por data ou prioridade
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

    // Botão de editar chamado.
    const botaoEditar = criarElemento(
        "button",
        "botao-editar",
        "Editar"
    );

    botaoEditar.type = "button";

    botaoEditar.addEventListener("click", () => {
        aoEditarChamado(chamado.id);
    });

    // Botão de excluir chamado.
    const botaoExcluir = criarElemento(
        "button",
        "botao-excluir",
        "Excluir"
    );

    botaoExcluir.type = "button";

    botaoExcluir.addEventListener("click", () => {
        aoExcluirChamado(chamado.id);
    });

    rodape.append(
        label,
        seletorStatus,
        botaoEditar,
        botaoExcluir
    );

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
async function aoMudarStatus(evento) {

    const id = Number(evento.target.dataset.id);
    const novoStatus = evento.target.value;

    // Converte o status do painel para o valor do banco
    const statusBanco = {
        "Aberto": "aberto",
        "Em andamento": "em andamento",
        "Resolvido": "concluido"
    };

    const statusFinal = statusBanco[novoStatus];

    const { error } = await supabaseClient
        .from("chamados")
        .update({ status: statusFinal })
        .eq("id", id);

    if (error) {

        console.error("Erro ao atualizar status:", error);

        alert("Não foi possível atualizar o status desse chamado.");
        await carregarChamados();
        return;
    }

    // Atualiza o chamado na lista local
    const chamado = chamadosBanco.find(
        chamado => chamado.id === id
    );

    if (chamado) {
        chamado.status = novoStatus;
    }

    renderizarLista();
} Z

// Encaminha o chamado selecionado para edição.
function aoEditarChamado(id) {

    const chamado = chamadosBanco.find(
        chamado => chamado.id === id
    );

    if (!chamado) {
        alert("Chamado não encontrado.");
        return;
    }

    sessionStorage.setItem(
        "chamadoEmEdicao",
        String(id)
    );

    window.location.href = "criar.html";
}

// Executada quando o usuário solicita a exclusão.
async function aoExcluirChamado(id) {

    const confirmou = confirm(
        `Tem certeza de que deseja excluir o chamado #${id}?`
    );

    if (!confirmou) {
        return;
    }

    const { error } = await supabaseClient
        .from("chamados")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Erro ao excluir chamado:", error);

        alert("Não foi possível excluir esse chamado.");
        return;
    }

    // Remove o chamado da lista exibida
    chamadosBanco = chamadosBanco.filter(
        chamado => chamado.id !== id
    );

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