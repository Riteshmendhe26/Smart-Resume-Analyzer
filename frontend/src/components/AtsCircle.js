import {
    CircularProgressbar,
    buildStyles
  } from "react-circular-progressbar";
  import "react-circular-progressbar/dist/styles.css";
  
  export default function AtsCircle({ score }) {
    return (
      <div className="w-40 mx-auto">
        <CircularProgressbar
          value={score}
          text={`${score}%`}
          styles={buildStyles({
            textSize: "18px",
            pathTransitionDuration: 1,
            pathColor: `rgba(79, 70, 229, ${score / 100})`,
            textColor: "#4F46E5",
            trailColor: "#E5E7EB",
          })}
        />
      </div>
    );
  }
  