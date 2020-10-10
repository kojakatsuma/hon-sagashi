import React, { ReactNode, useCallback, useState } from 'react'
import source from './result.json'

const Table: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <table style={{ borderCollapse: 'collapse' }}>{children}</table>
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

type Books = {
  title: string
  url: string
  libs: string[]
  isSuggest: boolean
  isWakatiGaki: boolean
}[]

const useFilter = (): [Books, string[], (libName: string) => void] => {
  const [books, setBooks] = useState<Books>(source)
  const findByLibrary = useCallback(
    (libName) => {
      if (libName === '全て') {
        setBooks(source)
        return
      }
      setBooks(source.filter(({ libs }) => libs.find((lib) => lib === libName)))
    },
    [setBooks],
  )

  const libNames = ['全て', 'なし'].concat(
    Array.from(
      new Set(
        source
          .filter(({ libs }) => libs.find((lib) => lib !== 'なし'))
          .flatMap(({ libs }) => libs),
      ),
    ),
  )

  return [books, libNames, findByLibrary]
}

const App = () => {
  const [books, libNames, findByLibrary] = useFilter()
  return (
    <Table>
      <thead>
        <tr>
          <th>本の名前</th>
          <th>
            <select onChange={(e) => findByLibrary(e.target.value)}>
              {libNames.map((lib, i) => (
                <option value={lib} key={i}>
                  {lib}
                </option>
              ))}
            </select>
          </th>
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
