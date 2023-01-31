import { Header } from './Components/Header';
import { MapContainer } from './Components/MapContainer';

function App() {
  return (
    <div className='undp-container'>
      {
        window.location.href.includes('data.undp.org') ? null : <Header />
      }
      <MapContainer />
    </div>
  );
}

export default App;
