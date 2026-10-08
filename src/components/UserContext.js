// src/context/UserContext.js
import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  if (user) {
    localStorage.setItem("user", JSON.stringify(user.name));
  } else {
    localStorage.removeItem("user");
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
