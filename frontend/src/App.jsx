import { useEffect, useState } from 'react';
import Customers from './Customers.jsx';
import Chat from './Chat.jsx';
import './App.css';

export default function App() {
  const [tab, setTab] = useState('customers');
  // bump to make the customer list reload after the chat agent changes data
  const [version, setVersion] = useState(0);

  useEffect(() => { document.title = 'Customer Hub'; }, []);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand"><span className="logo">C</span> Customer Hub</div>
        <nav>
          <button className={tab === 'customers' ? 'active' : ''} onClick={() => setTab('customers')}>Customers</button>
          <button className={tab === 'chat' ? 'active' : ''} onClick={() => setTab('chat')}>AI Assistant</button>
        </nav>
      </header>
      <main>
        {tab === 'customers'
          ? <Customers version={version} />
          : <Chat onDataChange={() => setVersion((v) => v + 1)} />}
      </main>
    </div>
  );
}
