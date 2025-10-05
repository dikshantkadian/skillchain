import React, { useState, useEffect } from 'react';

// API Helper - A small object to keep our API calls organized.
const api = {
  baseUrl: 'https://skillchain-backend.vercel.app',

  register: (email, password, name, role) => {
    return fetch(`${api.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role }),
    });
  },

  login: (email, password) => {
    return fetch(`${api.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  },
  
  issueCertificate: (formData, token) => {
    return fetch(`${api.baseUrl}/certificates/issue`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
  },
};


// The main App component - This is the "brain" of our frontend.
function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('skillchain_token');
    const savedUser = localStorage.getItem('skillchain_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('skillchain_user', JSON.stringify(userData));
    localStorage.setItem('skillchain_token', userToken);
  };
  
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('skillchain_user');
    localStorage.removeItem('skillchain_token');
    setPage('home');
  };

  const renderPage = () => {
    if (user) {
      switch (user.role) {
        case 'INSTITUTION':
          return <InstitutionDashboard user={user} token={token} onLogout={handleLogout} />;
        case 'STUDENT':
          return <StudentDashboard user={user} token={token} onLogout={handleLogout} />;
        case 'RECRUITER':
          return <RecruiterDashboard user={user} onLogout={handleLogout} />;
        default:
          handleLogout();
          return <HomePage setPage={setPage} />;
      }
    } else {
      switch (page) {
        case 'login':
          return <AuthPage setPage={setPage} onLogin={handleLogin} />;
        case 'home':
        default:
          return <HomePage setPage={setPage} />;
      }
    }
  };

  return <div className="app-wrapper">{renderPage()}</div>;
}


// ---------------------------------
// Component for the Home Page
// ---------------------------------
function HomePage({ setPage }) {
  return (
    <div className="index-body">
       <header className="topbar">
        <div className="brand">
          <img src="https://cdn-icons-png.flaticon.com/512/6490/6490339.png" alt="logo" className="brand-logo" />
          <div><h1>SkillChain</h1><p className="subtitle">Decentralized Credentialing Platform</p></div>
        </div>
      </header>
      <main className="index-main">
        <section className="hero">
          <h2>A New Era of Trust for Credentials</h2>
          <p>Issue, store, and verify skill certificates on the blockchain, backed by decentralized storage.</p>
          <div className="role-grid">
            <div className="role-card" onClick={() => setPage('login')}><img src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png" alt="institution" /><h3>Institution Portal</h3><p>Login to issue new certificates.</p></div>
            <div className="role-card" onClick={() => setPage('login')}><img src="https://cdn-icons-png.flaticon.com/512/1995/1995574.png" alt="student" /><h3>Student Portal</h3><p>Login to view your credentials.</p></div>
            <div className="role-card" onClick={() => setPage('login')}><img src="https://cdn-icons-png.flaticon.com/512/2917/2917242.png" alt="recruiter" /><h3>Recruiter Portal</h3><p>Login to verify a certificate instantly.</p></div>
          </div>
        </section>
      </main>
      <footer className="footer"><small>© 2025 SkillChain — A Hackathon Project</small></footer>
    </div>
  );
}


// ---------------------------------
// Component for Login & Registration
// ---------------------------------
function AuthPage({ setPage, onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      let response;
      if (isRegister) { response = await api.register(email, password, name, role); } 
      else { response = await api.login(email, password); }
      const data = await response.json();
      if (!response.ok) {
        const errorMessage = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(errorMessage || 'An error occurred.');
      }
      if (isRegister) {
          alert("Registration successful! Please log in.");
          setIsRegister(false);
      } else {
          const decodedToken = JSON.parse(atob(data.access_token.split('.')[1]));
          onLogin(decodedToken, data.access_token);
      }
    } catch (err) { setError(err.message); } 
    finally { setIsLoading(false); }
  };

  return (
    <>
      <header className="topbar small"><div className="brand"><div><h1>SkillChain Login</h1></div></div><div className="link-home" onClick={() => setPage('home')} style={{cursor:'pointer'}}>← Home</div></header>
      <main className="container">
        <section className="card center-card">
          <h2>{isRegister ? 'Register Account' : 'User Login'}</h2>
          <form onSubmit={handleSubmit}>
            {isRegister && ( <>
              <div className="form-row"><label>Full Name</label><input value={name} onChange={e => setName(e.target.value)} required /></div>
              <div className="form-row"><label>Role</label><select value={role} onChange={e => setRole(e.target.value)}><option value="STUDENT">Student</option><option value="INSTITUTION">Institution</option><option value="RECRUITER">Recruiter</option></select></div>
            </>)}
            <div className="form-row"><label>Email Address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div className="form-row"><label>Password (min 8 characters)</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
            {error && <div className="invalid" style={{marginBottom:'10px'}}>{error}</div>}
            <div className="form-row"><button type="submit" className="btn" disabled={isLoading}>{isLoading ? '...' : (isRegister ? 'Register' : 'Login')}</button></div>
          </form>
          <div style={{marginTop:'20px', textAlign:'center'}}><a href="#" onClick={(e) => { e.preventDefault(); setIsRegister(!isRegister); setError(''); }}>{isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}</a></div>
        </section>
      </main>
    </>
  );
}


