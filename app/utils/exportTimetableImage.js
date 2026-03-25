import html2canvas from "html2canvas";
import { PERIOD_TIMINGS, getColor } from "@/lib/timetable";

export async function exportTimetableImage({
  days,
  subjects,
  overrides,
  findSubject,
}) {
  const container = document.createElement("div");

  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.background = "#f9fafb";
  container.style.padding = "30px";
  container.style.fontFamily = "Inter, sans-serif";

  const wrapper = document.createElement("div");
  wrapper.style.background = "white";
  wrapper.style.borderRadius = "16px";
  wrapper.style.padding = "24px";
  wrapper.style.boxShadow = "0 12px 30px rgba(0,0,0,0.12)";
  wrapper.style.width = "1400px";

  // =========================
  // 🔥 FINAL HEADER (ALL IN ONE ROW)
  // =========================
  const header = document.createElement("div");

  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.justifyContent = "space-between";
  header.style.width = "100%";
  header.style.marginBottom = "20px";

  // 🔷 LOGO
  const logo = document.createElement("div");

logo.innerHTML = `
<svg width="210" height="50" viewBox="0 0 210 50" xmlns="http://www.w3.org/2000/svg">

  <rect x="0" y="8" width="34" height="34" rx="10" fill="url(#grad)" />

  <text x="17" y="25"
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="16"
        font-weight="700"
        fill="white"
        font-family="Inter, sans-serif">
    A
  </text>

  <text x="38" y="26"
        dominant-baseline="middle"
        font-size="18"
        font-family="Inter, sans-serif"
        fill="#111827">

    <tspan font-weight="500">cademia</tspan>
    <tspan font-weight="700">DeX</tspan>

  </text>

  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#000000"/>
      <stop offset="100%" stop-color="#374151"/>
    </linearGradient>
  </defs>

</svg>
`;

  // 🔷 TITLE (CENTERED PERFECTLY)
  const title = document.createElement("div");
  title.innerText = "Timetable";

  title.style.fontSize = "22px";
  title.style.fontWeight = "700";
  title.style.textAlign = "center";
  title.style.flex = "1";

  // 🔷 LINK (BADGE STYLE)
  const link = document.createElement("div");
  link.innerText = "academiadex.vercel.app";

link.style.fontSize = "13px"; // 🔥 slightly bigger
link.style.fontWeight = "500";
link.style.color = "white";
link.style.background = "black";
link.style.height = "32px";            // 🔥 fixed height
link.style.padding = "8px 16px"; // 🔥 better vertical balance
link.style.borderRadius = "999px";

// 🔥 PERFECT CENTERING
link.style.display = "flex";
link.style.alignItems = "center";
link.style.justifyContent = "center";

// 🔥 Optional polish
link.style.lineHeight = "1"; // removes vertical offset
link.style.transform = "translateY(1px)"; // tiny visual correction
link.style.letterSpacing = "0.2px";

  // 🔥 BALANCE SIDES
  logo.style.minWidth = "220px";
  link.style.minWidth = "200px";
  link.style.textAlign = "right";

  header.appendChild(logo);
  header.appendChild(title);
  header.appendChild(link);

  // divider
  const divider = document.createElement("div");
  divider.style.height = "1px";
  divider.style.background = "#e5e7eb";
  divider.style.marginBottom = "20px";

  wrapper.appendChild(header);
  wrapper.appendChild(divider);

  // =========================
  // TABLE
  // =========================
  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";
  table.style.tableLayout = "fixed";

  const colWidth = `${100 / (PERIOD_TIMINGS.length + 1)}%`;

  const headerRow = document.createElement("tr");

  const corner = document.createElement("th");
  corner.innerText = "Day";
  styleHeader(corner, colWidth);
  headerRow.appendChild(corner);

  PERIOD_TIMINGS.forEach((p) => {
    const th = document.createElement("th");
    th.innerText = `${p.start}\n${p.end}`;
    styleHeader(th, colWidth);
    headerRow.appendChild(th);
  });

  table.appendChild(headerRow);

  // =========================
  // ROWS
  // =========================
  days.forEach(([day, periodsObj]) => {
    const row = document.createElement("tr");

    const dayCell = document.createElement("td");
    dayCell.innerText = day;
    styleDayCell(dayCell, colWidth);
    row.appendChild(dayCell);

    PERIOD_TIMINGS.forEach((p) => {
      const td = document.createElement("td");

      const key = `${day}-${p.name}`;
      let subject = null;

      if (key in overrides) {
        const code = overrides[key];
        subject = subjects.find((s) => s.course_code === code);
      } else {
        subject = findSubject(periodsObj[p.name]);
      }

      if (subject) {
        const colorClass = getColor(
          subject.course_code ||
            subject.slot ||
            subject.course_title
        );

        applyTailwindColor(td, colorClass);
      } else {
        td.style.background = "#f3f4f6";
      }

      td.innerHTML = subject
        ? `
          <div style="font-weight:600; font-size:13px;">
            ${subject.course_title}
          </div>
          <div style="font-size:11px; margin-top:4px;">
            ${subject.faculty_name}
          </div>
          <div style="font-size:10px; color:#6b7280;">
            ${subject.room_no}
          </div>
        `
        : `<div style="font-size:12px; color:#9ca3af;">Free</div>`;

      styleCell(td, colWidth);
      row.appendChild(td);
    });

    table.appendChild(row);
  });

  wrapper.appendChild(table);
  container.appendChild(wrapper);
  document.body.appendChild(container);

  const canvas = await html2canvas(container, {
    scale: 2,
  });

  const linkEl = document.createElement("a");
  linkEl.download = "timetable.png";
  linkEl.href = canvas.toDataURL();
  linkEl.click();

  document.body.removeChild(container);
}

