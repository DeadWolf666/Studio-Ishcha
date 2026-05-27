import ProjectCard from "./ProjectCard";
import { projects } from "../data/projects";
import "../styles/ProjectsMenu.css";

export default function ProjectsMenu() {
  return (
    <div className="projects-menu">
      <div className="projects-header">
        <h2>Selected Projects</h2>
        <p>Campaigns, spatial systems, product studies, and installation notes</p>
      </div>
      <div className="projects-scroll-container">
        <div className="projects-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
