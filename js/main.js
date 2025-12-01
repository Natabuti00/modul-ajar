// Progress tracker
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
      const scoreValue = document.getElementById("scoreValue");
      const scoreTotal = document.getElementById("scoreTotal");
      const scoreFill = document.getElementById("scoreFill");
      scoreTotal.textContent = progressGoals.size;
      function markDone(key) {
        if (!progressGoals.has(key) || progressState[key]) return;
        progressState[key] = true;
        const done = Object.keys(progressState).length;
        const percent = Math.round((done / progressGoals.size) * 100);
        scoreValue.textContent = done;
        scoreFill.style.width = percent + "%";
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
