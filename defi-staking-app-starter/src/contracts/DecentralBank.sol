
pragma solidity ^0.5.8;
import './RWD.sol';
import './Tether.sol';

contract DecentralBank {
    address public owner;
    string public name = "Decentral Bank";
    Tether public tether;
    RWD public rwd;

    address[] public stakers;

    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;


    constructor(RWD _rwd, Tether _tether) public {
       rwd = _rwd;
       tether = _tether;
       owner = msg.sender;
    }

    //Staking function
    function depositTokens (uint _amount) public {
        // Require the staking amount to be higher than zero
        require(_amount > 0, 'The amount cannot be equal or less than zero');

        //Transfer our tether tokens to this contract address for staking
        tether.transferFrom(msg.sender, address(this),_amount);

        //Update the staking balance for the sender
        stakingBalance[msg.sender] += _amount;

        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        //Update the staking balance
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    //Unstaked the coins 
    function unstakeToken() public {
        uint balance = stakingBalance[msg.sender];
        require(balance>0, 'staking balance must be higher than 0 in order to unstake');

        //Transfer the token back to the customer
        tether.transfer(msg.sender, balance);

        stakingBalance[msg.sender] = 0;
        isStaking[msg.sender] = false;
        
    }

    modifier bankOwner {
        require(msg.sender == owner, 'caller must be the owner');
        _;
    }

    //Issue the rewards of the staking
    function issueTokens() public bankOwner {
        //Loop over the stakers in order to send them the reward token, 
        //equal to one nineth of the tether they have staked
        for (uint i=0; i<stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient] / 9;
            if(balance>0) {
                rwd.transfer(recipient, balance);
            }
        }
    }


}

