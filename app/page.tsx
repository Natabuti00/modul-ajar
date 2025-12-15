"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ModalAction = {
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  onClick?: () => void;
};

type ModalState = {
  title: string;
  message: string;
  actions?: ModalAction[];
};

type DragZoneState = {
  status: "idle" | "correct" | "wrong";
  label: string;
};

type MemoryCard = {
  id: string;
  pairId: number;
  icon: string;
  label: string;
};

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#kosakata", label: "Kosakata" },
  { href: "#pelajaran", label: "Pelajaran" },
  { href: "#aktivitas", label: "Aktivitas" },
  { href: "#cerita", label: "Cerita" },
  { href: "#quiz-app", label: "Kuis" },
  { href: "#tambahan", label: "Materi Tambahan" },
];

const vocabCards = [
  {
    id: "sistem",
    title: "Sistem & Lingkungan",
    front: "Apa itu sistem dan lingkungan?",
    back: [
      "Sistem: Bagian dari alam semesta yang sedang dipelajari (misal: reaksi kimia dalam tabung reaksi).",
      "Lingkungan: Segala sesuatu di luar sistem yang dapat berinteraksi (misal: udara, wadah, dll.).",
    ],
  },
  {
    id: "sifat",
    title: "Eksoterm vs Endoterm",
    front: "Dua jenis perpindahan energi.",
    back: [
      "Reaksi eksoterm melepaskan energi panas ke lingkungan, membuat suhu sekitar lebih panas.",
      "Reaksi endoterm menyerap energi panas dari lingkungan, membuat suhu sekitar lebih dingin.",
    ],
  },
  {
    id: "entalpi",
    title: "Perubahan Entalpi (Delta H)",
    front: "Delta H adalah perubahan energi panas.",
    back: [
      "Perubahan entalpi (ΔH) adalah perubahan energi panas dalam suatu sistem kimia pada tekanan konstan. Besaran ini menunjukkan berapa banyak energi yang diserap atau dilepaskan selama reaksi berlangsung. ΔH negatif = reaksi melepaskan panas (eksoterm); ΔH positif = reaksi menyerap panas (endoterm).",
    ],
  },
];

const dragItems = [
  { id: "exo", label: "Eksoterm", target: "lepas" },
  { id: "endo", label: "Endoterm", target: "serap" },
  { id: "delta", label: "Kalor Reaksi (Delta H)", target: "delta" },
  { id: "diagram", label: "Diagram Energi", target: "grafik" },
];

const dropZones = [
  { id: "lepas", label: "Panas keluar" },
  { id: "serap", label: "Panas masuk" },
  { id: "delta", label: "Nilai + atau -" },
  { id: "grafik", label: "Naik turun energi" },
];

const choiceQuestions = [
  {
    id: "q1",
    prompt: "Pembakaran kayu termasuk...",
    options: [
      { label: "Eksoterm (panas keluar)", correct: true },
      { label: "Endoterm (panas masuk)", correct: false },
      { label: "Reaksi netral", correct: false },
    ],
  },
  {
    id: "q2",
    prompt: "Mencairkan es termasuk...",
    options: [
      { label: "Eksoterm", correct: false },
      { label: "Endoterm", correct: true },
      { label: "Tidak ada perpindahan energi", correct: false },
    ],
  },
];

const categoryItems = [
  { label: "Es batu terbentuk", side: "exo" as const },
  { label: "Besi berkarat hangat", side: "exo" as const },
  { label: "Es meleleh di tangan", side: "endo" as const },
  { label: "Fotosintesis daun", side: "endo" as const },
];
const flashcards = [
  {
    id: "flash-exo",
    title: "Eksoterm",
    icon: "🔥",
    back: ["Melepas panas", "Delta H negatif", "Suhu sekitar naik"],
  },
  {
    id: "flash-endo",
    title: "Endoterm",
    icon: "❄️",
    back: ["Menyerap panas", "Delta H positif", "Suhu sekitar turun"],
  },
  {
    id: "flash-dh",
    title: "Delta H",
    icon: "ΔH",
    back: [
      "Perubahan entalpi (ΔH) = energi panas pada tekanan konstan. ΔH negatif: eksoterm (panas keluar). ΔH positif: endoterm (panas masuk).",
    ],
  },
  {
    id: "flash-system",
    title: "Sistem/Lingkungan",
    icon: "⚙️",
    back: [
      "Sistem: Bagian dari alam semesta yang sedang dipelajari (misal: reaksi kimia dalam tabung reaksi). Lingkungan: segala sesuatu di luar sistem yang dapat berinteraksi (misal: udara, wadah, dll.).",
    ],
  },
];

const organizerInfo: Record<string, string> = {
  reaksi: "Reaksi kimia mengubah reaktan menjadi produk dengan perubahan energi.",
  eksoterm: "Eksoterm: melepas panas, Delta H negatif.",
  endoterm: "Endoterm: menyerap panas, Delta H positif.",
  "ekso-delta": "Produk ber-energi lebih rendah (Delta H < 0).",
  "ekso-suhu": "Suhu lingkungan naik karena panas keluar.",
  "ekso-energi": "Diagram energi menurun dari reaktan ke produk.",
  "endo-delta": "Produk ber-energi lebih tinggi (Delta H > 0).",
  "endo-suhu": "Suhu lingkungan turun karena panas diserap.",
  "endo-energi": "Diagram energi naik dari reaktan ke produk.",
};

