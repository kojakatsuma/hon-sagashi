import React, { ReactNode, useCallback, useEffect, useState } from 'react'
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
  resultTitle: string
  amazonUrl: string
  ndc: string
}> = ({
  title,
  url,
  libs,
  isSuggest,
  isWakatiGaki,
  resultTitle,
  amazonUrl,
  ndc,
}) => {
  return (
    <tr>
      <td>{ndc}</td>
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
  resultTitle: string
  amazonUrl: string
  ndc: string
}[]

const useFilter = () => {
  const [books, setBooks] = useState<Books>(source)
  const [searchLib, setLib] = useState<string>('全て')
  const [kind, setKind] = useState<string>('全て')
  useEffect(() => {
    if (searchLib === '全て' && kind === '全て') {
      setBooks(source)
      return
    }
    if (searchLib === '全て' && kind !== '全て') {
      setBooks(source.filter(({ ndc }) => ndc === kind))
      return
    }
    if (kind === '全て' && searchLib !== '全て') {
      setBooks(
        source.filter(({ libs }) => libs.find((lib) => lib === searchLib)),
      )
      return
    }
    setBooks(
      source
        .filter(({ ndc }) => ndc === kind)
        .filter(({ libs }) => libs.find((lib) => lib === searchLib)),
    )
  }, [searchLib, kind])

  const findByLibrary = useCallback((libName) => {
    setLib(libName)
  }, [])

  const findByKinds = useCallback((kind) => {
    setKind(kind)
  }, [])

  const libNames = ['全て', 'なし'].concat(
    Array.from(
      new Set(
        books
          .filter(({ libs }) => libs.find((lib) => lib !== 'なし'))
          .flatMap(({ libs }) => libs),
      ),
    ),
  )

  const kinds =
    searchLib !== '全て'
      ? ['全て'].concat(
          Array.from(
            new Set(
              source
                .filter(({ libs }) => libs.find((lib) => lib === searchLib))
                .filter(({ ndc }) => ndc)
                .map(({ ndc }) => ndc),
            ),
          ),
        )
      : ['全て'].concat(
          Array.from(
            new Set(books.filter(({ ndc }) => ndc).map(({ ndc }) => ndc)),
          ),
        )

  return { books, libNames, kinds, findByLibrary, findByKinds, searchLib, kind }
}

const App = () => {
  const {
    books,
    libNames,
    kinds,
    findByLibrary,
    findByKinds,
    searchLib,
    kind,
  } = useFilter()
  return (
    <Table>
      <thead>
        <tr>
          <th>
            <select value={kind} onChange={(e) => findByKinds(e.target.value)}>
              {kinds.map((kind, i) => (
                <option value={kind} key={i}>
                  {kind}
                </option>
              ))}
            </select>
          </th>
          <th>検索した本の名前</th>
          <th>検索結果</th>
          <th>
            <select
              value={searchLib}
              onChange={(e) => findByLibrary(e.target.value)}
            >
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
