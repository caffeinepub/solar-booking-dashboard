import SolarTypes "types/solar-projects";
import UserTypes "types/users";
import SolarProjectsApi "mixins/solar-projects-api";
import UsersApi "mixins/users-api";
import UsersLib "lib/users";
import Map "mo:core/Map";



actor {

  let projects = Map.empty<Text, SolarTypes.SolarProject>();
  let users = Map.empty<Text, UserTypes.User>();
  let sessions = Map.empty<Text, Text>();

  // Bootstrap the default admin account once when users map is empty.
  // With enhanced orthogonal persistence this only runs when the canister
  // is freshly installed (not on upgrades), so existing users are never lost.
  UsersLib.bootstrapAdmin(users);

  include SolarProjectsApi(projects);
  include UsersApi(users, sessions);

};
