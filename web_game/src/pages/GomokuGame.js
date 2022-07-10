import { useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography } from '@mui/material';
// components
import Page from '../components/Page';
// sections
import { GameBoard, GameControlPanel } from '../sections/@dashboard/game';
import { AIMODE } from '../utils/constants';

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
});
// settings that does not need reset every game
const getNewGameSettings = () => ({
  gameName: "Gomoku",
  showHistoryIdx: false,
  boardColor: "#f1b06c",
  AIBlack: AIMODE.DISABLED,
  AIWhite: AIMODE.DISABLED,
});

export default function GomokuGame({ aiServer, serverState }) {
  const theme = useTheme();
  
  const [boardState, setBoardState] = useState( getEmptyBoard() );
  const [gameState, setGameState] = useState( getNewGameState() );
  const [gameSettings, setGameSettings] = useState( getNewGameSettings() );

  const handlePlayStone = (i, j) => {
    if (boardState[i][j] !== 0 || gameState.winner) return;
    const newboardState = [...boardState];
    newboardState[i][j] = gameState.playing;
    setBoardState(newboardState);
    // check winner, switch player if no winner
    const winningMoves = checkWinningMoves(boardState, [i,j], gameState.playing);
    setGameState(gameState => ({
      ...gameState,
      winner: winningMoves.length > 0 ? gameState.playing: 0,
      playing: winningMoves.length > 0 ? 0 : 3 - gameState.playing,
      winningMoves,
      moveHistory: [...gameState.moveHistory, [i,j,gameState.playing]],
    }));
  };

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
    const moveHistory = gameState.moveHistory;
    const lastMove = moveHistory && moveHistory[moveHistory.length-1];
    // update board state to remove last move
    const [i, j, playing] = lastMove;
    const newboardState = [...boardState];
    newboardState[i][j] = 0;
    setBoardState(newboardState);
    // update game state, reset winner if exist
    setGameState(gameState => ({
      ...gameState,
      playing,
      winner: 0,
      moveHistory: moveHistory.slice(0, -1),
      winningMoves: [],
    }));
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
              title={gameSettings.name}
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