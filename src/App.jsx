import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

function App() {
  const [gameCode, setGameCode] = useState("");
  const [players, setPlayers] = useState([]);
  const [phase, setPhase] = useState("lobby");
  const [question, setQuestion] = useState(null);

  useEffect(() => {
    const onState = (state) => {
      setGameCode(state.code);
      setPlayers(state.players || []);
      setPhase(state.phase);
      setQuestion(state.question);
    };

    socket.on("game:state", onState);

    return () => {
      socket.off("game:state", onState);
    };
  }, []);

  const createGame = () => {
    socket.emit("host:createGame", {}, (res) => {
      if (res?.code) {
        setGameCode(res.code);
      }
    });
  };

  const startGame = () => {
    socket.emit("host:startGame", { code: gameCode });
  };

  const nextQuestion = () => {
    socket.emit("host:nextQuestion", { code: gameCode });
  };

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif", color: "white", background:"#0f172a", minHeight:"100vh" }}>
      <h1>Lesson Battle</h1>

      {!gameCode && (
        <button onClick={createGame}>Nieuw spel starten</button>
      )}

      {gameCode && (
        <>
          <h2>Spelcode: {gameCode}</h2>

          {phase === "lobby" && (
            <>
              <p>{players.length} spelers in lobby</p>
              <button onClick={startGame}>Start quiz</button>
            </>
          )}

          {phase === "question" && question && (
            <>
              <h3>{question.prompt}</h3>
              <ul>
                {question.options.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
              <button onClick={nextQuestion}>Volgende vraag</button>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
