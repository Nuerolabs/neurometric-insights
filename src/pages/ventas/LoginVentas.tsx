import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useVentas } from '@/context/VentasContext';

export default function LoginVentas() {
  const { login } = useVentas();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const ok = login(usuario.trim(), contrasena);
      if (ok) {
        navigate('/ventas');
      } else {
        setError('Usuario o contraseña incorrectos.');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="pt-login-bg">
      <div className="pt-login-card">
        {/* Logo */}
        <div className="pt-login-logo-wrap">
          <img src="/logo.png" alt="Logo empresa" className="pt-login-logo" />
        </div>

        <h1 className="pt-login-title">Sistema de Ventas</h1>
        <p className="pt-login-subtitle">Impresiones &amp; Copias</p>

        <form onSubmit={handleSubmit} className="pt-login-form">
          <div className="pt-input-group">
            <label htmlFor="login-usuario" className="pt-label">Usuario</label>
            <div className="pt-input-wrap">
              <User size={15} className="pt-input-icon" />
              <input
                id="login-usuario"
                type="text"
                autoComplete="username"
                placeholder="Usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="pt-input"
                required
              />
            </div>
          </div>

          <div className="pt-input-group">
            <label htmlFor="login-contrasena" className="pt-label">Contraseña</label>
            <div className="pt-input-wrap">
              <Lock size={15} className="pt-input-icon" />
              <input
                id="login-contrasena"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                className="pt-input"
                style={{ paddingRight: '2.5rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="pt-input-toggle"
                aria-label="Mostrar/ocultar contraseña"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="pt-error" role="alert">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="pt-login-btn">
            {loading ? <span className="pt-spinner" /> : 'Ingresar'}
          </button>
        </form>

        <p className="pt-login-footer">Acceso privado · Solo uso personal</p>
      </div>
    </div>
  );
}
