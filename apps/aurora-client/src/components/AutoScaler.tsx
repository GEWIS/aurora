import { useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const DEFAULT_FONT_SIZE = 16;

export default function AutoScaler() {
  const { screen } = useContext(AuthContext);

  useEffect(() => {
    if (screen) {
      document.documentElement.style.fontSize = Math.round(DEFAULT_FONT_SIZE * screen.scaleFactor) + 'px';
    }
  }, [screen]);

  return null;
}
