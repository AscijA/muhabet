//App.js
import { Route, Routes } from 'react-router-dom';
import SignComponent from './Components/SignInSignUp/SignComponent';
import ChatContent from './Components/Chat/ChatContent/ChatContent';

function App() {
  return (
    <div className="App">
      <div>
        <Routes>
          <Route path='/' element={ <SignComponent /> } />
          <Route path='/chat' element={ <ChatContent /> } />
        </Routes>
      </div>
    </div>
  );
}

export default App;