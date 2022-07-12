import PropTypes, { number } from 'prop-types';
// @mui
import { Card, CardHeader, CardContent, Box } from '@mui/material';
import { useState, useEffect } from 'react';
// components

// ----------------------------------------------------------------------

GameBoard.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
};

// grid spacing
const GRID_SIZE = 40;
const PADDING = 40;

export default function GameBoard({ title, subheader, boardState, gameState, gameSettings, handlePlayStone }) {
  const stones = gameState.moveHistory.map(([i,j,player], idx) => Stone({
    row: i,
    col: j,
    value: player,
    historyIdx: gameSettings.showHistoryIdx ? idx : undefined,
    isLastMove: idx === gameState.moveHistory.length - 1,
    isWinningLine: gameState.winningMoves.some((move) => move[0] === i && move[1] === j),
  }));
  // lazy render the intersections to improve performance
  // This is because the hover effect of all intersections needs to be updated after every move
  const [ intersections, setIntersections ] = useState([]);
  useEffect(() => {
    const newIntersections = [];
    for (let i = 0; i < 15; i += 1) {
      for (let j = 0; j < 15; j += 1) {
        if (boardState[i][j] === 0) {
          newIntersections.push(Intersection({
            row: i,
            col: j,
            onPlay: () => handlePlayStone(i,j),
            playing: gameState.playing,
            winRate: gameState.aIWinRates[i*15+j]
          }));
        }
      }    
    }
    setIntersections(newIntersections);
  }, [boardState, gameState]); // cache key is needed to prevent infinite loop. Only run the effect once.
  
  /* below is the simple version without performance optimization
  const intersections = [];
  for (let i = 0; i < 15; i += 1) {
    for (let j = 0; j < 15; j += 1) {
      intersections.push(Stone({
        row: i,
        col: j,
        value: boardState[i][j],
        onPlay: () => handlePlayStone(i,j),
        playing: gameState.playing,
      }));
    }    
  }
  */
  const boardStyle = {
      width: 14 * GRID_SIZE + PADDING*2,
      height: 14 * GRID_SIZE + PADDING*2,
      position: "relative",
      backgroundColor: gameSettings.boardColor,
      padding: PADDING,
      paddingTop: PADDING,
      margin: 'auto',
      boxShadow: "2px 2px 4px 0 rgba(0, 0, 0, 0.25), -2px -2px 4px 0 rgba(255, 255, 255, 0.25)",
      draggable: false,
  };
  const gridStyle = {
    width: "100%",
    height: "100%",
    display: "grid",
    gridTemplateColumns: `repeat(14, ${GRID_SIZE}px)`,
    gridTemplateRows: `repeat(14, ${GRID_SIZE}px)`,
    borderRight: "1px solid grey",
    borderBottom: "1px solid grey",
    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
    backgroundImage: "linear-gradient(to right, grey 1px, transparent 1px), linear-gradient(to bottom, grey 1px, transparent 1px)",
    zIndex: 1,
  };

  const stars = [[3,3], [3,11], [11,3], [11,11]].map(([r,l], idx) => {
    const starStyle = {
      width: "calc(100% / 8)",
      height: "calc(100% / 8)",
      borderRadius: "50%",
      backgroundColor: "grey",
      alignSelf: "center",
      justifySelf: "center",
      zIndex: 1,
      gridRowStart: r,
      gridRowEnd: r+2,
      gridColumnStart: l,
      gridColumnEnd: l+2,
    }
    return <div key={idx} style={starStyle} />;
  });
  return (
    <Card>
      <CardHeader title={title} subheader={subheader} />
      <CardContent sx={{ p: 3 }}>
        <div style={boardStyle} id="board">
          <div style={gridStyle}>{stars}</div>
          {stones}
          {intersections}
        </div>
      </CardContent>
    </Card>
  );
}

function Stone({ row, col, value, historyIdx, isLastMove, isWinningLine }) {
  const sx = {
    top: PADDING - GRID_SIZE/2 + row * GRID_SIZE+2,
    left: PADDING - GRID_SIZE/2 + col * GRID_SIZE+2,
    width: GRID_SIZE - 4,
    height: GRID_SIZE - 4,
    borderRadius: "50%",
    position: "absolute",
    boxSizing: "border-box",
    zIndex: 2,
    transition: "0.1s",
    display: "flex",
    userSelect: "none",
  };
  // use different shadow colors for last move and winning moves
  let boxShadow;
  if (isLastMove) {
    boxShadow = "2px 2px 4px 2px rgba(252, 3, 48, 0.25), -2px -2px 4px 0 rgba(255, 150, 200, 0.25)";
  } else if (isWinningLine) {
    boxShadow = "2px 2px 4px 2px rgba(252, 30, 250, 0.25), -2px -2px 4px 0 rgba(255, 150, 250, 0.25)";
  } else {
    boxShadow = "2px 2px 4px 0 rgba(0, 0, 0, 0.25), -2px -2px 4px 0 rgba(255, 255, 255, 0.25)";
  }
  if (value === 1) {
    sx.backgroundColor = "#444";
    sx.boxShadow = boxShadow;
  } else if (value === 2) {
    sx.backgroundColor = "#eee";
    sx.boxShadow = boxShadow;
  }
  let historyNumber;
  if (historyIdx !== undefined) {
    const numberColor = value === 1 ? "#eee" : "#444";
    historyNumber = <div style={{ color: numberColor, margin: "auto" }}>{historyIdx+1}</div>
  }
  return <Box key={`stone ${row}-${col}`} sx={sx}>{historyNumber}</Box>;
}

function Intersection({ row, col, onPlay, playing, winRate }) {
  const sx = {
    top: PADDING - GRID_SIZE/2 + row * GRID_SIZE+2,
    left: PADDING - GRID_SIZE/2 + col * GRID_SIZE+2,
    width: GRID_SIZE - 4,
    height: GRID_SIZE - 4,
    borderRadius: "50%",
    position: "absolute",
    boxSizing: "border-box",
    zIndex: 2,
    transition: "0.1s",
    display: "flex",
    userSelect: "none",
  };
  if (playing) {
    sx['&:hover'] = {
      backgroundColor: playing === 1 ? "rgba(100, 100, 100, 0.4)" : "rgba(250, 250, 250, 0.5)"
    };
  }
  let winRateLable;
  if (winRate !== undefined) {
    // show as "50%"
    const winRatePercentage = `${parseFloat(winRate*100).toFixed(0)}%`;
    winRateLable = <div style={{ fontSize: "13px", color: `rgba(0,0,0,${0.2+winRate*0.3})`, margin: "auto" }}>{winRatePercentage}</div>
    sx.backgroundColor = `rgba(100, ${winRate*255}, 100, ${0.02+winRate*0.3})`;
    // set box shadow color from red to green
    sx.boxShadow = `2px 2px 4px 2px rgba(100, ${winRate*255}, 50, ${0.05+winRate*0.3}), -2px -2px 4px 0 rgba(100, ${winRate*255}, 250, ${0.05+winRate*0.3})`;
  }
  return <Box key={`intersection ${row}-${col}`} sx={sx} onClick={onPlay}>{winRateLable}</Box>;
}