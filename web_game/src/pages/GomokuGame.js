import { useEffect, useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography } from '@mui/material';
// components
import Page from '../components/Page';
// sections
import { GameBoard, GameControlPanel } from '../sections/@dashboard/game';
import { AIMODE, SERVER_STATUS } from '../utils/constants';

// ----------------------------------------------------------------------

// empty board
// 0 -> empty; 1 -> black stone; 2 -> white stone
const getEmptyBoard = () => Array.from(Array(15), _ => Array(15).fill(0));
// full state of the current game, can be used to reproduce game board
const getNewGameState = () => ({
  playing: 1,
  winner: 0,
  moveHistory: [],
  winningMoves: [],
  aIWinRates: {}, // e.g. {6x15+7: 1.0}
});
// settings that does not need reset every game
const getNewGameSettings = () => ({
  gameName: "Gomoku",
  showHistoryIdx: false,
  boardColor: "#f1b06c",
  AIBlack: AIMODE.DISABLED,
  AIWhite: AIMODE.DISABLED,
  AILevel: 1,
});

export default function GomokuGame({ aiServer, serverState }) {
  const theme = useTheme();
  
  const [boardState, setBoardState] = useState( getEmptyBoard() );
  const [gameState, setGameState] = useState( getNewGameState() );
  const [gameSettings, setGameSettings] = useState( getNewGameSettings() );
  const [undoHistory] = useState([]);
  const [predictionQueue, setPredictionQueue] = useState([]);

  const handlePlayStone = (i, j) => {
    console.log("playing stone", i, j);
    if (boardState[i][j] !== 0 || gameState.winner) return;
    // append states into undo history
    undoHistory.push(JSON.stringify([gameState, boardState]));
    // update board state
    setBoardState(boardState => {
      const newboardState = [...boardState];
      newboardState[i][j] = gameState.playing;
      return newboardState;
    });
    // check winner, switch player if no winner 
    setGameState(gameState => {
      const winningMoves = checkWinningMoves(boardState, [i,j], gameState.playing);
      const nextPlaying = winningMoves.length > 0 ? 0 : 3 - gameState.playing;
      return {
        ...gameState,
        winner: winningMoves.length > 0 ? gameState.playing: 0,
        playing: nextPlaying,
        winningMoves,
        moveHistory: [...gameState.moveHistory, [i,j,gameState.playing]],
        aIWinRates: {},
      };
    });
  }

  // emit event for predictions
  useEffect(() => {
    if (aiServer && serverState.status === SERVER_STATUS.IDLE && Object.keys(gameState.aIWinRates).length === 0) {
      const blackPredictionEnabled = gameSettings.AIBlack !== AIMODE.DISABLED && gameState.playing === 1;
      const whitePredictionEnabled = gameSettings.AIWhite !== AIMODE.DISABLED && gameState.playing === 2;
      if (blackPredictionEnabled || whitePredictionEnabled) {
        // append aiLevel to request
        const webGameState = {...gameState, aiLevel: gameSettings.AILevel};
        aiServer.socket.emit("queuePrediction", webGameState, (data) => {
          if (data === 'success') {
            aiServer.socket.emit("processPrediction");
            console.log('emit processPrediction success');
          }
        });
        console.log('emit queuePrediction success');
      }
    };
  }, [gameSettings.AIBlack, gameSettings.AIWhite, gameState]);

  useEffect(() => {
    if (aiServer) {
      const predictionListener = (prediction) => {
        console.log('got prediction: ', prediction);
        // put the prediction into queue for later processing;
        setPredictionQueue(predictionQueue => [...predictionQueue, prediction]);
      }
      aiServer.socket.on("prediction", predictionListener);
      return () => {
        aiServer.socket.off("prediction", predictionListener);
      }
    }
  }, [gameSettings, aiServer])

  // detect changes to gameState and predictionQueue, and apply the change when it matches
  useEffect(() => {
    console.log('updated predictionQueue and game state', predictionQueue)
    // no update needed
    if (predictionQueue.length === 0 || gameState.winner) return;
    const prediction = predictionQueue[0];
    // display prediction for black/white player
    const blackPredictionEnabled = prediction.playing === 1 && gameState.playing === 1 && gameSettings.AIBlack === AIMODE.PREDICT;
    const whitePredictionEnabled = prediction.playing === 2 && gameState.playing === 2 && gameSettings.AIWhite === AIMODE.PREDICT;
    if (blackPredictionEnabled || whitePredictionEnabled) {
      // take the prediction out from front
      predictionQueue.shift();
      const aIWinRates = buildAiWinRates(prediction.moveWinrates)
      // check if return data is empty before setting state (to prevent infinite loop)
      if (Object.keys(aIWinRates).length > 0) {
        setGameState(gameState => ({
          ...gameState,
          aIWinRates,
        }));
      }
      return;
    }
    // autoplay for black/white player
    const blackAutoplayEnabled = prediction.playing === 1 && gameState.playing === 1 &&  gameSettings.AIBlack === AIMODE.AUTOPLAY;
    const whiteAutoplayEnabled = prediction.playing === 2 && gameState.playing === 2 &&  gameSettings.AIBlack === AIMODE.AUTOPLAY;
    console.log(blackAutoplayEnabled, whiteAutoplayEnabled);
    if (blackAutoplayEnabled || whiteAutoplayEnabled) {
      // take the prediction out from front
      predictionQueue.shift();
      if (prediction.moveWinrates && prediction.moveWinrates.length > 0) {
        // best move is put on top
        const [ i, j, winrate ] = prediction.moveWinrates[0];
        handlePlayStone(i, j);
      }
    }

  }, [gameState, predictionQueue])

  const handleUpdateSettings = (key, value) => {
    setGameSettings(gameSettings => ({
      ...gameSettings,
      [key]: value,
    }));
  }

  const resetGame = () => {
    setBoardState(getEmptyBoard());
    setGameState(getNewGameState());
  }
  
  const undoLastMove = () => {
    if (undoHistory.length === 0) return;
    const [lastGameState, lastBoardState] = JSON.parse(undoHistory.pop());
    setBoardState(lastBoardState);
    setGameState(lastGameState);
  }

  const gameControls = {
    resetGame,
    undoLastMove,
  }

  return (
    <Page title="Game">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8} lg={9}>
            <GameBoard
              title={gameSettings.gameName}
              boardState={boardState}
              gameState={gameState}
              gameSettings={gameSettings}
              handlePlayStone={handlePlayStone}
            />
          </Grid>

          <Grid item xs={12} md={4} lg={3}>
            <GameControlPanel
              title="Game Control"
              gameState={gameState}
              gameSettings={gameSettings}
              gameControls={gameControls}
              serverState={serverState}
              handleUpdateSettings={handleUpdateSettings}
            />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}

