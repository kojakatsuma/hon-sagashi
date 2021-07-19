import React, { ReactNode } from 'react'
import source from './result.json'

type Book = {
  title: string
  url: string
  isSuggest: boolean
  isWakatiGaki: boolean
  resultTitle: string
  amazonUrl: string
}

const Table: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <table style={{ borderCollapse: 'collapse' }}>{children}</table>
}

const TD: React.FC<Book> = ({
  title,
  url,
  isSuggest,
  isWakatiGaki,
  resultTitle,
  amazonUrl,
}) => {
  return (
    <tr>
      <td>
        <a target="blank" href={amazonUrl}>
          {title}
        </a>
      </td>
      <td>
        {url === 'なし' ? (
          resultTitle
        ) : (
          <a target="blank" href={url}>
            {resultTitle}
          </a>
        )}
      </td>
      <td>{isSuggest ? 'した' : 'してない'}</td>
      <td>{isWakatiGaki ? 'した' : 'してない'}</td>
    </tr>
  )
}

const App = () => {
  const books = source;
  return (
    <Table>
      <thead>
        <tr>
          <th>検索した本の名前</th>
          <th>検索結果</th>
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
