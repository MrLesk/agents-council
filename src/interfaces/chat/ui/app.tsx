import { useState } from "react";

import { useCouncil } from "./hooks/useCouncil";
import { Gate } from "./pages/Gate";
import { Hall } from "./pages/Hall";
import { loadName, saveName } from "./storage";

export function App() {
  const [name, setName] = useState<string | null>(() => loadName());
  const council = useCouncil(name);

  const handleEnter = (newName: string) => {
    saveName(newName);
    setName(newName);
  };

  const handleNameChange = (newName: string) => {
    saveName(newName);
    setName(newName);
  };

  if (!name) {
    return <Gate onEnter={handleEnter} />;
  }

  return <Hall name={name} council={council} onNameChange={handleNameChange} />;
}
