import { useEffect, useMemo, useRef, useState } from "react";



const QUESTION_TIME = 15;
const socket = {
  emit: () => {},
  on: () => {},
  off: () => {}
};

function useCountdown(targetTime, active) {
  const [remaining, setRemaining] = useState(QUESTION_TIME);

  useEffect(() => {
    if (!active || !targetTime) {
      setRemaining(QUESTION_TIME);
      return;
    }

    const tick = () => {
      const seconds = Math.max(0, (targetTime - Date.now()) / 1000);
      setRemaining(seconds);
    };

    tick();
    const timer = setInterval(tick, 100);
    return () => clearInterval(timer);
  }, [targetTime, active]);

  return remaining;
}

function playTone(type) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  const context = new AudioCtx();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.type = "triangle";
  oscillator.frequency.value = type === "success" ? 720 : 240;
  gain.gain.setValueAtTime(0.001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.16, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.25);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.25);
}

function App() {
  const path = window.location.pathname;
  if (path === "/join") {
    return <JoinView />;
  }
  return <HostView />;
}

function HostView() {
  const [gameCode, setGameCode] = useState("");
  const [gameState, setGameState] = useState(null);
  const [chapterId, setChapterId] = useState("h3");
  const [teamMode, setTeamMode] = useState(false);
  const [questionCount, setQuestionCount] = useState(12);
  const [topic, setTopic] = useState("Economie");
  const [error, setError] = useState("");
  const [winnerBurst, setWinnerBurst] = useState(false);
  const lastPhaseRef = useRef("lobby");
  const timer = useCountdown(gameState?.timerEndsAt, gameState?.phase === "question");

  useEffect(() => {
    const onState = (state) => {
      setGameState(state);
      setGameCode(state.code);
      if (state.phase === "finished" && lastPhaseRef.current !== "finished") {
        setWinnerBurst(true);
        playTone("success");
        setTimeout(() => setWinnerBurst(false), 3000);
      }
      lastPhaseRef.current = state.phase;
    };

    const onClosed = () => {
      setError("De hostverbinding is gesloten. Start een nieuw spel.");
      setGameCode("");
      setGameState(null);
    };

    socket.on("game:state", onState);
    socket.on("game:closed", onClosed);
    return () => {
      socket.off("game:state", onState);
      socket.off("game:closed", onClosed);
    };
  }, []);

 const createGame = () => {

  setError("");

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const questions = [];

  for (let i = 0; i < questionCount; i++) {

    questions.push({
      id: i,
      prompt: `Vraag ${i+1} over ${topic}`,
      options: [
        "Antwoord A",
        "Antwoord B",
        "Antwoord C",
        "Antwoord D"
      ],
      correctIndex: Math.floor(Math.random()*4)
    });

  }

  setGameCode(code);

  setGameState({
    code: code,
    phase: "lobby",
    players: [],
    leaderboard: [],
    questionCount: questionCount,
    currentQuestionNumber: 0,
    questions: questions
  });

};

  const configureGame = () => {
    if (!gameCode) return;
    socket.emit(
      "host:configureGame",
      { code: gameCode, chapterId, teamMode, questionCount },
      (response) => {
        if (!response?.ok) {
          setError(response?.message ?? "Opslaan mislukt.");
        }
      }
    );
  };

  const startGame = () => {
    socket.emit("host:startGame", { code: gameCode });
  };

  const nextQuestion = () => {
    socket.emit("host:nextQuestion", { code: gameCode });
  };

  const newRound = () => {
    socket.emit("host:newRound", { code: gameCode });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.15),_transparent_30%),linear-gradient(135deg,#020617,#111827_45%,#1e293b)] text-white">
      {winnerBurst && <ConfettiBurst />}
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 p-4 md:p-8">
        <header className="glass-panel flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Lesson Battle</p>
            <h1 className="mt-2 text-3xl font-black md:text-5xl">Docent Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
              Start snel een herhaalquiz voor VMBO economie. Leerlingen doen direct mee via{" "}
              <span className="font-semibold text-white">/join</span>.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 px-6 py-4 text-center shadow-2xl shadow-emerald-500/10">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Spelcode</p>
            <p className="mt-2 text-4xl font-black tracking-[0.25em] text-amber-300">
              {gameCode || "------"}
            </p>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[360px,1fr]">
          <aside className="glass-panel space-y-4 p-5">
            <h2 className="text-xl font-bold">Spel instellen</h2>
            <label className="space-y-2">
  <span className="label">Onderwerp</span>
  <input
    className="input"
    value={topic}
    onChange={(e) => setTopic(e.target.value)}
    placeholder="bijv. Inflatie of Productie"
  />
</label>
            

            <label className="space-y-2">
              <span className="label">Aantal vragen</span>
              <input
                type="range"
                min="10"
                max="12"
                value={questionCount}
                onChange={(event) => setQuestionCount(Number(event.target.value))}
                className="w-full accent-emerald-400"
              />
              <p className="text-sm text-slate-300">{questionCount} vragen</p>
            </label>

            <button
              type="button"
              onClick={() => setTeamMode((current) => !current)}
              className={`toggle ${teamMode ? "toggle-on" : ""}`}
            >
              Teammodus: {teamMode ? "Aan" : "Uit"}
            </button>

            {!gameCode ? (
              <button type="button" onClick={createGame} className="primary-button w-full">
                Nieuw spel starten
              </button>
            ) : (
              <div className="space-y-3">
                <button type="button" onClick={configureGame} className="secondary-button w-full">
                  Vragen genereren
                </button>
                <button type="button" onClick={startGame} className="primary-button w-full">
                  Ronde starten
                </button>
                <button type="button" onClick={newRound} className="secondary-button w-full">
                  Nieuwe ronde klaarzetten
                </button>
              </div>
            )}

            {error ? <p className="rounded-2xl bg-rose-500/15 p-3 text-sm text-rose-200">{error}</p> : null}

            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-4">
              <p className="label">Doe mee</p>
              <p className="mt-2 text-sm text-slate-300">
                Laat leerlingen openen: <span className="font-semibold text-white">/join</span>
              </p>
            </div>
          </aside>

          <main className="space-y-6">
            <GameStage gameState={gameState} timer={timer} onAdvance={nextQuestion} host />
            <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
              <AnswerPanel gameState={gameState} />
              <LeaderboardCard gameState={gameState} />
            </div>
          </main>
        </section>
      </div>
    </div>
  );
}

