import { useEffect, useState } from "react";
import { Howl } from "howler";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

// 音
const fireSound = new Howl({ src: ["/sounds/fire.mp3"], loop: true, volume: 0.37 });
const riverSound = new Howl({ src: ["/sounds/river.mp3"], loop: true, volume: 0.15 });
const nightSound = new Howl({ src: ["/sounds/night.mp3"], loop: true, volume: 0.25 });

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [fireOn, setFireOn] = useState(false);
  const [riverOn, setRiverOn] = useState(false);
  const [nightOn, setNightOn] = useState(false);

  const [viewerCount, setViewerCount] = useState(5);
  const [floatingMessages, setFloatingMessages] = useState([]);
  const [showHint, setShowHint] = useState(true);
  
  const [circleCount, setCircleCount] = useState(5);
  const [viewerTotal, setViewerTotal] = useState(32);
  const [activityMessages, setActivityMessages] = useState([]);
  const [theme, setTheme] = useState("")
  const [entered, setEntered] = useState(false);


  const themes = {
    night: [
      "何もしないで、火を見る夜",
      "飲み物を片手に、静かに",
      "今日を終わらせる焚火",
      "誰かと同じ火を見ている夜",
      "少し疲れた人の焚火"
    ],
    day: [
      "作業の横に、小さな火",
      "本を読みながら",
      "昼下がりの焚火",
      "考えごとをしながら見る火"
    ]
  };

  // 投稿取得
  //useEffect(() => {
  //  const unsub = onSnapshot(
  //    query(collection(db, "messages"), orderBy("createdAt", "desc"), limit(1)),
  //    (snapshot) => {
  //      snapshot.docs.forEach((doc) => {
  //        const msg = doc.data().text;
  //        const id = Date.now();
//
   //       setFloatingMessages((prev) => [...prev, { id, text: msg }]);
//
   //       setTimeout(() => {
   //         setFloatingMessages((prev) =>
   //           prev.filter((m) => m.id !== id)
   //         );
  //        }, 5000);
  //      });
  //    }
  //  );
  //  return () => unsub();
  //}, []);

  useEffect(() => {
    setViewerCount(Math.floor(Math.random() * 30 + 10));
  }, []);

  
  useEffect(() => {
    const interval = setInterval(() => {
      setCircleCount((prev) => {
        const change = Math.floor(Math.random() * 3) - 1;
        return Math.min(8, Math.max(3, prev + change));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewerTotal((prev) => {
        const jump = Math.floor(Math.random() * 6); // 0〜5増減
        const dir = Math.random() > 0.6 ? -1 : 1;
        const next = prev + jump * dir;
        return Math.min(120, Math.max(20, next));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  
  useEffect(() => {
    const hour = new Date().getHours();
    const timeKey = hour >= 18 || hour < 5 ? "night" : "day";
    const list = themes[timeKey];
    setTheme(list[Math.floor(Math.random() * list.length)]);
  }, []);

  
  useEffect(() => {
    const seen = localStorage.getItem("soundHintSeen");
    if (seen) setShowHint(false);
  }, []);

  const shareActivity = (text) => {
    const id = Date.now();

    // 画面に出す
    setActivityMessages((prev) => [...prev, { id, text }]);

    // 軽い振動（スマホ）
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    setTimeout(() => {
      setActivityMessages((prev) =>
        prev.filter((m) => m.id !== id)
      );
    }, 4000);
  };

  // 投稿
  const sendMessage = async () => {
    if (!input) return;

    const text = input;
    const id = Date.now();

    // ✅ 先に画面に表示（即テロップ）
    setFloatingMessages((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setFloatingMessages((prev) => prev.filter((m) => m.id !== id));
    }, 5000);

    // ✅ あとからFirestoreに送信
    await addDoc(collection(db, "messages"), {
      text,
      createdAt: Date.now(),
    });

    setInput("");
  };

  // 音切替
  const toggle = (sound, stateSetter, current) => {
    if (current) {
      sound.stop();
    } else {
      sound.play();
    }
    stateSetter(!current);
  };

  return (
    <>
        {!entered && (
          <div className="intro-modal">
            <h2>🔥 CalmFire</h2>
            <p>
              CalmFireは、焚火の映像と音を通して、<br />
              同じ時間を静かに共有する場所です。
            </p>
            <p className="small">
              音が流れます。<br />
              必要なものだけONにしてください。
            </p>
            <button
              onClick={() => setEntered(true)}
              className="enter-button"
            >
              焚火会場へ入る 🔥
            </button>
          </div>
        )}

        <div className="container">
          {/* 背景 */}
          <video
            loop
            muted
            playsInline
            preload="metadata"
            poster="/fire.png"
            className="bg-video"
          >
            <source src="/fire.mp4" type="video/mp4" />
          </video>

      
        {theme && (
          <p className="theme">
            今日の焚火テーマ<br />
            「{theme}」
          </p>
        )}

      {/* UI */}
      <div className="content">
        <h1>🔥 CalmFire</h1>

        {showHint && (
          <div className="sound-hint" onClick={() => {
            setShowHint(false);
            localStorage.setItem("soundHintSeen", "true");
          }}>
            🔊 音が流れます。好きな音だけONにしてください
          </div>
        )}
        {/* 音コントロール */}
        <div className="controls">
          <button onClick={() => toggle(fireSound, setFireOn, fireOn)}>
            🔥 {fireOn ? "ON" : "OFF"}
          </button>

          <button onClick={() => toggle(riverSound, setRiverOn, riverOn)}>
            🌊 {riverOn ? "ON" : "OFF"}
          </button>

          <button onClick={() => toggle(nightSound, setNightOn, nightOn)}>
            🌙 {nightOn ? "ON" : "OFF"}
          </button>
        </div>

        {/* 人数（仮） */}
        <p className="viewer">
          🔥 今この焚火を {circleCount} 人が一緒に見ています
        </p>
        <p className="viewer-total">
          👀 今夜の焚火を {viewerTotal} 人が見ています
        </p>

        {/* メッセージ */}
        
        <div className="floating">
          {floatingMessages.map((m) => (
            <div key={m.id} className="floating-message">
              🔥 {m.text}
            </div>
          ))}

          {activityMessages.map((m) => (
            <div key={m.id} className="floating-message subtle">
              {m.text}
            </div>
          ))}
        </div>


        {/* 投稿 */}
        <div className="input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="一言をくべる..."
          />
          <button onClick={sendMessage}>🔥</button>
        </div>
        <div className="activities">
          <button onClick={() => shareActivity("☕ 誰かが飲み物を一口飲みました")}>
            ☕ 飲み物
          </button>
          <button onClick={() => shareActivity("📖 誰かが本を開きました")}>
            📖 読書
          </button>
          <button onClick={() => shareActivity("🍚 誰かがご飯を食べています")}>
            🍚 ごはん
          </button>
          <button onClick={() => shareActivity("🔥 誰かが火をじっと見ています")}>
            🔥 ぼーっと
          </button>
        </div>
      </div>
      <footer className="footer">
        焚火サークル「カコイビ」発のリラックスアプリ
      </footer>
    </div>
    </>
  );
}