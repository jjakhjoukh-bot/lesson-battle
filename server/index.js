import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { generateQuestionSet, CHAPTERS } from "../shared/questions.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const PORT = process.env.PORT || 3001;
const QUESTION_TIME_MS = 15000;
const TEAM_NAMES = ["Team Rood", "Team Blauw", "Team Groen", "Team Goud"];
const games = new Map();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    chapters: Object.values(CHAPTERS)
  });
});

function createGameCode() {
  let code = "";
  do {
    code = String(Math.floor(100000 + Math.random() * 900000));
  } while (games.has(code));
  return code;
}

function getGame(code) {
  return games.get(String(code));
}

function getPublicQuestion(game) {
  const question = game.questions[game.currentQuestionIndex];
  if (!question) return null;
  return {
    id: question.id,
    type: question.type,
    prompt: question.prompt,
    options: question.options,
    correctIndex: game.phase === "question" ? null : question.correctIndex
  };
}

function getLeaderboard(game) {
  if (game.teamMode) {
    const totals = TEAM_NAMES.map((team) => ({
      name: team,
      score: Object.values(game.players)
        .filter((player) => player.team === team)
        .reduce((sum, player) => sum + player.score, 0),
      memberCount: Object.values(game.players).filter((player) => player.team === team).length
    }))
      .filter((team) => team.memberCount > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    return totals;
  }

  return Object.values(game.players)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((player) => ({
      name: player.name,
      score: player.score,
      team: player.team
    }));
}

function getAnswerDistribution(game) {
  const question = game.questions[game.currentQuestionIndex];
  if (!question) return [];

  return question.options.map((option, index) => ({
    option,
    index,
    count: Object.values(game.answers).filter((answer) => answer.answerIndex === index).length
  }));
}

function emitGameState(code) {
  const game = getGame(code);
  if (!game) return;

  const payload = {
    code: game.code,
    phase: game.phase,
    chapterId: game.chapterId,
    chapter: CHAPTERS[game.chapterId],
    teamMode: game.teamMode,
    questionCount: game.questions.length,
    currentQuestionIndex: game.currentQuestionIndex,
    currentQuestionNumber:
      game.phase === "lobby" ? 0 : Math.min(game.currentQuestionIndex + 1, game.questions.length),
    question: getPublicQuestion(game),
    timerEndsAt: game.timerEndsAt,
    players: Object.values(game.players).map((player) => ({
      id: player.id,
      name: player.name,
      score: player.score,
      team: player.team
    })),
    leaderboard: getLeaderboard(game),
    answerDistribution: getAnswerDistribution(game),
    totalAnswers: Object.keys(game.answers).length
  };

  io.to(code).emit("game:state", payload);
}

function resetGameTimers(game) {
  if (game.questionTimer) {
    clearTimeout(game.questionTimer);
    game.questionTimer = null;
  }
}

function finishQuestion(code) {
  const game = getGame(code);
  if (!game || game.phase !== "question") return;

  game.phase = "leaderboard";
  game.timerEndsAt = null;
  resetGameTimers(game);
  emitGameState(code);
}

function startQuestion(code) {
  const game = getGame(code);
  if (!game) return;

  if (game.currentQuestionIndex >= game.questions.length) {
    game.phase = "finished";
    game.timerEndsAt = null;
    resetGameTimers(game);
    emitGameState(code);
    return;
  }

  game.phase = "question";
  game.answers = {};
  game.timerEndsAt = Date.now() + QUESTION_TIME_MS;
  resetGameTimers(game);
  game.questionTimer = setTimeout(() => finishQuestion(code), QUESTION_TIME_MS);
  emitGameState(code);
}

function assignTeam(game) {
  const counts = TEAM_NAMES.map((team) => ({
    team,
    count: Object.values(game.players).filter((player) => player.team === team).length
  })).sort((a, b) => a.count - b.count);

  return counts[0]?.team ?? TEAM_NAMES[0];
}

function resetScores(game) {
  Object.values(game.players).forEach((player) => {
    player.score = 0;
  });
}

function configureGame(game, payload = {}) {
  game.chapterId = payload.chapterId ?? game.chapterId ?? "h3";
  game.teamMode = Boolean(payload.teamMode);
  game.questions = generateQuestionSet(game.chapterId, payload.questionCount ?? 12);
  game.phase = "lobby";
  game.currentQuestionIndex = 0;
  game.timerEndsAt = null;
  game.answers = {};
  resetGameTimers(game);

  if (game.teamMode) {
    Object.values(game.players).forEach((player) => {
      player.team = assignTeam(game);
    });
  } else {
    Object.values(game.players).forEach((player) => {
      player.team = null;
    });
  }

  resetScores(game);
}

io.on("connection", (socket) => {
  socket.on("host:createGame", (payload, callback) => {
    const code = createGameCode();
    const game = {
      code,
      hostSocketId: socket.id,
      chapterId: payload?.chapterId ?? "h3",
      teamMode: Boolean(payload?.teamMode),
      questions: [],
      players: {},
      phase: "lobby",
      currentQuestionIndex: 0,
      timerEndsAt: null,
      questionTimer: null,
      answers: {}
    };

    games.set(code, game);
    configureGame(game, payload);
    socket.join(code);
    emitGameState(code);
    callback?.({ ok: true, code });
  });

  socket.on("host:configureGame", ({ code, ...payload }, callback) => {
    const game = getGame(code);
    if (!game || game.hostSocketId !== socket.id) {
      callback?.({ ok: false, message: "Spel niet gevonden." });
      return;
    }

    configureGame(game, payload);
    emitGameState(code);
    callback?.({ ok: true });
  });

  socket.on("host:startGame", ({ code }, callback) => {
    const game = getGame(code);
    if (!game || game.hostSocketId !== socket.id) {
      callback?.({ ok: false, message: "Spel niet gevonden." });
      return;
    }

    game.currentQuestionIndex = 0;
    resetScores(game);
    startQuestion(code);
    callback?.({ ok: true });
  });

  socket.on("host:nextQuestion", ({ code }, callback) => {
    const game = getGame(code);
    if (!game || game.hostSocketId !== socket.id) {
      callback?.({ ok: false, message: "Spel niet gevonden." });
      return;
    }

    if (game.phase === "question") {
      finishQuestion(code);
      callback?.({ ok: true });
      return;
    }

    game.currentQuestionIndex += 1;
    startQuestion(code);
    callback?.({ ok: true });
  });

  socket.on("host:newRound", ({ code }, callback) => {
    const game = getGame(code);
    if (!game || game.hostSocketId !== socket.id) {
      callback?.({ ok: false, message: "Spel niet gevonden." });
      return;
    }

    configureGame(game, {
      chapterId: game.chapterId,
      teamMode: game.teamMode,
      questionCount: game.questions.length || 12
    });
    emitGameState(code);
    callback?.({ ok: true });
  });

  socket.on("player:join", ({ code, name }, callback) => {
    const game = getGame(code);
    const trimmedName = String(name ?? "").trim().slice(0, 20);

    if (!game) {
      callback?.({ ok: false, message: "Spelcode niet gevonden." });
      return;
    }

    if (!trimmedName) {
      callback?.({ ok: false, message: "Vul een naam in." });
      return;
    }

    const playerId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const player = {
      id: playerId,
      socketId: socket.id,
      name: trimmedName,
      score: 0,
      team: game.teamMode ? assignTeam(game) : null
    };

    game.players[playerId] = player;
    socket.join(code);
    emitGameState(code);
    callback?.({
      ok: true,
      player: {
        id: player.id,
        name: player.name,
        score: player.score,
        team: player.team
      }
    });
  });

  socket.on("player:answer", ({ code, playerId, answerIndex }, callback) => {
    const game = getGame(code);
    const player = game?.players?.[playerId];
    const question = game?.questions?.[game.currentQuestionIndex];

    if (!game || !player || !question || game.phase !== "question") {
      callback?.({ ok: false, message: "Antwoord niet opgeslagen." });
      return;
    }

    if (game.answers[playerId]) {
      callback?.({ ok: false, message: "Je hebt al geantwoord." });
      return;
    }

    const elapsed = Math.max(0, QUESTION_TIME_MS - (game.timerEndsAt - Date.now()));
    const isCorrect = answerIndex === question.correctIndex;
    const speedBonus = isCorrect
      ? Math.max(0, Math.round(50 * ((QUESTION_TIME_MS - elapsed) / QUESTION_TIME_MS)))
      : 0;
    const earned = isCorrect ? 100 + speedBonus : 0;

    player.score += earned;
    game.answers[playerId] = {
      answerIndex,
      isCorrect,
      earned
    };

    emitGameState(code);
    callback?.({ ok: true, isCorrect, earned });

    const totalPlayers = Object.keys(game.players).length;
    const totalAnswers = Object.keys(game.answers).length;
    if (totalPlayers > 0 && totalPlayers === totalAnswers) {
      finishQuestion(code);
    }
  });

  socket.on("disconnect", () => {
    for (const [code, game] of games.entries()) {
      if (game.hostSocketId === socket.id) {
        resetGameTimers(game);
        games.delete(code);
        io.to(code).emit("game:closed");
        continue;
      }

      const playerEntry = Object.values(game.players).find((player) => player.socketId === socket.id);
      if (playerEntry) {
        delete game.players[playerEntry.id];
        delete game.answers[playerEntry.id];
        emitGameState(code);
      }
    }
  });
});

if (process.env.NODE_ENV === "production") {
  const distPath = path.resolve(__dirname, "../dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

server.listen(PORT, () => {
  console.log(`Lesson Battle server listening on http://localhost:${PORT}`);
});
