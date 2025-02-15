document.addEventListener("DOMContentLoaded", loadWeightData);

let weightData = JSON.parse(localStorage.getItem("weightData")) || [];
const goalWeight = 88; // Updated goal weight

function saveWeight() {
    let weightInput = parseFloat(document.getElementById("weight").value);
    if (!weightInput) return;

    let today = new Date().toISOString().split('T')[0];

    let existingEntryIndex = weightData.findIndex(entry => entry.date === today);

    // Check excessive variance (more than 10%)
    if (weightData.length > 0) {
        let lastWeight = weightData[weightData.length - 1].weight;
        let variance = Math.abs((weightInput - lastWeight) / lastWeight) * 100;
        if (variance > 10) {
            alert("Warning: The new weight differs by more than 10% from your last recorded weight!");
            return;
        }
    }

    // If an entry exists, confirm overwrite
    if (existingEntryIndex !== -1) {
        if (!confirm("You already have an entry for today. Do you want to overwrite it?")) {
            return;
        }
        weightData[existingEntryIndex].weight = weightInput;
    } else {
        weightData.push({ date: today, weight: weightInput });
    }

    localStorage.setItem("weightData", JSON.stringify(weightData));
    loadWeightData();
}

function loadWeightData() {
    if (weightData.length === 0) return;

    let startWeight = weightData[0].weight;
    let currentWeight = weightData[weightData.length - 1].weight;
    let totalLost = (startWeight - currentWeight).toFixed(1);

    document.getElementById("start-weight").textContent = startWeight;
    document.getElementById("current-weight").textContent = currentWeight;
    document.getElementById("total-lost").textContent = totalLost;

    updateProgressBar(startWeight, currentWeight);

    // Show the graph only if there are at least 2 entries
    if (weightData.length > 1) {
        drawCharts();
    }
}

function updateProgressBar(startWeight, currentWeight) {
    let progressPercent = ((startWeight - currentWeight) / (startWeight - goalWeight)) * 100;
    progressPercent = Math.min(100, Math.max(0, progressPercent));
    document.getElementById("progress-fill").style.width = progressPercent + "%";
}

function drawCharts() {
    let ctx1 = document.getElementById("weightChart").getContext("2d");

    let dates = weightData.map(entry => entry.date);
    let weights = weightData.map(entry => entry.weight);

    if (window.weightChart) window.weightChart.destroy();

    window.weightChart = new Chart(ctx1, {
        type: "line",
        data: {
            labels: dates,
            datasets: [{
                label: "Weight (kg)",
                data: weights,
                borderColor: "#3498db",
                backgroundColor: "rgba(52, 152, 219, 0.2)",
                fill: true
            }]
        },
        options: { responsive: true }
    });
}
