
const botonAbrir = document.getElementById("abrir-chat");
const botonCerrar = document.getElementById("cerrar-chat");
const ventanaChat = document.getElementById("chatbot");
const formularioChat = document.getElementById("form-chat");
const entradaChat = document.getElementById("pregunta");
const listaMensajes = document.getElementById("mensajes");

botonAbrir.addEventListener("click", function () {
    ventanaChat.classList.remove("oculto");
});

botonCerrar.addEventListener("click", function () {
    ventanaChat.classList.add("oculto");
});

function mostrarMensaje(texto, clase) {
    const mensaje = document.createElement("div");

    mensaje.className = clase;
    mensaje.textContent = texto;

    listaMensajes.appendChild(mensaje);
    listaMensajes.scrollTop = listaMensajes.scrollHeight;

    return mensaje;
}

formularioChat.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const pregunta = entradaChat.value.trim();

    if (!pregunta) return;

    mostrarMensaje(pregunta, "usuario");
    entradaChat.value = "";

    const cargando = mostrarMensaje(
        "TXT AI está pensando... ✨",
        "bot"
    );

    const botonEnviar = formularioChat.querySelector("button");
    botonEnviar.disabled = true;

    try {
        const respuesta = await fetch(
            "/.netlify/functions/chat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    pregunta: pregunta
                })
            }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                datos.error || "No se pudo obtener una respuesta."
            );
        }

        cargando.textContent = datos.respuesta;

    } catch (error) {
        cargando.textContent =
            "No pude conectarme con la IA. Revisa la conexión e inténtalo de nuevo. 💗";

        console.error(error);

    } finally {
        botonEnviar.disabled = false;
        entradaChat.focus();
        listaMensajes.scrollTop = listaMensajes.scrollHeight;
    }
});
