const STORAGE_KEY = "healthylife-data-v2";
const form = document.getElementById("entryForm");
const clearAllBtn = document.getElementById("clearAllBtn");
const historyList = document.getElementById("historyList");
const ctx = document.getElementById("dashboardChart").getContext("2d");

const avgWater = document.getElementById("avgWater");
const avgSleep = document.getElementById("avgSleep");
const avgSteps = document.getElementById("avgSteps");

let chart;

// Initialize today's date
document.getElementById("entryDate").value = new Date().toISOString().slice(0,10);

// Load and save helpers
function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
function saveData(d) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

// Handle save
form.addEventListener("submit", e => {
  e.preventDefault();
  const data = loadData();
  const date = document.getElementById("entryDate").value;
  data[date] = {
    water: +document.getElementById("water").value,
    sleep: +document.getElementById("sleep").value,
    steps: +document.getElementById("steps").value,
    exercise: +document.getElementById("exercise").value,
    meals: +document.getElementById("meals").value
  };
  saveData(data);
  renderAll();
  form.reset();
  document.getElementById("entryDate").value = new Date().toISOString().slice(0,10);
  alert("Entry saved!");
});

// Clear all data
clearAllBtn.addEventListener("click", ()=>{
  if(confirm("Clear all data?")) {
    localStorage.removeItem(STORAGE_KEY);
    renderAll();
  }
});

// Generate last N days with empty defaults
function lastNDays(n=7) {
  const result = [];
  const data = loadData();
  for(let i=n-1; i>=0; i--) {
    const d = new Date();
    d.setDate(d.getDate()-i);
    const key = d.toISOString().slice(0,10);
    result.push({ date: key, ...data[key] ?? { water:0, sleep:0, steps:0 }});
  }
  return result;
}

// Render chart
function renderChart() {
  const last7 = lastNDays(7);
  const labels = last7.map(d => d.date.slice(5));
  const waterData = last7.map(d => d.water);
  const sleepData = last7.map(d => d.sleep);
  const stepsData = last7.map(d => d.steps);

  if(chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: "Water (ml)",
          data: waterData,
          backgroundColor: 'rgba(54,162,235,0.6)',
          borderColor: 'rgb(54,162,235)',
          borderWidth: 1
        },
        {
          label: "Sleep (hrs)",
          data: sleepData,
          backgroundColor: 'rgba(255,206,86,0.6)',
          borderColor: 'rgb(255,206,86)',
          borderWidth: 1
        },
        {
          label: "Steps",
          data: stepsData,
          backgroundColor: 'rgba(75,192,192,0.6)',
          borderColor: 'rgb(75,192,192)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      },
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: 'Daily Health Stats' }
      }
    }
  });
}

// Render history list
function renderHistory() {
  const data = loadData();
  const dates = Object.keys(data).sort((a,b)=>b.localeCompare(a));
  historyList.innerHTML = "";

  if(dates.length === 0) {
    historyList.innerHTML = `<li class="list-group-item small text-muted">No entries yet.</li>`;
    return;
  }

  dates.forEach(d=>{
    const e = data[d];
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <div>
        <strong>${d}</strong>
        <div class="text-muted small">
          Water: ${e.water}ml | Sleep: ${e.sleep}h | Steps: ${e.steps}
        </div>
      </div>
      <button class="btn btn-sm btn-outline-danger" data-date="${d}">Delete</button>
    `;
    li.querySelector("button").addEventListener("click", ()=>{
      if(confirm("Delete entry?")){
        delete data[d];
        saveData(data);
        renderAll();
      }
    });
    historyList.appendChild(li);
  });
}

// Render averages
function renderAverages() {
  const last7 = lastNDays(7);
  const avg = (key) => {
    const total = last7.reduce((s,x)=>s+(x[key]||0),0);
    return (total / last7.length).toFixed(1);
  };
  avgWater.textContent = avg("water");
  avgSleep.textContent = avg("sleep");
  avgSteps.textContent = avg("steps");
}

// Master render
function renderAll() {
  renderChart();
  renderHistory();
  renderAverages();
}

// Initialize
renderAll();
