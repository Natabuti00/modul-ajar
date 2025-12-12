const STORAGE_PREFIX = "quiz-physics-";

// Polyfill window.storage.set(...) using localStorage for persistence
const storageApi = (() => {
  try {
    if (window.storage && typeof window.storage.set === "function") {
      return {
        set: window.storage.set.bind(window.storage),
        get: window.storage.get
          ? window.storage.get.bind(window.storage)
          : (k) => window.storage.getItem(k),
        remove: window.storage.remove
          ? window.storage.remove.bind(window.storage)
          : (k) => window.storage.removeItem(k),
        keys:
          window.storage.keys ||
          (() => (window.storage ? Object.keys(window.storage) : [])),
      };
    }
  } catch (err) {
    // ignore
  }

  try {
    return {
      set: (key, value) => window.localStorage.setItem(key, value),
      get: (key) => window.localStorage.getItem(key),
      remove: (key) => window.localStorage.removeItem(key),
      keys: () => Object.keys(window.localStorage),
    };
  } catch (err) {
    return {
      set: () => {
        throw new Error("Storage tidak tersedia");
      },
      get: () => null,
      remove: () => {},
      keys: () => [],
    };
  }
})();

const questions = [
  {
    id: "q1",
    level: "mudah",
    points: 15,
    question:
      "Es batu mencair di tangan karena menyerap panas dari kulit. Proses ini tergolong...",
    options: [
      { key: "A", label: "Endoterm (panas masuk ke sistem)" },
      { key: "B", label: "Eksoterm (panas keluar dari sistem)" },
      { key: "C", label: "Adiabatik tanpa perpindahan panas" },
      { key: "D", label: "Reaksi spontan tanpa energi" },
    ],
    answer: "A",
    explanation:
      "Pencairan es membutuhkan energi untuk memutus ikatan, sehingga panas diambil dari kulit (lingkungan). Delta H bernilai positif karena energi masuk ke sistem.",
  },
  {
    id: "q2",
    level: "mudah",
    points: 15,
    question:
      "Pembakaran gas LPG di kompor membuat udara sekitar terasa panas. Pernyataan yang tepat adalah...",
    options: [
      { key: "A", label: "Delta H negatif; energi dilepas ke lingkungan" },
      { key: "B", label: "Delta H positif; energi diserap dari lingkungan" },
      { key: "C", label: "Tidak ada perubahan entalpi" },
      { key: "D", label: "Reaksi endoterm dengan energi aktivasi sangat kecil" },
    ],
    answer: "A",
    explanation:
      "Pembakaran adalah eksoterm: energi kimia diubah menjadi panas dan cahaya sehingga Delta H bernilai negatif (panas dilepas ke lingkungan).",
  },
  {
    id: "q3",
    level: "sedang",
    points: 20,
    question:
      "Sebuah reaksi memiliki Delta H = +120 kJ untuk reaksi sebagaimana ditulis. Makna angka ini adalah...",
    options: [
      {
        key: "A",
        label: "Sistem menyerap 120 kJ dari lingkungan agar reaksi berlangsung",
      },
      {
        key: "B",
        label: "Sistem melepas 120 kJ ke lingkungan selama reaksi",
      },
      { key: "C", label: "Energi aktivasi reaksi sebesar 120 kJ" },
      { key: "D", label: "Reaksi pasti berjalan spontan tanpa syarat" },
    ],
    answer: "A",
    explanation:
      "Tanda positif menunjukkan reaksi endoterm; energi sebesar 120 kJ dibutuhkan oleh sistem. Nilai ini bukan energi aktivasi, melainkan perubahan entalpi bersih.",
  },
  {
    id: "q4",
    level: "sedang",
    points: 20,
    question:
      "Paket hand warmer (oksidasi serbuk Fe) menaikkan suhu 200 g air dari 25 C ke 33 C. Perkiraan energi panas yang dilepas adalah...",
    options: [
      { key: "A", label: "Sekitar 6,7 kJ dilepas (eksoterm)" },
      { key: "B", label: "Sekitar 6,7 kJ diserap (endoterm)" },
      { key: "C", label: "Sekitar 0,8 kJ dilepas" },
      { key: "D", label: "Data tidak cukup untuk menilai" },
    ],
    answer: "A",
    explanation:
      "q = m x c x DeltaT = 200 g x 4,18 J/gC x 8 C ~ 6688 J (~6,7 kJ). Suhu naik berarti panas keluar dari reaksi ke air (eksoterm).",
  },
  {
    id: "q5",
    level: "sulit",
    points: 30,
    question:
      "Pada diagram energi: reaktan 50 kJ, produk 140 kJ, dan energi aktivasi 80 kJ. Pernyataan yang tepat adalah...",
    options: [
      { key: "A", label: "Reaksi endoterm dengan Delta H ~ +90 kJ" },
      { key: "B", label: "Reaksi eksoterm dengan Delta H ~ -90 kJ" },
      { key: "C", label: "Reaksi endoterm dengan Delta H ~ -30 kJ" },
      { key: "D", label: "Reaksi eksoterm dengan Delta H ~ +30 kJ" },
    ],
    answer: "A",
    explanation:
      "Delta H = energi produk - energi reaktan = 140 - 50 = +90 kJ sehingga endoterm. Energi aktivasi tidak mengubah tanda Delta H, hanya memengaruhi kecepatan.",
  },
];

