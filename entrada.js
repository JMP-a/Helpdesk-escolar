const formEntrada = document.getElementById("formEntrada");
const formDirecao = document.getElementById("formDirecao");

// Função de autenticação
async function autenticar(email, senha, acessoDirecao) {

    // Faz login no Supabase
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: senha
    });

    if (error) {
        alert("E-mail ou senha incorretos.");
        console.error(error);
        return;
    }

    const usuario = data.user;

    // Busca o perfil do usuário no banco
    const { data: perfil, error: erroPerfil } = await supabaseClient
        .from("perfis")
        .select("nome, tipo")
        .eq("id", usuario.id)
        .single();

    if (erroPerfil || !perfil) {

        await supabaseClient.auth.signOut();

        alert("Perfil não encontrado no banco de dados.");
        console.error(erroPerfil);
        return;
    }

    // Verifica se o usuário está entrando pela tela correta
    if (acessoDirecao && perfil.tipo !== "diretor") {

        await supabaseClient.auth.signOut();

        alert("Esta conta não possui acesso à Direção.");
        return;
    }

    if (!acessoDirecao && perfil.tipo === "diretor") {

        await supabaseClient.auth.signOut();

        alert("A conta de Direção deve entrar pelo acesso da Direção.");
        return;
    }

    // Guarda os dados básicos da sessão no navegador
    localStorage.setItem(
        "tipoUsuario",
        perfil.tipo === "diretor" ? "direcao" : perfil.tipo
    );

    localStorage.setItem("nomeUsuario", perfil.nome);
    localStorage.setItem("emailUsuario", usuario.email);

    // Redireciona conforme o perfil
    if (perfil.tipo === "diretor") {
        window.location.href = "chamados.html";
    } else {
        window.location.href = "criar.html";
    }
}


// LOGIN DE USUÁRIO
formEntrada.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const senha = document.getElementById("senha").value;

    await autenticar(email, senha, false);

});


// LOGIN DA DIREÇÃO
formDirecao.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("emailDirecao").value.trim().toLowerCase();
    const senha = document.getElementById("senhaDirecao").value;

    await autenticar(email, senha, true);

});