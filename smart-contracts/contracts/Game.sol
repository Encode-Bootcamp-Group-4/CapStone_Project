// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Game is Ownable {
    constructor(uint256 _minBet) {
        minBet = _minBet;
        ownerAddress = msg.sender;
    }

    // to store balances in contract
    mapping(address => uint256) public balances;

    // for game id counters
    using Counters for Counters.Counter;
    Counters.Counter private _gameIds;

    struct gameStruct {
        uint256 gameId;
        uint256 betSize;
        uint16 score;
        address addressSetter;
        address addressChallenger; // is the game being challenged right now?
    }
    uint256 public gameId;
    // to store active games in contract
    mapping(gameId => gameStruct) public games;

    // create a game
    function createGame() public payable {
        require(msg.value >= minBet, "need to bet some money my friend");
        _gameIds.increment();
        uint256 newGameId = _gameIds.current();

        const _gameStruct = gameStruct(
            newGameId,
            msg.value,
            0,
            msg.sender,
            0x0
        );
        games[newGameId] = _gameStruct;
        emit GameCreated(_gameStruct);
        return newGameId;
    }

    // set the game score for a created game. backend function
    function setGameScore(
        uint256 _gameId,
        uint16 _score,
        address _address
    ) public Ownable {
        require(
            _address == games[_gameId].addressSetter,
            "Incorrect address for game id!"
        );
        require(games[_gameId].score == 0, "Score already set!");
        games[_gameId].score = _score;
    }

    // challenge an existing game
    function startChallenge(uint256 _gameid) public payable {
        const _game = games[_gameId];
        require(
            _game.addressChallenger == 0x0 && _game.score > 0,
            "game is not open!"
        );
        require(msg.value >= _game.betSize, "You did not match the bet");
        require(
            _game.addressSetter != msg.sender,
            "You cannot challenge yourself!"
        );
        games[_gameId].gameChallenger = msg.sender;
    }

    // close off the challenge. backend function
    function closeChallenge(
        uint256 _gameId,
        uint16 _score,
        address _address
    ) public Ownable {
        require(
            _address == games[_gameId].addressChallenger,
            "address is not the challenger!"
        );
        _game = games[_gameId];
        if (_score > _game.score) {
            // destroy the game
            delete games[_gameId];
            // add balance to winner
            balances[_address] = balances[_address] + _game.betSize;
        } else {
            // add balance to winner
            balances[_game.addressSetter] =
                balances[_game.addressSetter] +
                _game.betSize;
            // open game to others
            games[_gameId].addressChallenger = 0x0;
        }
    }

    /// @notice Withdraw `amount` from that accounts prize pool
    function prizeWithdraw(uint256 _amount) public {
        require(_amount <= balances[msg.sender], "Not enough balance");
        prize[msg.sender] -= _amount;
        // check with bryce and with mw that this is safe
        payable(msg.sender).transfer(_amount * 0.95);
        // our fee - 5% at extraction
        payable(ownerAddress).transfer(_amount * 0.05);
    }
}
