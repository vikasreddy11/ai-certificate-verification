import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import '../styles/globals.css';
import { warmUpBackend } from '../utils/api';

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    warmUpBackend();
  }, []);

  return <Component {...pageProps} />;
}
