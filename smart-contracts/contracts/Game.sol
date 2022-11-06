// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Game is Ownable {
    
    uint256 public minBet;
    address public ownerAddress;

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

    // to store active games in contract
    mapping(uint256 => gameStruct) public games;

    // open game event
    event OpenGame(uint256 gameId, uint256 betSize, address addressSetter);

    // close game event
    event CloseChallenge(uint256 gameId, uint16 score, address addressChallenger);

    constructor(uint256 _minBet) {
        minBet = _minBet;
        ownerAddress = msg.sender;
    }

    // create a game
    function createGame() public payable returns (uint256) {
        require(msg.value >= minBet, "need to bet some more money my friend, minimum bet is 0.01 ether");

        _gameIds.increment();
        uint256 newGameId = _gameIds.current();

        games[newGameId] = gameStruct(
            newGameId,
            msg.value,
            0,
            msg.sender,
            0x0000000000000000000000000000000000000000
        );
        return newGameId;
    }

    // set the game score for a created game. backend function
    function setGameScore(
        uint256 _gameId,
        uint16 _score,
        address _address
    ) public {
        require(msg.sender == ownerAddress, "onlyOwner!");
        require(
            _address == games[_gameId].addressSetter,
            "Incorrect address for game id!"
        );
        require(games[_gameId].score == 0, "Score already set!");
        games[_gameId].score = _score;
        emit OpenGame(_gameId, games[_gameId].score, games[_gameId].addressSetter);
    }

    // challenge an existing game
    function startChallenge(uint256 _gameId) public payable {
        gameStruct memory _game = games[_gameId];
        require(
            _game.addressChallenger ==
                0x0000000000000000000000000000000000000000 &&
                _game.score > 0,
            "game is not open!"
        );
        require(msg.value == _game.betSize, "You did not match the bet");
        require(
            _game.addressSetter != msg.sender,
            "You cannot challenge yourself!"
        );
        games[_gameId].addressChallenger = msg.sender;
    }

    // close off the challenge. backend function
    function closeChallenge(
        uint256 _gameId,
        uint16 _score,
        address _address
    ) public {
        require(msg.sender == ownerAddress, "onlyOwner!");
        require(
            _address == games[_gameId].addressChallenger,
            "address is not the challenger!"
        );
        gameStruct memory _game = games[_gameId];
        if (_score > _game.score) {
            // destroy the game
            delete games[_gameId];
            // add balance to winner
            balances[_address] = balances[_address] + _game.betSize * 2;
        } else {
            // add balance to winner
            balances[_game.addressSetter] =
                balances[_game.addressSetter] +
                _game.betSize;
            // open game to others
            games[_gameId]
                .addressChallenger = 0x0000000000000000000000000000000000000000;
        }
        emit CloseChallenge(_gameId, games[_gameId].score, games[_gameId].addressChallenger);
    }

    /// @notice Withdraw `amount` from that accounts prize pool
    function prizeWithdraw(uint256 _amount) public {
        require(_amount <= balances[msg.sender], "Not enough balance");
        balances[msg.sender] -= _amount;
        // send 95% of the amount to the user
        payable(msg.sender).transfer((_amount * 19) / 20);
        // our fee - 5% at extraction
        payable(ownerAddress).transfer(_amount / 20);
    }
}