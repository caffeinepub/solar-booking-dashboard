import Types "../types/users";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat32 "mo:core/Nat32";
import Nat8 "mo:core/Nat8";

module {

  // SHA-256 round constants
  let K : [Nat32] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  func rotr32(x : Nat32, n : Nat32) : Nat32 {
    (x >> n) | (x << (32 - n))
  };

  // Encode 64-bit big-endian length (as Nat) into 8 bytes
  func encodeBitLen(bitLen : Nat) : [Nat8] {
    [
      Nat8.fromNat((bitLen / 72057594037927936) % 256), // byte 0 (most significant)
      Nat8.fromNat((bitLen / 281474976710656) % 256),
      Nat8.fromNat((bitLen / 1099511627776) % 256),
      Nat8.fromNat((bitLen / 4294967296) % 256),
      Nat8.fromNat((bitLen / 16777216) % 256),
      Nat8.fromNat((bitLen / 65536) % 256),
      Nat8.fromNat((bitLen / 256) % 256),
      Nat8.fromNat(bitLen % 256),                       // byte 7 (least significant)
    ]
  };

  func sha256(data : [Nat8]) : [Nat8] {
    let msgLen = data.size();
    let bitLen = msgLen * 8;

    // Padding: 1 byte 0x80, zeros, then 8-byte big-endian bit length
    // Total length must be multiple of 64
    let paddedLen = ((msgLen + 9 + 63) / 64) * 64;
    let lenBytes = encodeBitLen(bitLen);

    let padded = Array.tabulate<Nat8>(paddedLen, func(i) {
      if (i < msgLen) { data[i] }
      else if (i == msgLen) { 0x80 }
      else if (i + 8 >= paddedLen) { lenBytes[i - (paddedLen - 8 : Nat)] }
      else { 0x00 }
    });

    var h0 : Nat32 = 0x6a09e667;
    var h1 : Nat32 = 0xbb67ae85;
    var h2 : Nat32 = 0x3c6ef372;
    var h3 : Nat32 = 0xa54ff53a;
    var h4 : Nat32 = 0x510e527f;
    var h5 : Nat32 = 0x9b05688c;
    var h6 : Nat32 = 0x1f83d9ab;
    var h7 : Nat32 = 0x5be0cd19;

    let numBlocks = paddedLen / 64;
    var block = 0;
    while (block < numBlocks) {
      let w = Array.tabulate<Nat32>(64, func(i) {
        if (i < 16) {
          let base = block * 64 + i * 4;
          (Nat32.fromNat(padded[base].toNat()) << 24)
          | (Nat32.fromNat(padded[base + 1].toNat()) << 16)
          | (Nat32.fromNat(padded[base + 2].toNat()) << 8)
          | Nat32.fromNat(padded[base + 3].toNat())
        } else { 0 }
      }).toVarArray();
      var i = 16;
      while (i < 64) {
        let s0 = rotr32(w[i-15], 7) ^ rotr32(w[i-15], 18) ^ (w[i-15] >> 3);
        let s1 = rotr32(w[i-2], 17) ^ rotr32(w[i-2], 19) ^ (w[i-2] >> 10);
        w[i] := w[i-16] +% s0 +% w[i-7] +% s1;
        i += 1;
      };

      var a = h0; var b = h1; var c = h2; var d = h3;
      var e = h4; var f = h5; var g = h6; var h = h7;

      var j = 0;
      while (j < 64) {
        let s1 = rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25);
        let ch = (e & f) ^ ((^e) & g);
        let temp1 = h +% s1 +% ch +% K[j] +% w[j];
        let s0 = rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22);
        let maj = (a & b) ^ (a & c) ^ (b & c);
        let temp2 = s0 +% maj;
        h := g; g := f; f := e; e := d +% temp1;
        d := c; c := b; b := a; a := temp1 +% temp2;
        j += 1;
      };

      h0 +%= a; h1 +%= b; h2 +%= c; h3 +%= d;
      h4 +%= e; h5 +%= f; h6 +%= g; h7 +%= h;
      block += 1;
    };

    // Extract digest bytes (big-endian)
    let words = [h0, h1, h2, h3, h4, h5, h6, h7];
    Array.tabulate<Nat8>(32, func(i) {
      let word = words[i / 4];
      let shift = Nat32.fromNat((3 - (i % 4)) * 8);
      Nat8.fromNat(((word >> shift) & 0xff).toNat())
    })
  };

  let hexChars : [Char] = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];

  func byteToHex(b : Nat8) : Text {
    Text.fromChar(hexChars[(b >> 4).toNat()]) # Text.fromChar(hexChars[(b & 0x0f).toNat()])
  };

  public func hashPassword(password : Text) : Text {
    let bytes = password.encodeUtf8().toArray();
    let digest = sha256(bytes);
    var hex = "";
    for (b in digest.values()) { hex #= byteToHex(b) };
    hex
  };

  public func accessLevelToText(level : Types.AccessLevel) : Text {
    switch (level) {
      case (#admin) "admin";
      case (#fullEdit) "full-edit";
      case (#viewOnly) "view-only";
    }
  };

  public func textToAccessLevel(t : Text) : ?Types.AccessLevel {
    if (t == "admin") { ?#admin }
    else if (t == "full-edit") { ?#fullEdit }
    else if (t == "view-only") { ?#viewOnly }
    else { null }
  };

  public func toUserInfo(user : Types.User) : Types.UserInfo {
    { username = user.username; accessLevel = accessLevelToText(user.accessLevel) }
  };

  public func bootstrapAdmin(users : Map.Map<Text, Types.User>) {
    if (users.isEmpty()) {
      users.add("admin 2", {
        username = "admin 2";
        passwordHash = hashPassword("Admin@1234");
        accessLevel = #admin;
      });
    };
  };

  func sessionUser(
    users : Map.Map<Text, Types.User>,
    sessions : Map.Map<Text, Text>,
    token : Text,
  ) : ?Types.User {
    switch (sessions.get(token)) {
      case null null;
      case (?username) { users.get(username) };
    }
  };

  public func login(
    users : Map.Map<Text, Types.User>,
    sessions : Map.Map<Text, Text>,
    username : Text,
    password : Text,
  ) : { #ok : Types.UserSession; #err : Text } {
    let hashedPw = hashPassword(password);
    switch (users.get(username)) {
      case null { #err("Invalid username or password") };
      case (?user) {
        if (user.passwordHash != hashedPw) {
          #err("Invalid username or password")
        } else {
          // Deterministic token: username + ":" + passwordHash
          let token = username # ":" # hashedPw;
          sessions.add(token, username);
          #ok({
            token;
            username = user.username;
            accessLevel = accessLevelToText(user.accessLevel);
          })
        }
      };
    }
  };

  public func validateSession(
    users : Map.Map<Text, Types.User>,
    sessions : Map.Map<Text, Text>,
    token : Text,
  ) : { #ok : Types.UserInfo; #err : Text } {
    switch (sessionUser(users, sessions, token)) {
      case null { #err("Invalid or expired session") };
      case (?user) { #ok(toUserInfo(user)) };
    }
  };

  public func createUser(
    users : Map.Map<Text, Types.User>,
    sessions : Map.Map<Text, Text>,
    callerToken : Text,
    username : Text,
    password : Text,
    accessLevel : Text,
  ) : { #ok : Text; #err : Text } {
    switch (sessionUser(users, sessions, callerToken)) {
      case null { #err("Invalid or expired session") };
      case (?caller) {
        switch (caller.accessLevel) {
          case (#admin) {};
          case _ { return #err("Admin access required") };
        };
        if (username == "") { return #err("Username cannot be empty") };
        if (password == "") { return #err("Password cannot be empty") };
        switch (users.get(username)) {
          case (?_) { #err("Username already exists") };
          case null {
            switch (textToAccessLevel(accessLevel)) {
              case null { #err("Invalid access level. Use: admin, full-edit, or view-only") };
              case (?level) {
                users.add(username, {
                  username;
                  passwordHash = hashPassword(password);
                  accessLevel = level;
                });
                #ok("User created successfully")
              };
            }
          };
        }
      };
    }
  };

  public func deleteUser(
    users : Map.Map<Text, Types.User>,
    sessions : Map.Map<Text, Text>,
    callerToken : Text,
    username : Text,
  ) : { #ok : Text; #err : Text } {
    switch (sessionUser(users, sessions, callerToken)) {
      case null { #err("Invalid or expired session") };
      case (?caller) {
        switch (caller.accessLevel) {
          case (#admin) {};
          case _ { return #err("Admin access required") };
        };
        if (caller.username == username) {
          return #err("Cannot delete your own account")
        };
        switch (users.get(username)) {
          case null { #err("User not found") };
          case (?_) {
            users.remove(username);
            // Invalidate all sessions for deleted user
            let toRemove = sessions.entries().filter(func(entry : (Text, Text)) : Bool { entry.1 == username }).toArray();
            for ((tok, _) in toRemove.values()) { sessions.remove(tok) };
            #ok("User deleted successfully")
          };
        }
      };
    }
  };

  public func listUsers(
    users : Map.Map<Text, Types.User>,
    sessions : Map.Map<Text, Text>,
    callerToken : Text,
  ) : { #ok : [Types.UserInfo]; #err : Text } {
    switch (sessionUser(users, sessions, callerToken)) {
      case null { #err("Invalid or expired session") };
      case (?caller) {
        switch (caller.accessLevel) {
          case (#admin) {};
          case _ { return #err("Admin access required") };
        };
        let infos = users.values().map(func(u : Types.User) : Types.UserInfo { toUserInfo(u) }).toArray();
        #ok(infos)
      };
    }
  };

};
