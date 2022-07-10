// routes
import { useEffect, useState } from 'react';
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components
import ScrollToTop from './components/ScrollToTop';
import { BaseOptionChartStyle } from './components/chart/BaseOptionChart';
import AIServer from './server/api';

// ----------------------------------------------------------------------

export default function App() {
  const [serverState, setServerState] = useState({});
  const [aiServer, setAiServer] = useState(null);

  const updateState = (key, value) => {
		setServerState(serverState => ({
			...serverState,
			[key]: value,
		}));
	};
  
  useEffect(() => {
    const newServer = new AIServer(updateState);
    setAiServer(newServer);
  }, [setAiServer]);

  return (
    <ThemeProvider>
      <ScrollToTop />
      <BaseOptionChartStyle />
      <Router aiServer={aiServer} serverState={serverState} />
    </ThemeProvider>
  );
}
