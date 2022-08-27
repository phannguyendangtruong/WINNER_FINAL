/**
 * Module     : main.mo
 * Copyright  : 2022 Rocklabs Team
 * License    : Apache 2.0 with LLVM Exception
 * Stability  : Experimental
 */
import AID "./Utils/AccountId";
import HashMap "mo:base/HashMap";
import Cycles "mo:base/ExperimentalCycles";
import Principal "mo:base/Principal";
import Error "mo:base/Error";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Hash "mo:base/Hash";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import TrieSet "mo:base/TrieSet";
import Array "mo:base/Array";
import Result "mo:base/Result";
import Prelude "mo:base/Prelude";
import Buffer "mo:base/Buffer";
import Types "./types";
import Debug "mo:base/Debug"

shared(msg) actor class NFTSale(
    _owner: Principal,
    ) = this {

    type Metadata = Types.Metadata;
    type Location = Types.Location;
    type Attribute = Types.Attribute;
    type TokenMetadata = Types.TokenMetadata;
    type Record = Types.Record;
    type TxRecord = Types.TxRecord;
    type Operation = Types.Operation;
    type TokenInfo = Types.TokenInfo;
    type OrderInfo = Types.OrderInfo;
    type TokenInfoExt = Types.TokenInfoExt;
    type UserInfo = Types.UserInfo;
    type User = Types.User;
    type UserInfoExt = Types.UserInfoExt;
    type SchoolList = Types.SchoolList;
    type SchoolId = Types.SchoolId;
    type DegreeList = Types.DegreeList;
    type DegreeId = Types.DegreeId;

    public type Errors = {
        #Unauthorized;
        #TokenNotExist;
        #InvalidOperator;
    };
    // to be compatible with Rust canister
    // in Rust, Result is `Ok` and `Err`
    public type TxReceipt = {
        #Ok: Nat;
        #Err: Errors;
    };
    public type MintResult = {
        #Ok: (Nat, Nat);
        #Err: Errors;
    };

    public type SaleInfo = {
        var amountLeft: Nat;
        var fundRaised: Nat;
        devFee: Nat; // /1e6
        devAddr: Principal;
        paymentToken: Principal;
        var fundClaimed: Bool;
        var feeClaimed: Bool;
    };

    public type SaleInfoExt = {
        amountLeft: Nat;
        fundRaised: Nat;
        devFee: Nat; // /1e6
        devAddr: Principal;
        paymentToken: Principal;
        fundClaimed: Bool;
        feeClaimed: Bool;
    };

    // DIP20 token actor
	type DIP20Errors = {
        #InsufficientBalance;
        #InsufficientAllowance;
        #LedgerTrap;
        #AmountTooSmall;
        #BlockUsed;
        #ErrorOperationStyle;
        #ErrorTo;
        #Other;
    };
    type DIP20Metadata = {
        logo : Text;
        name : Text;
        symbol : Text;
        decimals : Nat8;
        totalSupply : Nat;
        owner : Principal;
        fee : Nat;
    };
    public type TxReceiptToken = {
        #Ok: Nat;
        #Err: DIP20Errors;
    };
    type TokenActor = actor {
        allowance: shared (owner: Principal, spender: Principal) -> async Nat;
        approve: shared (spender: Principal, value: Nat) -> async TxReceiptToken;
        balanceOf: (owner: Principal) -> async Nat;
        decimals: () -> async Nat8;
        name: () -> async Text;
        symbol: () -> async Text;
        getMetadata: () -> async DIP20Metadata;
        totalSupply: () -> async Nat;
        transfer: shared (to: Principal, value: Nat) -> async TxReceiptToken;
        transferFrom: shared (from: Principal, to: Principal, value: Nat) -> async TxReceiptToken;
    };

    type Info = {
        walletAddress: Principal;
        username: Text;
    };

    public type WhitelistActor = actor {
        check: shared(user: Principal) -> async Bool;
    };

    private stable var owner_: Principal = _owner;
    private stable var totalSupply_: Nat = 0;
    private stable var blackhole: Principal = Principal.fromText("aaaaa-aa");

    private stable var tokensEntries : [(Nat, TokenInfo)] = [];
    private stable var usersEntries : [(Principal, UserInfo)] = [];
     private var tokens = HashMap.HashMap<Nat, TokenInfo>(1, Nat.equal, Hash.hash);
    private var userInfo = HashMap.HashMap<Principal, User>(1, Principal.equal, Principal.hash);
    private var users = HashMap.HashMap<Principal, UserInfo>(1, Principal.equal, Principal.hash);
    // lấy cccd làm key
    private var info = HashMap.HashMap<Text, Info>(1, Text.equal, Text.hash);
    private var orders = HashMap.HashMap<Nat, OrderInfo>(1, Nat.equal, Hash.hash);
    private stable var txs: [TxRecord] = [];
    private stable var txIndex: Nat = 0;
    private stable var totalOrders_: Nat = 0;

    var admins = {
      tuannghia: Principal = Principal.fromText("32pz5-7bxkd-zaqki-5xgb4-lhny7-pdqav-ywrl3-z5gti-o2gh7-ctkhg-dae");
      tuannghia2: Principal = Principal.fromText("jcwhs-j4bkq-2xz7o-u6fvx-g53cs-an4t6-fhyna-3ots3-ecnn5-gflap-fqe");
      dangtruong: Principal = Principal.fromText("f4bkg-aa6oj-rq3m3-zkirc-ibqed-r7lzd-26vim-wq2hv-4tarp-dpmp4-jae");
    };

     var adminInfo = {
      tuannghia = {
        walletAddress: Principal = admins.tuannghia;
        username = "Admin"; 
        role = 3 ;
        cccd = "1234567890";
        school = "";
        birthday = "2003-01-22";
        image = "https://www.nicepng.com/png/detail/263-2635963_admin-png.png";
        description = "The currents and weather of the Grand Line's open sea are extremely unpredictable, whereas in the vicinity of islands the climate is stable.[8] The magnetic fields within the Grand Line cause normal compasses to malfunction, making it even more difficult to navigate,[9] and instead a special compass called a Log Pose[Jp 15] must be used.[10] The Log Pose functions by locking on to one island's magnetic field and then locking on to another island's magnetic field.[11] The time for it to set depends on the island."
      };
      tuannghia2 = {
        walletAddress: Principal = admins.tuannghia2;
        username = "Dang Tuan Nghia"; 
        role = 3 ;
        cccd = "123456789";
        school = "FPOLY";
        birthday = "2003-01-22";
        image = "https://bafybeidogmnnguoj5cgyucveurkgavzhdlsqbxyaszwe4kv2jvvw7phnla.ipfs.w3s.link/49dfe71fe9db2c8575ca%20%281%29.jpg";
        description = "The currents and weather of the Grand Line's open sea are extremely unpredictable, whereas in the vicinity of islands the climate is stable.[8] The magnetic fields within the Grand Line cause normal compasses to malfunction, making it even more difficult to navigate,[9] and instead a special compass called a Log Pose[Jp 15] must be used.[10] The Log Pose functions by locking on to one island's magnetic field and then locking on to another island's magnetic field.[11] The time for it to set depends on the island."
      };
      dangtruong = {
        walletAddress: Principal = admins.dangtruong;
        username = "Phan Nguyen Dang Truong";
        role = 3;
        cccd = "12345678";
        school = "FPOLY";
        birthday = "2003-01-22";
        image = "https://bafybeidogmnnguoj5cgyucveurkgavzhdlsqbxyaszwe4kv2jvvw7phnla.ipfs.w3s.link/49dfe71fe9db2c8575ca%20%281%29.jpg";
        description = "The currents and weather of the Grand Line's open sea are extremely unpredictable, whereas in the vicinity of islands the climate is stable.[8] The magnetic fields within the Grand Line cause normal compasses to malfunction, making it even more difficult to navigate,[9] and instead a special compass called a Log Pose[Jp 15] must be used.[10] The Log Pose functions by locking on to one island's magnetic field and then locking on to another island's magnetic field.[11] The time for it to set depends on the island."
      };
    };
    // ##################

    var role = {
        employee: Nat = 1;
        manager: Nat = 2;
        admin: Nat = 3;
    };

    // Cho quyền admin
    public shared(msg) func isAdmin(walletAddress : Principal) {
      if(userInfo.get(walletAddress) == null){
        if(walletAddress == admins.tuannghia){
          userInfo.put(walletAddress, adminInfo.tuannghia);
        }else if(walletAddress == admins.dangtruong){
          userInfo.put(walletAddress, adminInfo.dangtruong);
        }else if(walletAddress == admins.tuannghia2){
          userInfo.put(walletAddress, adminInfo.tuannghia2);
        }
      }
    };


    // confirm degree is true
    // public shared(msg) func updateIsBlocked(id : Nat)  {       
    //    for(sc : TokenInfo in tokens.vals()){
    //       if(sc.index == id){
    //         let token: TokenInfo = {
    //         index = sc.index;
    //         var owner = sc.owner;
    //         var metadata = sc.metadata;
    //         var operator = sc.operator;
    //         var isBlocked = true;
    //         timestamp = sc.timestamp;
    //       };
    //       tokens.put(id, token);
    //     } ;
    //    };
    // };


    // Thêm tài khoản cho user
    public shared(msg) func insertUser(walletAddress : Principal, username : Text,
                cccd : Text, school : Text, birthday : Text, image: Text, description: Text){   
        userInfo.put(walletAddress, {walletAddress = walletAddress; role = role.employee; username = username ; cccd = cccd; school = school; birthday = birthday; image = image; description = description});
        info.put(cccd, {walletAddress = walletAddress ; username = username});
    };

    // Lấy danh sách users
    public query func getAllUser() : async [User] {
        Iter.toArray(userInfo.vals());
    };

    //Update user bằng walletAddress
    public shared(msg) func updateUser(walletAddress : Principal, username : Text, 
                cccd : Text,  school : Text, birthday : Text, image: Text, description: Text, role : Nat){
          userInfo.put(walletAddress, {walletAddress = walletAddress; role = role; username = username ; cccd = cccd; school = school; 
            birthday = birthday; image = image; description = description});
    };


    // Đang chỉ lấy thông tin Info gồm name và pricipal
    public query func findUser(cccd : Text) : async ?Info {
        info.get(cccd);
    };

    // lay thong tin
    public query func getValInfo() : async [Info] {
        Iter.toArray(info.vals());
    };


    // tim kiem bang địa chỉ ví và trả về object 
    public query func findUserById(walletAddress : Principal) : async ?User {
        userInfo.get(walletAddress);
     };

    //###################

    // Hash của trường học
    private var school = HashMap.HashMap<Nat, SchoolList>(1, Nat.equal, Hash.hash);
    private var schoolId = HashMap.HashMap<Nat, SchoolId>(1, Nat.equal, Hash.hash);


    // Thêm trường học
    public shared(msg) func insertSchool(name : Text, address: Text, schoolCode: Text, chairman: Text, logo: Text, image: Text, description: Text): async(){   
        var id : Nat = 0;
          for (sc : SchoolId in schoolId.vals()) {
              if(id < sc.id){
                  id := sc.id;
              }
         };
        id+=1;
        school.put(id, { name = name; address = address; schoolCode = schoolCode; chairman = chairman; logo = logo; image = image;description = description});
        schoolId.put(id,{id = id});
    };


      // update school 

    public func updateSchool(id : Nat, name : Text, address: Text, schoolCode: Text, chairman: Text, logo: Text, image: Text, description: Text): async(){   
        school.put(id, { name = name; address = address; schoolCode = schoolCode; chairman = chairman; logo = logo; image = image;description = description});
    };



    // insert default school
    public func insertSchoolDefault(): async [SchoolList]{
         if(school.size() == 0){
            await insertSchool("FPT University","Lot E2a-7, Road D1 Hi-Tech Park, Long Thanh My Ward, City. Thu Duc, City. Ho Chi Minh","FU","Nguyen Khac Thanh","https://seeklogo.com/images/F/fpt-university-logo-B3B6D84292-seeklogo.com.png","https://vcdn-vnexpress.vnecdn.net/2021/02/20/DH-FPT-4359-1612093890-5647-1613785573.jpg","truong dai hoc");
            await insertSchool("FPT Polytechnic","Software Park, Innovation Building, Lot 24, Quang Trung, District 12, City.","FPOLY","Vu Chi Thanh", "https://upload.wikimedia.org/wikipedia/commons/2/20/FPT_Polytechnic.png","https://luathoangphi.vn/wp-content/uploads/2022/04/Hoc-phi-truong-cao-dang-fpt-Polytechnic-2022.jpg?v=1650860023","truon dai hoc");
        };
        Iter.toArray(school.vals());
        
    };



    // get school list
    public query func getAllSchool() : async [SchoolList] {
        Iter.toArray(school.vals());
    };

    //delete school by key
    public shared(msg) func deleteSchool(key : Nat): async ?SchoolList{   
        var id : Nat = school.size();
        school.remove(key);
    };


    //find school by key
    public shared(msg) func findSchool(key : Nat): async ?SchoolList{   
        school.get(key);
    };

    // Hash của degree
    private var degree = HashMap.HashMap<Nat, DegreeList>(1, Nat.equal, Hash.hash);
    private var degreeId = HashMap.HashMap<Nat, DegreeId>(1, Nat.equal, Hash.hash);

    // create degree name
    public shared(msg) func insertDegree(degreeName : Text){   
        var id : Nat = 0;
          for (sc : DegreeId in degreeId.vals()) {
              if(id < sc.id){
                  id := sc.id;
              }
         };
        id+=1;
        degree.put(id, {id = id ;degreeName = degreeName});
        degreeId.put(id,{id = id});
    };

    // get degree list
    public query func getAllDegree() : async [DegreeList] {
        Iter.toArray(degree.vals());
    };

    //delete degree by key
    public shared(msg) func deleteDegree(key : Nat): async ?DegreeList{   
        var id : Nat = degree.size();
        degree.remove(key);
    };


    //find degree by key
    public shared(msg) func findDegree(key : Nat): async ?DegreeList{   
        degree.get(key);
    };

    private func addTxRecord(
        caller: Principal, op: Operation, tokenIndex: ?Nat,
        from: Record, to: Record, timestamp: Time.Time
    ): Nat {
        let record: TxRecord = {
            caller = caller;
            op = op;
            index = txIndex;
            tokenIndex = tokenIndex;
            from = from;
            to = to;
            timestamp = timestamp;
        };
        txs := Array.append(txs, [record]);
        txIndex += 1;
        return txIndex - 1;
    };

    private func _unwrap<T>(x : ?T) : T =
    switch x {
      case null { Prelude.unreachable() };
      case (?x_) { x_ };
    };
    
    private func _exists(tokenId: Nat) : Bool {
        switch (tokens.get(tokenId)) {
            case (?info) { return true; };
            case _ { return false; };
        }
    };

    private func _ownerOf(tokenId: Nat) : ?Principal {
        switch (tokens.get(tokenId)) {
            case (?info) { return ?info.owner; };
            case (_) { return null; };
        }
    };

    private func _isOwner(who: Principal, tokenId: Nat) : Bool {
        switch (tokens.get(tokenId)) {
            case (?info) { return info.owner == who; };
            case _ { return false; };
        };
    };

    private func _isApproved(who: Principal, tokenId: Nat) : Bool {
        switch (tokens.get(tokenId)) {
            case (?info) { return info.operator == ?who; };
            case _ { return false; };
        }
    };
    
    private func _balanceOf(who: Principal) : Nat {
        switch (users.get(who)) {
            case (?user) { return TrieSet.size(user.tokens); };
            case (_) { return 0; };
        }
    };

    private func _newUser() : UserInfo {
        {
            var operators = TrieSet.empty<Principal>();
            var allowedBy = TrieSet.empty<Principal>();
            var allowedTokens = TrieSet.empty<Nat>();
            var tokens = TrieSet.empty<Nat>();
        }
    };

    private func _tokenInfotoExt(info: TokenInfo) : TokenInfoExt {
        return {
            index = info.index;
            owner = info.owner;
            metadata = info.metadata;
            timestamp = info.timestamp;
            isBlocked = info.isBlocked;
            operator = info.operator;
        };
    };

    private func _userInfotoExt(info: UserInfo) : UserInfoExt {
        return {
            operators = TrieSet.toArray(info.operators);
            allowedBy = TrieSet.toArray(info.allowedBy);
            allowedTokens = TrieSet.toArray(info.allowedTokens);
            tokens = TrieSet.toArray(info.tokens);
        };
    };

    private func _isApprovedOrOwner(spender: Principal, tokenId: Nat) : Bool {
        switch (_ownerOf(tokenId)) {
            case (?owner) {
                return spender == owner or _isApproved(spender, tokenId) or _isApprovedForAll(owner, spender);
            };
            case _ {
                return false;
            };
        };        
    };

    private func _getApproved(tokenId: Nat) : ?Principal {
        switch (tokens.get(tokenId)) {
            case (?info) {
                return info.operator;
            };
            case (_) {
                return null;
            };
        }
    };

    private func _isApprovedForAll(owner: Principal, operator: Principal) : Bool {
        switch (users.get(owner)) {
            case (?user) {
                return TrieSet.mem(user.operators, operator, Principal.hash(operator), Principal.equal);
            };
            case _ { return false; };
        };
    };

    private func _addTokenTo(to: Principal, tokenId: Nat) {
        switch(users.get(to)) {
            case (?user) {
                user.tokens := TrieSet.put(user.tokens, tokenId, Hash.hash(tokenId), Nat.equal);
                users.put(to, user);
            };
            case _ {
                let user = _newUser();
                user.tokens := TrieSet.put(user.tokens, tokenId, Hash.hash(tokenId), Nat.equal);
                users.put(to, user);
            };
        }
    }; 

    private func _removeTokenFrom(owner: Principal, tokenId: Nat) {
        assert(_exists(tokenId) and _isOwner(owner, tokenId));
        switch(users.get(owner)) {
            case (?user) {
                user.tokens := TrieSet.delete(user.tokens, tokenId, Hash.hash(tokenId), Nat.equal);
                users.put(owner, user);
            };
            case _ {
                assert(false);
            };
        }
    };
   
    private func _clearApproval(owner: Principal, tokenId: Nat) {
        assert(_exists(tokenId) and _isOwner(owner, tokenId));
        switch (tokens.get(tokenId)) {
            case (?info) {
                if (info.operator != null) {
                    let op = _unwrap(info.operator);
                    let opInfo = _unwrap(users.get(op));
                    opInfo.allowedTokens := TrieSet.delete(opInfo.allowedTokens, tokenId, Hash.hash(tokenId), Nat.equal);
                    users.put(op, opInfo);
                    info.operator := null;
                    tokens.put(tokenId, info);
                }
            };
            case _ {
                assert(false);
            };
        }
    };  

    private func _transfer(to: Principal, tokenId: Nat) {
        assert(_exists(tokenId));
        switch(tokens.get(tokenId)) {
            case (?info) {
                _removeTokenFrom(info.owner, tokenId);
                _addTokenTo(to, tokenId);
                info.owner := to;
                tokens.put(tokenId, info);
            };
            case (_) {
                assert(false);
            };
        };
    };

    private func _burn(owner: Principal, tokenId: Nat) {
        _clearApproval(owner, tokenId);
        _transfer(blackhole, tokenId);
    };

    private func _batchMint(to: Principal, amount: Nat): async Bool {
        var startIndex = totalSupply_;
        var endIndex = startIndex + amount;
        while(startIndex < endIndex) {
            let token: TokenInfo = {
                index = totalSupply_;
                var owner = to;
                var metadata = null;
                var operator = null;
                var isBlocked = false;
                timestamp = Time.now();
            };
            tokens.put(totalSupply_, token);
            _addTokenTo(to, totalSupply_);
            totalSupply_ += 1;
            startIndex += 1;
            ignore addTxRecord(msg.caller, #mint(null), ?token.index, #user(blackhole), #user(to), Time.now());
        };
        return true;
    };

	public shared(msg) func setOwner(new: Principal): async Principal {
		assert(msg.caller == owner_);
		owner_ := new;
		new
	};

    // public update calls
    public shared(msg) func mint(to: Principal, metadata: ?TokenMetadata): async MintResult {
        // if(msg.caller != owner_) {
        //     return #Err(#Unauthorized);
        // };
        let token: TokenInfo = {
            index = totalSupply_;
            var owner = to;
            var metadata = metadata;
            var operator = null;
            var isBlocked = false;
            timestamp = Time.now();
        };
        tokens.put(totalSupply_, token);
        _addTokenTo(to, totalSupply_);
        totalSupply_ += 1;
        let txid = addTxRecord(msg.caller, #mint(metadata), ?token.index, #user(blackhole), #user(to), Time.now());
        return #Ok((token.index, txid));
    };

    public shared(msg) func batchMint(to: Principal, arr: [?TokenMetadata]): async MintResult {
        if(msg.caller != owner_) {
            return #Err(#Unauthorized);
        };
        let startIndex = totalSupply_;
        for(metadata in Iter.fromArray(arr)) {
            let token: TokenInfo = {
                index = totalSupply_;
                var owner = to;
                var metadata = metadata;
                var operator = null;
                var isBlocked = false;
                timestamp = Time.now();
            };
            tokens.put(totalSupply_, token);
            _addTokenTo(to, totalSupply_);
            totalSupply_ += 1;
            ignore addTxRecord(msg.caller, #mint(metadata), ?token.index, #user(blackhole), #user(to), Time.now());
        };
        return #Ok((startIndex, txs.size() - arr.size()));
    };

    public shared(msg) func burn(tokenId: Nat): async TxReceipt {
        if(_exists(tokenId) == false) {
            return #Err(#TokenNotExist)
        };
        if(_isOwner(msg.caller, tokenId) == false) {
            return #Err(#Unauthorized);
        };
        _burn(msg.caller, tokenId); //not delete tokenId from tokens temporarily. (consider storage limited, it should be delete.)
        let txid = addTxRecord(msg.caller, #burn, ?tokenId, #user(msg.caller), #user(blackhole), Time.now());
        return #Ok(txid);
    };

    public shared(msg) func approve(tokenId: Nat, operator: Principal) : async TxReceipt {
        var owner: Principal = switch (_ownerOf(tokenId)) {
            case (?own) {
                own;
            };
            case (_) {
                return #Err(#TokenNotExist)
            }
        };
        if(Principal.equal(msg.caller, owner) == false)
            if(_isApprovedForAll(owner, msg.caller) == false)
                return #Err(#Unauthorized);
        if(owner == operator) {
            return #Err(#InvalidOperator);
        };
        switch (tokens.get(tokenId)) {
            case (?info) {
                info.operator := ?operator;
                tokens.put(tokenId, info);
            };
            case _ {
                return #Err(#TokenNotExist);
            };
        };
        switch (users.get(operator)) {
            case (?user) {
                user.allowedTokens := TrieSet.put(user.allowedTokens, tokenId, Hash.hash(tokenId), Nat.equal);
                users.put(operator, user);
            };
            case _ {
                let user = _newUser();
                user.allowedTokens := TrieSet.put(user.allowedTokens, tokenId, Hash.hash(tokenId), Nat.equal);
                users.put(operator, user);
            };
        };
        let txid = addTxRecord(msg.caller, #approve, ?tokenId, #user(msg.caller), #user(operator), Time.now());
        return #Ok(txid);
    };

    public shared(msg) func transfer(to: Principal, tokenId: Nat): async TxReceipt {
        var owner: Principal = switch (_ownerOf(tokenId)) {
            case (?own) {
                own;
            };
            case (_) {
                return #Err(#TokenNotExist)
            }
        };
        if (owner != msg.caller) {
            return #Err(#Unauthorized);
        };
        _clearApproval(msg.caller, tokenId);
        _transfer(to, tokenId);
        let txid = addTxRecord(msg.caller, #transfer, ?tokenId, #user(msg.caller), #user(to), Time.now());
        return #Ok(txid);
    };

    public shared(msg) func transferFrom(from: Principal, to: Principal, tokenId: Nat): async TxReceipt {
        if(_exists(tokenId) == false) {
            return #Err(#TokenNotExist)
        };
        if(_isApprovedOrOwner(msg.caller, tokenId) == false) {
            return #Err(#Unauthorized);
        };
        _clearApproval(from, tokenId);
        _transfer(to, tokenId);
        let txid = addTxRecord(msg.caller, #transferFrom, ?tokenId, #user(from), #user(to), Time.now());
        return #Ok(txid);
    };

    public query func balanceOf(who: Principal): async Nat {
        return _balanceOf(who);
    };

    public query func totalSupply(): async Nat {
        return totalSupply_;
    };

    public query func isApprovedForAll(owner: Principal, operator: Principal) : async Bool {
        return _isApprovedForAll(owner, operator);
    };

    public query func getUserInfo(who: Principal) : async UserInfoExt {
        switch (users.get(who)) {
            case (?user) {
                return _userInfotoExt(user)
            };
            case _ {
                throw Error.reject("unauthorized");
            };
        };        
    };

    public query func getUserTokens(owner: Principal) : async [TokenInfoExt] {
        let tokenIds = switch (users.get(owner)) {
            case (?user) {
                TrieSet.toArray(user.tokens)
            };
            case _ {
                []
            };
        };
        let ret = Buffer.Buffer<TokenInfoExt>(tokenIds.size());
        for(id in Iter.fromArray(tokenIds)) {
            ret.add(_tokenInfotoExt(_unwrap(tokens.get(id))));
        };
        return ret.toArray();
    };

    public query func ownerOf(tokenId: Nat): async Principal {
        switch (_ownerOf(tokenId)) {
            case (?owner) {
                return owner;
            };
            case _ {
                throw Error.reject("token not exist")
            };
        }
    };

    // Optional
    public query func getAllTokens() : async [TokenInfoExt] {
        Iter.toArray(Iter.map(tokens.entries(), func (i: (Nat, TokenInfo)): TokenInfoExt {_tokenInfotoExt(i.1)}))
    };

    // upgrade functions
    system func preupgrade() {
        usersEntries := Iter.toArray(users.entries());
        tokensEntries := Iter.toArray(tokens.entries());
    };

    system func postupgrade() {
        type TokenInfo = Types.TokenInfo;
        type UserInfo = Types.UserInfo;

        users := HashMap.fromIter<Principal, UserInfo>(usersEntries.vals(), 1, Principal.equal, Principal.hash);
        tokens := HashMap.fromIter<Nat, TokenInfo>(tokensEntries.vals(), 1, Nat.equal, Hash.hash);
        usersEntries := [];
        tokensEntries := [];
    };
};