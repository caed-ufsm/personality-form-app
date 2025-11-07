'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ResultsPage() {
  const [data, setData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadResults() {
      console.log('🔍 Buscando dados do Supabase...')
      const { data, error } = await supabase.from('UserResult').select('*')

      if (error) {
        console.error('❌ Erro Supabase:', error)
        setError(error.message)
      } else {
        console.log('✅ Dados recebidos:', data)
        setData(data || [])
      }
      setLoading(false)
    }

    loadResults()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl font-bold text-gray-600">
        ⏳ Carregando resultados...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 text-red-700 font-semibold">
        ⚠️ Erro ao buscar dados: {error}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-gray-600 text-center">
        📭 Nenhum dado encontrado na tabela <strong>UserResult</strong>.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">
        Resultados de Usuários
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow-md rounded-xl p-6 border border-gray-200"
          >
            <h2 className="text-lg font-semibold mb-2 text-gray-800">
              Session ID:
            </h2>
            <p className="text-sm break-all text-gray-600 mb-3">
              {item.sessionId}
            </p>

            <p className="text-xs text-gray-500 mb-1">
              Criado em: {new Date(item.createdAt).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Atualizado em: {new Date(item.updatedAt).toLocaleString()}
            </p>

            <details className="bg-gray-50 rounded-lg p-3">
              <summary className="cursor-pointer text-indigo-600 font-semibold">
                Ver resultados JSON
              </summary>
              <pre className="mt-2 text-xs bg-black text-green-400 p-3 rounded overflow-x-auto">
                {JSON.stringify(item.results, null, 2)}
              </pre>
            </details>
          </div>
        ))}
      </div>
    </div>
  )
}
