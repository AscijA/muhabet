//App.js
import { Route, Routes } from 'react-router-dom';
import SignComponent from './Components/SignInSignUp/SignComponent';
import Chat from './Components/Chat/Chat';

function App() {
  return (
    <div className="App">
      <div>
        <Routes>
          <Route path='/' element={ <SignComponent /> } />
          <Route path='/chat' element={ <Chat /> } />
        </Routes>
      </div>
    </div>
  );
}

export default App;