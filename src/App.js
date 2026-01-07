import { useState } from "react";
import './App.css';

const playlistLinks = {
  relax: "https://music.apple.com/jp/playlist/relax/pl.u-V9D7Z9pc383JzDD",
  happy: "https://music.apple.com/jp/playlist/happy/pl.u-76oN96yCvRvz5jj",
  rain: "https://music.apple.com/jp/playlist/rain/pl.u-JPAZBP3IL6L5Ykk",
  walk: "https://music.apple.com/jp/playlist/walk/pl.u-aZb0YZxC1G14B55",
  calm: "https://music.apple.com/jp/playlist/calm/pl.u-mJy89b8tNkN1Xdd"
};

function App() {
  const [artist, setArtist] = useState("");
  const [keyword, setKeyword] = useState("");
  const [time, setTime] = useState("");
  const [combinedArtist, setCombinedArtist] = useState("");
  const [combinedKeyword, setCombinedKeyword] = useState("");
  const [combinedTime, setCombinedTime] = useState("");
  const [message, setMessage] = useState("〇検索結果↓");
  const [results, setResults] = useState([]);

  // -------------------- ヘルパー --------------------
  const timeToSeconds = (timeStr) => {
    const [m, s] = timeStr.split(":").map(Number);
    return m * 60 + s;
  };

  const mergeResults = (existing, newResults) => {
    const map = new Map();
    [...existing, ...newResults].forEach(item => map.set(item.trackId, item));
    return Array.from(map.values());
  };

  // -------------------- iTunes検索 --------------------
  const searchByKeyword = async (kw) => {
    if (!kw) {
      alert("検索したいワードを入力してください");
      return;
    }
    setMessage("検索中...");
    setResults([]); // 前の結果を消す

    const words = kw.split(" ").filter(w => w.trim() !== "");
    const resultsMap = new Map();

    await Promise.all(
      words.map(async (word) => {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(word)}&media=music&limit=20&country=JP`;
        const res = await fetch(url);
        const data = await res.json();
        data.results.forEach(item => resultsMap.set(item.trackId, item));
      })
    );

    setResults(Array.from(resultsMap.values()));
    setMessage(`キーワード検索: ${kw}`);
  };

  const searchByArtist = async (artistName) => {
  if (!artistName) {
    alert("アーティスト名を入力してください");
    return;
  }
  setMessage("検索中...");
  setResults([]); // 前の結果を消す

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&media=music&limit=50&country=JP`;
  const res = await fetch(url);
  const data = await res.json();

  // artistName でフィルター
  const filtered = data.results.filter(item =>
    item.artistName.toLowerCase().includes(artistName.toLowerCase())
  );

  setResults(filtered);
  setMessage(`アーティスト検索: ${artistName}`);
};


  const searchByTime = async (input) => {
    if (!input.includes(":")) {
      alert("4:00 のように入力してください");
      return;
    }
    const targetSeconds = timeToSeconds(input);
    const minTime = (targetSeconds - 30) * 1000;
    const maxTime = (targetSeconds + 30) * 1000;

    setMessage("検索中...");
    setResults([]); // 前の結果を消す

    const url = "https://itunes.apple.com/search?term=music&media=music&limit=50&country=JP";
    const res = await fetch(url);
    const data = await res.json();

    const filtered = data.results.filter(item => item.trackTimeMillis >= minTime && item.trackTimeMillis <= maxTime);
    setResults(filtered);
    setMessage(`時間検索: ${input}`);
  };

  // -------------------- まとめて検索 --------------------
  const combinedSearch = async () => {
    setMessage("検索中...");
    let combinedResults = [];

    // キーワード検索
    if (combinedKeyword.trim()) {
      const words = combinedKeyword.split(" ").filter(w => w.trim() !== "");
      for (const word of words) {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(word)}&media=music&limit=20&country=JP`;
        const res = await fetch(url);
        const data = await res.json();
        combinedResults = mergeResults(combinedResults, data.results);
      }
    }

    // アーティスト検索
    if (combinedArtist.trim()) {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(combinedArtist)}&media=music&limit=20&country=JP`;
      const res = await fetch(url);
      const data = await res.json();
      combinedResults = mergeResults(combinedResults, data.results);
    }

    // 時間検索
    if (combinedTime.trim() && combinedTime.includes(":")) {
      const targetSeconds = timeToSeconds(combinedTime);
      const minTime = (targetSeconds - 15) * 1000;
      const maxTime = (targetSeconds + 15) * 1000;

      const url = "https://itunes.apple.com/search?term=music&media=music&limit=50&country=JP";
      const res = await fetch(url);
      const data = await res.json();
      const filtered = data.results.filter(item => item.trackTimeMillis >= minTime && item.trackTimeMillis <= maxTime);
      combinedResults = mergeResults(combinedResults, filtered);
    }

    setResults(combinedResults);
    setMessage(combinedResults.length === 0 ? "曲が見つかりませんでした" : "まとめて検索結果");
  };

  // -------------------- おすすめプレイリスト --------------------
  const openPlaylist = (key) => {
    window.open(playlistLinks[key], "_blank");
  };

  return (
    <div className="App">
      <h1>Searching Japanese Music!!</h1>
      <img src="images/searchMusic.jpg" alt="サイトメイン画像" />

      <p>アーティスト名で検索</p>
      <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="例：Mrs.GREEN APPLE" />
      <button onClick={() => searchByArtist(artist)}>検索</button>

      <p>キーワードで検索</p>
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="例：雨" />
      <button onClick={() => searchByKeyword(keyword)}>検索</button>

      <p>時間から検索</p>
      <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="例：3:30" />
      <button onClick={() => searchByTime(time)}>検索</button>

      <p>条件をしぽって検索</p>
      <input value={combinedArtist} onChange={(e) => setCombinedArtist(e.target.value)} placeholder="例：Mrs.GREEN APPLE" />
      <input value={combinedKeyword} onChange={(e) => setCombinedKeyword(e.target.value)} placeholder="例：雨" />
      <input value={combinedTime} onChange={(e) => setCombinedTime(e.target.value)} placeholder="例：3:30" />
      <button onClick={combinedSearch}>検索</button>

      <p className="noBorder">{message}</p>
      <ul>
        {results.map(item => (
          <li key={item.trackId}>
            {item.trackName} / {item.artistName} {item.trackTimeMillis ? `(${Math.floor(item.trackTimeMillis/60000)}:${Math.floor((item.trackTimeMillis % 60000)/1000).toString().padStart(2,"0")})` : ""}
          </li>
        ))}
      </ul>

      <hr />
      <p className="noBorder">☆おすすめ</p>
      <ul>
        <li><button onClick={() => openPlaylist("relax")}>relax</button></li>
        <li><button onClick={() => openPlaylist("happy")}>happy</button></li>
        <li><button onClick={() => openPlaylist("rain")}>rain</button></li>
        <li><button onClick={() => openPlaylist("walk")}>walk</button></li>
        <li><button onClick={() => openPlaylist("calm")}>calm</button></li>
      </ul>
    </div>
  );
}

export default App;
