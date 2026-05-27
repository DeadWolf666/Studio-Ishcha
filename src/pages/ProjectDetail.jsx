import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { projects } from "../data/projects";
import "../styles/ProjectDetail.css";

export default function ProjectDetail() {
  const { id } = useParams();
  const project = projects.find((p) => p.id === id);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [id]);

  const handleBackToProjects = () => {
    window.location.hash = "#projects";
  };

  const handleBackButton = () => {
    window.location.hash = "#projects";
  };

  if (!project) {
    return (
      <div className="project-detail-error">
        <h1>Project Not Found</h1>
        <p>The project you're looking for doesn't exist.</p>
        <button onClick={handleBackToProjects} className="back-button">
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="project-detail-page">
      <button onClick={handleBackButton} className="back-button">
        ← Back
      </button>

      <div className="project-detail-hero">
        <img src={project.imageUrl} alt={project.title} className="project-hero-image" />
      </div>

      <article className="project-detail-content">
        <header className="project-detail-header">
          <div className="project-meta">
            <span className="project-year">{project.year}</span>
            <span className="project-category">{project.category}</span>
          </div>
          <h1 className="project-detail-title">{project.title}</h1>
          <p className="project-detail-subtitle">{project.subtitle}</p>
        </header>

        <div className="project-detail-body">
          <div className="project-description">
            {project.description.split("\n\n").map((paragraph, index) => {
              if (paragraph.includes(":")) {
                const [title, ...items] = paragraph.split("\n");
                return (
                  <div key={index} className="description-section">
                    <h3>{title}</h3>
                    <ul>
                      {items.map((item, i) => (
                        <li key={i}>{item.replace(/^- /, "")}</li>
                      ))}
                    </ul>
                  </div>
                );
              }
              return (
                <p key={index} className="description-paragraph">
                  {paragraph}
                </p>
              );
            })}
          </div>

          <aside className="project-details-sidebar">
            <div className="details-section">
              <h3>Client</h3>
              <p>{project.details.client}</p>
            </div>

            <div className="details-section">
              <h3>Timeline</h3>
              <p>{project.details.timeline}</p>
            </div>

            <div className="details-section">
              <h3>Disciplines</h3>
              <ul>
                {project.details.disciplines.map((discipline, index) => (
                  <li key={index}>{discipline}</li>
                ))}
              </ul>
            </div>

            <div className="details-section">
              <h3>Tools</h3>
              <ul>
                {project.details.tools.map((tool, index) => (
                  <li key={index}>{tool}</li>
                ))}
              </ul>
            </div>

            <div className="details-section outcome">
              <h3>Outcome</h3>
              <p>{project.details.outcome}</p>
            </div>

            <div className="details-section credits">
              <p className="credits-label">Credits</p>
              <p>{project.credits}</p>
            </div>
          </aside>
        </div>
      </article>

      <nav className="project-navigation">
        <button onClick={handleBackToProjects} className="nav-button full-width">
          ← Back to All Projects
        </button>
      </nav>
    </div>
  );
}