const memoryPairs = [
  { icon: "EXO", label: "Eksoterm" },
  { icon: "ENDO", label: "Endoterm" },
  { icon: "DH", label: "Entalpi" },
  { icon: "RXN", label: "Reaksi" },
  { icon: "T+", label: "Suhu Naik" },
  { icon: "T-", label: "Suhu Turun" },
];

const experiments = [
  {
    title: "Pembakaran (Eksoterm)",
    steps: [
      "Persiapan: lilin, korek api, termometer.",
      "Catat suhu awal.",
      "Nyalakan lilin, ukur lagi.",
      "Suhu naik tajam -> Delta H negatif.",
    ],
  },
  {
    title: "Garam di Air (Endoterm)",
    steps: [
      "Persiapan: garam, air, termometer.",
      "Catat suhu awal.",
      "Larutkan garam, aduk.",
      "Suhu turun -> Delta H positif.",
    ],
  },
];

const sentenceTemplates = [
  "Perubahan Entalpi (ΔH): ΔH = H_produk - H_reaktan",
  "Kalor Reaksi: q = m × c × ΔT (m = massa, c = kalor jenis, ΔT = perubahan suhu)",
  "Hukum Hess: ΔH_reaksi = ΣΔHf produk - ΣΔHf reaktan",
  "Energi Ikatan: ΔH = Σ Energi ikatan putus - Σ Energi ikatan terbentuk",
];

const enthalpyTable = [
  { name: "Air", formula: "H2O(l)", dhf: "-285.8" },
  { name: "Karbon dioksida", formula: "CO2(g)", dhf: "-393.5" },
  { name: "Metana", formula: "CH4(g)", dhf: "-74.8" },
  { name: "Amonia", formula: "NH3(g)", dhf: "-46.1" },
  { name: "Etanol", formula: "C2H5OH(l)", dhf: "-277.7" },
  { name: "Glukosa", formula: "C6H12O6(s)", dhf: "-1273.3" },
  { name: "Natrium klorida", formula: "NaCl(s)", dhf: "-411.2" },
  { name: "Kalsium karbonat", formula: "CaCO3(s)", dhf: "-1206.9" },
];

