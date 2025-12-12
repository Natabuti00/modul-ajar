      // Progress tracker (not used in UI anymore, kept for future hooks)
      const progressGoals = new Set([
        "drop1",
        "drop2",
        "drop3",
        "drop4",
        "q1",
        "q2",
        "blank",
        "cat1",
        "t1",
        "t2",
        "t3",
        "t4",
        "t5",
      ]);
      const progressState = {};
      function markDone(key) {
        if (!progressGoals.has(key) || progressState[key]) return;
        progressState[key] = true;
      }
      // Modal helpers
      const modal = document.getElementById("appModal");
      const modalTitle = document.getElementById("modalTitle");
      const modalMsg = document.getElementById("modalMessage");
      const modalActions = document.getElementById("modalActions");
      function hideModal() {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
      }
      function showModal(title, msg, actions) {
        modalTitle.textContent = title;
        modalMsg.textContent = msg;
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        modalActions.innerHTML = "";
        const acts =
          actions ||
          [
            {
              label: "Tutup",
              className:
                "px-4 py-2 rounded-lg bg-[#465c8b] text-white font-bold shadow-md hover:translate-y-[-1px] transition",
              onClick: hideModal,
            },
          ];
        acts.forEach((act) => {
          const b = document.createElement("button");
          b.textContent = act.label;
          b.className = act.className;
          b.addEventListener("click", () => {
            if (act.onClick) act.onClick();
          });
          modalActions.appendChild(b);
        });
      }
      modal.addEventListener("click", (e) => {
        if (e.target === modal) hideModal();
      });

      // Mode toggle
      const modeToggle = document.getElementById("modeToggle");
      modeToggle.addEventListener("click", () => {
        document.body.classList.toggle("endo-mode");
        modeToggle.textContent = document.body.classList.contains("endo-mode")
          ? "Mode: Endoterm"
          : "Mode: Eksoterm";
      });

      // Hero meter slider
      const energyRange = document.getElementById("energyRange");
      const energyLabel = document.getElementById("energyLabel");
      energyRange.addEventListener("input", () => {
        const val = Number(energyRange.value);
        if (val > 10) {
          energyLabel.textContent = "Endoterm: butuh panas dari sekitar";
        } else if (val < -10) {
          energyLabel.textContent = "Eksoterm: melepas panas ke sekitar";
        } else {
          energyLabel.textContent = "Seimbang: butuh bukti!";
        }
      });

      // Energy slider in lesson
      const energyRange2 = document.getElementById("energyRange2");
      const energyLabel2 = document.getElementById("energyLabel2");
      energyRange2.addEventListener("input", () => {
        const val = Number(energyRange2.value);
        if (val > 20) {
          energyLabel2.textContent =
            "Endoterm kuat: produk butuh energi tinggi.";
        } else if (val < -20) {
          energyLabel2.textContent =
            "Eksoterm kuat: produk lebih rendah energinya.";
        } else if (val >= -20 && val <= 20) {
          energyLabel2.textContent =
            "Sedang: lihat grafik untuk petunjuk energi.";
        }
      });

      // Flip cards
      document.querySelectorAll(".flip-card").forEach((card) => {
        const inner = card.querySelector(".flip-inner");
        card.addEventListener("click", () => inner.classList.toggle("flip"));
      });

      // Drag and drop matching
    const chips = document.querySelectorAll(".chip");
    const zones = document.querySelectorAll(".drop-zone[data-accept]");
    let dragSolved = 0;
    chips.forEach((chip) => {
      chip.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", chip.dataset.target);
        e.dataTransfer.effectAllowed = "move";
      });
    });
    zones.forEach((zone, idx) => {
      zone.addEventListener("dragover", (e) => e.preventDefault());
      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData("text/plain");
        // reset visual
        zone.classList.remove("wrong");
        if (!zone.dataset.original) {
          zone.dataset.original = zone.textContent;
        }
        if (zone.dataset.accept === data) {
          zone.classList.add("correct");
          zone.textContent = "Cocok!";
          const chipEl = [...chips].find((c) => c.dataset.target === data);
          if (chipEl) {
            chipEl.style.visibility = "hidden";
            chipEl.setAttribute("draggable", "false");
          }
          dragSolved += 1;
          markDone("drop" + (idx + 1));
          if (dragSolved >= 4) {
            showModal("Keren!", "Selamat! Semua jawaban drag & drop benar.");
          }
        } else {
          zone.classList.remove("correct");
          zone.classList.add("wrong");
          const original = zone.dataset.original || zone.textContent;
          zone.textContent = "Coba lagi";
          setTimeout(() => {
            zone.classList.remove("wrong");
            zone.textContent = original;
          }, 2000);
        }
      });
      });

      // Reset drag & drop
      function resetDrag() {
        dragSolved = 0;
      chips.forEach((chip) => {
        chip.style.visibility = "visible";
        chip.setAttribute("draggable", "true");
      });
      zones.forEach((zone, idx) => {
        zone.classList.remove("correct", "wrong");
        const labels = [
          "Panas keluar",
          "Panas masuk",
          "Nilai + atau -",
          "Naik turun energi",
        ];
        zone.textContent = labels[idx] || "Tempatkan di sini";
      });
    }

    // Reset kategori
    function resetKategori() {
      catSolved.clear();
      exoList.length = 0;
      endoList.length = 0;
      renderCatZones();
      document.querySelectorAll('[data-question="cat1"] button').forEach((b) => {
        b.classList.remove("correct", "wrong");
        b.disabled = false;
      });
      if (exoZone) exoZone.classList.remove("correct");
      if (endoZone) endoZone.classList.remove("correct");
    }

      const exoZone = document.querySelector(
        '[aria-label="kelompok eksoterm"]'
      );
      const endoZone = document.querySelector(
        '[aria-label="kelompok endoterm"]'
      );
      const menuToggle = document.getElementById("menuToggle");
      const menuLinks = document.getElementById("menuLinks");
    const catAnswers = {
      "Es batu terbentuk": "exo",
      "Besi berkarat hangat": "exo",
      "Es meleleh di tangan": "endo",
      "Fotosintesis daun": "endo",
    };
      const catSolved = new Set();
      const exoList = [];
      const endoList = [];
      const exoBase = exoZone ? exoZone.textContent : "";
      const endoBase = endoZone ? endoZone.textContent : "";
      function renderCatZones() {
        if (exoZone) {
          exoZone.style.textAlign = "left";
          exoZone.innerHTML =
            exoList.length > 0
              ? `<div class="text-sm font-bold text-[#233237] mb-1">Eksoterm:</div><ul class="list-disc list-inside text-sm font-semibold text-[#233237]">${exoList
                  .map((i) => `<li>${i}</li>`)
                  .join("")}</ul>`
              : exoBase;
          exoZone.style.background = "#f7f2d4";
        }
        if (endoZone) {
          endoZone.style.textAlign = "left";
          endoZone.innerHTML =
            endoList.length > 0
              ? `<div class="text-sm font-bold text-[#233237] mb-1">Endoterm:</div><ul class="list-disc list-inside text-sm font-semibold text-[#233237]">${endoList
                  .map((i) => `<li>${i}</li>`)
                  .join("")}</ul>`
              : endoBase;
        }
      }

      // Multiple choice highlighting
      document.querySelectorAll(".choice-buttons").forEach((group) => {
        const qId = group.dataset.question;
        group.querySelectorAll("button").forEach((btn) => {
          btn.addEventListener("click", () => {
            group
              .querySelectorAll("button")
              .forEach((b) => b.classList.remove("correct", "wrong"));
            if (qId === "cat1") {
              const text = btn.textContent.trim();
              const allCatButtons = group.querySelectorAll("button");
              const choiceActions = [
                {
                  label: "Eksoterm",
                  value: "exo",
                  className:
                    "px-3 py-2 rounded-lg bg-[#f7f2d4] border-2 border-[#233237] font-bold text-[#233237]",
                },
                {
                  label: "Endoterm",
                  value: "endo",
                  className:
                    "px-3 py-2 rounded-lg bg-[#e1e7f3] border-2 border-[#233237] font-bold text-[#233237]",
                },
              ];
              showModal(
                "Pilih Kelompok",
                `Kelompokkan: ${text}`,
                choiceActions.map((act) => ({
                  label: act.label,
                  className: act.className,
                  onClick: () => {
                    const expectedSide = catAnswers[text];
                    const chosenSide = act.value;
                    if (expectedSide && chosenSide === expectedSide) {
                      btn.classList.add("correct");
                      btn.disabled = true;
                      if (expectedSide === "exo" && !exoList.includes(text)) {
                        exoList.push(text);
                        if (exoZone) exoZone.classList.add("correct");
                      }
                      if (expectedSide === "endo" && !endoList.includes(text)) {
                        endoList.push(text);
                        if (endoZone) endoZone.classList.add("correct");
                      }
                      renderCatZones();
                      catSolved.add(text);
                      if (catSolved.size === Object.keys(catAnswers).length) {
                        markDone("cat1");
                        showModal("Mantap!", "Semua kategori sudah benar!");
                        allCatButtons.forEach((b) => (b.disabled = true));
                      } else {
                        hideModal();
                      }
                    } else {
                      btn.classList.add("wrong");
                      hideModal();
                    }
                  },
                }))
              );
              return;
            }
            if (btn.dataset.correct) {
              btn.classList.add("correct");
              if (qId) markDone(qId);
              showModal("Mantap!", "Jawabanmu benar.");
            } else {
              btn.classList.add("wrong");
            }
          });
        });
      });

      // Fill in the blank checker
      function checkBlank() {
        const val = document
          .getElementById("blankInput")
          .value.trim()
          .toLowerCase();
      const res = document.getElementById("blankResult");
      const inputBox = document.getElementById("blankInput");
      if (val.includes("negatif")) {
        res.textContent = "Benar! Delta H eksoterm bernilai negatif.";
        res.style.color = "#0c8c55";
        inputBox.style.borderColor = "#0c8c55";
        showModal("Mantap!", "Jawaban benar: ΔH eksoterm bernilai negatif.");
        markDone("blank");
      } else if (val === "") {
        res.textContent = "Tulis dulu ya!";
        res.style.color = "#18121e";
        inputBox.style.borderColor = "#18121e";
      } else {
        res.textContent =
          "Belum tepat. Delta H eksoterm itu negatif karena reaksi melepas panas ke lingkungan.";
        res.style.color = "#c0392b";
        inputBox.style.borderColor = "#c0392b";
        inputBox.classList.add("shake");
        setTimeout(() => inputBox.classList.remove("shake"), 400);
        showModal(
          "Kurang tepat",
          "ΔH eksoterm harus bernilai negatif (panas keluar). Coba lagi!"
          );
        }
      }

      // Toggle pills for matching symbols
      document.querySelectorAll(".pill[data-toggle]").forEach((pill) => {
        pill.addEventListener("click", () => {
          pill.classList.toggle("checked");
        });
      });

      // Flashcard flip
      document.querySelectorAll(".flashcard").forEach((card) => {
        const inner = card.querySelector(".flash-inner");
        card.addEventListener("click", () => inner.classList.toggle("flip"));
      });

      // Hamburger toggle
      if (menuToggle && menuLinks) {
        menuToggle.addEventListener("click", () => {
          menuLinks.classList.toggle("open");
        });
        menuLinks.querySelectorAll("a").forEach((link) => {
          link.addEventListener("click", () =>
            menuLinks.classList.remove("open")
          );
        });
      }

      // Bonus tabs & mini games
      const bonusTabButtons = document.querySelectorAll("#tambahan .tab-btn");
      const bonusTabContents = document.querySelectorAll("#tambahan .tab-content");

      const organizerInfoMap = {
        reaksi:
          "Reaksi Kimia: Proses perubahan zat dari reaktan menjadi produk dengan perubahan energi.",
        eksoterm: "EKSOTERM: Reaksi yang melepaskan energi panas ke lingkungan.",
        endoterm: "ENDOTERM: Reaksi yang menyerap energi panas dari lingkungan.",
        "ekso-delta": "ΔH < 0 (negatif): Produk memiliki energi lebih rendah dari reaktan.",
        "ekso-suhu":
          "Suhu Lingkungan NAIK: Panas yang dilepaskan membuat sekitar lebih panas.",
        "ekso-energi": "Diagram Energi: Produk berada di bawah reaktan.",
        "endo-delta": "ΔH > 0 (positif): Produk memiliki energi lebih tinggi dari reaktan.",
        "endo-suhu":
          "Suhu Lingkungan TURUN: Panas dari sekitar diserap oleh reaksi.",
        "endo-energi": "Diagram Energi: Produk berada di atas reaktan.",
      };

      const organizerInfoEl = document.getElementById("organizer-info");
      document.querySelectorAll(".organizer-node").forEach((node) => {
        node.addEventListener("click", () => {
          document
            .querySelectorAll(".organizer-node")
            .forEach((n) => n.classList.remove("active"));
          node.classList.add("active");
          const concept = node.dataset.concept;
          if (organizerInfoEl) {
            organizerInfoEl.textContent =
              organizerInfoMap[concept] || "Klik node lain untuk info";
          }
        });
      });

      // Memory game
      const memoryPairs = [
        { icon: "🔥", label: "Eksoterm" },
        { icon: "❄️", label: "Endoterm" },
        { icon: "📊", label: "ΔH" },
        { icon: "⚛️", label: "Reaksi" },
        { icon: "🌡️", label: "Panas" },
        { icon: "⬆️", label: "Naik" },
        { icon: "⬇️", label: "Turun" },
        { icon: "🧪", label: "Katalis" },
        { icon: "📈", label: "Grafik" },
        { icon: "🌍", label: "Sistem" },
        { icon: "🔀", label: "Reaktan" },
      ];
      let memoryCards = [];
      let memoryFlipped = [];
      let memoryMatches = 0;
      let memoryAttempts = 0;
      let memoryInitialized = false;
      const memoryBoard = document.getElementById("memory-board");
      const memoryMatchesEl = document.getElementById("memory-matches");
      const memoryAttemptsEl = document.getElementById("memory-attempts");
      const memoryTotalEl = document.getElementById("memory-total");
      const memoryResetBtn = document.getElementById("memory-reset-btn");

      function buildMemoryBoard() {
        if (!memoryBoard) return;
        memoryInitialized = true;
        memoryCards = [...memoryPairs, ...memoryPairs].sort(
          () => Math.random() - 0.5
        );
        memoryFlipped = [];
        memoryMatches = 0;
        memoryAttempts = 0;
        if (memoryMatchesEl) memoryMatchesEl.textContent = "0";
        if (memoryAttemptsEl) memoryAttemptsEl.textContent = "0";
        if (memoryTotalEl) memoryTotalEl.textContent = memoryPairs.length;
        memoryBoard.innerHTML = "";
        memoryCards.forEach((card, idx) => {
          const cardEl = document.createElement("div");
          cardEl.className = "memory-card";
          cardEl.dataset.index = idx;
          cardEl.dataset.value = card.icon;
          cardEl.innerHTML = `
            <div class="memory-card-inner">
              <div class="memory-card-front">?</div>
              <div class="memory-card-back" aria-label="${card.label}">
                <div style="font-size:26px;">${card.icon}</div>
                <div style="font-size:11px; font-weight:700; margin-top:4px;">${card.label}</div>
              </div>
            </div>`;
          cardEl.addEventListener("click", () => flipMemoryCard(idx));
          memoryBoard.appendChild(cardEl);
        });
      }

      function flipMemoryCard(idx) {
        const card = document.querySelector(`.memory-card[data-index="${idx}"]`);
        if (!card || card.classList.contains("flipped") || card.classList.contains("matched")) return;
        card.classList.add("flipped");
        memoryFlipped.push(idx);
        if (memoryFlipped.length === 2) {
          memoryAttempts += 1;
          if (memoryAttemptsEl) memoryAttemptsEl.textContent = memoryAttempts;
          const card1 = document.querySelector(
            `.memory-card[data-index="${memoryFlipped[0]}"]`
          );
          const card2 = document.querySelector(
            `.memory-card[data-index="${memoryFlipped[1]}"]`
          );
          if (
            card1 &&
            card2 &&
            card1.dataset.value === card2.dataset.value
          ) {
            card1.classList.add("matched");
            card2.classList.add("matched");
            memoryMatches += 1;
            if (memoryMatchesEl) memoryMatchesEl.textContent = memoryMatches;
            memoryFlipped = [];
            if (memoryMatches === memoryPairs.length) {
              showModal(
                "🎉 Selesai!",
                `Kamu mencocokkan semua pasangan dalam ${memoryAttempts} kali coba!`
              );
            }
          } else {
            setTimeout(() => {
              memoryFlipped.forEach((i) => {
                const c = document.querySelector(`.memory-card[data-index="${i}"]`);
                if (c) c.classList.remove("flipped");
              });
              memoryFlipped = [];
            }, 800);
          }
        }
      }

      function resetMemoryGame() {
        memoryInitialized = false;
        buildMemoryBoard();
      }

      if (memoryResetBtn) {
        memoryResetBtn.addEventListener("click", resetMemoryGame);
      }

      // Tabs handler
      function showBonusTab(tabName) {
        bonusTabContents.forEach((tab) => {
          tab.style.display = "none";
          tab.classList.remove("active");
        });
        bonusTabButtons.forEach((btn) => btn.classList.remove("active"));
        const target = document.getElementById(`tab-${tabName}`);
        const btn = document.querySelector(
          `#tambahan .tab-btn[data-tab="${tabName}"]`
        );
        if (target) {
          target.style.display = "block";
          target.classList.add("active");
        }
        if (btn) btn.classList.add("active");
        if (tabName === "memory") {
          buildMemoryBoard();
        }
        if (tabName === "quiz") {
          initBonusQuiz();
        }
      }

      if (bonusTabButtons.length) {
        showBonusTab("flashcards");
        bonusTabButtons.forEach((btn) => {
          btn.addEventListener("click", () => showBonusTab(btn.dataset.tab));
        });
      }
