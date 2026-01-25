import {
    Radar
  } from "react-chartjs-2";
  import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
  } from "chart.js";
  
  ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
  );
  
  export default function SkillRadar({ skillScores }) {
  
    const data = {
      labels: [
        "Technical Skills",
        "Tools & Frameworks",
        "Soft Skills",
        "Domain Knowledge",
        "Role Fit"
      ],
      datasets: [
        {
          label: "Skill Strength",
          data: [
            skillScores.technical,
            skillScores.tools,
            skillScores.soft,
            skillScores.domain,
            skillScores.role
          ],
          backgroundColor: "rgba(99, 102, 241, 0.4)",
          borderColor: "rgba(99, 102, 241, 1)",
          borderWidth: 2,
          pointBackgroundColor: "rgba(99, 102, 241, 1)",
          pointBorderColor: "#fff",
          pointHoverRadius: 5,
        },
      ],
    };
  
    const options = {
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { display: false },
          grid: { color: "#e5e7eb" },
          angleLines: { color: "#c7c7c7" },
          pointLabels: {
            color: "#374151",
            font: { size: 14, weight: "600" },
          },
        },
      },
      plugins: {
        legend: { display: false },
      },
    };
  
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 mt-10">
        <h3 className="text-2xl font-bold mb-6">Skill Radar Analysis</h3>
        <Radar data={data} options={options} />
      </div>
    );
  }
  