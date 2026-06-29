import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

function App() {
  const [api, setApi] = useState('comprobando...')

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((r) => r.json())
      .then((d) => setApi(d.status))
      .catch(() => setApi('sin conexión'))
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-green-900">
      <h1 className="text-4xl font-semibold">Macrobiótica Estilo Natural</h1>
      <p className="mt-2 text-green-700">Entorno base listo · React + Vite + Tailwind</p>
      <p className="mt-4 text-sm">
        Estado de la API: <span className="font-mono font-bold">{api}</span>
      </p>
    </main>
  )
}

export default App
