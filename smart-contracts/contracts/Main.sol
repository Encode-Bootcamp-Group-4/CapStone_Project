// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;


contract Game {

    event gameBegin(address indexed _playing);

    event logScore(address indexed _playing, uint256 indexed _score, bool indexed _winning);

    address public playing;

    bool public betsOpen;

    struct gameData {
        uint256 betSize;
        uint16 highScore;
        address currentWinner;
    }

    struct devData {
        //fee for the contract holder as a percentage of the betSize in bps
        uint256 fee;   
        address owner;
    }

    gameData public stats;

    devData private devStats;


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


    function saveScore(address _player, uint16 _score) external {

        require(msg.sender == devStats.owner,
         "This function can only be accessed through game");
        require( _player==playing,
        "Player is not currently playing");

        if (stats.highScore == 0){
            stats.highScore = _score;
            stats.currentWinner = _player;
        } else if (_score > stats.highScore) {
            stats.highScore = _score;
            stats.currentWinner = _player;
            prize[playing] += ( stats.betSize * ( 10000-devStats.fee ) ) / 10000;
        } else {
            prize[stats.currentWinner] += ( stats.betSize * ( 10000-devStats.fee ) ) / 10000;
        }

        playing = address(0);
        betsOpen = true;
        emit logScore(_player , _score, _score > stats.highScore);
    }

    /// @notice Withdraw `amount` from that accounts prize pool
    function prizeWithdraw(uint256 amount) public {
        require(amount <= prize[msg.sender],
         "Not enough prize");
        prize[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    /// @notice Withdraw `amount` from the owner pool
    /// @notice We do not need to store a the total fees on chain as only one bet can be stored at a time and so all else is fees
    function ownerWithdraw(uint256 _amount) public onlyOwner {
        require( _amount <= address(this).balance-stats.betSize,
         "Not enough fees collected");
        payable(devStats.owner).transfer(_amount);
    }

    /// @notice Allows the devloper to view gamestats not available to others
    function viewDev() public view onlyOwner returns(devData memory) {
        return devStats;
    }

    modifier onlyOwner() {
        require(msg.sender == devStats.owner,
        "Only Devs can view this data");
        _;
    }
        
}