const formChamado = document.getElementById("form-chamado");
const mensagemStatus = document.getElementById("mensagem-status");

// Verifica se existe um chamado sendo editado.
let chamadoEmEdicao = null;

const idEmEdicao = sessionStorage.getItem(
    "chamadoEmEdicao"
);

if (idEmEdicao !== null) {

    const id = Number(idEmEdicao);

    chamadoEmEdicao = listarChamados().find(
        chamado => chamado.id === id
    );

    if (chamadoEmEdicao) {

        document.getElementById("setor").value =
            chamadoEmEdicao.setor;

        document.getElementById("setor").readOnly = true;

        document.getElementById("prioridade").value =
            chamadoEmEdicao.prioridade;

        document.getElementById("descricao").value =
            chamadoEmEdicao.descricao;

        document.querySelector("h1").textContent =
            `Editar chamado #${id}`;

        formChamado.querySelector(
            'button[type="submit"]'
        ).textContent = "Salvar alterações";

    } else {

        sessionStorage.removeItem("chamadoEmEdicao");

        alert("O chamado selecionado não foi encontrado.");

    }
}

formChamado.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const dadosChamado = {
        solicitante: document.getElementById("solicitante").value.trim(),
        setor: document.getElementById("setor").value.trim(),
        prioridade: document.getElementById("prioridade").value,
        descricao: document.getElementById("descricao").value.trim()
    };

    // Se estiver editando, atualiza o chamado existente.
if (chamadoEmEdicao) {

    const novosDados = {
        descricao: document.getElementById("descricao").value.trim(),
        prioridade: document.getElementById("prioridade").value
    };

    if (
        !novosDados.descricao ||
        !novosDados.prioridade
    ) {
        exibirMensagem(
            "Preencha todos os campos.",
            "erro"
        );

        return;
    }

    const sucesso = atualizarChamado(
        chamadoEmEdicao.id,
        novosDados
    );

    if (!sucesso) {
        exibirMensagem(
            "Não foi possível atualizar o chamado.",
            "erro"
        );

        return;
    }

    sessionStorage.removeItem("chamadoEmEdicao");

    window.location.href = "chamados.html";

    return;
}

    if (!validarDadosChamado(dadosChamado)) {
        exibirMensagem("Preencha todos os campos.", "erro");
        return;
    }

    try {
        const chamadoCriado = salvarChamado(dadosChamado);

        exibirMensagem(
            `Chamado #${chamadoCriado.id} registrado com sucesso!`,
            "sucesso"
        );

        formChamado.reset();

    } catch (erro) {
        console.error(erro);
        exibirMensagem(
            "Não foi possível salvar o chamado.",
            "erro"
        );
    }
});

function validarDadosChamado(dados) {
    return (
        dados.solicitante !== "" &&
        dados.setor !== "" &&
        dados.prioridade !== "" &&
        dados.descricao !== ""
    );
}

function exibirMensagem(texto, tipo) {
    mensagemStatus.textContent = texto;
    mensagemStatus.className = `mensagem-status ${tipo}`;
}