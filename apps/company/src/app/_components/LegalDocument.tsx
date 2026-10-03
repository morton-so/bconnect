export type LegalBlock =
  | { h2: string }
  | { h3: string }
  | { p: string }
  | { ol: string[] }
  | { table: { head: string[]; rows: string[][]; label?: boolean } }

export function LegalDocument({ title, blocks }: { title: string; blocks: LegalBlock[] }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10 text-r-14 leading-relaxed break-keep text-gray-700 sm:px-6">
      <h1 className="border-b-2 border-gray-900 pb-4 text-sb-24 text-gray-900">{title}</h1>
      {blocks.map((b, i) => {
        if ('h2' in b)
          return (
            <h2 key={i} className="mt-10 mb-2 text-sb-20 text-gray-900">
              {b.h2}
            </h2>
          )
        if ('h3' in b)
          return (
            <h3 key={i} className="mt-6 mb-2 text-sb-16 text-gray-900">
              {b.h3}
            </h3>
          )
        if ('p' in b)
          return (
            <p key={i} className="my-2">
              {b.p}
            </p>
          )
        if ('ol' in b)
          return (
            <ol key={i} className="my-2 list-decimal space-y-1 pl-7">
              {b.ol.map((li) => (
                <li key={li}>{li}</li>
              ))}
            </ol>
          )
        const { head, rows, label } = b.table
        return (
          <div key={i} className="my-3 overflow-x-auto">
            <table className="w-full border-collapse text-r-12">
              <thead>
                <tr>
                  {head.map((h) => (
                    <th
                      key={h}
                      className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td
                        key={c}
                        className={
                          label && c === 0
                            ? 'border border-gray-200 bg-gray-50 px-3 py-2 align-top font-semibold whitespace-nowrap'
                            : 'border border-gray-200 px-3 py-2 align-top'
                        }
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
    </main>
  )
}
