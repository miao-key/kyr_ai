import { useState } from "react";
import "./App.css";
import Page from "./components/Page";
import { ThemeContext } from "./ThemeContext.js";

function App() {
  const [theme, setTheme] = useState("light");
  console.log(ThemeContext, "//////");

  return (
    <div className={`app ${theme}`}>
    <ThemeContext.Provider value={theme}>
      <Page />
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        切换主题 
      </button>
      {/* <Uncle /> */}
      {/* <Parent>
        <Child>
          <GrandChild>
            <GreatGrandChild></GreatGrandChild>
          </GrandChild>
        </Child>
      </Parent> */}
    </ThemeContext.Provider>
    </div>
  );
}

export default App;