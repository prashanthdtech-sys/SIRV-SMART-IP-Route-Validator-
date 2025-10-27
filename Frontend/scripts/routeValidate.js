// ================== Routes Validator ==================
const routesInput = document.getElementById("routesInput");
const routesResults = document.getElementById("routesResults");
const routesSpinner = document.getElementById("routesSpinner");
const routesBtn = document.querySelector("#routes .check-btn");

// Restore input & results
routesInput.value = localStorage.getItem("routesInput") || "";

const savedRoutesResults = localStorage.getItem("routesResults");
if (savedRoutesResults) {
  routesResults.innerHTML = savedRoutesResults;
  routesResults.classList.remove("hidden");
}

routesInput.addEventListener("input", () =>
  localStorage.setItem("routesInput", routesInput.value)
);
routesBtn.addEventListener("click", checkRoutes);
routesInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkRoutes();
});

async function checkRoutes() {
  const ipInput = routesInput.value.trim();
  if (!ipInput) return alert("Please enter one or more IPs/CIDRs (max 5)");

  routesResults.innerHTML = "";
  routesResults.classList.remove("hidden");
  routesSpinner.classList.remove("hidden");

  try {
    const response = await fetch(
      `http://localhost:3000/api/rpki-check?ip=${encodeURIComponent(
        ipInput
      )}`
    );
    if (!response.ok) throw new Error("Unable to fetch route validation data");

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      routesResults.innerHTML = "<p>No data found.</p>";
      return;
    }

    data.forEach((item) => {
      const result = {
        prefix: item.prefix,
        status: item.categoryOverall || "UNKNOWN",
        bgp: {
          status: item.bgpOrigins?.length ? "VALID" : "INVALID",
          info: item.bgpOrigins?.join(", ") || "No origins found",
        },
        rpki: {
          status: item.rpkiRoutes?.length
            ? item.rpkiRoutes[0].rpkiStatus
            : "UNKNOWN",
          info:
            item.rpkiRoutes
              ?.map((r) => `${r.asn} (${r.rpkiStatus})`)
              .join(", ") || "No RPKI routes",
        },
        arin: {
          status: item.irrRoutes?.arin?.rpkiStatus || "UNKNOWN",
          info: item.irrRoutes?.arin?.asn || "No ARIN data",
        },
        radb: {
          status: item.irrRoutes?.radb?.rpkiStatus || "UNKNOWN",
          info: item.irrRoutes?.radb?.asn || "No RADB data",
        },
      };
      renderRouteResult(routesResults, result);
    });

    localStorage.setItem("routesResults", routesResults.innerHTML);
  } catch (err) {
    routesResults.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
  } finally {
    routesSpinner.classList.add("hidden");
  }
}

function renderRouteResult(container, result) {
  const card = document.createElement("div");
  card.className = "route-card";

  const header = document.createElement("div");
  header.className = "route-header";
  header.innerHTML = `
    <span class="prefix">${result.prefix}</span>
    <span class="badge ${result.status.toLowerCase()}">${result.status}</span>
    <button class="toggle-btn">Details ▼</button>
  `;

  const details = document.createElement("div");
  details.className = "route-details hidden";
  details.innerHTML = `
    <table class="rpki-table">
      <thead>
        <tr><th>Check</th><th>Status</th><th>Info</th></tr>
      </thead>
      <tbody>
        <tr><td>BGP Origin</td><td>${iconify(result.bgp.status)}</td><td>${
    result.bgp.info
  }</td></tr>
        <tr><td>RPKI</td><td>${iconify(result.rpki.status)}</td><td>${
    result.rpki.info
  }</td></tr>
        <tr><td>ARIN</td><td>${iconify(result.arin.status)}</td><td>${
    result.arin.info
  }</td></tr>
        <tr><td>RADB</td><td>${iconify(result.radb.status)}</td><td>${
    result.radb.info
  }</td></tr>
      </tbody>
    </table>
  `;

  header.querySelector(".toggle-btn").addEventListener("click", () => {
    details.classList.toggle("hidden");
    header.querySelector(".toggle-btn").textContent =
      details.classList.contains("hidden") ? "Details ▼" : "Details ▲";
  });

  card.appendChild(header);
  card.appendChild(details);
  container.appendChild(card);
}

function iconify(status) {
  switch ((status || "").toLowerCase()) {
    case "valid":
      return `<span class="badge success">✅ VALID</span>`;
    case "invalid":
      return `<span class="badge error">❌ INVALID</span>`;
    case "warning":
      return `<span class="badge warning">⚠️ WARNING</span>`;
    case "info":
      return `<span class="badge info">ℹ️ INFO</span>`;
    default:
      return `<span class="badge unknown">❓ UNKNOWN</span>`;
  }
}
