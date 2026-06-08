import { useEffect, useState, useRef } from "react";
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
  const videoRef = useRef(null);
  const clientId = useRef(
    Math.random().toString(36).slice(2)
  );
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
  const [showAudioPanel, setShowAudioPanel] = useState(false);
  const [fireVolume, setFireVolume] = useState(37);
  const [riverVolume, setRiverVolume] = useState(15);
  const [nightVolume, setNightVolume] = useState(25);
  const changeVolume = (sound, value) => {
  sound.volume(value / 100);
};


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

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "messages"), orderBy("createdAt", "desc"), limit(1)),
      (snapshot) => {
        snapshot.docs.forEach((doc) => {
          const data = doc.data();

          // ✅ 自分の操作は無視（二重防止）
          if (data.clientId === clientId.current) return;

          const id = Date.now();

          if (data.type === "message") {
            setFloatingMessages((prev) => [...prev, { id, text: data.text }]);
            setTimeout(() => {
              setFloatingMessages((prev) =>
                prev.filter((m) => m.id !== id)
              );
            }, 5000);
          }

          if (data.type === "activity") {
            setActivityMessages((prev) => [...prev, { id, text: data.text }]);
            setTimeout(() => {
              setActivityMessages((prev) =>
                prev.filter((m) => m.id !== id)
              );
            }, 4000);
          }
        });
      }
    );

    return () => unsub();
  }, []);

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

  
  // 今日の日付キーを作る関数（index.jsの上の方に書いてOK）
  const getTodayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  };

  // 今日の焚火テーマを決める useEffect
  useEffect(() => {
    const hour = new Date().getHours();
    const timeKey = hour >= 18 || hour < 5 ? "night" : "day";
    const list = themes[timeKey];

    const todayKey = getTodayKey();

    // 日付文字列から安定した index を作る
    let hash = 0;
    for (let i = 0; i < todayKey.length; i++) {
      hash += todayKey.charCodeAt(i);
    }

    const index = hash % list.length;
    setTheme(list[index]);
  }, []);

  
  useEffect(() => {
    const seen = localStorage.getItem("soundHintSeen");
    if (seen) setShowHint(false);
  }, []);

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  }, []);

  const shareActivity = async (text) => {
    const id = Date.now();

    // ✅ 自分の画面には即表示
    setActivityMessages((prev) => [...prev, { id, text }]);

    if (navigator.vibrate) navigator.vibrate(30);

    setTimeout(() => {
      setActivityMessages((prev) =>
        prev.filter((m) => m.id !== id)
      );
    }, 4000);

    // ✅ 他の人用に Firestore に送信
    await addDoc(collection(db, "messages"), {
      type: "activity",
      text,
      createdAt: Date.now(),
      clientId: clientId.current,
    });
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
    clientId: clientId.current,
    });

    setInput("");
  };

  // 音切替
  const toggle = (sound, stateSetter, current) => {
    if (current) {
      sound.pause();
    } else {
      sound.play();
    }

    stateSetter(!current);
  };

  return (
    <>
        {!entered && (
          <div className="intro-overlay">
            <div className="intro-modal">
              <h2>🔥 CalmFire</h2>

              <p>
                CalmFireは、焚火の映像と環境音を通して
                離れた場所にいる人同士が
                同じ時間を静かに共有するためのサービスです。
              </p>

              <p>
                会話をしなくてもいい。
                何かを発信しなくてもいい。
                ただ火を見ながら、
                作業や読書、休憩の時間を過ごせます。
              </p>

              <p>
                この焚火を見ている人数や、
                他の人の小さな行動を通して、
                「誰かと同じ時間を過ごしている」
                気配だけを感じられます。
              </p>

              <p className="small">
                🔊 音が流れます。<br />
                焚火・川・夜の環境音から
                好きなものだけONにしてください。
              </p>

              
              <button
                className="enter-button"
                onClick={() => {
                  setEntered(true);
                  if (videoRef.current) {
                    videoRef.current.play().catch(() => {
                      // 再生できなくても何もしない（posterに任せる）
                    });
                  }
                }}
              >
                焚火会場へ入る 🔥
              </button>
              <p className="intro-links">
                <a href="/about">CalmFireについて</a>
              </p>
            </div>
          </div>
        )}

        <div className={`container ${!entered ? "locked" : ""}`}>
          {/* 背景 */}
          
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/fire.png"
            className="bg-video"
          >
            <source src="/fire.mp4" type="video/mp4" />
          </video>


      
        <div className="theme-wrapper">
          <div className="theme">
            <div className="theme-label">
              今日の焚火テーマ
            </div>

            <div className="theme-title">
              {theme}
            </div>
          </div>

          <button
            className="audio-button"
            onClick={() => setShowAudioPanel(!showAudioPanel)}
          >
            🎧
          </button>
        </div>
        {showAudioPanel && (
          <div className="audio-panel">

            <div className="audio-row">

              <button
                className={`audio-toggle ${fireOn ? "on" : ""}`}
                onClick={() => toggle(fireSound, setFireOn, fireOn)}
              >
                🔥
              </button>

              <input
                type="range"
                min="0"
                max="100"
                value={fireVolume}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setFireVolume(value);
                  fireSound.volume(value / 100);
                }}
              />

              <span>{fireVolume}%</span>

            </div>

            <div className="audio-row">

              <button
                className={`audio-toggle ${riverOn ? "on" : ""}`}
                onClick={() => toggle(riverSound, setRiverOn, riverOn)}
              >
                🌊
              </button>

              <input
                type="range"
                min="0"
                max="100"
                value={riverVolume}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setRiverVolume(value);
                  riverSound.volume(value / 100);
                }}
              />

              <span>{riverVolume}%</span>

            </div>

            <div className="audio-row">

              <button
                className={`audio-toggle ${nightOn ? "on" : ""}`}
                onClick={() => toggle(nightSound, setNightOn, nightOn)}
              >
                🌙
              </button>

              <input
                type="range"
                min="0"
                max="100"
                value={nightVolume}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setNightVolume(value);
                  nightSound.volume(value / 100);
                }}
              />

              <span>{nightVolume}%</span>

            </div>

          </div>
        )}

      {/* UI */}
      <div className="content">

        {/* 人数（仮） */}
        <div className="presence">
          <div className="presence-item">
            🔥 今 {circleCount} 人
          </div>

          <div className="presence-item">
            👀 今夜 {viewerTotal} 人
          </div>
        </div>

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
        <p className="small-note">
        音は左上の🎧から調整できます
        </p>
        <div className="activities">
          <button
            onClick={() =>
              shareActivity("☕ 誰かが飲み物を一口飲みました")
            }
          >
            ☕
          </button>

          <button
            onClick={() =>
              shareActivity("📖 誰かが本を開きました")
            }
          >
            📖
          </button>

          <button
            onClick={() =>
              shareActivity("🍚 誰かがご飯を食べています")
            }
          >
            🍚
          </button>

          <button
            onClick={() =>
              shareActivity("🔥 誰かが火をじっと見ています")
            }
          >
            🔥
          </button>
        </div>
      </div>
      <footer className="footer">
        焚火サークル「カコイビ」発のリラックスアプリ
        <a href="/about">CalmFireについて</a>
      </footer>
      <div className="ad-box">
        広告エリア
      </div>
    </div>
    </>
  );
}