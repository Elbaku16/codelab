import { useState } from 'react';
import { Home } from './screens/Home';
import { CodeLab } from './screens/CodeLab';
import { isUnlocked, useProgress } from './lib/progress';

type Screen = { name: 'home' } | { name: 'lab'; levelId: number };

export default function App() {
  const { progress, completeLevel, markIntro, resetProgress } = useProgress();
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  const openLevel = (levelId: number) => {
    if (!isUnlocked(progress, levelId)) return;
    setScreen({ name: 'lab', levelId });
  };

  if (screen.name === 'lab') {
    return (
      <CodeLab
        key={screen.levelId}
        levelId={screen.levelId}
        progress={progress}
        onComplete={completeLevel}
        onSeenIntro={markIntro}
        onChangeLevel={(id) => setScreen({ name: 'lab', levelId: id })}
        onHome={() => setScreen({ name: 'home' })}
      />
    );
  }

  return <Home progress={progress} onPlay={openLevel} onReset={resetProgress} />;
}
