module {

  public type AccessLevel = {
    #admin;
    #fullEdit;
    #viewOnly;
  };

  public type User = {
    username : Text;
    passwordHash : Text;
    accessLevel : AccessLevel;
  };

  public type UserInfo = {
    username : Text;
    accessLevel : Text;
  };

  public type UserSession = {
    token : Text;
    username : Text;
    accessLevel : Text;
  };

};
