import React, { ReactNode } from 'react'
import books from './result.json'

const Table: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <table style={{ borderCollapse: "collapse" }}>{children}</table>
}

const TD: React.FC<{
  title: string
  url: string
  libs: string[]
  isSuggest: boolean
  isWakatiGaki: boolean
}> = ({ title, url, libs, isSuggest, isWakatiGaki }) => {
  return (
    <tr>
      <td>
        {url === 'なし' ? (
          title
        ) : (
          <a target="blank" href={url}>
            {title}
          </a>
        )}
      </td>
      <td>
        {libs.map((lib, i) => (
          <div key={i}>{lib}</div>
        ))}
      </td>
      <td>{isSuggest ? 'した' : 'してない'}</td>
      <td>{isWakatiGaki ? 'した' : 'してない'}</td>
    </tr>
  )
}

function App() {
  return (
    <Table>
      <thead>
        <tr>
          <th>本の名前</th>
          <th>図書館</th>
          <th>サジェスト検索</th>
          <th>わかち書き検索</th>
        </tr>
      </thead>
      <tbody>
        {books.map((book, i) => (
          <TD key={i} {...book} />
        ))}
      </tbody>
    </Table>
  )
}

export default App
