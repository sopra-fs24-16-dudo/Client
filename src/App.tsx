import React from "react";
import Header from "./components/views/Header";
import AppRouter from "./components/routing/routers/AppRouter";

const App = () => {
  return (
    <div>
      <Header width ="100px"/>
      <AppRouter/>
    </div>
  );
};

export default App;