// =========================
// STYLES
// =========================
function styleHeader(cell, width) {
  cell.style.border = "1px solid #e5e7eb";
  cell.style.padding = "10px";
  cell.style.fontSize = "12px";
  cell.style.fontWeight = "600";
  cell.style.textAlign = "center";
  cell.style.whiteSpace = "pre-line";
  cell.style.background = "#f3f4f6";
  cell.style.width = width;
  cell.style.height = "70px";
}

function styleDayCell(cell, width) {
  cell.style.border = "1px solid #e5e7eb";
  cell.style.padding = "10px";
  cell.style.fontWeight = "600";
  cell.style.textAlign = "center";
  cell.style.background = "#f9fafb";
  cell.style.width = width;
  cell.style.height = "90px";
}

function styleCell(cell, width) {
  cell.style.border = "1px solid #e5e7eb";
  cell.style.padding = "8px";
  cell.style.textAlign = "center";
  cell.style.verticalAlign = "middle";
  cell.style.width = width;
  cell.style.height = "90px";
  cell.style.wordBreak = "break-word";
}

function applyTailwindColor(el, cls) {
  const map = {
    "bg-blue-200": "#bfdbfe",
    "bg-green-200": "#bbf7d0",
    "bg-purple-200": "#e9d5ff",
    "bg-yellow-200": "#fef08a",
    "bg-pink-200": "#fbcfe8",
    "bg-indigo-200": "#c7d2fe",
    "bg-red-200": "#fecaca",
    "bg-orange-200": "#fed7aa",
    "bg-teal-200": "#99f6e4",
    "bg-cyan-200": "#a5f3fc",
    "bg-lime-200": "#d9f99d",
    "bg-emerald-200": "#a7f3d0",
    "bg-violet-200": "#ddd6fe",
    "bg-rose-200": "#fecdd3",
    "bg-sky-200": "#bae6fd",
  };

  const bg = cls.split(" ").find((c) => c.startsWith("bg-"));
  el.style.background = map[bg] || "#e5e7eb";
}