import { Link } from "react-router-dom";
import "../styles/ProjectCard.css";

export default function ProjectCard({ project }) {
  return (
    <div className="project-card">
      <div className="project-image">
        <img src={project.imageUrl} alt={project.title} />
      </div>
      <div className="project-content">
        <p className="project-year">{project.year}</p>
        <h3 className="project-title">{project.title}</h3>
        <p className="project-subtitle">{project.subtitle}</p>
        <p className="project-summary">{project.summary}</p>
        <Link to={`/project/${project.id}`} className="view-more">
          View More
          <span className="arrow">→</span>
        </Link>
      </div>
    </div>
  );
}
