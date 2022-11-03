// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

//import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

//still have to add the safemath library

contract TokenizedBallot {

    event gameBegin(address indexed _playing);

    event logScore(address indexed _playing, uint256 indexed _score, bool indexed _winning);

    address public playing;

    bool public betsOpen;

    struct gameData {
        uint256 betSize;
        uint256 highScore;
        address currentWinner;
    }

    struct devData {
        //fee for the contract holder as a percentage of the betSize in bps
        uint256 fee;   
        uint256 feesCollected;
        address owner;
    }

    gameData public stats;

    devData private devStats;


    //This really is unnecesserary, should jusy be done of chain
    mapping (address => uint256) public score;

    mapping (address => uint256) public prize;


    constructor(uint256 _betSize, uint256 _fee) {
        stats.betSize = _betSize;
        devStats.fee = _fee;
        devStats.owner = msg.sender;
        betsOpen=true;
    }

    function bet() public payable {
        require(betsOpen,"Bets are closed :(");
        require(msg.value >= stats.betSize, "Need to bet BIGGER!!!!!!!!");
        //close the betting
        betsOpen=false;
        playing=msg.sender;
        emit gameBegin(msg.sender);
    }


    function saveScore(address player, uint256 _score) external {
        require(msg.sender == devStats.owner,
         "This function can only be accessed through game");
        
        require(player==playing,
        "Player is not currently playing");
        if (_score > stats.highScore) {
            stats.highScore = _score;
            score[playing] = _score;
            prize[playing] += ( stats.betSize * ( 10000-devStats.fee ) ) / 10000;
        } else {
            prize[stats.currentWinner] += ( stats.betSize * ( 10000-devStats.fee ) ) / 10000;
        }
        playing = address(0);
        betsOpen = true;
        emit logScore(player , _score, _score > stats.highScore);
    }

    /// @notice Withdraw `amount` from that accounts prize pool
    function prizeWithdraw(uint256 amount) public {
        require(amount <= prize[msg.sender], "Not enough prize");
        prize[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    /// @notice Withdraw `amount` from the owner pool
    function ownerWithdraw(uint256 amount) public {
        require(amount <= devStats.feesCollected, "Not enough fees collected");
        devStats.feesCollected -= amount;
        payable(devStats.owner).transfer(amount);
    }

    function viewDev() public view returns(devData memory) {
        require(msg.sender == devStats.owner,
         "Only Devs can view this data");
        return devStats;
    }
        
}