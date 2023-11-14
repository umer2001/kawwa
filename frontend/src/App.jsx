import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Router from './routes';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <Router />
      <Footer />
    </QueryClientProvider>
  )
}

export default App
