//App.js
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const SignComponent = lazy(() => import('./Components/SignInSignUp/SignComponent'));
const Chat = lazy(() => import('./Components/Chat/Chat'));

function App() {
  return (
    <div className="App">
      <div>
        <Suspense fallback={ <p role="status">Loading Muhabet…</p> }>
          <Routes>
            <Route path='/' element={ <SignComponent /> } />
            <Route path='/chat' element={ <Chat /> } />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

export default App;
