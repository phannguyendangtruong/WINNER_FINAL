/**
 * Module     : types.mo
 * Copyright  : 2021 Rocklabs Team
 * License    : Apache 2.0 with LLVM Exception
 * Stability  : Experimental
 */

import Time "mo:base/Time";
import TrieSet "mo:base/TrieSet";
import Bool "mo:base/Bool";


module {
    public type Metadata = {
        logo: Text;
        name: Text;
        symbol: Text;
        desc: Text;
        totalSupply: Nat;
        owner: Principal;
        isBlocked: Bool;
        cycles: Nat;
    };

    public type Location = {
        #InCanister: Blob; // NFT encoded data
        #AssetCanister: (Principal, Blob); // asset canister id, storage key
        #IPFS: Text; // IPFS content hash
        #Web: Text; // URL pointing to the file
    };
    public type Attribute = {
        key: Text;
        value: Text;
    };
    public type TokenMetadata = {
        tokenUri: Text;
    };

    public type TokenInfo = {
        index: Nat;
        var owner: Principal;
        var metadata: ?TokenMetadata;
        var operator: ?Principal;
        var isBlocked: Bool;
        timestamp: Time.Time;
    };

    public type TokenInfoExt = {
        index: Nat;
        owner: Principal;
        metadata: ?TokenMetadata;
        operator: ?Principal;
        isBlocked: Bool;
        timestamp: Time.Time;
    };
    
    public type User = {
        walletAddress : Principal;
        username : Text;
        role : Nat;
        cccd : Text;
        school: Text;
        birthday: Text;
        image: Text;
        description: Text;
    };

    public type UserInfo = {
        var operators: TrieSet.Set<Principal>;     // principals allowed to operate on the user's behalf
        var allowedBy: TrieSet.Set<Principal>;     // principals approved user to operate their's tokens
        var allowedTokens: TrieSet.Set<Nat>;       // tokens the user can operate
        var tokens: TrieSet.Set<Nat>;              // user's tokens
    };

    public type UserInfoExt = {
        operators: [Principal];
        allowedBy: [Principal];
        allowedTokens: [Nat];
        tokens: [Nat];
    };

    public type OrderInfo = {
        price: Nat;
        index: Nat;
        owner: Principal;
    };

    /// Update call operations
    public type Operation = {
        #mint: ?TokenMetadata;  
        #burn;
        #transfer;
        #transferFrom;
        #approve;
        #approveAll;
        #revokeAll; // revoke approvals
        #setMetadata;
        #createOrder;
    };
    /// Update call operation record fields
    public type Record = {
        #user: Principal;
        #metadata: ?TokenMetadata; // op == #setMetadata
    };
    public type TxRecord = {
        caller: Principal;
        op: Operation;
        index: Nat;
        tokenIndex: ?Nat;
        from: Record;
        to: Record;
        timestamp: Time.Time;
    };

    // Khai báo trường School
    public type SchoolList ={
        name: Text;
        address: Text;
        schoolCode: Text;
        chairman: Text;
        logo: Text;
        image: Text;
        description: Text;
    };

     public type SchoolId ={
        id: Nat;
    };

    // Khai báo trường Degree
    public type DegreeList ={
        id: Nat;
        degreeName: Text;
    };

     public type DegreeId ={
        id: Nat;
    };
};