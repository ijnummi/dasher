function App() {
  return (
    <div className="min-h-screen p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Dasher</h1>
        <p className="text-slate-400 text-sm">Dashboard</p>
      </header>
      <main>
        <div className="grid grid-cols-1 gap-4 text-center text-slate-500">
          <div className="rounded-lg border border-slate-700 p-8">
            <p className="text-lg">Dashboard is ready.</p>
            <p className="text-sm mt-2">Widgets will appear here once configured.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
