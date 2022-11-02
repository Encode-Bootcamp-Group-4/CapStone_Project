// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;



contract TokenizedBallot {

    uint256 public betSize;
    //check the actial relm of possible scores this size can probably be reduced
    uint256 public highScore;
    //the address of the current winner
    address public currentWinner;
    //fee for the contract holder as a percentage of the betSize in bps
    uint256 private fee;

    //This really is unnecesserary, should jusy be done of chain
    mapping (address => uint256) public score;

    mapping (address => uint256) public prize;


    constructor(uint256 _betSize, uint256 _fee) {
        betSize = _betSize;
        fee = _fee;      
    }

    function bet() public payable {
        //uint256 votePower_ = votePower(msg.sender);
        //require(votePower_ >= amount, "Not enough vote power");
		//		require(votePowerSpent[msg.sender] + amount <= votePower_, "Not enough vote power");
    }


    function saveScore(uint256 _score) public {
        if (_score > highScore) {
            highScore = _score;
            score[msg.sender] = _score;
            prize[msg.sender] += ( betSize * ( 10000-fee ) ) / 10000;
        } else {
            prize[currentWinner] += ( betSize * ( 10000-fee ) ) / 10000;
        }
    }
}