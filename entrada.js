const formEntrada = document.getElementById("formEntrada");

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