const thermoStoryFull = `Petualangan Thermo & Chem di Dunia Energi

Di sebuah laboratorium ajaib yang penuh dengan tabung reaksi berwarna-warni dan alat-alat kimia yang berkilauan, hiduplah dua sahabat yang tak terpisahkan: Thermo si robot pengukur suhu dengan termometer digital yang selalu menempel di dadanya, dan Chem si kelinci ilmuwan yang selalu mengenakan jas lab putih dan kacamata bulat. Mereka berdua memiliki misi khusus yang sangat penting - menjelajahi dunia reaksi kimia untuk memahami misteri perpindahan energi yang selama ini menjadi teka-teki bagi banyak orang.

Suatu pagi yang cerah, saat mereka sedang membereskan laboratorium setelah percobaan semalam, tiba-tiba muncul dua pintu misterius di dinding laboratorium yang tadinya kosong. Pintu pertama berwarna merah menyala dengan tulisan besar "EKSOTERM" yang berkilau seperti api, sementara pintu kedua berwarna biru dingin dengan tulisan "ENDOTERM" yang tampak seperti kristal es. Thermo dan Chem saling berpandangan dengan mata berbinar penuh rasa ingin tahu. "Ayo kita jelajahi keduanya!" seru Thermo penuh semangat sambil menggenggam tangan Chem. "Aku yakin kita akan menemukan sesuatu yang luar biasa di balik pintu-pintu ini!"

Dengan penuh keberanian, mereka membuka pintu merah terlebih dahulu. WHOOSH! Begitu pintu terbuka, gelombang panas langsung menyambut mereka. Termometer digital Thermo yang biasanya menunjukkan suhu 25°C langsung naik drastis menjadi 45°C, lalu 60°C, terus naik! "Panaaas sekali!" teriak Thermo sambil mengipas-ngipas tubuhnya dengan tangannya yang berbentuk robot. Chem yang lebih tenang segera menjelaskan dengan antusias: "Ini dia, Thermo! Kita berada di dunia EKSOTERM! Di dunia ini, semua reaksi kimia melepaskan energi dalam bentuk panas ke lingkungan sekitar. Makanya suhu di sekitar kita naik tinggi!" Mereka berjalan lebih dalam dan melihat berbagai contoh reaksi eksoterm: kayu yang terbakar melepaskan panas dan cahaya, proses respirasi dalam sel yang menghasilkan energi untuk tubuh, dan reaksi netralisasi ketika asam bertemu basa yang menghasilkan kehangatan.

Chem kemudian mengeluarkan spidol ajaibnya dan mulai menggambar diagram energi di udara. Gambar itu melayang dan bersinar di depan mereka. "Lihat dengan saksama, Thermo! Ini adalah diagram energi untuk reaksi eksoterm. Perhatikan bahwa energi reaktan di awal itu tinggi, kemudian setelah reaksi terjadi, energi produk menjadi lebih rendah. Nah, energi yang hilang ini tidak menghilang begitu saja lho! Energi tersebut dilepaskan ke lingkungan dalam bentuk PANAS. Itulah sebabnya termometermu naik!" jelas Chem sambil menunjuk-nunjuk diagramnya. "Dalam ilmu kimia, kita menuliskan perubahan entalpi atau ΔH untuk reaksi eksoterm ini dengan tanda negatif (-) karena sistem melepaskan energi. Jadi ΔH eksoterm = negatif!"

Setelah puas menjelajahi dunia eksoterm yang hangat, mereka kembali ke laboratorium dan kali ini membuka pintu biru. Begitu pintu terbuka, mereka merasakan sensasi yang sangat berbeda. Brrrrr! Udara dingin langsung menyelimuti mereka. Termometer Thermo yang tadi menunjukkan 25°C kini turun drastis menjadi 10°C, lalu 5°C, bahkan mendekati 0°C! "Dingin sekali! Aku sampai menggigil!" kata Thermo sambil memeluk dirinya sendiri mencoba menghangatkan badan. Chem tersenyum lebar dan berkata: "Selamat datang di dunia ENDOTERM, sahabatku! Ini kebalikan total dari dunia eksoterm tadi. Di dunia ini, reaksi kimia justru MENYERAP energi panas dari lingkungan sekitar. Makanya kita merasakan dingin karena panas tubuh kita diserap oleh reaksi-reaksi di sekitar kita!"

Mereka melihat berbagai contoh reaksi endoterm di sekitar mereka: proses fotosintesis pada tanaman hijau yang menyerap energi cahaya matahari untuk mengubah karbon dioksida dan air menjadi glukosa, es batu yang meleleh dengan menyerap panas dari sekitarnya, dan kompres dingin instan yang digunakan atlet ketika cedera yang langsung terasa dingin saat diaktifkan. "Semua reaksi ini membutuhkan energi dari luar untuk bisa terjadi," jelas Chem sambil mencatat pengamatannya di buku catatan kecilnya.

Chem kembali mengeluarkan spidol ajaibnya dan menggambar diagram energi yang kedua. "Nah, sekarang perhatikan diagram untuk reaksi endoterm ini, Thermo. Berbeda dengan eksoterm, di sini energi reaktan di awal itu lebih rendah, lalu setelah reaksi berlangsung, energi produk menjadi lebih tinggi. Artinya, reaksi ini membutuhkan tambahan energi untuk bisa terjadi. Energi tambahan itu diserap dari lingkungan sekitar, yaitu dari panas di udara atau dari benda-benda di sekitar kita. Makanya kita merasakan dingin!" Chem menunjuk ke arah panah yang mengarah ke dalam sistem. "Untuk reaksi endoterm, nilai ΔH adalah positif (+) karena sistem menyerap energi dari lingkungan. Jadi ΔH endoterm = positif!"

Setelah menjelajahi kedua dunia yang menakjubkan itu, Thermo dan Chem kembali ke laboratorium mereka dengan pengetahuan baru yang sangat berharga. "Sekarang aku benar-benar mengerti!" seru Thermo dengan mata yang berbinar penuh semangat. "Reaksi eksoterm itu seperti api unggun di malam yang dingin yang menghangatkan kita, sementara reaksi endoterm itu seperti es batu yang kita masukkan ke dalam minuman untuk mendinginkannya!" Chem mengangguk dengan bangga melihat sahabatnya memahami konsep yang rumit dengan analogi sederhana. "Tepat sekali, Thermo! Dan yang lebih menakjubkan lagi, kedua jenis reaksi ini sangat penting dalam kehidupan sehari-hari kita. Tanpa reaksi eksoterm, kita tidak bisa memasak makanan atau menghangatkan tubuh. Tanpa reaksi endoterm, tumbuhan tidak bisa berfotosintesis dan kita tidak bisa menikmati kesegaran es krim!"

Mereka kemudian membuat poster besar untuk dipasang di laboratorium agar tidak lupa. Di poster itu tertulis: "EKSOTERM = Melepaskan panas, suhu naik, ΔH negatif (-), contohnya pembakaran dan respirasi. ENDOTERM = Menyerap panas, suhu turun, ΔH positif (+), contohnya fotosintesis dan peleburan es." Thermo dan Chem berpelukan, bangga dengan petualangan mereka hari ini. Mereka tidak sabar untuk berbagi pengetahuan ini dengan teman-teman mereka yang lain di laboratorium.`;

const thermoQuestions = [
  "Apa yang terjadi dengan suhu lingkungan saat reaksi eksoterm berlangsung?",
  "Mengapa reaksi endoterm membuat lingkungan sekitar terasa dingin?",
  "Sebutkan masing-masing 3 contoh reaksi eksoterm dan endoterm dalam kehidupan sehari-hari!",
];

