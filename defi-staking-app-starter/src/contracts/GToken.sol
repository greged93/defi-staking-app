pragma solidity ^0.5.8;

contract GToken {
    string public name = "GToken";
    string public symbol = "GTO";
    uint256 public supply = 1e24;
    uint256 public decimals = 18;
    uint256 public deployedAmount = 1e23;

    event Transfer (
        address indexed _from,
        address indexed _to,
        uint _value
    );

    event Approve (
        address indexed _owner,
        address indexed _spender,
        uint _value
    );

    mapping(address => uint256) public balanceOf;

    constructor() public {
        balanceOf[msg.sender] = supply;
    }
}