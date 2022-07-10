// routes
import { useEffect, useState } from 'react';
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components
import ScrollToTop from './components/ScrollToTop';
import { BaseOptionChartStyle } from './components/chart/BaseOptionChart';
import AIServer, { SERVER_STATUS } from './server/api';

// ----------------------------------------------------------------------

export default function App() {
  const [serverState, setServerState] = useState({status: SERVER_STATUS.NO_CONNECTION});
  const [aiServer, setAiServer] = useState(null);

  useEffect(() => {
    const newServer = new AIServer(serverState, setServerState);
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
