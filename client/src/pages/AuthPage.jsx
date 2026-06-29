import { useState } from "react";
import { registrar, iniciarSesion } from "../api/auth";

const inputClass =
  "w-full rounded-lg border border-green-200 bg-white px-4 py-2.5 text-sm text-green-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100";

const labelClass =
  "mb-1 block text-xs font-semibold uppercase tracking-wide text-green-700";

const botonClass =
  "w-full rounded-lg bg-green-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-900 disabled:opacity-60";

export default function AuthPage({ onAuth }) {
  const [login, setLogin] = useState({ email: "", password: "" });
  const [registro, setRegistro] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
  });
  const [errorLogin, setErrorLogin] = useState("");
  const [errorRegistro, setErrorRegistro] = useState("");
  const [cargando, setCargando] = useState(false);

  async function manejarLogin(e) {
    e.preventDefault();
    setErrorLogin("");
    setCargando(true);
    try {
      const data = await iniciarSesion(login);
      onAuth(data);
    } catch (err) {
      setErrorLogin(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function manejarRegistro(e) {
    e.preventDefault();
    setErrorRegistro("");
    setCargando(true);
    try {
      const data = await registrar(registro);
      onAuth(data);
    } catch (err) {
      setErrorRegistro(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <header className="mx-auto mb-8 max-w-5xl">
        <h1 className="text-xl font-semibold text-green-900">
          Macrobiótica Estilo Natural
        </h1>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
        {/* Inicia Sesión */}
        <section className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-green-900">Inicia Sesión</h2>
          <p className="mt-1 mb-6 text-sm text-green-600">
            Bienvenido de nuevo a tu santuario de bienestar.
          </p>

          <form onSubmit={manejarLogin} className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                className={inputClass}
                value={login.email}
                onChange={(e) => setLogin({ ...login, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="login-password">Contraseña</label>
              <input
                id="login-password"
                type="password"
                className={inputClass}
                value={login.password}
                onChange={(e) => setLogin({ ...login, password: e.target.value })}
                required
              />
            </div>

            {errorLogin && (
              <p className="text-sm text-red-600">{errorLogin}</p>
            )}

            <button type="submit" className={botonClass} disabled={cargando}>
              {cargando ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </section>

        {/* Crea una Cuenta */}
        <section className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-green-900">Crea una Cuenta</h2>
          <p className="mt-1 mb-6 text-sm text-green-600">
            Únete a nuestra comunidad macrobiótica y comienza tu viaje hoy.
          </p>

          <form onSubmit={manejarRegistro} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="reg-nombre">Nombre</label>
                <input
                  id="reg-nombre"
                  className={inputClass}
                  value={registro.nombre}
                  onChange={(e) => setRegistro({ ...registro, nombre: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="reg-apellido">Apellido</label>
                <input
                  id="reg-apellido"
                  className={inputClass}
                  value={registro.apellido}
                  onChange={(e) => setRegistro({ ...registro, apellido: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                className={inputClass}
                value={registro.email}
                onChange={(e) => setRegistro({ ...registro, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="reg-password">Contraseña</label>
              <input
                id="reg-password"
                type="password"
                className={inputClass}
                value={registro.password}
                onChange={(e) => setRegistro({ ...registro, password: e.target.value })}
                minLength={8}
                required
              />
              <p className="mt-1 text-xs text-green-500">Mínimo 8 caracteres.</p>
            </div>

            {errorRegistro && (
              <p className="text-sm text-red-600">{errorRegistro}</p>
            )}

            <button type="submit" className={botonClass} disabled={cargando}>
              {cargando ? "Creando…" : "Crear Cuenta"}
            </button>
          </form>
        </section>
      </main>

      <p className="mx-auto mt-8 max-w-5xl text-center text-xs text-green-500">
        Tu salud es el resultado de vivir en armonía con la naturaleza.
      </p>
    </div>
  );
}
