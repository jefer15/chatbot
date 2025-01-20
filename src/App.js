import './App.css';
import { useState } from 'react';

// API key for the OpenAI API.
const API_KEY = "";

// Initial message to the system that defines the expected behavior of the chatbot.
const systemMessage = {
  role: "system",
  // content: "Responde como un amigo amable y conversacional. Sé natural, usa expresiones cotidianas y asegúrate de mantener una conversación coherente."
  content: "Eres un asistente conversacional que responde de manera natural, cálida y amigable, como si fueras un amigo cercano. Tu objetivo es mantener una conversación fluida y coherente. Cuando un usuario te envía un mensaje, interpreta su intención y responde de manera adecuada. Usa un tono amable y asegúrate de hacer preguntas relevantes para mantener la interacción activa. Por ejemplo:  1. Usuario: Hola, ¿cómo estás?  Respuesta: ¡Hola! Estoy muy bien, gracias por preguntar. ¿Cómo estás tú hoy? 2. Usuaario : ¿Qué opinas sobre el clima hoy? Respuesta: ¡El clima es increíble! Perfecto para salir a caminar. ¿Qué planes tienes para hoy? Responde de forma natural, mantén un tono cálido y asegura que tu respuesta sea amigable y coherente."
};

// Functional component to render each message.
const Message = ({ message }) => (
  <div className={`message ${message.sender}`}>
    {message.message}
  </div>
);

function App() {
  // Initial state for storing chat messages.
  const [messages, setMessages] = useState([{ message: 'Hola, soy un chatbot, estoy aquí para ayudarte...', sender: 'bot' }]);
  // State to handle user input.
  const [userInput, setUserInput] = useState("");

  //Handles sending a message when the user presses the "Enter" button or key.
  const sendMessage = async () => {
    if (!userInput.trim()) return;
    const newMessage = { message: userInput.trim(), sender: 'user' };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setUserInput("");
    await processMessageToChatGPT(newMessages);
  };

  // Process chat messages using the OpenAI API.
  // Send the entire conversation to the API and add the bot's response to the state.
  async function processMessageToChatGPT(chatMessages) {
    // Mapea los mensajes del chat al formato esperado por la API.
    let apiMessages = chatMessages.map((msg) => ({
      role: msg.sender === "bot" ? "assistant" : "user",
      content: msg.message,
    }));

    // Model used for conversation and stored messages.
    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...apiMessages],
    };

    // Makes the request to the chatGPT API.
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiRequestBody),
      });

      const data = await response.json();

      // Handles API errors.
      if (data.error) throw new Error(data.error.message);

      // Adds the bot's response to the message status.
      setMessages([...chatMessages, { message: data.choices[0].message.content, sender: "bot" }]);

    } catch (error) {
      // Adds an error message to the message status.
      setMessages([...chatMessages, { message: "Error: No se pudo procesar tu mensaje.", sender: "bot" }]);
    }
  }

  return (
    // Chatbot structure.
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          placeholder="Escribe tu mensaje"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>
    </div>
  );
}

export default App;
