import { useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography } from '@mui/material';
// components
import Page from '../components/Page';
// sections
import { GameBoard, GameControlPanel } from '../sections/@dashboard/game';

// ----------------------------------------------------------------------

// empty board
// 0 -> empty; 1 -> black stone; 2 -> white stone
const getEmptyBoard = () => Array.from(Array(15), _ => Array(15).fill(0));
const GAME_STATE = {
  playing: 1,
  name: "Gomoku",
}

export default function GomokuGame() {
  const theme = useTheme();
  
  const [boardState, setBoardState] = useState( getEmptyBoard() );
  const [gameState, setGameState] = useState( GAME_STATE );

  const handlePlayStone = (i, j) => {
    if (boardState[i][j] !== 0) return;
    const newboardState = [...boardState];
    newboardState[i][j] = gameState.playing;
    setBoardState(newboardState);
    // switch player
    setGameState({
      ...gameState,
      playing: 3 - gameState.playing
    });
  };

  const resetGame = () => {
    setBoardState(getEmptyBoard());
    setGameState({...gameState, playing: 1});
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
              title={gameState.name}
              boardState={boardState}
              gameState={gameState}
              handlePlayStone={handlePlayStone}
            />
          </Grid>

          <Grid item xs={12} md={4} lg={3}>
            <GameControlPanel
              title="Game Control"
              boardState={boardState}
              gameState={gameState}
              resetGame={resetGame}
            />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
