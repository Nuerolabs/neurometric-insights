import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
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

    // Simulate brief async
    setTimeout(() => {
      const ok = login(usuario.trim(), contrasena);
      if (ok) {
        navigate('/ventas');
      } else {
        setError('Usuario o contraseña incorrectos. Intenta de nuevo.');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="ventas-login-bg">
      {/* Animated background blobs */}
      <div className="ventas-blob ventas-blob-1" />
      <div className="ventas-blob ventas-blob-2" />
      <div className="ventas-blob ventas-blob-3" />

      <div className="ventas-login-card">
        {/* Header */}
        <div className="ventas-login-header">
          <div className="ventas-login-icon-wrap">
            <Printer size={32} className="ventas-login-icon" />
          </div>
          <h1 className="ventas-login-title">PrintTrack</h1>
          <p className="ventas-login-subtitle">Sistema de Ventas de Impresora</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="ventas-login-form">
          <div className="ventas-input-group">
            <label htmlFor="login-usuario" className="ventas-label">
              Usuario
            </label>
            <div className="ventas-input-wrap">
              <User size={16} className="ventas-input-icon" />
              <input
                id="login-usuario"
                type="text"
                autoComplete="username"
                placeholder="Tu usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="ventas-input"
                required
              />
            </div>
          </div>

          <div className="ventas-input-group">
            <label htmlFor="login-contrasena" className="ventas-label">
              Contraseña
            </label>
            <div className="ventas-input-wrap">
              <Lock size={16} className="ventas-input-icon" />
              <input
                id="login-contrasena"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Tu contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                className="ventas-input"
                style={{ paddingRight: '2.75rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="ventas-input-toggle"
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="ventas-error" role="alert">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="ventas-login-btn"
          >
            {loading ? (
              <span className="ventas-spinner" />
            ) : (
              'Ingresar al Sistema'
            )}
          </button>
        </form>

        <p className="ventas-login-footer">
          Solo para uso personal &middot; PrintTrack &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
