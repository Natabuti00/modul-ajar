"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_PREFIX = "quiz-thermokimia-";

type Option = { key: string; label: string };
type Question = {
  id: string;
  level: "mudah" | "sedang" | "sulit";
  points: number;
  question: string;
  options: Option[];
  answer: string;
  explanation: string;
};

type AnswerPayload = {
  id: string;
  question: string;
  options: Option[];
  selected?: string;
  correctOption: string;
  correct: boolean;
  points: number;
  earned: number;
  explanation: string;
  level: string;
};

type ResultPayload = {
  info: { name: string; class: string; absen: string };
  detail: AnswerPayload[];
  totalScore: number; // normalized to 0-100
  totalPoints: number; // normalized max (100)
  timeUsedSeconds: number | null;
  timestamp: string;
  rawScore?: number;
  rawTotalPoints?: number;
};

const questions: Question[] = [
  {
    id: "q1",
    level: "mudah",
    points: 5,
    question:
      "Es batu mencair di tangan karena menyerap panas dari kulit. Proses ini tergolong...",
    options: [
      { key: "A", label: "Endoterm (panas masuk ke sistem)" },
      { key: "B", label: "Eksoterm (panas keluar dari sistem)" },
      { key: "C", label: "Adiabatik tanpa perpindahan panas" },
      { key: "D", label: "Reaksi spontan tanpa energi" },
      { key: "E", label: "Tidak ada perubahan entalpi" },
    ],
    answer: "A",
    explanation:
      "Pencairan es membutuhkan energi untuk memutus ikatan, sehingga panas diambil dari kulit (lingkungan). Delta H bernilai positif karena energi masuk ke sistem.",
  },
  {
    id: "q2",
    level: "mudah",
    points: 5,
    question:
      "Pembakaran gas LPG di kompor membuat udara sekitar terasa panas. Pernyataan yang tepat adalah...",
    options: [
      { key: "A", label: "Delta H negatif; energi dilepas ke lingkungan" },
      { key: "B", label: "Delta H positif; energi diserap dari lingkungan" },
      { key: "C", label: "Tidak ada perubahan entalpi" },
      { key: "D", label: "Reaksi endoterm dengan energi aktivasi sangat kecil" },
      { key: "E", label: "Energi hanya berubah bentuk tanpa panas" },
    ],
    answer: "A",
    explanation:
      "Pembakaran adalah eksoterm: energi kimia diubah menjadi panas sehingga Delta H bernilai negatif (panas dilepas ke lingkungan).",
  },
  {
    id: "q3",
    level: "sedang",
    points: 7,
    question:
      "Sebuah reaksi memiliki Delta H = +120 kJ. Makna angka ini adalah...",
    options: [
      { key: "A", label: "Sistem menyerap 120 kJ dari lingkungan agar reaksi berlangsung" },
      { key: "B", label: "Sistem melepas 120 kJ ke lingkungan selama reaksi" },
      { key: "C", label: "Energi aktivasi reaksi sebesar 120 kJ" },
      { key: "D", label: "Reaksi pasti berjalan spontan tanpa syarat" },
      { key: "E", label: "Delta H = 0 menunjukkan reaksi adiabatik" },
    ],
    answer: "A",
    explanation:
      "Tanda positif menunjukkan reaksi endoterm; energi sebesar 120 kJ dibutuhkan oleh sistem. Ini bukan energi aktivasi, melainkan perubahan entalpi bersih.",
  },
  {
    id: "q4",
    level: "sedang",
    points: 7,
    question:
      "Paket hand warmer menaikkan suhu 200 g air dari 25 C ke 33 C. Perkiraan energi panas yang dilepas adalah...",
    options: [
      { key: "A", label: "Sekitar 6,7 kJ dilepas (eksoterm)" },
      { key: "B", label: "Sekitar 6,7 kJ diserap (endoterm)" },
      { key: "C", label: "Sekitar 0,8 kJ dilepas" },
      { key: "D", label: "Data tidak cukup untuk menilai" },
      { key: "E", label: "Tidak ada perubahan suhu" },
    ],
    answer: "A",
    explanation:
      "q = m x c x DeltaT = 200 g x 4,18 J/gC x 8 C ~ 6,7 kJ. Suhu naik berarti panas keluar dari reaksi (eksoterm).",
  },
  {
    id: "q5",
    level: "sulit",
    points: 12,
    question:
      "Pada diagram energi: reaktan 50 kJ, produk 140 kJ, dan energi aktivasi 80 kJ. Pernyataan yang tepat adalah...",
    options: [
      { key: "A", label: "Reaksi endoterm dengan Delta H ~ +90 kJ" },
      { key: "B", label: "Reaksi eksoterm dengan Delta H ~ -90 kJ" },
      { key: "C", label: "Reaksi endoterm dengan Delta H ~ -30 kJ" },
      { key: "D", label: "Reaksi eksoterm dengan Delta H ~ +30 kJ" },
      { key: "E", label: "Reaksi adiabatik tanpa perubahan entalpi" },
    ],
    answer: "A",
    explanation:
      "Delta H = energi produk - energi reaktan = 140 - 50 = +90 kJ sehingga endoterm. Energi aktivasi tidak mengubah tanda Delta H.",
  },
  {
    id: "q6",
    level: "mudah",
    points: 5,
    question:
      "C(s) + O2(g) -> CO2(g) dengan Delta H = -393,5 kJ. Pernyataan yang benar adalah...",
    options: [
      { key: "A", label: "Reaksi menyerap kalor 393,5 kJ" },
      { key: "B", label: "Reaksi melepaskan kalor 393,5 kJ" },
      { key: "C", label: "Entalpi produk lebih besar dari reaktan" },
      { key: "D", label: "Reaksi tergolong endoterm" },
      { key: "E", label: "Suhu lingkungan menurun" },
    ],
    answer: "B",
    explanation: "Tanda negatif menunjukkan reaksi eksoterm sehingga kalor dilepaskan sebesar 393,5 kJ.",
  },
  {
    id: "q7",
    level: "mudah",
    points: 5,
    question: "Pada reaksi endoterm, pernyataan yang tepat adalah...",
    options: [
      { key: "A", label: "Delta H bernilai negatif" },
      { key: "B", label: "Kalor berpindah dari sistem ke lingkungan" },
      { key: "C", label: "Entalpi reaktan lebih kecil dari entalpi produk" },
      { key: "D", label: "Suhu lingkungan akan naik" },
      { key: "E", label: "Reaksi melepaskan panas" },
    ],
    answer: "C",
    explanation: "Endoterm menyerap panas sehingga produk berentalpi lebih tinggi; Delta H positif.",
  },
  {
    id: "q8",
    level: "mudah",
    points: 5,
    question:
      "Mencampur HCl dan NaOH membuat gelas hangat. Kesimpulan yang tepat adalah...",
    options: [
      { key: "A", label: "Endoterm dengan Delta H positif" },
      { key: "B", label: "Eksoterm dengan Delta H negatif" },
      { key: "C", label: "Reaksi menyerap kalor dari lingkungan" },
      { key: "D", label: "Entalpi produk lebih besar dari reaktan" },
      { key: "E", label: "Tidak ada perpindahan kalor" },
    ],
    answer: "B",
    explanation: "Suhu naik berarti panas dilepas ke lingkungan; reaksi netralisasi bersifat eksoterm.",
  },
  {
    id: "q9",
    level: "sedang",
    points: 7,
    question:
      "Manakah reaksi yang tergolong eksoterm? (1) Fotosintesis (2) Pembakaran bensin (3) Pelarutan NH4Cl (4) Respirasi sel (5) Peleburan es",
    options: [
      { key: "A", label: "1, 2, dan 3" },
      { key: "B", label: "2 dan 4" },
      { key: "C", label: "1, 3, dan 5" },
      { key: "D", label: "2, 3, dan 4" },
      { key: "E", label: "3, 4, dan 5" },
    ],
    answer: "B",
    explanation: "Pembakaran bensin dan respirasi sel melepaskan energi (eksoterm); lainnya endoterm.",
  },
  {
    id: "q10",
    level: "sulit",
    points: 11,
    question:
      "Reaksi pembakaran CH4: CH4 + 2O2 -> CO2 + 2H2O, dengan Delta H = -890,3 kJ. Nilai ini menunjukkan...",
    options: [
      { key: "A", label: "Reaksi menyerap 890,3 kJ" },
      { key: "B", label: "Reaksi melepas 890,3 kJ" },
      { key: "C", label: "Energi aktivasi 890,3 kJ" },
      { key: "D", label: "Reaksi endoterm karena tanda negatif" },
      { key: "E", label: "Delta H tidak dipengaruhi stoikiometri" },
    ],
    answer: "B",
    explanation:
      "Delta H negatif berarti energi dilepas; perhitungan entalpi pembentukan memberi -890,3 kJ per reaksi.",
  },
  {
    id: "q11",
    level: "mudah",
    points: 5,
    question: "Kompres dingin instan terasa dingin karena...",
    options: [
      { key: "A", label: "Reaksi melepas kalor ke lingkungan" },
      { key: "B", label: "Reaksi menyerap kalor dari lingkungan" },
      { key: "C", label: "Tidak ada reaksi kimia" },
      { key: "D", label: "Entalpi sistem berkurang" },
      { key: "E", label: "Delta H bernilai negatif" },
    ],
    answer: "B",
    explanation: "Kompres menyerap panas dari sekitar sehingga terasa dingin (endoterm).",
  },
  {
    id: "q12",
    level: "sedang",
    points: 7,
    question:
      "Diagram energi menunjukkan produk lebih rendah dari reaktan dan panas keluar. Pernyataan benar adalah...",
    options: [
      { key: "A", label: "Reaksi bersifat endoterm" },
      { key: "B", label: "Delta H bertanda positif" },
      { key: "C", label: "Kalor dilepaskan ke lingkungan" },
      { key: "D", label: "Entalpi produk > entalpi reaktan" },
      { key: "E", label: "Reaksi memerlukan energi luar" },
    ],
    answer: "C",
    explanation: "Produk lebih rendah dan panas keluar menandakan eksoterm (Delta H negatif).",
  },
  {
    id: "q13",
    level: "sedang",
    points: 7,
    question:
      "N2 + 3H2 -> 2NH3 dengan Delta H = -92 kJ. Jika 0,2 mol N2 bereaksi, kalor yang dilepaskan adalah...",
    options: [
      { key: "A", label: "9,2 kJ" },
      { key: "B", label: "18,4 kJ" },
      { key: "C", label: "46 kJ" },
      { key: "D", label: "92 kJ" },
      { key: "E", label: "184 kJ" },
    ],
    answer: "B",
    explanation: "0,2 mol N2 setara 0,2 stoikiometri reaksi: 0,2 x 92 kJ = 18,4 kJ dilepas.",
  },
  {
    id: "q14",
    level: "mudah",
    points: 5,
    question: "Peristiwa yang tergolong endoterm adalah...",
    options: [
      { key: "A", label: "Lilin menyala" },
      { key: "B", label: "Kapur barus menyublim" },
      { key: "C", label: "Logam besi berkarat" },
      { key: "D", label: "Kayu terbakar" },
      { key: "E", label: "Petasan meledak" },
    ],
    answer: "B",
    explanation: "Sublimasi kapur barus menyerap panas dari sekitar (endoterm).",
  },
  {
    id: "q15",
    level: "sedang",
    points: 7,
    question:
      "Pernyataan yang benar untuk reaksi endoterm: (1) Sistem menyerap energi (2) Entalpi produk lebih tinggi (3) Delta H positif (4) Suhu lingkungan meningkat (5) Contoh fotosintesis",
    options: [
      { key: "A", label: "1, 2, dan 3" },
      { key: "B", label: "1, 2, 3, dan 5" },
      { key: "C", label: "2, 3, dan 4" },
      { key: "D", label: "1, 3, 4, dan 5" },
      { key: "E", label: "Semua benar" },
    ],
    answer: "B",
    explanation: "Endoterm menyerap energi, produk lebih tinggi, Delta H positif, contoh fotosintesis; suhu lingkungan justru turun.",
  },
];

