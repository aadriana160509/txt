
exports.handler = async function (event) {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({
                error: "Método no permitido"
            })
        };
    }

    try {
        const datos = JSON.parse(event.body || "{}");
        const pregunta = datos.pregunta;

        if (
            typeof pregunta !== "string" ||
            pregunta.trim() === "" ||
            pregunta.length > 1000
        ) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: "Escribe una pregunta válida."
                })
            };
        }

        const apiKey = process.env.NETLIFY_AI_GATEWAY_KEY;
        const baseUrl = process.env.NETLIFY_AI_GATEWAY_URL;

        if (!apiKey || !baseUrl) {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: "No se encontraron las credenciales de AI Gateway."
                })
            };
        }

        const url = baseUrl.replace(/\/+$/, "") + "/v1/chat/completions";

        const respuestaIA = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "openai/gpt-4.1-mini",
                messages: [
                    {
                        role: "system",
                        content:
                            "Eres TXT AI BOT, el asistente virtual de TXT WORLD, una página informativa sobre TOMORROW X TOGETHER. Responde en español, de manera amigable, juvenil y clara. Ayuda con preguntas sobre los integrantes, álbumes, giras y contenido de TXT. Si no sabes un dato, dilo con honestidad y no inventes información."
                    },
                    {
                        role: "user",
                        content: pregunta
                    }
                ],
                max_tokens: 350
            })
        });

        const resultado = await respuestaIA.json();

        if (!respuestaIA.ok) {
            console.error("Error de AI Gateway:", resultado);

            return {
                statusCode: 502,
                body: JSON.stringify({
                    error: "La IA no pudo responder. Inténtalo más tarde."
                })
            };
        }

        const respuesta =
            resultado.choices?.[0]?.message?.content;

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                respuesta: respuesta ||
                    "No pude generar una respuesta. Inténtalo otra vez."
            })
        };

    } catch (error) {
        console.error("Error en TXT AI BOT:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Ocurrió un problema al procesar tu pregunta."
            })
        };
    }
};
