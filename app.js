document.addEventListener("DOMContentLoaded", loadWeightData);

let weightData = JSON.parse(localStorage.getItem("weightData")) || [];

function saveWeight() {
    let weightInput = document.getElementById("weight").value;
    if (!weightInput) return;

    let today = new Date().toISOString().split('T')[0];

    let existingEntry = weightData.find(entry => entry.date === today);
    if (existingEntry) {
        existingEntry.weight = parseFloat(weightInput);
    } else {
        weightData.push({ date: today, weight: parseFloat(weightInput) });
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

    drawCharts();
}

function drawCharts() {
    let ctx1 = document.getElementById("weightChart").getContext("2d");
    let ctx2 = document.getElementById("bmiChart").getContext("2d");

    let dates = weightData.map(entry => entry.date);
    let weights = weightData.map(entry => entry.weight);
    let heightM = 1.77;
    let bmiValues = weights.map(weight => (weight / (heightM * heightM)).toFixed(1));

    if (window.weightChart) window.weightChart.destroy();
    if (window.bmiChart) window.bmiChart.destroy();

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

    window.bmiChart = new Chart(ctx2, {
        type: "line",
        data: {
            labels: dates,
            datasets: [{
                label: "BMI",
                data: bmiValues,
                borderColor: "#2ecc71",
                backgroundColor: "rgba(46, 204, 113, 0.2)",
                fill: true
            }]
        },
        options: { responsive: true }
    });
}