function JoinView() {
  const [form, setForm] = useState({ name: "", code: "" });
  const [player, setPlayer] = useState(() => {
    const saved = window.localStorage.getItem("lesson-battle-session");
    return saved ? JSON.parse(saved) : null;
  });
  const [gameState, setGameState] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [locked, setLocked] = useState(false);
  const [winnerBurst, setWinnerBurst] = useState(false);
  const timer = useCountdown(gameState?.timerEndsAt, gameState?.phase === "question");
  const previousPhaseRef = useRef("lobby");
  const previousPlayersRef = useRef([]);

  useEffect(() => {
    const onState = (state) => {
      setGameState(state);
      if (state.phase === "question") {
        setLocked(false);
        setFeedback("");
      }

      if (state.phase === "leaderboard" && previousPhaseRef.current === "question" && player) {
        const self = state.players.find((entry) => entry.id === player.id);
        const previous = previousPlayersRef.current.find((entry) => entry.id === player.id);
        if (self && previous && self.score > previous.score) {
          playTone("success");
          setFeedback("Goed gedaan! Punten binnen.");
        }
      }

      if (state.phase === "finished" && previousPhaseRef.current !== "finished") {
        setWinnerBurst(true);
        setTimeout(() => setWinnerBurst(false), 3000);
      }

      previousPhaseRef.current = state.phase;
      previousPlayersRef.current = state.players;
    };

    const onClosed = () => {
      setFeedback("Dit spel is gesloten.");
      setGameState(null);
      setPlayer(null);
      window.localStorage.removeItem("lesson-battle-session");
    };

    socket.on("game:state", onState);
    socket.on("game:closed", onClosed);
    return () => {
      socket.off("game:state", onState);
      socket.off("game:closed", onClosed);
    };
  }, [player]);

  useEffect(() => {
    if (!player || gameState) return;

    socket.emit("player:join", { code: player.code, name: player.name }, (response) => {
      if (!response?.ok) {
        setPlayer(null);
        window.localStorage.removeItem("lesson-battle-session");
        return;
      }

      const joinedPlayer = {
        ...response.player,
        code: player.code
      };
      setPlayer(joinedPlayer);
      window.localStorage.setItem("lesson-battle-session", JSON.stringify(joinedPlayer));
    });
  }, [gameState, player]);

  const handleJoin = (event) => {
    event.preventDefault();
    setFeedback("");
    socket.emit("player:join", form, (response) => {
      if (!response?.ok) {
        setFeedback(response?.message ?? "Joinen mislukt.");
        return;
      }

      const joinedPlayer = response.player;
      const sessionPlayer = {
        ...joinedPlayer,
        code: form.code
      };
      setPlayer(sessionPlayer);
      window.localStorage.setItem("lesson-battle-session", JSON.stringify(sessionPlayer));
      setFeedback("Je zit in de lobby. Wacht op de docent.");
    });
  };

  const submitAnswer = (answerIndex) => {
    if (!player || !gameState || locked) return;
    setLocked(true);
    socket.emit(
      "player:answer",
      { code: gameState.code, playerId: player.id, answerIndex },
      (response) => {
        if (!response?.ok) {
          setFeedback(response?.message ?? "Opslaan mislukt.");
          setLocked(false);
          return;
        }
        setFeedback(response.isCorrect ? `Juist! +${response.earned} punten` : "Niet goed, geen punten.");
      }
    );
  };

  const self = useMemo(
    () => gameState?.players?.find((entry) => entry.id === player?.id) ?? player,
    [gameState?.players, player]
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.15),_transparent_30%),linear-gradient(180deg,#0f172a,#111827_45%,#1f2937)] text-white">
      {winnerBurst && <ConfettiBurst />}
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center p-4 md:p-8">
        {!player ? (
          <form onSubmit={handleJoin} className="glass-panel space-y-5 p-6 md:p-8">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Lesson Battle</p>
              <h1 className="mt-2 text-3xl font-black md:text-5xl">Meedoen</h1>
              <p className="mt-2 text-slate-300">Vul alleen je naam en de spelcode in.</p>
            </div>

            <label className="space-y-2">
              <span className="label">Bijnaam of teamnaam</span>
              <input
                className="input"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Bijv. Milan of Team Tijgers"
                maxLength={20}
              />
            </label>

            <label className="space-y-2">
              <span className="label">Spelcode</span>
              <input
                className="input text-center text-3xl tracking-[0.35em]"
                inputMode="numeric"
                maxLength={6}
                value={form.code}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    code: event.target.value.replace(/\D/g, "").slice(0, 6)
                  }))
                }
                placeholder="123456"
              />
            </label>

            <button type="submit" className="primary-button w-full">
              Join game
            </button>
            {feedback ? <p className="text-center text-sm text-amber-100">{feedback}</p> : null}
          </form>
        ) : (
          <div className="space-y-4">
            <div className="glass-panel flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-slate-300">Speler</p>
                <p className="text-2xl font-black">{self?.name}</p>
                {self?.team ? <p className="text-sm text-emerald-300">{self.team}</p> : null}
              </div>
              <div className="rounded-2xl bg-emerald-500/15 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Score</p>
                <p className="text-3xl font-black text-emerald-300">{self?.score ?? 0}</p>
              </div>
            </div>

            <GameStage
              gameState={gameState}
              timer={timer}
              onAnswer={submitAnswer}
              locked={locked}
              feedback={feedback}
            />

            <LeaderboardCard gameState={gameState} compact highlightName={self?.team || self?.name} />
          </div>
        )}
      </div>
    </div>
  );
}

