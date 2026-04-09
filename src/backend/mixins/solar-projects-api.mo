import Types "../types/solar-projects";
import SolarProjectsLib "../lib/solar-projects";
import Map "mo:core/Map";

mixin (
  projects : Map.Map<Text, Types.SolarProject>,
) {

  var nextId : Nat = 1;

  public func createProject(input : Types.CreateProjectInput) : async Types.SolarProject {
    let (project, newNextId) = SolarProjectsLib.createProject(projects, nextId, input);
    nextId := newNextId;
    project
  };

  public func updateProject(input : Types.UpdateProjectInput) : async ?Types.SolarProject {
    SolarProjectsLib.updateProject(projects, input)
  };

  public func deleteProject(id : Text) : async Bool {
    SolarProjectsLib.deleteProject(projects, id)
  };

  public query func getProject(id : Text) : async ?Types.SolarProject {
    SolarProjectsLib.getProject(projects, id)
  };

  public query func getAllProjects() : async [Types.SolarProject] {
    SolarProjectsLib.getAllProjects(projects)
  };

  public query func getProjectsByStatus(status : Types.ProjectStatus) : async [Types.SolarProject] {
    SolarProjectsLib.getProjectsByStatus(projects, status)
  };

  public query func getProjectsByRegion(region : Text) : async [Types.SolarProject] {
    SolarProjectsLib.getProjectsByRegion(projects, region)
  };

};
