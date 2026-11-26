
let preguntas = [];
let actual = 0;
let puntos = 0;
let respuestas = [];
let temporizador;
let segundos = 60;

const inicio = document.getElementById("inicio");
const quiz = document.getElementById("quiz");
const resultados = document.getElementById("resultados");

const pregunta = document.getElementById("pregunta");
const opciones = document.getElementById("opciones");
const mensaje = document.getElementById("mensaje");
const siguiente = document.getElementById("siguiente");

// Comenzar el quiz
document.getElementById("comenzar").addEventListener("click", async () => {
    try {
        const respuesta = await fetch("preguntas.json");

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar las preguntas");
        }

        preguntas = await respuesta.json();

        if (!Array.isArray(preguntas) || preguntas.length === 0) {
            throw new Error("No hay preguntas disponibles");
        }

        actual = 0;
        puntos = 0;
        respuestas = [];

        inicio.hidden = true;
        resultados.hidden = true;
        quiz.hidden = false;

        mostrarPregunta();

    } catch (error) {
        alert("Error al cargar el quiz. Usa Live Server.");
        console.error(error);
    }
});

// Mostrar pregunta
function mostrarPregunta() {
    clearInterval(temporizador);

    const datos = preguntas[actual];

    pregunta.textContent = datos.pregunta;
    opciones.innerHTML = "";
    mensaje.textContent = "";
    siguiente.hidden = true;

    document.getElementById("progreso").textContent =
        `Pregunta ${actual + 1} de ${preguntas.length}`;

    mostrarPuntos();

    datos.opciones.forEach((opcion, indice) => {
        const boton = document.createElement("button");

        boton.textContent = opcion;
        boton.className = "opcion";

        boton.addEventListener("click", () => {
            comprobarRespuesta(indice);
        });

        opciones.appendChild(boton);
    });

    iniciarTiempo();
}

// Comprobar respuesta
function comprobarRespuesta(seleccion) {
    clearInterval(temporizador);

    const datos = preguntas[actual];
    const botones = opciones.querySelectorAll("button");
    const correcta = datos.correcta;

    botones.forEach((boton, indice) => {
        boton.disabled = true;

        if (indice === correcta) {
            boton.classList.add("correcta");
        }

        if (indice === seleccion && seleccion !== correcta) {
            boton.classList.add("incorrecta");
        }
    });

    if (seleccion === correcta) {
        puntos++;
        mensaje.textContent = "¡Correcto! 🎉";
        mensaje.style.color = "green";
    } else {
        mensaje.textContent =
            "Incorrecto. La respuesta correcta es: " +
            datos.opciones[correcta];

        mensaje.style.color = "#c03956";
    }

    respuestas.push({
        pregunta: datos.pregunta,
        elegida: seleccion === -1
            ? "Sin responder"
            : datos.opciones[seleccion],
        correcta: datos.opciones[correcta],
        acierto: seleccion === correcta
    });

    mostrarPuntos();
    siguiente.hidden = false;
}

// Mostrar puntuación
function mostrarPuntos() {
    document.getElementById("puntuacion").textContent =
        `Puntuación: ${puntos}`;
}

// Siguiente pregunta
siguiente.addEventListener("click", () => {
    actual++;

    if (actual < preguntas.length) {
        mostrarPregunta();
    } else {
        mostrarResultados();
    }
});

// Temporizador
function iniciarTiempo() {
    segundos = 60;
    mostrarTiempo();

    temporizador = setInterval(() => {
        segundos--;
        mostrarTiempo();

        if (segundos <= 0) {
            clearInterval(temporizador);
            comprobarRespuesta(-1);
            mensaje.textContent =
                "¡Se acabó el tiempo! ⏰ " +
                "Pierdes 1 punto. Respuesta correcta: " +
                preguntas[actual].opciones[preguntas[actual].correcta];

            puntos--;
            mostrarPuntos();

            // Pasar automáticamente a la siguiente
            setTimeout(() => {
                if (!quiz.hidden && actual < preguntas.length) {
                    siguiente.click();
                }
            }, 2000);
        }
    }, 1000);
}

function mostrarTiempo() {
    document.getElementById("tiempo").textContent =
        `⏰ Tiempo: ${segundos} segundos`;
}

// Mostrar resultados finales
function mostrarResultados() {
    clearInterval(temporizador);

    quiz.hidden = true;
    resultados.hidden = false;

    document.getElementById("resultadoFinal").textContent =
        `Tu puntuación final es ${puntos} de ${preguntas.length} puntos`;

    const resumen = document.getElementById("resumen");
    resumen.innerHTML = "";

    respuestas.forEach((respuesta, indice) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "resultado";

        const titulo = document.createElement("h4");
        titulo.textContent = `${indice + 1}. ${respuesta.pregunta}`;

        const elegida = document.createElement("p");
        elegida.textContent = `Tu respuesta: ${respuesta.elegida}`;

        const correcta = document.createElement("p");
        correcta.textContent = `Correcta: ${respuesta.correcta}`;

        const estado = document.createElement("p");
        estado.textContent = respuesta.acierto
            ? "✅ Correcto"
            : "❌ Incorrecto";

        tarjeta.append(titulo, elegida, correcta, estado);
        resumen.appendChild(tarjeta);
    });
}

// Reiniciar el quiz
document.getElementById("reiniciar").addEventListener("click", () => {
    clearInterval(temporizador);
    resultados.hidden = true;
    inicio.hidden = false;
});
