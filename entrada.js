const formEntrada = document.getElementById("formEntrada");
const formDirecao = document.getElementById("formDirecao");

formEntrada.addEventListener("submit", function(event) {
    event.preventDefault();

    const cpf = document.getElementById("cpf").value.trim();
    const senha = document.getElementById("senha").value;

    // 1. Verificação do CPF
    const formatoCPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

    if (!formatoCPF.test(cpf)) {
        alert("Digite o CPF no formato 123.456.789-10.");
        return;
    }

    // 2. Verificação da senha
    if (senha.length < 8) {
        alert("A senha deve ter no mínimo 8 caracteres.");
        return;
    }

    // 3. Se passar pelas duas verificações
    salvarEntradaDemo();

    window.location.href = "chamados.html";
});

formDirecao.addEventListener("submit", function(event) {
    event.preventDefault();

    const cpf = document.getElementById("cpfDirecao").value.trim();
    const senha = document.getElementById("senhaDirecao").value;

    const formatoCPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

    if (!formatoCPF.test(cpf)) {
        alert("Digite o CPF no formato 123.456.789-10.");
        return;
    }

    if (senha.length < 8) {
        alert("A senha deve ter no mínimo 8 caracteres.");
        return;
    }

    // Identifica o acesso como Direção
    localStorage.setItem("tipoUsuario", "direcao");

    salvarEntradaDemo();

    // Vai para a área de gerenciamento
    window.location.href = "chamados.html";
});