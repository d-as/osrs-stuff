import { useState } from 'react';
import './App.scss';

const increment = (value: number): number => value + 1;

export const App = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>osrs-vite</h1>
      <div>
        <button type="button" onClick={() => setCount(increment)}>
          {`Count is ${count}`}
        </button>
      </div>
    </div>
  );
};
