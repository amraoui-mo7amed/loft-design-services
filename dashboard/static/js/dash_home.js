document.addEventListener("DOMContentLoaded", function () {
  var donutEl = document.getElementById("statusDonut");
  if (!donutEl) return;

  var labels = [];
  var values = [];
  var colors = [];

  try {
    labels = JSON.parse(donutEl.dataset.labels || "[]");
    values = JSON.parse(donutEl.dataset.values || "[]");
    colors = JSON.parse(donutEl.dataset.colors || "[]");
  } catch (e) {
    return;
  }

  if (labels.length === 0) return;

  var ctx = donutEl.getContext("2d");

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "72%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 16,
            usePointStyle: true,
            pointStyle: "circle",
            font: { size: 12 },
            generateLabels: function (chart) {
              var data = chart.data;
              return data.labels.map(function (label, i) {
                return {
                  text: label + "  " + data.datasets[0].data[i],
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: "transparent",
                  pointStyle: "circle",
                  index: i,
                };
              });
            },
          },
        },
        tooltip: {
          backgroundColor: "#fff",
          titleColor: "#111",
          bodyColor: "#6b7280",
          borderColor: "rgba(0,0,0,0.06)",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
          boxPadding: 6,
          callbacks: {
            label: function (ctx) {
              var total = ctx.dataset.data.reduce(function (a, b) { return a + b; }, 0);
              var pct = total > 0 ? Math.round((ctx.parsed / total) * 100) : 0;
              return " " + ctx.parsed + " (" + pct + "%)";
            },
          },
        },
      },
    },
  });
});
