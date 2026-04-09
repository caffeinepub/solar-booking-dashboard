import Types "../types/users";
import UsersLib "../lib/users";
import Map "mo:core/Map";

mixin (
  users : Map.Map<Text, Types.User>,
  sessions : Map.Map<Text, Text>,
) {

  public func login(username : Text, password : Text) : async { #ok : Types.UserSession; #err : Text } {
    UsersLib.login(users, sessions, username, password)
  };

  public func createUser(
    callerToken : Text,
    username : Text,
    password : Text,
    accessLevel : Text,
  ) : async { #ok : Text; #err : Text } {
    UsersLib.createUser(users, sessions, callerToken, username, password, accessLevel)
  };

  public func deleteUser(callerToken : Text, username : Text) : async { #ok : Text; #err : Text } {
    UsersLib.deleteUser(users, sessions, callerToken, username)
  };

  public query func listUsers(callerToken : Text) : async { #ok : [Types.UserInfo]; #err : Text } {
    UsersLib.listUsers(users, sessions, callerToken)
  };

  public query func validateSession(token : Text) : async { #ok : Types.UserInfo; #err : Text } {
    UsersLib.validateSession(users, sessions, token)
  };

};