// ---------------------------------
// Component for Institution Dashboard
// ---------------------------------
function InstitutionDashboard({ user, token, onLogout }) {
  const [studentEmail, setStudentEmail] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmitCertificate = async (event) => {
    event.preventDefault();
    if (!file) { alert("Please select a certificate file to upload."); return; }
    setIsSubmitting(true);
    setResult(null);
    const formData = new FormData();
    formData.append('studentEmail', studentEmail);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);
    try {
      const response = await api.issueCertificate(formData, token);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to issue certificate.');
      setResult({ success: true, data });
      setStudentEmail(''); setTitle(''); setDescription(''); setFile(null);
      document.getElementById('uploadFile').value = null;
    } catch (error) { setResult({ success: false, message: error.message }); } 
    finally { setIsSubmitting(false); }
  };

  return (
    <>
      <header className="topbar small">
        <div className="brand"><img src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png" alt="inst" className="brand-logo" /><div><h1>Institution Portal</h1></div></div>
        <div><span style={{color:'var(--muted)', fontSize:'13px', marginRight:'15px'}}>Welcome, {user.email}</span><button onClick={onLogout} className="btn ghost">Logout</button></div>
      </header>
      <main className="container">
        <section className="card">
          <h3>Issue New Certificate</h3>
          <form onSubmit={handleSubmitCertificate}>
            <div className="form-row"><label>Student's Email Address</label><input value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} placeholder="e.g., student@test.com" required /></div>
            <div className="form-row"><label>Certificate Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Hackathon Champion" required /></div>
            <div className="form-row"><label>Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the achievement..." required></textarea></div>
            <div className="form-row"><label>Certificate File (PDF, PNG, JPG)</label><input id="uploadFile" type="file" onChange={(e) => setFile(e.target.files[0])} accept=".pdf,.png,.jpg,.jpeg" required /></div>
            <div className="form-row"><button type="submit" className="btn" disabled={isSubmitting}>{isSubmitting ? 'Issuing...' : 'Issue Certificate on Sepolia'}</button></div>
          </form>
          {result && (
            <div className="result-area" style={{marginTop:'20px'}}>
              {result.success ? (
                <div className="valid">✅ Success! Certificate Issued.<div className="muted" style={{fontSize:'12px', marginTop:'8px', wordBreak: 'break-all'}}><div>Tx Hash: <code>{result.data.transactionHash}</code></div><div>IPFS CID: <a href={`https://gateway.pinata.cloud/ipfs/${result.data.ipfsCid}`} target="_blank" rel="noopener noreferrer" style={{color:'inherit'}}><code>{result.data.ipfsCid}</code></a></div></div></div>
              ) : ( <div className="invalid">❌ Error: {result.message}</div> )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

// ---------------------------------
// Component for Student Dashboard
// ---------------------------------
function StudentDashboard({ user, token, onLogout }) {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await fetch(`${api.baseUrl}/certificates/my-certificates`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not fetch certificates.');
        setCertificates(data);
      } catch (err) { setError(err.message); } 
      finally { setIsLoading(false); }
    };
    fetchCertificates();
  }, [token]);

  // Helper function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Hash copied to clipboard!');
    }, (err) => {
      alert('Failed to copy hash.');
      console.error('Clipboard copy failed: ', err);
    });
  };

  return (
    <>
      <header className="topbar small">
        <div className="brand"><img src="https://cdn-icons-png.flaticon.com/512/1995/1995574.png" alt="student" className="brand-logo" /><div><h1>Student Dashboard</h1></div></div>
        <div><span style={{color:'var(--muted)', fontSize:'13px', marginRight:'15px'}}>Welcome, {user.email}</span><button onClick={onLogout} className="btn ghost">Logout</button></div>
      </header>
      <main className="container">
        <section className="card">
          <h2>My Certificates</h2>
          {isLoading && <p className="muted">Loading your certificates...</p>}
          {error && <div className="invalid">Error: {error}</div>}
          {!isLoading && !error && (
            <div id="certList" style={{marginTop:'12px'}}>
              {certificates.length === 0 ? (
                <p className="muted">No certificates have been issued to you yet.</p>
              ) : (
                certificates.map(cert => (
                  <div key={cert.id} className='cert-card'>
                    <div>
                      <div style={{fontWeight:800}}>{cert.title}</div>
                      <div className="muted" style={{fontSize:'13px'}}>{cert.description}</div>
                      <div className="muted" style={{fontSize:'12px', marginTop:'8px'}}>Issued by {cert.institution.name} • {new Date(cert.issueDate).toLocaleDateString()}</div>
                      {/* --- THIS IS THE NEW PART! --- */}
                      <div className="muted" style={{fontSize:'12px', marginTop:'8px', display:'flex', alignItems:'center', gap:'10px'}}>
                        <code className="mono" style={{fontSize:'11px', wordBreak:'break-all'}}>File Hash: {cert.fileHash}</code>
                        <button className="btn ghost" style={{fontSize:'10px', padding:'4px 8px'}} onClick={() => copyToClipboard(cert.fileHash)}>Copy</button>
                      </div>
                      {/* --- END OF NEW PART --- */}
                    </div>
                    <div style={{textAlign:'right', minWidth: '200px', display:'flex', flexDirection:'column', gap:'5px'}}>
                       <a href={`https://sepolia.etherscan.io/tx/${cert.transactionHash}`} target="_blank" rel="noopener noreferrer" className="btn ghost" style={{fontSize:'12px', padding:'6px 10px'}}>Verify on Etherscan</a>
                       <a href={`https://gateway.pinata.cloud/ipfs/${cert.ipfsCid}`} target="_blank" rel="noopener noreferrer" className="btn ghost" style={{fontSize:'12px', padding:'6px 10px'}}>View Original File</a>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}


// ---------------------------------
// Component for Recruiter Dashboard
// ---------------------------------
function RecruiterDashboard({ user, onLogout }) {
  const [hashInput, setHashInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleVerify = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch(`${api.baseUrl}/certificates/verify/${hashInput}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Verification failed.');
      setResult({ success: true, data });
    } catch (error) { setResult({ success: false, message: error.message }); } 
    finally { setIsLoading(false); }
  };

  return (
    <>
      <header className="topbar small">
        <div className="brand"><img src="https://cdn-icons-png.flaticon.com/512/2917/2917242.png" alt="recruiter" className="brand-logo" /><div><h1>Recruiter Portal</h1></div></div>
        <div><span style={{color:'var(--muted)', fontSize:'13px', marginRight:'15px'}}>Welcome, {user.email}</span><button onClick={onLogout} className="btn ghost">Logout</button></div>
      </header>
      <main className="container">
        <section className="card center-card">
          <h2>Verify a Certificate</h2>
          <p className="muted">Enter the certificate's unique File Hash (SHA-256) to verify its authenticity.</p>
          <form onSubmit={handleVerify}>
            <div className="form-row"><input value={hashInput} onChange={(e) => setHashInput(e.target.value)} placeholder="Enter certificate file hash..." required /></div>
            <div className="form-row"><button type="submit" className="btn" disabled={isLoading}>{isLoading ? 'Verifying...' : 'Verify Hash'}</button></div>
          </form>
          {result && (
            <div className="result-area">
              {result.success ? (
                <div className="valid">
                  ✅ **Valid Hash — Certificate Verified!**
                  <div className="muted" style={{fontSize:'13px', marginTop:'10px'}}>
                    <p style={{margin: '5px 0'}}><strong>Title:</strong> {result.data.title}</p>
                    <p style={{margin: '5px 0'}}><strong>Student:</strong> {result.data.student.name} ({result.data.student.email})</p>
                    <p style={{margin: '5px 0'}}><strong>Institution:</strong> {result.data.institution.name}</p>
                    <p style={{margin: '5px 0'}}><strong>Issued On:</strong> {new Date(result.data.issueDate).toLocaleDateString()}</p>
                    <p style={{margin: '5px 0'}}><a href={`https://gateway.pinata.cloud/ipfs/${result.data.ipfsCid}`} target="_blank" rel="noopener noreferrer" style={{color:'inherit'}}>View Original File on IPFS</a></p>
                  </div>
                </div>
              ) : ( <div className="invalid">❌ Invalid Hash — {result.message}</div> )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default App;