const RAW_TOTAL_POINTS = questions.reduce((sum, q) => sum + q.points, 0);
const MAX_POINTS = 100;
const DURATION_SECONDS = 30 * 60;

const formatSeconds = (sec: number | null) => {
  if (!Number.isFinite(sec)) return "-";
  const m = Math.floor((sec ?? 0) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor((sec ?? 0) % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};
function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "anonim"
  );
}

export default function QuizPage() {
  const [phase, setPhase] = useState<"landing" | "confirm" | "quiz" | "result">("landing");
  const [info, setInfo] = useState({ name: "", class: "", absen: "" });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION_SECONDS);
  const [result, setResult] = useState<ResultPayload | null>(null);
  const [storedResults, setStoredResults] = useState<ResultPayload[]>([]);
  const [teacherMode, setTeacherMode] = useState(false);
  const [teacherAuthed, setTeacherAuthed] = useState(false);
  const [filterClass, setFilterClass] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [teacherPassInput, setTeacherPassInput] = useState("");

  const startRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isBrowser = typeof window !== "undefined";

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadStoredResults();
    return () => clearInterval(timerRef.current ?? undefined);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (phase !== "quiz") return;
    clearInterval(timerRef.current ?? undefined);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current ?? undefined);
          submitQuiz(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current ?? undefined);
  }, [phase]);

  const answeredCount = questions.filter((q) => answers[q.id]).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  function handleInfoChange(key: keyof typeof info, value: string) {
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
    setTimeLeft(DURATION_SECONDS);
    setResult(null);
    setError(null);
    startRef.current = Date.now();
  }

  function selectOption(questionId: string, optionKey: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  }

  function submitQuiz(auto = false) {
    if (phase !== "quiz") return;
    if (!auto && !confirmSubmit()) return;

    const detail: AnswerPayload[] = questions.map((q) => {
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

    const rawScore = detail.reduce((sum, d) => sum + d.earned, 0);
    const totalScore = Math.round((rawScore / RAW_TOTAL_POINTS) * MAX_POINTS);
    const now = Date.now();
    const timeUsedSeconds = startRef.current
      ? Math.min(DURATION_SECONDS, Math.max(0, Math.round((now - startRef.current) / 1000)))
      : null;
    const payload: ResultPayload = {
      info,
      detail,
      totalScore,
      totalPoints: MAX_POINTS,
      timeUsedSeconds,
      timestamp: new Date().toISOString(),
      rawScore,
      rawTotalPoints: RAW_TOTAL_POINTS,
    };

    setResult(payload);
    setPhase("result");
    clearInterval(timerRef.current ?? undefined);
    persistResult(payload);
  }

  function confirmSubmit() {
    setShowConfirm(true);
    return false;
  }

  function persistResult(payload: ResultPayload) {
    if (!isBrowser) return;
    setLoading(true);
    try {
      const key = `${STORAGE_PREFIX}${Date.now()}-${slugify(payload.info.name)}`;
      window.localStorage.setItem(key, JSON.stringify(payload));
      loadStoredResults();
    } catch (err) {
      setError("Gagal menyimpan hasil ke storage.");
    } finally {
      setLoading(false);
    }
  }

  function loadStoredResults() {
    if (!isBrowser) return;
    setLoading(true);
    try {
      const keys = Object.keys(window.localStorage).filter((k) => k.startsWith(STORAGE_PREFIX));
      const parsed = keys
        .map((key) => {
          try {
            const raw = window.localStorage.getItem(key);
            return raw ? (JSON.parse(raw) as ResultPayload) : null;
          } catch (err) {
            return null;
          }
        })
        .filter(Boolean) as ResultPayload[];
      parsed.sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));
      setStoredResults(parsed);
    } catch (err) {
      setError("Gagal memuat hasil dari storage.");
    } finally {
      setLoading(false);
    }
  }

  function resetData() {
    if (!isBrowser) return;
    if (!window.confirm("Hapus semua hasil yang tersimpan?")) return;
    try {
      Object.keys(window.localStorage)
        .filter((k) => k.startsWith(STORAGE_PREFIX))
        .forEach((key) => window.localStorage.removeItem(key));
      setStoredResults([]);
    } catch (err) {
      setError("Gagal menghapus data.");
    }
  }

  async function downloadCSV(rows: ResultPayload[]) {
    if (!rows.length) return;
    const header = ["Nama", "Kelas", "Absen", "Skor", "Waktu (detik)", "Timestamp"];
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

  async function downloadExcel(rows: ResultPayload[]) {
    if (!rows.length) return;
    const XLSX = await import("xlsx");
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
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hasil");
    XLSX.writeFile(wb, "hasil-kuis-thermokimia.xlsx");
  }

  function handleTeacherLogin(password: string) {
    if (password === "guru123") {
      setTeacherAuthed(true);
      setTeacherMode(true);
      setError(null);
      loadStoredResults();
      return true;
    }
    setTeacherAuthed(false);
    setTeacherMode(false);
    setError("Password guru salah.");
    return false;
  }

  const filteredResults = useMemo(
    () =>
      filterClass === "all"
        ? storedResults
        : storedResults.filter(
            (r) => (r.info.class || "").toLowerCase() === filterClass.toLowerCase()
          ),
    [filterClass, storedResults]
  );

  const classesAvailable = useMemo(
    () =>
      Array.from(
        new Set(storedResults.map((r) => (r.info.class || "").trim()).filter(Boolean))
      ),
    [storedResults]
  );

  const stats = useMemo(() => {
    if (!filteredResults.length) return null;
    const scores = filteredResults.map((r) => r.totalScore);
    const avg = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    return { avg, max, min, count: filteredResults.length };
  }, [filteredResults]);
  return (
    <div className="quiz-page">
      {showConfirm && (
        <div className="quiz-modal-backdrop">
          <div className="quiz-modal">
            <h3>Konfirmasi</h3>
            <p>Sudah yakin ingin mengumpulkan jawaban?</p>
            <div className="quiz-modal-actions">
              <button className="quiz-btn ghost" onClick={() => setShowConfirm(false)}>
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

      <header className="quiz-page__header">
        <div>
          <p className="quiz-tag">Termokimia - Eksoterm & Endoterm</p>
          <h1>Kuis Interaktif</h1>
          <p className="quiz-subtitle">
            Siswa: lengkapi identitas, baca aturan singkat, lalu mulai kuis {DURATION_SECONDS / 60} menit.
          </p>
        </div>
        <div className="quiz-actions">
          <Link className="quiz-link" href="/">
            ← Kembali ke modul
          </Link>
        </div>
      </header>

      <div className="quiz-shell">
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
                setTeacherPassInput("");
                setError(null);
                setTeacherMode(true);
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
                    <li>Isi identitas, baca aturan, lalu mulai kuis ({DURATION_SECONDS / 60} menit).</li>
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
                  <p>Durasi: {DURATION_SECONDS / 60} menit</p>
                  <p>Jumlah soal: {questions.length} pilihan ganda</p>
                    <p>Total poin: {MAX_POINTS}</p>
                  </div>
                </div>
                <ul className="rule-list">
                  <li>Timer mulai setelah klik tombol mulai.</li>
                  <li>Kamu bisa berpindah soal kapan saja.</li>
                  <li>Setelah submit, kamu akan melihat pembahasan.</li>
                  <li>Skor dinormalisasi ke 100; bobot soal mengikuti tingkat kesulitan.</li>
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
                      <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                  <div>
                    <p className="meta-label">Total poin</p>
                  <div className="timer">{MAX_POINTS}</div>
                  </div>
                </div>

                <div className="indicator-row">
                  {questions.map((q, idx) => {
                    const answered = Boolean(answers[q.id]);
                    const isCurrent = idx === currentIndex;
                    return (
                      <button
                        key={q.id}
                        className={`indicator-dot ${answered ? "answered" : ""} ${
                          isCurrent ? "current" : ""
                        }`}
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
                    <span className="pill ghost">{questions[currentIndex].points} poin</span>
                  </div>
                  <h3>
                    Soal {currentIndex + 1}. {questions[currentIndex].question}
                  </h3>
                  <div className="option-grid">
                    {questions[currentIndex].options.map((opt) => {
                      const selected = answers[questions[currentIndex].id] === opt.key;
                      return (
                        <button
                          key={opt.key}
                          className={`option-btn ${selected ? "selected" : ""}`}
                          onClick={() => selectOption(questions[currentIndex].id, opt.key)}
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
                      onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
                      disabled={currentIndex === 0}
                    >
                      ← Sebelumnya
                    </button>
                    <div className="nav-right">
                      <button
                        className="quiz-btn secondary"
                        onClick={() =>
                          setCurrentIndex((idx) => Math.min(questions.length - 1, idx + 1))
                        }
                        disabled={currentIndex === questions.length - 1}
                      >
                        Berikutnya →
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
                    <strong>{formatSeconds(result.timeUsedSeconds)}</strong>
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
                          <div className="earned">+{d.earned} / {d.points}</div>
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
    setTimeLeft(DURATION_SECONDS);
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
            {!teacherAuthed && <p>Masuk dengan password untuk melihat hasil. (Password : guru123) </p>}
            {teacherAuthed && (
              <>
                <div className="teacher-toolbar">
                  <div>
                    <label>
                      Filter kelas:
                      <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
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

            {!teacherAuthed && (
              <div className="quiz-modal" style={{ marginTop: 12 }}>
                <h3>Masuk Mode Guru</h3>
                <p>Masukkan password guru untuk membuka dashboard.</p>
                <input
                  type="password"
                  value={teacherPassInput}
                  onChange={(e) => setTeacherPassInput(e.target.value)}
                  placeholder="Password guru"
                />
                <div className="quiz-modal-actions">
                  <button className="quiz-btn ghost" onClick={() => setTeacherMode(false)}>
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
            )}
          </section>
        )}
      </div>
    </div>
  );
}
