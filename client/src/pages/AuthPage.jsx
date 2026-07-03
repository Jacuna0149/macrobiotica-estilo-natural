import { useEffect, useState } from "react";
import { registrar, iniciarSesion, olvidePassword, restablecerPassword } from "../api/auth";

const inputClass =
  "w-full rounded-lg border border-green-200 bg-white px-4 py-2.5 text-sm text-green-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100";

const labelClass =
  "mb-1 block text-xs font-semibold uppercase tracking-wide text-green-700";

const botonClass =
  "w-full rounded-lg bg-green-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-900 disabled:opacity-60";

export default function AuthPage({ onAuth }) {
  // vista: "principal" (login + registro) | "olvide" | "restablecer"
  const [vista, setVista] = useState("principal");
  const [tokenReset, setTokenReset] = useState("");

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

  // Si la URL trae ?token=... (viene del enlace de recuperación), abre esa vista directamente
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      setTokenReset(token);
      setVista("restablecer");
    }
  }, []);

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

  if (vista === "olvide") {
    return <OlvidePasswordCard onVolver={() => setVista("principal")} />;
  }

  if (vista === "restablecer") {
    return (
      <RestablecerPasswordCard
        token={tokenReset}
        onExito={() => {
          // Limpia el token de la URL para que no se reutilice al recargar
          window.history.replaceState({}, "", window.location.pathname);
          setVista("principal");
        }}
      />
    );
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
              <div className="flex items-center justify-between">
                <label className={labelClass} htmlFor="login-password">Contraseña</label>
                <button
                  type="button"
                  onClick={() => setVista("olvide")}
                  className="mb-1 text-xs font-medium text-green-700 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
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

// Tarjeta para pedir el email y solicitar el enlace de recuperación
function OlvidePasswordCard({ onVolver }) {
  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await olvidePassword(email);
      setEnviado(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-green-900">Recuperar contraseña</h2>

        {enviado ? (
          <>
            <p className="mt-4 text-sm text-green-700">
              Si el correo <span className="font-semibold">{email}</span> está registrado,
              recibirás un enlace para restablecer tu contraseña.
            </p>
            <button
              type="button"
              onClick={onVolver}
              className="mt-6 text-sm font-medium text-green-700 hover:underline"
            >
              ← Volver a iniciar sesión
            </button>
          </>
        ) : (
          <>
            <p className="mt-1 mb-6 text-sm text-green-600">
              Ingresá tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <form onSubmit={enviar} className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="olvide-email">Email</label>
                <input
                  id="olvide-email"
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button type="submit" className={botonClass} disabled={cargando}>
                {cargando ? "Enviando…" : "Enviar enlace"}
              </button>
            </form>
            <button
              type="button"
              onClick={onVolver}
              className="mt-4 text-sm font-medium text-green-700 hover:underline"
            >
              ← Volver a iniciar sesión
            </button>
          </>
        )}
      </section>
    </div>
  );
}

// Tarjeta para establecer la nueva contraseña (llega desde el enlace con ?token=...)
function RestablecerPasswordCard({ token, onExito }) {
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    try {
      await restablecerPassword(token, password);
      setExito(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-green-900">Restablecer contraseña</h2>

        {exito ? (
          <>
            <p className="mt-4 text-sm text-green-700">
              Tu contraseña fue actualizada correctamente.
            </p>
            <button
              type="button"
              onClick={onExito}
              className="mt-6 w-full rounded-lg bg-green-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-900"
            >
              Iniciar sesión
            </button>
          </>
        ) : (
          <>
            <p className="mt-1 mb-6 text-sm text-green-600">
              Ingresá tu nueva contraseña.
            </p>
            <form onSubmit={enviar} className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="nueva-password">Nueva contraseña</label>
                <input
                  id="nueva-password"
                  type="password"
                  className={inputClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <p className="mt-1 text-xs text-green-500">Mínimo 8 caracteres.</p>
              </div>
              <div>
                <label className={labelClass} htmlFor="confirmar-password">Confirmar contraseña</label>
                <input
                  id="confirmar-password"
                  type="password"
                  className={inputClass}
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  minLength={8}
                  required
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button type="submit" className={botonClass} disabled={cargando}>
                {cargando ? "Guardando…" : "Guardar nueva contraseña"}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
