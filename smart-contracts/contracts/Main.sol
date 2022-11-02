// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

//import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract TokenizedBallot {

    event gameBegin(address indexed _from, bytes32 indexed _id, uint _value);

    event Deposit(address indexed _from, bytes32 indexed _id, uint _value);

    uint256 public betSize;
    //check the actial relm of possible scores this size can probably be reduced
    uint256 public highScore;
    //fee for the contract holder as a percentage of the betSize in bps
    uint256 private fee;
    
    uint256 private feesCollected;
    //the address of the current winner
    address public currentWinner;

    address private owner;

    address public playing;

    bool public betsOpen;

    //This really is unnecesserary, should jusy be done of chain
    mapping (address => uint256) public score;

    mapping (address => uint256) public prize;


    constructor(uint256 _betSize, uint256 _fee) {
        betSize = _betSize;
        fee = _fee;
        owner = msg.sender;
        betsOpen=true;
    }

    function bet() public payable {
        require(betsOpen,"Bets are closed :(");
        require(msg.value >= betSize, "Need to bet BIGGER!!!!!!!!");
        //close the betting
        betsOpen=false;
        playing=msg.sender;
    }


    function saveScore(uint256 _score) external {
        require(msg.sender == owner,
         "This function can only be accessed through game");
        if (_score > highScore) {
            highScore = _score;
            score[playing] = _score;
            prize[playing] += ( betSize * ( 10000-fee ) ) / 10000;
        } else {
            prize[currentWinner] += ( betSize * ( 10000-fee ) ) / 10000;
        }
        playing = address(0);
        betsOpen = true;
    }

    /// @notice Withdraw `amount` from that accounts prize pool
    function prizeWithdraw(uint256 amount) public {
        require(amount <= prize[msg.sender], "Not enough prize");
        prize[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    /// @notice Withdraw `amount` from the owner pool
    function ownerWithdraw(uint256 amount) public {
        require(amount <= feesCollected, "Not enough fees collected");
        feesCollected -= amount;
        payable(owner).transfer(amount);
    }
        
}