/**
 * Check whether the last played player is winner
 * @param {*} boardState the state of the board before or after last move
 * @param {*} lastMove the last move just played
 * @param {*} playing the player who just played. Other players are not checked
 * @returns array of 5 stone locations as winning moves, otherwise empty
 */
function checkWinningMoves(boardState, lastMove, playing) {
  const [r, c] = lastMove;
  // try all 4 directions, the other 4 is included
  const directions = [[1,1], [1,0], [0,1], [1,-1]];
  for (let di=0; di < directions.length; di += 1) {
    const [dr, dc] = directions[di];
    const winningLine = [[r,c]];
    // try to extend in the positive direction
    let extR = r;
    let extC = c;
    for (let i = 0; i < 5; i += 1) {
      extR += dr;
      extC += dc;
      if (extR < 0 || extR >= 15 || extC < 0 || extC >= 15) {
        break;
      } else if (boardState[extR][extC] === playing) {
        winningLine.push([extR, extC]);
      } else {
        break;
      }
    }
    // try to extend in the opposite direction
    extR = r;
    extC = c;
    for (let i = 0; i < 5; i += 1) {
      extR -= dr;
      extC -= dc;
      if (extR < 0 || extR >= 15 || extC < 0 || extC >= 15 || winningLine.length > 5) {
        break;
      } else if (boardState[extR][extC] === playing) {
        winningLine.push([extR, extC]);
      } else {
        break;
      }
    }
    // only win if exactly 5 in a row (6 or more does not count)
    if (winningLine.length === 5) {
      return winningLine;
    }
  };
  return [];
}

function buildAiWinRates(moveWinRates) {
  const aIWinRates = {};
  moveWinRates.forEach(([i,j,winrate]) => {
    aIWinRates[i*15+j] = winrate;
  });
  return aIWinRates;
}