import ExcelJS from "exceljs";

export async function parseQuizExcel(filePath) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  const sheets = [];

  wb.eachSheet((ws) => {
    const questions = [];
    ws.eachRow((row, idx) => {
      if (idx === 1) return; 

      const vals = row.values; 
      const q       = vals[1];
      const a       = vals[2];
      const b       = vals[3];
      const c       = vals[4];
      const d       = vals[5];
      const ans     = vals[6];
      const explain = vals[7];

      if (!q) return;

      const ansRaw = String(ans || "").trim().toLowerCase();
      const answer = "abcd".indexOf(ansRaw);
      if (answer === -1) return; 

      questions.push({
        q: String(q).trim(),
        options: [a, b, c, d].map((x) => String(x == null ? "" : x).trim()),
        answer,
        explain: String(explain == null ? "" : explain).trim()
      });
    });

    sheets.push({ title: ws.name, questions });
  });

  return { sheets };
}

export async function parseFlashcardExcel(filePath) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  const ws = wb.worksheets[0];
  if (!ws) return { cards: [] };

  const cards = [];
  ws.eachRow((row, idx) => {
    if (idx === 1) return; 

    const vals = row.values; 
    const emoji = vals[1];
    const front = vals[2];
    const backCells = vals.slice(3); 

    if (!front) return;

    const back = backCells
      .filter((b) => b != null && String(b).trim() !== "")
      .map((b) => String(b).trim());

    if (back.length === 0) return;

    cards.push({
      emoji: String(emoji || "💡").trim() || "💡",
      front: String(front).trim(),
      back
    });
  });

  return { cards };
}

export async function parseReportsExcel(filePath) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  const ws = wb.worksheets[0];
  if (!ws) return { reports: [] };

  const reports = [];
  ws.eachRow((row, idx) => {
    if (idx === 1) return; 

    const vals = row.values;
    const title        = vals[1];
    const slug         = vals[2];
    const description  = vals[3];
    const embedUrl     = vals[4];
    const icon         = vals[5];
    const sortOrder    = vals[6];
    const accessEmails = vals[7];

    if (!title || !embedUrl) return;

    let emailList = [];
    if (accessEmails) {
      emailList = String(accessEmails)
        .split(/[,;]/)
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.includes("@"));
    }

    reports.push({
      title: String(title).trim(),
      slug: slug ? String(slug).trim().toLowerCase() : "",
      description: description ? String(description).trim() : "",
      embedUrl: String(embedUrl).trim(),
      icon: String(icon || "📊").trim() || "📊",
      sort_order: Number(sortOrder) || 0,
      access_emails: emailList
    });
  });

  return { reports };
}

export async function buildTemplate(type) {
  if (type === "monthly-quiz") type = "quiz";

  const wb = new ExcelJS.Workbook();

  if (type === "quiz") {
    const ws = wb.addWorksheet("Chapter 1");
    ws.columns = [
      { header: "q",        width: 40 },
      { header: "option_a", width: 25 },
      { header: "option_b", width: 25 },
      { header: "option_c", width: 25 },
      { header: "option_d", width: 25 },
      { header: "answer",   width: 10 },
      { header: "explain",  width: 40 }
    ];
    ws.addRow([
      "Apa langkah pertama?",
      "PDKT", "Promo", "Bongkar rak", "Minta order",
      "a",
      "PDKT dulu."
    ]);
  } else if (type === "flashcards") {
    const ws = wb.addWorksheet("FunFact");
    ws.columns = [
      { header: "emoji", width: 8 },
      { header: "front", width: 40 },
      { header: "back1", width: 50 },
      { header: "back2", width: 50 },
      { header: "back3", width: 50 }
    ];
    ws.addRow(["🌭", "Tahukah kamu?", "Fakta 1", "Fakta 2", ""]);
  } else {
    throw new Error(`Template type tidak dikenal: ${type}`);
  }

  return wb.xlsx.writeBuffer();
}