function GameStage({ gameState, timer, onAdvance, onAnswer, locked, feedback, host = false }) {
  if (!gameState) {
    return (
      <section className="glass-panel p-6">
        <h2 className="text-2xl font-bold">Klaar om te spelen</h2>
        <p className="mt-2 text-slate-300">Maak eerst een spel aan of join met een spelcode.</p>
      </section>
    );
  }

  const question = gameState.question;
  const progress = Math.max(0, Math.min(100, (timer / QUESTION_TIME) * 100));
  const chapterLabel = gameState.chapter
    ? `${gameState.chapter.title} - ${gameState.chapter.subtitle}`
    : "Quiz";

  return (
    <section className="glass-panel overflow-hidden p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{chapterLabel}</p>
          <h2 className="mt-2 text-2xl font-black md:text-4xl">
            {gameState.phase === "lobby" && "Lobby open"}
            {gameState.phase === "question" &&
              `Vraag ${gameState.currentQuestionNumber} van ${gameState.questionCount}`}
            {gameState.phase === "leaderboard" && "Tussenstand"}
            {gameState.phase === "finished" && "Winnaars"}
          </h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Spelcode</p>
          <p className="mt-1 text-2xl font-black tracking-[0.2em] text-amber-300">{gameState.code}</p>
        </div>
      </div>

      {gameState.phase === "lobby" ? (
        <div className="mt-6 rounded-[2rem] bg-slate-950/40 p-6">
          <p className="text-lg font-bold text-white">
            {gameState.players.length} speler{gameState.players.length === 1 ? "" : "s"} in de lobby
          </p>
          <p className="mt-2 text-slate-300">
            {host
              ? "Laat leerlingen nu joinen. Klik daarna op 'Ronde starten'."
              : "Wacht tot de docent de quiz start."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {gameState.players.map((player) => (
              <span key={player.id} className="rounded-full bg-white/10 px-3 py-2 text-sm">
                {player.name}
                {player.team ? ` · ${player.team}` : ""}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {question ? (
        <div className="mt-6">
          <div className="timer-shell">
            <div className="timer-bar" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 text-right text-sm text-slate-300">
            {gameState.phase === "question" ? `${timer.toFixed(1)} sec` : "Timer gestopt"}
          </p>

          <div className="mt-4 rounded-[2rem] bg-slate-950/45 p-5 md:p-7">
            <p className="text-2xl font-black leading-tight md:text-4xl">{question.prompt}</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {question.options.map((option, index) => {
                const revealed = gameState.phase !== "question";
                const isCorrect = revealed && question.correctIndex === index;
                return (
                  <button
                    key={`${question.id}-${index}`}
                    type="button"
                    disabled={host || gameState.phase !== "question" || locked}
                    onClick={() => onAnswer?.(index)}
                    className={`answer-card ${isCorrect ? "answer-card-correct" : ""} ${
                      locked ? "opacity-70" : ""
                    }`}
                  >
                    <span className="answer-badge">{String.fromCharCode(65 + index)}</span>
                    <span className="text-left text-lg font-bold">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {feedback ? <p className="mt-4 text-center text-sm text-amber-100">{feedback}</p> : null}

      {host && gameState.phase !== "lobby" && gameState.phase !== "finished" ? (
        <div className="mt-5 flex justify-end">
          <button type="button" onClick={onAdvance} className="primary-button">
            {gameState.phase === "question"
              ? "Vraag stoppen"
              : gameState.currentQuestionNumber >= gameState.questionCount
                  ? "Eindscherm tonen"
                  : "Volgende vraag"}
          </button>
        </div>
      ) : null}
    </section>
  );
}

function AnswerPanel({ gameState }) {
  const distribution = gameState?.answerDistribution ?? [];

  return (
    <section className="glass-panel p-5">
      <h3 className="text-xl font-bold">Antwoorden</h3>
      <p className="mt-1 text-sm text-slate-300">
        Live verdeling van antwoorden op het digibord.
      </p>
      <div className="mt-5 space-y-3">
        {distribution.length ? (
          distribution.map((entry) => (
            <div key={entry.index} className="rounded-3xl bg-slate-950/45 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-bold text-white">{entry.option}</span>
                <span className="text-sm text-slate-300">{entry.count} reacties</span>
              </div>
              <div className="h-3 rounded-full bg-white/5">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      ((entry.count || 0) / Math.max(gameState?.players?.length || 1, 1)) * 100
                    )}%`
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl bg-slate-950/45 p-4 text-slate-300">Nog geen actieve vraag.</div>
        )}
      </div>
    </section>
  );
}

function LeaderboardCard({ gameState, compact = false, highlightName }) {
  const rows = gameState?.leaderboard ?? [];
  return (
    <section className="glass-panel p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Leaderboard</h3>
          <p className="mt-1 text-sm text-slate-300">
            Top 10 {gameState?.teamMode ? "teams" : "spelers"}
          </p>
        </div>
        <div className="rounded-2xl bg-white/5 px-3 py-2 text-sm text-slate-200">
          Live update
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {rows.length ? (
          rows.map((entry, index) => (
            <div
              key={`${entry.name}-${index}`}
              className={`leaderboard-row ${
                highlightName && highlightName === entry.name ? "leaderboard-row-highlight" : ""
              } ${compact ? "py-3" : "py-4"}`}
            >
              <div className="flex items-center gap-4">
                <div className="place-badge">{index + 1}</div>
                <div>
                  <p className="font-bold text-white">{entry.name}</p>
                  {entry.team && !gameState?.teamMode ? (
                    <p className="text-xs text-emerald-300">{entry.team}</p>
                  ) : null}
                </div>
              </div>
              <p className="text-xl font-black text-amber-300">{entry.score}</p>
            </div>
          ))
        ) : (
          <div className="rounded-3xl bg-slate-950/45 p-4 text-slate-300">Nog geen scores.</div>
        )}
      </div>
    </section>
  );
}

function ConfettiBurst() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {Array.from({ length: 42 }).map((_, index) => (
        <span
          key={index}
          className="confetti-piece"
          style={{
            left: `${(index * 17) % 100}%`,
            animationDelay: `${(index % 8) * 0.08}s`,
            backgroundColor: ["#f59e0b", "#22c55e", "#38bdf8", "#f43f5e"][index % 4]
          }}
        />
      ))}
    </div>
  );
}

export default App;
