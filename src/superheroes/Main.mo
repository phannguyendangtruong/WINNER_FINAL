/**
 * Module     : main.mo
 * Copyright  : 2022 Rocklabs Team
 * License    : Apache 2.0 with LLVM Exception
 * Stability  : Experimental
 */

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
import AID "./Utils/AccountId";
import User "./User";
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
    type UserInfoExt = Types.UserInfoExt;

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
    private var users = HashMap.HashMap<Principal, UserInfo>(1, Principal.equal, Principal.hash);
    // lấy cccd làm key
    private var info = HashMap.HashMap<Text, Info>(1, Text.equal, Text.hash);
    private var orders = HashMap.HashMap<Nat, OrderInfo>(1, Nat.equal, Hash.hash);
    private stable var txs: [TxRecord] = [];
    private stable var txIndex: Nat = 0;
    private stable var totalOrders_: Nat = 0;

    public shared(msg) func add_user(walletAddress : Principal, username : Text, cccd : Text ) : async [UserInfo] {   
        users.put(walletAddress,{username = username ; cccd = cccd});
        info.put(cccd, {walletAddress = walletAddresds ; username = username});
    };

    public query func getValInfo() : async [Info] {
        Iter.toArray(info.vals());
    };

    public query func getValUsers() : async [UserInfo] {
        Iter.toArray(users.vals());
    };

      // Đang chỉ lấy thông tin Info gồm name và pricipal
    public query func findUser(cccd : Text) : async ?Info {
        info.get(cccd);
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
                Debug.print("========> getUserTokens " );

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
        type OrderInfo = Types.OrderInfo;

        users := HashMap.fromIter<Principal, UserInfo>(usersEntries.vals(), 1, Principal.equal, Principal.hash);
        tokens := HashMap.fromIter<Nat, TokenInfo>(tokensEntries.vals(), 1, Nat.equal, Hash.hash);
        // orders := HashMap.fromIter<Nat, OrderInfo>(ordersEntries.vals(), 1 , Nat.equal, Hash.hash);
        usersEntries := [];
        tokensEntries := [];
    };
};