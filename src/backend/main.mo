import SolarTypes "types/solar-projects";
import UserTypes "types/users";
import SolarProjectsApi "mixins/solar-projects-api";
import UsersApi "mixins/users-api";
import Map "mo:core/Map";



actor {

  let projects = Map.empty<Text, SolarTypes.SolarProject>();
  let users = Map.empty<Text, UserTypes.User>();
  let sessions = Map.empty<Text, Text>();

  include SolarProjectsApi(projects);
  include UsersApi(users, sessions);

};