const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

const formatSeconds = (sec) => {
  if (!Number.isFinite(sec)) return "-";
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

const slugify = (value) =>
  (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || "anonim";

function ThermoQuizApp() {
  const [phase, setPhase] = React.useState("landing");
  const [info, setInfo] = React.useState({ name: "", class: "", absen: "" });
  const [answers, setAnswers] = React.useState({});
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(15 * 60);
  const [result, setResult] = React.useState(null);
  const [storedResults, setStoredResults] = React.useState([]);
  const [teacherMode, setTeacherMode] = React.useState(false);
  const [teacherAuthed, setTeacherAuthed] = React.useState(false);
  const [filterClass, setFilterClass] = React.useState("all");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [teacherPromptOpen, setTeacherPromptOpen] = React.useState(false);
  const [teacherPassInput, setTeacherPassInput] = React.useState("");
  const [showConfirm, setShowConfirm] = React.useState(false);

  const startRef = React.useRef(null);
  const timerRef = React.useRef(null);

  React.useEffect(() => {
    loadStoredResults();
    return () => clearInterval(timerRef.current);
  }, []);

  React.useEffect(() => {
    if (phase !== "quiz") return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submitQuiz(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const answeredCount = questions.filter((q) => answers[q.id]).length;
  const progressPercent = Math.round(
    (answeredCount / questions.length) * 100
  );

  function handleInfoChange(key, value) {
    setInfo((prev) => ({ ...prev, [key]: value }));
  }

  function goToConfirm() {
    if (!info.name.trim() || !info.class.trim() || !info.absen.trim()) {
      setError("Isi identitas (nama, kelas, absen) sebelum lanjut.");
      return;
    }
    setError(null);
    setPhase("confirm");
  }

  function startQuiz() {
    setPhase("quiz");
    setAnswers({});
    setCurrentIndex(0);
    setTimeLeft(15 * 60);
    setResult(null);
    setError(null);
    startRef.current = Date.now();
  }

  function selectOption(questionId, optionKey) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  }

  function confirmSubmit() {
    setShowConfirm(true);
    return false;
  }

  function submitQuiz(auto = false) {
    if (phase !== "quiz") return;
    if (!auto && !confirmSubmit()) return;

    const detail = questions.map((q) => {
      const selected = answers[q.id];
      const correct = selected === q.answer;
      return {
        id: q.id,
        question: q.question,
        options: q.options,
        selected,
        correctOption: q.answer,
        correct,
        points: q.points,
        earned: correct ? q.points : 0,
        explanation: q.explanation,
        level: q.level,
      };
    });

    const totalScore = detail.reduce((sum, d) => sum + d.earned, 0);
    const now = Date.now();
    const timeUsedSeconds = startRef.current
      ? Math.min(15 * 60, Math.max(0, Math.round((now - startRef.current) / 1000)))
      : null;
    const payload = {
      info,
      detail,
      totalScore,
      totalPoints,
      timeUsedSeconds,
      timestamp: new Date().toISOString(),
    };

    setResult(payload);
    setPhase("result");
    clearInterval(timerRef.current);
    persistResult(payload);
  }

  function persistResult(payload) {
    setLoading(true);
    try {
      const key = `${STORAGE_PREFIX}${Date.now()}-${slugify(payload.info.name)}`;
      storageApi.set(key, JSON.stringify(payload));
      loadStoredResults();
    } catch (err) {
      setError(
        "Gagal menyimpan hasil ke storage. Coba ulangi atau aktifkan penyimpanan browser."
      );
    } finally {
      setLoading(false);
    }
  }

  function loadStoredResults() {
    setLoading(true);
    try {
      const keys = storageApi.keys().filter((k) => k.startsWith(STORAGE_PREFIX));
      const parsed = keys
        .map((key) => {
          try {
            const raw = storageApi.get(key);
            return raw ? JSON.parse(raw) : null;
          } catch (err) {
            return null;
          }
        })
        .filter(Boolean)
        .sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));
      setStoredResults(parsed);
    } catch (err) {
      setError("Gagal memuat hasil dari storage.");
    } finally {
      setLoading(false);
    }
  }

  function resetData() {
    if (
      !window.confirm(
        "Hapus semua hasil yang tersimpan? Tindakan ini tidak bisa dibatalkan."
      )
    ) {
      return;
    }
    try {
      storageApi
        .keys()
        .filter((k) => k.startsWith(STORAGE_PREFIX))
        .forEach((key) => storageApi.remove(key));
      setStoredResults([]);
    } catch (err) {
      setError("Gagal menghapus data.");
    }
  }

  function handleTeacherLogin(password) {
    if (password === "guru123") {
      setTeacherAuthed(true);
      setTeacherMode(true);
      setError(null);
      loadStoredResults();
      setTeacherPromptOpen(false);
      setTeacherPassInput("");
      return true;
    } else {
      setTeacherAuthed(false);
      setTeacherMode(false);
      setError("Password guru salah.");
      return false;
    }
  }

  function downloadCSV(rows) {
    if (!rows.length) return;
    const header = [
      "Nama",
      "Kelas",
      "Absen",
      "Skor",
      "Waktu (detik)",
      "Timestamp",
    ];
    const lines = rows.map((r) =>
      [
        r.info.name,
        r.info.class,
        r.info.absen,
        r.totalScore,
        r.timeUsedSeconds ?? "",
        r.timestamp,
      ]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hasil-kuis-thermokimia.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadExcel(rows) {
    if (!rows.length || typeof XLSX === "undefined") return;
    const headers = ["Nama", "Kelas", "Absen", "Skor", "Waktu (detik)", "Timestamp"];
    const rowsAoa = [
      headers,
      ...rows.map((r) => [
        r.info.name,
        r.info.class,
        r.info.absen,
        r.totalScore,
        r.timeUsedSeconds ?? "",
        r.timestamp,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(rowsAoa);
    ws["!cols"] = [
      { wch: 20 },
      { wch: 10 },
      { wch: 8 },
      { wch: 8 },
      { wch: 12 },
      { wch: 24 },
    ];

    const headerStyle = {
      font: { bold: true, color: { rgb: "233237" } },
      fill: { fgColor: { rgb: "E8F1FF" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "B9D3FF" } },
        bottom: { style: "thin", color: { rgb: "B9D3FF" } },
        left: { style: "thin", color: { rgb: "B9D3FF" } },
        right: { style: "thin", color: { rgb: "B9D3FF" } },
      },
    };

    const bodyStyle = {
      font: { color: { rgb: "233237" } },
      alignment: { vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "DCE6F5" } },
        bottom: { style: "thin", color: { rgb: "DCE6F5" } },
        left: { style: "thin", color: { rgb: "DCE6F5" } },
        right: { style: "thin", color: { rgb: "DCE6F5" } },
      },
    };

    headers.forEach((_, colIdx) => {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: colIdx })];
      if (cell) cell.s = headerStyle;
    });

    for (let r = 1; r < rowsAoa.length; r += 1) {
      for (let c = 0; c < headers.length; c += 1) {
        const addr = XLSX.utils.encode_cell({ r, c });
        if (ws[addr]) ws[addr].s = bodyStyle;
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hasil");
    XLSX.writeFile(wb, "hasil-kuis-thermokimia.xlsx");
  }

  const filteredResults =
    filterClass === "all"
      ? storedResults
      : storedResults.filter((r) => (r.info.class || "").toLowerCase() === filterClass.toLowerCase());

  const classesAvailable = Array.from(
    new Set(storedResults.map((r) => (r.info.class || "").trim()).filter(Boolean))
  );

  const stats = React.useMemo(() => {
    if (!filteredResults.length) return null;
    const scores = filteredResults.map((r) => r.totalScore);
    const avg = Math.round(
      scores.reduce((sum, s) => sum + s, 0) / scores.length
    );
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    return { avg, max, min, count: filteredResults.length };
  }, [filteredResults]);

  return (
    <div className="quiz-shell">
      {showConfirm && (
        <div className="quiz-modal-backdrop">
          <div className="quiz-modal">
            <h3>Konfirmasi</h3>
            <p>Sudah yakin ingin mengumpulkan jawaban?</p>
            <div className="quiz-modal-actions">
              <button
                className="quiz-btn ghost"
                onClick={() => setShowConfirm(false)}
              >
                Batal
              </button>
              <button
                className="quiz-btn primary"
                onClick={() => {
                  setShowConfirm(false);
                  submitQuiz(true);
                }}
              >
                Ya, kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="quiz-mode-toggle">
        <span className={`mode-badge ${teacherMode ? "teacher" : "student"}`}>
          {teacherMode ? "Teacher Mode" : "Student Mode"}
        </span>
        <div className="mode-actions">
          <button
            className="quiz-btn ghost"
            onClick={() => {
              setTeacherMode(false);
              setTeacherAuthed(false);
            }}
          >
            Mode Murid
          </button>
          <button
            className="quiz-btn primary"
            onClick={() => {
              setTeacherPromptOpen(true);
              setTeacherPassInput("");
              setError(null);
            }}
          >
            Mode Guru
          </button>
        </div>
      </div>

      {error && <div className="quiz-alert">{error}</div>}
      {loading && <div className="quiz-loading">Memuat / menyimpan data...</div>}

      {!teacherMode && (
        <>
          {phase === "landing" && (
            <section className="quiz-card">
              <h2>Identitas Siswa</h2>
              <div className="identity-grid">
                <label>
                  Nama lengkap
                  <input
                    type="text"
                    value={info.name}
                    onChange={(e) => handleInfoChange("name", e.target.value)}
                    placeholder="Tuliskan nama kamu"
                  />
                </label>
                <label>
                  Kelas
                  <input
                    type="text"
                    value={info.class}
                    onChange={(e) => handleInfoChange("class", e.target.value)}
                    placeholder="Contoh: XI IPA 1"
                  />
                </label>
                <label>
                  Nomor Absen
                  <input
                    type="text"
                    value={info.absen}
                    onChange={(e) => handleInfoChange("absen", e.target.value)}
                    placeholder="Contoh: 12"
                  />
                </label>
              </div>
              <div className="rule-box">
                <p>Alur:</p>
                <ol>
                  <li>Isi identitas, baca aturan, lalu mulai kuis (15 menit).</li>
                  <li>Navigasi soal bebas (Next/Previous atau klik indikator).</li>
                  <li>Submit untuk melihat skor, pembahasan, dan warna benar/salah.</li>
                  <li>Jawaban tersimpan otomatis untuk dashboard guru.</li>
                </ol>
              </div>
              <div className="quiz-actions-row">
                <button className="quiz-btn primary" onClick={goToConfirm}>
                  Lanjut ke aturan
                </button>
              </div>
            </section>
          )}

          {phase === "confirm" && (
            <section className="quiz-card">
              <h2>Konfirmasi & Aturan</h2>
              <div className="info-grid">
                <div className="info-box">
                  <p>Nama: <strong>{info.name}</strong></p>
                  <p>Kelas: <strong>{info.class}</strong></p>
                  <p>No. Absen: <strong>{info.absen}</strong></p>
                </div>
                <div className="info-box">
                  <p>Durasi: 15 menit</p>
                  <p>Jumlah soal: 5 pilihan ganda</p>
                  <p>Total poin: {totalPoints}</p>
                </div>
              </div>
              <ul className="rule-list">
                <li>Timer mulai setelah kamu klik tombol mulai.</li>
                <li>Kamu bisa berpindah soal kapan saja.</li>
                <li>Setelah submit, kamu akan melihat pembahasan.</li>
                <li>Skor dihitung otomatis: mudah 15 poin, sedang 20 poin, sulit 30 poin.</li>
              </ul>
              <div className="quiz-actions-row">
                <button className="quiz-btn ghost" onClick={() => setPhase("landing")}>
                  Kembali
                </button>
                <button className="quiz-btn primary" onClick={startQuiz}>
                  Mulai Kuis
                </button>
              </div>
            </section>
          )}

          {phase === "quiz" && (
            <section className="quiz-card">
              <div className="quiz-bar">
                <div>
                  <p className="meta-label">Sisa waktu</p>
                  <div className="timer">{formatSeconds(timeLeft)}</div>
                </div>
                <div className="progress-area">
                  <p className="meta-label">
                    Progres: {answeredCount}/{questions.length} soal
                  </p>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
                <div>
                  <p className="meta-label">Total poin</p>
                  <div className="timer">{totalPoints}</div>
                </div>
              </div>

              <div className="indicator-row">
                {questions.map((q, idx) => {
                  const answered = Boolean(answers[q.id]);
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      className={`indicator-dot ${
                        answered ? "answered" : ""
                      } ${isCurrent ? "current" : ""}`}
                      onClick={() => setCurrentIndex(idx)}
                      aria-label={`Soal ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="question-card">
                <div className="question-meta">
                  <span className={`pill pill-${questions[currentIndex].level}`}>
                    {questions[currentIndex].level}
                  </span>
                  <span className="pill ghost">
                    {questions[currentIndex].points} poin
                  </span>
                </div>
                <h3>
                  Soal {currentIndex + 1}. {questions[currentIndex].question}
                </h3>
                <div className="option-grid">
                  {questions[currentIndex].options.map((opt) => {
                    const selected =
                      answers[questions[currentIndex].id] === opt.key;
                    return (
                      <button
                        key={opt.key}
                        className={`option-btn ${selected ? "selected" : ""}`}
                        onClick={() =>
                          selectOption(questions[currentIndex].id, opt.key)
                        }
                      >
                        <span className="option-key">{opt.key}</span>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="nav-row">
                  <button
                    className="quiz-btn ghost"
                    onClick={() =>
                      setCurrentIndex((idx) => Math.max(0, idx - 1))
                    }
                    disabled={currentIndex === 0}
                  >
                    &lt;- Sebelumnya
                  </button>
                  <div className="nav-right">
                    <button
                      className="quiz-btn secondary"
                      onClick={() =>
                        setCurrentIndex((idx) =>
                          Math.min(questions.length - 1, idx + 1)
                        )
                      }
                      disabled={currentIndex === questions.length - 1}
                    >
                      Berikutnya -&gt;
                    </button>
                    <button className="quiz-btn primary" onClick={() => submitQuiz(false)}>
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {phase === "result" && result && (
            <section className="quiz-card">
              <h2>Hasil & Pembahasan</h2>
              <div className="result-summary">
                <div className="score-box">
                  <p>Skor</p>
                  <strong>{result.totalScore} / {result.totalPoints}</strong>
                </div>
                <div className="score-box">
                  <p>Waktu</p>
                  <strong>{formatSeconds(result.timeUsedSeconds ?? 0)}</strong>
                </div>
                <div className="score-box">
                  <p>Identitas</p>
                  <strong>{result.info.name} ({result.info.class}) - Absen {result.info.absen}</strong>
                </div>
              </div>

              <div className="review-list">
                {result.detail.map((d, idx) => {
                  const selectedLabel =
                    d.options.find((o) => o.key === d.selected)?.label || "Belum dijawab";
                  const correctLabel =
                    d.options.find((o) => o.key === d.correctOption)?.label || "";
                  return (
                    <div
                      key={d.id}
                      className={`review-item ${d.correct ? "correct" : "wrong"}`}
                    >
                      <div className="review-head">
                        <div>
                          <p className="meta-label">
                            Soal {idx + 1} - {d.level} - {d.points} poin
                          </p>
                          <h4>{d.question}</h4>
                        </div>
                        <div className="earned">
                          +{d.earned} / {d.points}
                        </div>
                      </div>
                      <p>
                        Jawabanmu: <strong>{selectedLabel}</strong>
                      </p>
                      <p>
                        Kunci: <strong>{d.correctOption} - {correctLabel}</strong>
                      </p>
                      <p className="explanation">Pembahasan: {d.explanation}</p>
                    </div>
                  );
                })}
              </div>

              <div className="quiz-actions-row">
                <button
                  className="quiz-btn ghost"
                  onClick={() => {
                    setPhase("landing");
                    setResult(null);
                    setAnswers({});
                    setTimeLeft(15 * 60);
                  }}
                >
                  Kerjakan lagi
                </button>
              </div>
            </section>
          )}
        </>
      )}

      {teacherMode && (
        <section className="quiz-card teacher">
          <h2>Dashboard Guru</h2>
          {!teacherAuthed && (
            <p>Masuk dengan password untuk melihat hasil.</p>
          )}
          {teacherAuthed && (
            <>
              <div className="teacher-toolbar">
                <div>
                  <label>
                    Filter kelas:
                    <select
                      value={filterClass}
                      onChange={(e) => setFilterClass(e.target.value)}
                    >
                      <option value="all">Semua</option>
                      {classesAvailable.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="toolbar-actions">
                  <button
                    className="quiz-btn secondary"
                    onClick={() => downloadCSV(filteredResults)}
                    disabled={!filteredResults.length}
                  >
                    Download CSV
                  </button>
                  <button
                    className="quiz-btn secondary"
                    onClick={() => downloadExcel(filteredResults)}
                    disabled={!filteredResults.length}
                  >
                    Download Excel
                  </button>
                  <button
                    className="quiz-btn ghost"
                    onClick={resetData}
                    disabled={!storedResults.length}
                  >
                    Reset data
                  </button>
                </div>
              </div>

              {stats && (
                <div className="stats-grid">
                  <div className="stat-card">
                    <p>Rata-rata</p>
                    <strong>{stats.avg}</strong>
                  </div>
                  <div className="stat-card">
                    <p>Nilai tertinggi</p>
                    <strong>{stats.max}</strong>
                  </div>
                  <div className="stat-card">
                    <p>Nilai terendah</p>
                    <strong>{stats.min}</strong>
                  </div>
                  <div className="stat-card">
                    <p>Jumlah entri</p>
                    <strong>{stats.count}</strong>
                  </div>
                </div>
              )}

              {!filteredResults.length && (
                <p className="meta-label">Belum ada hasil untuk filter ini.</p>
              )}

              {filteredResults.length > 0 && (
                <div className="table-wrapper">
                  <table className="result-table">
                    <thead>
                      <tr>
                        <th>Nama</th>
                        <th>Kelas</th>
                        <th>Absen</th>
                        <th>Skor</th>
                        <th>Waktu (detik)</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResults.map((row, idx) => (
                        <tr key={`${row.timestamp}-${idx}`}>
                          <td>{row.info.name}</td>
                          <td>{row.info.class}</td>
                          <td>{row.info.absen}</td>
                          <td>{row.totalScore}</td>
                          <td>{row.timeUsedSeconds ?? "-"}</td>
                          <td>{row.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      )}
      {teacherPromptOpen && (
        <div className="quiz-modal-backdrop">
          <div className="quiz-modal">
            <h3>Masuk Mode Guru</h3>
            <p>Masukkan password guru untuk membuka dashboard.</p>
            <input
              type="password"
              value={teacherPassInput}
              onChange={(e) => setTeacherPassInput(e.target.value)}
              placeholder="Password guru"
              autoFocus
            />
            <div className="quiz-modal-actions">
              <button
                className="quiz-btn ghost"
                onClick={() => {
                  setTeacherPromptOpen(false);
                  setTeacherPassInput("");
                }}
              >
                Batal
              </button>
              <button
                className="quiz-btn primary"
                onClick={() => handleTeacherLogin(teacherPassInput)}
              >
                Masuk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("quiz-root")).render(
  <ThermoQuizApp />
);