const thermoHeroImage = "/images/thermo-chem-energi.png";

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}
export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [endoMode, setEndoMode] = useState(false);
  const [energy, setEnergy] = useState(0);
  const [lessonEnergy, setLessonEnergy] = useState(-10);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [dropState, setDropState] = useState<Record<string, DragZoneState>>(
    () =>
      dropZones.reduce((acc, zone) => {
        acc[zone.id] = { status: "idle", label: zone.label };
        return acc;
      }, {} as Record<string, DragZoneState>)
  );
  const [chipHidden, setChipHidden] = useState<Record<string, boolean>>({});
  const [choiceState, setChoiceState] = useState<
    Record<string, "correct" | "wrong" | null>
  >({});
  const [blankValue, setBlankValue] = useState("");
  const [blankFeedback, setBlankFeedback] = useState<
    { text: string; status: "idle" | "correct" | "wrong" }
  >({ text: "", status: "idle" });
  const [assignments, setAssignments] = useState<
    Record<string, "exo" | "endo" | null>
  >(() =>
    categoryItems.reduce((acc, item) => {
      acc[item.label] = null;
      return acc;
    }, {} as Record<string, "exo" | "endo" | null>)
  );
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [activeNode, setActiveNode] = useState<string>("reaksi");
  const [activeTab, setActiveTab] = useState<
    "flashcards" | "organizer" | "memory" | "experiment" | "sentences" | "wordwall"
  >("flashcards");
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [memoryFlipped, setMemoryFlipped] = useState<number[]>([]);
  const [memoryMatched, setMemoryMatched] = useState<Set<number>>(new Set());
  const [memoryAttempts, setMemoryAttempts] = useState(0);

  useEffect(() => {
    document.body.classList.toggle("endo-mode", endoMode);
    return () => document.body.classList.remove("endo-mode");
  }, [endoMode]);

  useEffect(() => {
    if (activeTab === "memory") {
      initMemoryGame();
    }
  }, [activeTab]);

  const energyLabel = useMemo(() => {
    if (energy > 10) return "Endoterm: butuh panas dari sekitar.";
    if (energy < -10) return "Eksoterm: melepas panas ke sekitar.";
    return "Seimbang: butuh bukti!";
  }, [energy]);

  const lessonEnergyLabel = useMemo(() => {
    if (lessonEnergy > 20) return "Endoterm kuat: produk butuh energi tinggi.";
    if (lessonEnergy < -20) return "Eksoterm kuat: produk lebih rendah energinya.";
    return "Sedang: lihat grafik energi.";
  }, [lessonEnergy]);

  const exoList = categoryItems
    .filter((item) => assignments[item.label] === "exo")
    .map((item) => item.label);
  const endoList = categoryItems
    .filter((item) => assignments[item.label] === "endo")
    .map((item) => item.label);

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  function openModal(nextModal: ModalState) {
    setModal(nextModal);
  }

  function closeModal() {
    setModal(null);
  }

  function handleDrop(zoneId: string, data: string) {
    const zone = dropZones.find((z) => z.id === zoneId);
    if (!zone) return;
    if (zone.id === data) {
      setDropState((prev) => ({
        ...prev,
        [zoneId]: { status: "correct", label: "Cocok!" },
      }));
      setChipHidden((prev) => ({ ...prev, [data]: true }));
      const solved = Object.values({
        ...dropState,
        [zoneId]: { status: "correct", label: "Cocok!" },
      }).filter((s) => s.status === "correct").length;
      if (solved >= dropZones.length) {
        openModal({ title: "Mantap!", message: "Semua jawaban drag & drop benar." });
      }
    } else {
      setDropState((prev) => ({
        ...prev,
        [zoneId]: { status: "wrong", label: "Coba lagi" },
      }));
      setTimeout(() => {
        setDropState((prev) => ({
          ...prev,
          [zoneId]: { status: "idle", label: zone.label },
        }));
      }, 900);
    }
  }

  function resetDrag() {
    setChipHidden({});
    setDropState(
      dropZones.reduce((acc, zone) => {
        acc[zone.id] = { status: "idle", label: zone.label };
        return acc;
      }, {} as Record<string, DragZoneState>)
    );
  }
  function selectChoice(qid: string, correct: boolean) {
    setChoiceState((prev) => ({ ...prev, [qid]: correct ? "correct" : "wrong" }));
    if (correct) {
      openModal({ title: "Mantap!", message: "Jawabanmu benar." });
    }
  }

  function checkBlank() {
    const trimmed = blankValue.trim().toLowerCase();
    if (!trimmed) {
      setBlankFeedback({ status: "idle", text: "Tulis dulu ya!" });
      return;
    }
    if (trimmed.includes("negatif")) {
      setBlankFeedback({
        status: "correct",
        text: "Benar! Delta H eksoterm bernilai negatif.",
      });
      openModal({
        title: "Sip!",
        message: "Delta H eksoterm bernilai negatif karena panas keluar.",
      });
    } else {
      setBlankFeedback({
        status: "wrong",
        text: "Belum tepat. Delta H eksoterm bernilai negatif.",
      });
    }
  }

  function chooseCategory(label: string) {
    openModal({
      title: "Pilih Kelompok",
      message: `Kelompokkan: ${label}`,
      actions: [
        {
          label: "Eksoterm",
          variant: "secondary",
          onClick: () => applyCategory(label, "exo"),
        },
        {
          label: "Endoterm",
          variant: "primary",
          onClick: () => applyCategory(label, "endo"),
        },
      ],
    });
  }

  function applyCategory(label: string, side: "exo" | "endo") {
    setAssignments((prev) => {
      const next = { ...prev, [label]: side };
      const allDone = categoryItems.every((item) => next[item.label] !== null);
      if (allDone) {
        openModal({ title: "Mantap!", message: "Semua kategori sudah benar!" });
      } else {
        closeModal();
      }
      return next;
    });
  }

  function resetCategory() {
    setAssignments(
      categoryItems.reduce((acc, item) => {
        acc[item.label] = null;
        return acc;
      }, {} as Record<string, "exo" | "endo" | null>)
    );
  }

  function toggleFlashcard(id: string) {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function initMemoryGame() {
    const cards: MemoryCard[] = memoryPairs
      .flatMap((pair, idx) => [
        { id: `${idx}-a`, pairId: idx, icon: pair.icon, label: pair.label },
        { id: `${idx}-b`, pairId: idx, icon: pair.icon, label: pair.label },
      ])
      .sort(() => Math.random() - 0.5);
    setMemoryCards(cards);
    setMemoryFlipped([]);
    setMemoryMatched(new Set());
    setMemoryAttempts(0);
  }

  function flipMemoryCard(index: number) {
    if (memoryFlipped.includes(index)) return;
    if (memoryMatched.has(index)) return;
    const card = memoryCards[index];
    if (!card) return;
    const nextFlipped = [...memoryFlipped, index];
    setMemoryFlipped(nextFlipped);
    if (nextFlipped.length === 2) {
      const [firstIdx, secondIdx] = nextFlipped;
      const first = memoryCards[firstIdx];
      const second = memoryCards[secondIdx];
      setMemoryAttempts((a) => a + 1);
      if (first && second && first.pairId === second.pairId) {
        setMemoryMatched((prev) => {
          const next = new Set(prev);
          next.add(firstIdx);
          next.add(secondIdx);
          if (next.size === memoryPairs.length * 2) {
            openModal({
              title: "Selesai!",
              message: `Kamu mencocokkan semua pasangan dalam ${memoryAttempts + 1} kali coba!`,
            });
          }
          return next;
        });
      }
      setTimeout(() => setMemoryFlipped([]), 650);
    }
  }

const quizBanner = (
  <section className="section" id="quiz-app">
    <div className="pill-label">📘 Kuis Interaktif Termokimia - Latihan Kelas XI (Eksoterm & Endoterm)</div>
    <div className="quiz-banner single">
      <div className="quiz-banner__left">
        <div className="quiz-badge">Siap Ikut Kuis?</div>
        <p className="quiz-intro">
          Uji pemahaman eksoterm vs endoterm, ΔH, dan contoh sehari-hari lewat 15
          soal interaktif berdurasi 30 menit.
        </p>
        <ul className="quiz-stats">
          <li>
            <span className="bubble-icon">📘</span>
            <div>
              <strong>Topik</strong>
              <div>Eksoterm & Endoterm</div>
            </div>
          </li>
          <li>
            <span className="bubble-icon">📝</span>
            <div>
              <strong>Jumlah soal</strong>
              <div>15 pilihan ganda</div>
            </div>
          </li>
          <li>
            <span className="bubble-icon">🎓</span>
            <div>
              <strong>Target</strong>
              <div>Siswa SMA kelas XI</div>
            </div>
          </li>
          <li>
            <span className="bubble-icon">⏱️</span>
            <div>
              <strong>Durasi</strong>
              <div>30 menit</div>
            </div>
          </li>
        </ul>
        <Link className="quiz-btn primary" href="/quiz" style={{ marginTop: 12, minWidth: 140 }}>
          Mulai Kuis
        </Link>
      </div>
    </div>
  </section>
);
  return (
    <div>
      <header>
        <div className="topbar">
          <button className="logo-block" onClick={() => scrollToSection("home")}>
            <Image
              src="/images/logo-termokimia.png"
              alt="Logo Termokimia Eksoterm Endoterm"
              width={54}
              height={54}
            />
            <span>Termokimia</span>
          </button>
          <button
            className="menu-toggle"
            aria-label="buka menu navigasi"
            onClick={() => setMenuOpen((v) => !v)}
          >
            ☰
          </button>
          <nav className={classNames("menu-links", menuOpen && "open")} id="menuLinks">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => {
                  scrollToSection(item.href.replace("#", ""));
                  setMenuOpen(false);
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-text">
          <div className="badge-age">Kelas XI</div>
          <h1>Termokimia: Eksoterm & Endoterm</h1>
          <p>Belajar perubahan energi dalam reaksi kimia secara ringan dan interaktif.</p>
          <div className="cta-buttons">
            <button className="btn secondary" onClick={() => scrollToSection("pelajaran")}>
              Mulai Belajar
            </button>
            <button className="btn secondary" onClick={() => scrollToSection("aktivitas")}>
              Coba Aktivitas
            </button>
            <button className="btn ghost" onClick={() => setEndoMode((v) => !v)}>
              Mode: {endoMode ? "Endoterm" : "Eksoterm"}
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="thermo-card">
            <div className="mini-card">
              <strong>Eksoterm</strong>
              <small>Panas keluar, Delta H negatif.</small>
              <div className="meter">
                <span style={{ width: "70%" }} />
              </div>
            </div>
            <div className="mini-card">
              <strong>Endoterm</strong>
              <small>Panas masuk, Delta H positif.</small>
              <div className="meter">
                <span style={{ width: "30%", background: "linear-gradient(90deg, #93c178, #465c8b)" }} />
              </div>
            </div>
            <div className="mini-card">
              <strong>Delta H Tracker</strong>
              <input
                type="range"
                min={-50}
                max={50}
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
              />
              <div style={{ fontWeight: 800 }}>{energyLabel}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="kosakata">
        <div className="pill-label">📚 Kosakata / Ide Utama - Kenalan Dulu Yuk!</div>
        <div className="cards-grid">
          {vocabCards.map((card) => (
            <div
              key={card.id}
              className="card"
              style={{ cursor: "pointer" }}
              onClick={() =>
                openModal({
                  title: card.title,
                  message: card.back.join("\n"),
                })
              }
            >
              <h3 style={{ textAlign: "center" }}>{card.title}</h3>
              <p style={{ textAlign: "center", fontWeight: 700 }}>{card.front}</p>
            </div>
          ))}
        </div>
      </section>
            <section className="section" id="pelajaran">
        <div className="pill-label">🧠 Materi Pembelajaran - Eksoterm vs Endoterm</div>

        <div className="lesson-hero">
          <div>
            <p className="lesson-kicker">Eksoterm vs Endoterm</p>
            <h2 className="lesson-title">Energi dalam reaksi kimia</h2>
            <p className="lesson-sub">
              Ringkasan visual tentang arah energi, grafik sederhana, dan contoh sehari-hari.
            </p>
          </div>
          <div className="lesson-stats">
            <div>
              <span>Eksoterm</span>
              <strong>Delta H &lt; 0</strong>
            </div>
            <div>
              <span>Endoterm</span>
              <strong>Delta H &gt; 0</strong>
            </div>
          </div>
        </div>

        <div className="lesson-grid">
          <div className="lesson-card">
            <div className="lesson-chip">Apa & Mengapa</div>
            <ul className="lesson-list">
              <li>Termokimia mempelajari perubahan energi saat reaksi.</li>
              <li>Eksoterm: energi keluar, suhu sekitar naik.</li>
              <li>Endoterm: energi masuk, suhu sekitar turun.</li>
              <li>Delta H membantu memprediksi pelepasan/penyerapan panas.</li>
            </ul>
          </div>
          <div className="lesson-card diagram-card">
            <div className="lesson-chip">Diagram</div>
            <div className="diagram-lines">
              <div className="line exo">
                <div className="dot" /> Eksoterm : Reaktan (tinggi) → Produk (lebih rendah) + panas.
              </div>
              <div className="line endo">
                <div className="dot" /> Endoterm : Reaktan + panas → Produk (lebih tinggi).
              </div>
            </div>
            <div className="diagram-pill-row">
              <span className="pill warm">Eksoterm · panas keluar</span>
              <span className="pill cool">Endoterm · panas masuk</span>
            </div>
          </div>
          <div className="lesson-card">
            <div className="lesson-chip">Contoh</div>
            <ul className="lesson-list">
              <li>Pembakaran kayu → hangat + cahaya.</li>
              <li>Reaksi termit → panas besar.</li>
              <li>Mencairkan es → butuh panas.</li>
              <li>Fotosintesis → menyerap energi cahaya.</li>
            </ul>
          </div>
        </div>

        <div className="energy-panel">
          <div className="energy-header">
            <span className="pill ghost">Gerakkan slider energi</span>
            <span className="energy-value">{lessonEnergy}</span>
          </div>
          <input
            className="energy-slider"
            type="range"
            min={-50}
            max={50}
            value={lessonEnergy}
            onChange={(e) => setLessonEnergy(Number(e.target.value))}
          />
          <div className="energy-note">{lessonEnergyLabel}</div>
        </div>

        <div className="comparison-card" aria-label="perbandingan reaksi eksoterm dan endoterm">
          <div className="comparison-head">
            <div>Eksoterm</div>
            <div>Endoterm</div>
          </div>
          <div className="comparison-row">
            <div>Delta H &lt; 0 (energi keluar)</div>
            <div>Delta H &gt; 0 (energi masuk)</div>
          </div>
          <div className="comparison-row">
            <div>Suhu lingkungan naik</div>
            <div>Suhu lingkungan turun</div>
          </div>
          <div className="comparison-row">
            <div>Contoh: pembakaran, netralisasi</div>
            <div>Contoh: fotosintesis, mencairkan es</div>
          </div>
        </div>
      </section>

      <section className="section" id="aktivitas">
        <div className="pill-label">🎮 Aktivitas Interaktif - Ayo Bermain & Belajar</div>
        <div className="activities">
          <div className="activity">
            <h3>Drag & Drop</h3>
            <p>Tarik istilah ke deskripsi yang tepat.</p>
            <div className="drag-items">
              {dragItems.map((item) => (
                <div
                  key={item.id}
                  className="chip"
                  draggable={!chipHidden[item.target]}
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", item.target)}
                  style={{ visibility: chipHidden[item.target] ? "hidden" : "visible" }}
                >
                  {item.label}
                </div>
              ))}
            </div>
            <div className="drop-zones" style={{ marginTop: 8 }}>
              {dropZones.map((zone) => (
                <div
                  key={zone.id}
                  className={classNames(
                    "drop-zone",
                    dropState[zone.id]?.status === "correct" && "correct",
                    dropState[zone.id]?.status === "wrong" && "wrong"
                  )}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const data = e.dataTransfer.getData("text/plain");
                    handleDrop(zone.id, data);
                  }}
                >
                  {dropState[zone.id]?.label ?? zone.label}
                </div>
              ))}
            </div>
            <button className="btn secondary" style={{ marginTop: 10 }} onClick={resetDrag}>
              Reset Jawaban
            </button>
          </div>

          <div className="activity">
            <h3>Pilih Jawaban</h3>
            {choiceQuestions.map((q) => (
              <div key={q.id} style={{ marginBottom: 12 }}>
                <p>{q.prompt}</p>
                <div className="choice-buttons" data-question={q.id}>
                  {q.options.map((opt) => (
                    <button
                      key={opt.label}
                      className={classNames(
                        choiceState[q.id] === "correct" && opt.correct && "correct",
                        choiceState[q.id] === "wrong" && !opt.correct && "wrong"
                      )}
                      onClick={() => selectChoice(q.id, opt.correct)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="activity">
            <h3>Isi Titik-Titik</h3>
            <p>Masukkan kata: Delta H eksoterm bernilai _____</p>
            <input
              value={blankValue}
              onChange={(e) => setBlankValue(e.target.value)}
              className={classNames(
                "fill-input",
                blankFeedback.status === "correct" && "input-correct",
                blankFeedback.status === "wrong" && "input-wrong"
              )}
              placeholder="tulis positif / negatif"
            />
            <button className="btn secondary" style={{ marginTop: 8 }} onClick={checkBlank}>
              Cek Jawaban
            </button>
            <div style={{ marginTop: 8, fontWeight: 700 }}>{blankFeedback.text}</div>
          </div>

          <div className="activity">
            <h3>Kategorisasi Cepat</h3>
            <p>Pilih kelompoknya.</p>
            <div className="choice-buttons" data-question="cat1">
              {categoryItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => chooseCategory(item.label)}
                  className={classNames(
                    assignments[item.label] === "exo" && "correct",
                    assignments[item.label] === "endo" && "correct"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="category-zones" style={{ marginTop: 8 }}>
              <div className="drop-zone" aria-label="kelompok eksoterm">
                {exoList.length ? (
                  <>
                    <div className="label">Eksoterm:</div>
                    <ul>
                      {exoList.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  "Eksoterm"
                )}
              </div>
              <div className="drop-zone soft-blue" aria-label="kelompok endoterm">
                {endoList.length ? (
                  <>
                    <div className="label">Endoterm:</div>
                    <ul>
                      {endoList.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  "Endoterm"
                )}
              </div>
            </div>
            <button className="btn secondary" style={{ marginTop: 10 }} onClick={resetCategory}>
              Reset Kategori
            </button>
          </div>
        </div>
      </section>

      <section className="section" id="cerita">
        <div className="pill-label"> 📖 Cerita Bergambar</div>
        <div className="story-box">
          <p style={{ fontWeight: 800 }}>
            Petualangan Thermo & Chem di Dunia Energi: buka pintu Eksoterm dan Endoterm, rasakan
            perpindahan panas, pahami ΔH, dan lihat contoh nyata.
          </p>
          <div className="story-actions">
            <button
              className="quiz-btn primary"
              onClick={() =>
                openModal({
                  title: "Petualangan Thermo & Chem",
                  message: thermoStoryFull,
                })
              }
            >
              Baca Cerita Lengkap
            </button>
            <button
              className="quiz-btn secondary"
              onClick={() =>
                openModal({
                  title: "Pertanyaan untuk Siswa",
                  message: thermoQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n\n"),
                })
              }
            >
              Lihat Pertanyaan
            </button>
          </div>
          <div className="story-illustration">
            <Image
              src={thermoHeroImage}
              alt="Petualangan Thermo dan Chem: pintu eksoterm dan endoterm"
              width={1200}
              height={800}
              priority
            />
          </div>
        </div>
      </section>
      {quizBanner}

      <section className="section" id="tambahan">
        <div className="pill-label">🧠 Materi Tambahan - Bonus Belajar Interaktif</div>
        <div className="card">
          <div className="tabs-row">
            {[
              { key: "flashcards", label: "Kartu Belajar" },
              { key: "organizer", label: "Peta Konsep" },
              { key: "memory", label: "Memory Game" },
              { key: "experiment", label: "Virtual Lab" },
              { key: "sentences", label: "Rumus Penting" },
              { key: "wordwall", label: "Referensi & Glosarium" },
            ].map((tab) => (
              <button
                key={tab.key}
                className={classNames("tab-btn", activeTab === tab.key && "active")}
                onClick={() =>
                  setActiveTab(
                    tab.key as
                      | "flashcards"
                      | "organizer"
                      | "memory"
                      | "experiment"
                      | "sentences"
                      | "wordwall"
                  )
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "flashcards" && (
            <div className="tab-content active animate-in" id="tab-flashcards">
              <h3>Kartu Belajar - Klik untuk Balik</h3>
              <div className="flash-grid">
                {flashcards.map((card) => (
                  <div key={card.id} className="flashcard" onClick={() => toggleFlashcard(card.id)}>
                    <div className={classNames("flash-inner", flippedCards[card.id] && "flip")}>
                      <div className="flash-face">
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
                          <strong>{card.title}</strong>
                        </div>
                      </div>
                      <div className="flash-face back">
                        <div style={{ textAlign: "center", fontSize: 14 }}>
                          {card.back.map((line) => (
                            <div key={line}>{line}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "organizer" && (
            <div className="tab-content active animate-in" id="tab-organizer">
              <h3>Peta Konsep - Klik untuk Highlight</h3>
              <div className="organizer">
                <div className="organizer-node active">Reaksi Kimia</div>
                <div className="organizer-grid">
                  <div>
                    <div
                      className="organizer-node"
                      onMouseEnter={() => setActiveNode("eksoterm")}
                      onClick={() => setActiveNode("eksoterm")}
                    >
                      EKSOTERM
                    </div>
                    <div className="organizer-sub">
                      <div
                        className={classNames(
                          "organizer-node",
                          activeNode === "ekso-delta" && "active"
                        )}
                        onMouseEnter={() => setActiveNode("ekso-delta")}
                        onClick={() => setActiveNode("ekso-delta")}
                      >
                        Delta H &lt; 0
                      </div>
                      <div
                        className={classNames(
                          "organizer-node",
                          activeNode === "ekso-suhu" && "active"
                        )}
                        onMouseEnter={() => setActiveNode("ekso-suhu")}
                        onClick={() => setActiveNode("ekso-suhu")}
                      >
                        Suhu Naik
                      </div>
                      <div
                        className={classNames(
                          "organizer-node",
                          activeNode === "ekso-energi" && "active"
                        )}
                        onMouseEnter={() => setActiveNode("ekso-energi")}
                        onClick={() => setActiveNode("ekso-energi")}
                      >
                        Produk Energi Rendah
                      </div>
                    </div>
                  </div>
                  <div>
                    <div
                      className="organizer-node"
                      onMouseEnter={() => setActiveNode("endoterm")}
                      onClick={() => setActiveNode("endoterm")}
                    >
                      ENDOTERM
                    </div>
                    <div className="organizer-sub">
                      <div
                        className={classNames(
                          "organizer-node",
                          activeNode === "endo-delta" && "active"
                        )}
                        onMouseEnter={() => setActiveNode("endo-delta")}
                        onClick={() => setActiveNode("endo-delta")}
                      >
                        Delta H &gt; 0
                      </div>
                      <div
                        className={classNames(
                          "organizer-node",
                          activeNode === "endo-suhu" && "active"
                        )}
                        onMouseEnter={() => setActiveNode("endo-suhu")}
                        onClick={() => setActiveNode("endo-suhu")}
                      >
                        Suhu turun → Delta H positif.
                      </div>
                      <div
                        className={classNames(
                          "organizer-node",
                          activeNode === "endo-energi" && "active"
                        )}
                        onMouseEnter={() => setActiveNode("endo-energi")}
                        onClick={() => setActiveNode("endo-energi")}
                      >
                        Produk Energi Tinggi
                      </div>
                    </div>
                  </div>
                </div>
                <div className="organizer-info">
                  <strong>Info:</strong>{" "}
                  {organizerInfo[activeNode] ||
                    "Klik node di atas untuk melihat informasi detail."}
                </div>
              </div>
            </div>
          )}

          {activeTab === "memory" && (
            <div className="tab-content active animate-in" id="tab-memory">
              <h3>Memory Game - Cari Pasangan!</h3>
              <div className="memory-shell">
                <div className="memory-meta">
                  <div>
                    <strong>Kecocokan:</strong> {memoryMatched.size / 2}/{memoryPairs.length}
                  </div>
                  <div>
                    <strong>Coba:</strong> {memoryAttempts}
                  </div>
                  <button className="btn primary" onClick={initMemoryGame}>
                    Reset
                  </button>
                </div>
                <div id="memory-board">
                  {memoryCards.map((card, idx) => {
                    const flipped = memoryFlipped.includes(idx) || memoryMatched.has(idx);
                    return (
                      <div
                        key={card.id}
                        className={classNames(
                          "memory-card",
                          flipped && "flipped",
                          memoryMatched.has(idx) && "matched"
                        )}
                        onClick={() => flipMemoryCard(idx)}
                      >
                        <div className="memory-card-inner">
                          <div className="memory-card-front">?</div>
                          <div className="memory-card-back" aria-label={card.label}>
                            <div style={{ fontSize: 24 }}>{card.icon}</div>
                            <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                              {card.label}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "experiment" && (
            <div className="tab-content active animate-in" id="tab-experiment">
              <h3>Laboratorium Virtual</h3>
              <div className="experiment-grid">
                {experiments.map((exp) => (
                  <div key={exp.title} className="card">
                    <h4 style={{ marginTop: 0 }}>{exp.title}</h4>
                    {exp.steps.map((step, idx) => (
                      <div className="experiment-step" key={step}>
                        <div className="step-number">{idx + 1}</div>
                        <div>{step}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "sentences" && (
            <div className="tab-content active animate-in" id="tab-sentences">
              <h3>Rumus Penting</h3>
              <div className="experiment-grid">
                {sentenceTemplates.map((text) => (
                  <div className="card" key={text}>
                    <div className="sentence-frame">{text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "wordwall" && (
            <div className="tab-content active animate-in" id="tab-wordwall">
              <h3>Tabel Entalpi Pembentukan Standar (ΔHf°)</h3>
              <div className="ref-card">
                <div className="ref-table">
                  <div className="ref-head">
                    <div>Senyawa</div>
                    <div>Rumus</div>
                    <div>ΔHf° (kJ/mol)</div>
                  </div>
                  {enthalpyTable.map((row) => (
                    <div className="ref-row" key={row.name}>
                      <div>{row.name}</div>
                      <div>{row.formula}</div>
                      <div>{row.dhf}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Image
              src="/images/logo-termokimia.png"
              alt="Logo Termokimia"
              width={48}
              height={48}
            />
            <div>
              <strong>Termokimia Interaktif</strong>
              <div className="foot-note">Eksoterm & Endoterm untuk siswa</div>
            </div>
          </div>
          <div className="footer-links">
            <a href="#home">Beranda</a>
            <a href="#pelajaran">Pelajaran</a>
            <a href="#aktivitas">Aktivitas</a>
            <Link href="/quiz">Kuis</Link>
            <a href="#tambahan">Materi Tambahan</a>
          </div>
          <div className="footer-meta">
            <div>Kontak: natasyarachmawati6@gmail.com</div>
            <div className="foot-note">Didesain untuk belajar mandiri dan kelas.</div>
          </div>
        </div>
      </footer>

      {modal && (
        <div className="quiz-modal-backdrop" onClick={closeModal}>
          <div className="quiz-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{modal.title}</h3>
            <p>{modal.message}</p>
            <div className="quiz-modal-actions">
              {(modal.actions || [
                {
                  label: "Tutup",
                  variant: "primary" as const,
                  onClick: closeModal,
                },
              ]).map((action) => (
                <button
                  key={action.label}
                  className={classNames(
                    "quiz-btn",
                    action.variant === "primary" && "primary",
                    action.variant === "secondary" && "secondary",
                    action.variant === "ghost" && "ghost"
                  )}
                  onClick={() => {
                    action.onClick?.();
                    if (!action.onClick) closeModal();
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
