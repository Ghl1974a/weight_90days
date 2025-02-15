document.addEventListener("DOMContentLoaded", loadWeightData);

let weightData = JSON.parse(localStorage.getItem("weightData")) || [];
const goalWeight = 88; // Updated goal weight
const heightM = 1.77; // Your height in meters

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

    let bmi = calculateBMI(weightInput);

    // If an entry exists, confirm overwrite
    if (existingEntryIndex !== -1) {
        if (!confirm("You already have an entry for today. Do you want to overwrite it?")) {
            return;
        }
        weightData[existingEntryIndex] = { date: today, weight: weightInput, bmi: bmi };
    } else {
        weightData.push({ date: today, weight: weightInput, bmi: bmi });
    }

    localStorage.setItem("weightData", JSON.stringify(weightData));
    loadWeightData();
}

function loadWeightData() {
    if (weightData.length === 0) return;

    let startWeight = weightData[0].weight;
    let currentWeight = weightData[weightData.length - 1].weight;
    let totalLost = (startWeight - currentWeight).toFixed(1);
    let currentBMI = weightData[weightData.length - 1].bmi.toFixed(1);

    document.getElementById("start-weight").textContent = startWeight;
    document.getElementById("current-weight").textContent = currentWeight;
    document.getElementById("total-lost").textContent = totalLost;
    document.getElementById("current-bmi").textContent = currentBMI;

    updateBMIColor(currentBMI);
    updateProgressBar(startWeight, currentWeight);

    if (weightData.length > 1) {
        drawCharts();
    }
}

function calculateBMI(weight) {
    return weight / (heightM * heightM);
}

function updateBMIColor(bmi) {
    let bmiElement = document.getElementById("current-bmi");

    if (bmi < 25) {
        bmiElement.style.color = "green"; // Healthy
    } else if (bmi < 30) {
        bmiElement.style.color = "orange"; // Overweight
    } else {
        bmiElement.style.color = "red"; // Obese
    }
}

function updateProgressBar(startWeight, currentWeight) {
    let progressPercent = ((startWeight - currentWeight) / (startWeight - goalWeight)) * 100;
    progressPercent = Math.min(100, Math.max(0, progressPercent));
    document.getElementById("progress-fill").style.width = progressPercent + "%";
}

function drawCharts() {
    let ctx1 = document.getElementById("weightChart").getContext("2d");
    let ctx2 = document.getElementById("bmiChart").getContext("2d");

    let dates = weightData.map(entry => entry.date);
    let weights = weightData.map(entry => entry.weight);
    let bmiValues = weightData.map(entry => entry.bmi.toFixed(1));

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
