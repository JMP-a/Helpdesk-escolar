const formChamado = document.getElementById("form-chamado");
const mensagemStatus = document.getElementById("mensagem-status");

// Verifica se existe um chamado sendo editado.
// Verifica se existe um chamado sendo editado.
let chamadoEmEdicao = null;

const idEmEdicao = sessionStorage.getItem("chamadoEmEdicao");

async function carregarChamadoEmEdicao() {

    if (idEmEdicao === null) {
        return;
    }

    const { data: chamado, error } = await supabaseClient
        .from("chamados")
        .select("*")
        .eq("id", Number(idEmEdicao))
        .single();

    if (error || !chamado) {
        console.error("Erro ao buscar chamado:", error);

        sessionStorage.removeItem("chamadoEmEdicao");

        alert("O chamado não foi encontrado.");
        window.location.href = "chamados.html";
        return;
    }

    chamadoEmEdicao = chamado;

    document.getElementById("solicitante").value =
        chamado.solicitante || "Não informado";

    document.getElementById("solicitante").readOnly = true;

    document.getElementById("setor").value =
        chamado.setor;

    document.getElementById("setor").readOnly = true;

    document.getElementById("prioridade").value = {
        baixa: "Baixa",
        media: "Média",
        alta: "Alta"
    }[chamado.prioridade];

    document.getElementById("descricao").value =
        chamado.descricao;

    document.querySelector("h1").textContent =
        `Editar chamado #${chamado.id}`;

    formChamado.querySelector(
        'button[type="submit"]'
    ).textContent = "Salvar alterações";
}

carregarChamadoEmEdicao();

formChamado.addEventListener("submit", async function (evento) {
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

        const prioridadeBanco = novosDados.prioridade
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        const { error } = await supabaseClient
            .from("chamados")
            .update({
                descricao: novosDados.descricao,
                prioridade: prioridadeBanco
            })
            .eq("id", chamadoEmEdicao.id);

        if (error) {
            console.error("Erro ao editar chamado:", error);

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

        // Verifica o usuário autenticado
        const { data: { user }, error: erroUsuario } =
            await supabaseClient.auth.getUser();

        if (erroUsuario || !user) {
            throw new Error("Usuário não autenticado.");
        }

        // Salva o chamado no Supabase
        const { data: chamadoCriado, error } =
            await supabaseClient
                .from("chamados")
                .insert({
                    solicitante_id: user.id,
                    solicitante: dadosChamado.solicitante,
                    setor: dadosChamado.setor,
                    prioridade: dadosChamado.prioridade
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, ""),
                    descricao: dadosChamado.descricao
                })
                .select()
                .single();

        if (error) {
            throw error;
        }

        exibirMensagem(
            "Chamado registrado com sucesso!",
            "sucesso"
        );

        formChamado.reset();

    } catch (erro) {

        console.error("Erro ao salvar chamado:", erro);

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