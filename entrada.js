const formEntrada = document.getElementById("formEntrada");

formEntrada.addEventListener("submit", function(event) {
    event.preventDefault();

    const cpf = document.getElementById("cpf").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (cpf === "" || senha === "") {
        alert("Preencha o CPF e a senha para continuar.");
        return;
    }

    salvarEntradaDemo();

    window.location.href = "chamado.html";
});