// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

// Oracle
//import "https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";


//Token
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract ProjectSolidityV2 { 

    address admin;

    // Oracle 
    AggregatorV3Interface internal priceFeed;

    address[] playerArray;
    mapping(address => int) playerPrediction;
    mapping(address => int) playerEntryPrice;
    uint today;

    
    /**
     * Network: Goerli
     * Aggregator: ETH/USD
     * Address: 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
     */
    constructor(address _token0, address _token1, address _token2) {
        admin = msg.sender;

        //Oracle
        priceFeed = AggregatorV3Interface(
            0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        );
        today = block.timestamp;


        // AMM

        //token0 = IERC20(0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6);
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
        token2 = IERC20(_token2);
        fees = 100;

    }

    uint256 MAX_UINT = 2**256 - 1;
    int MAX_INT = 2**256/2 - 1;


    ////////////////Oracle/////////////////////////


    function getLatestPrice() public view returns (int) {
        (
            ,
            /*uint80 roundID*/
            int price,
            ,
            ,

        ) = /*uint startedAt*/
            /*uint timeStamp*/
            /*uint80 answeredInRound*/
            priceFeed.latestRoundData();
        return price;
    }

    function makePrediction(int price) external payable {
        require (block.timestamp < today + 10 days);

        require(msg.value == 1 ether);
        playerArray.push(msg.sender);
        playerPrediction[msg.sender] = price;
    }

    function selectWinner() external {
        require (block.timestamp >= today + 10 days);

        int bestGuess = MAX_INT ;
        uint playerPosition;
        uint arrayLength = playerArray.length;
        int realPrice = getLatestPrice();

        for (uint i = 0; i < arrayLength; i++) {
            if(abs(playerPrediction[playerArray[i]] - realPrice) < bestGuess){
                playerPosition = i;
                bestGuess = playerPrediction[playerArray[i]];
            }
        }

        payable (playerArray[playerPosition]).transfer(address(this).balance);
    }

    function abs(int x) private pure returns (int) {
        return x >= 0 ? x : -x;
    }

    event retourPlaceBet(
        int playerEntryPrice,
        bool more,
        address player,
        uint amount
    );

    function sendViaCall(address payable _to) public payable {
        // Call returns a boolean value indicating success or failure.
        // This is the current recommended method to use.
        (bool sent, bytes memory data) = _to.call{value: msg.value}("");
        require(sent, "Failed to send Ether");
    }

    function placeBet(uint amount, bool more) public payable returns (int, bool, address, uint){
        require (msg.value > 0.004 ether);
        require (token2.balanceOf(msg.sender) >= amount);
        address payable adminPayable = payable(admin);
        sendViaCall(adminPayable);
        token2.approve(address(this), amount);
        token2.transferFrom(msg.sender, address(this), amount);
        playerEntryPrice[msg.sender] = getLatestPrice();
        emit retourPlaceBet(
            playerEntryPrice[msg.sender],
            more,
            msg.sender,
            amount
        );
        return (playerEntryPrice[msg.sender], more, msg.sender, amount);
    }

    function checkBet(int oldPrice, bool more, address player, uint amount) external {
        require(msg.sender == admin);

        int newPrice = getLatestPrice();

        if( (oldPrice < newPrice) == more ){
            token2.transfer(player,amount*2);
        }

    }

    int price1;
    address player1;
    uint _amount2;
    bool _more1;
    bool openToBets = true;

    function makeBet(uint amount, bool more) external payable {
        require (msg.value > 0.004 ether);
        require (token2.balanceOf(msg.sender) >= amount);
        require (openToBets);
        openToBets = false;

        address payable adminPayable = payable(admin);
        sendViaCall(adminPayable);
        token2.approve(address(this), amount);
        token2.transferFrom(msg.sender, address(this), amount);
        price1 = getLatestPrice();
        player1 = msg.sender;
        _amount2 = amount;
        _more1 = more;
    }

    function repayPlayer() external payable {
        require(msg.sender == admin);
        require(!openToBets);

        int newPrice = getLatestPrice();

        if( (price1 < newPrice) == _more1 ){
            token2.transfer(player1,_amount2*2);
        }

        openToBets = true;

    }



    //////////////////// AMM //////////////////

    IERC20 public immutable token0;
    IERC20 public immutable token1;
    IERC20 public immutable token2;

    uint public reserve0;
    uint public reserve1;
    uint public fees;

    uint public totalSupply;
    mapping(address => uint) public balanceOf;

    function getBalanceOf(address user) public view returns (uint userbalance){
        return balanceOf[user];
    }

    function getReserve() public view returns (uint){
        return reserve0;
    }

    function _mint(address _to, uint _amount) private {
        balanceOf[_to] += _amount;
        totalSupply += _amount;
    }

    function _burn(address _from, uint _amount) private {
        balanceOf[_from] -= _amount;
        totalSupply -= _amount;
    }

    function _update(uint _reserve0, uint _reserve1) private {
        reserve0 = _reserve0;
        reserve1 = _reserve1;
    }

    function setFees(uint newFees) public {
        require(msg.sender == admin);
        fees = newFees;
    }


    function swap(address _tokenIn, uint _amountIn) external returns (uint amountOut) {
        require(
            _tokenIn == address(token0) || _tokenIn == address(token1),
            "invalid token"
        );
        require(_amountIn > 0, "amount in = 0");

        bool isToken0 = _tokenIn == address(token0);
        (IERC20 tokenIn, IERC20 tokenOut, uint reserveIn, uint reserveOut) = isToken0
            ? (token0, token1, reserve0, reserve1)
            : (token1, token0, reserve1, reserve0);

        tokenIn.transferFrom(msg.sender, address(this), _amountIn);

        
        // 0.3% fee
        uint amountInWithFee = (_amountIn * 900) / 1000;
        amountOut = (reserveOut * amountInWithFee) / (reserveIn + amountInWithFee);

        tokenOut.transfer(msg.sender, amountOut);

        _update(token0.balanceOf(address(this)), token1.balanceOf(address(this)));
    }

    function addLiquidity(uint _amount0, uint _amount1) external returns (uint shares) {
        token0.transferFrom(msg.sender, address(this), _amount0);
        token1.transferFrom(msg.sender, address(this), _amount1);

        
        if (reserve0 > 0 || reserve1 > 0) {
            require(reserve0 * _amount1 == reserve1 * _amount0, "x / y != dx / dy");
        }

        
        if (totalSupply == 0) {
            shares = _sqrt(_amount0 * _amount1);
        } else {
            shares = _min(
                (_amount0 * totalSupply) / reserve0,
                (_amount1 * totalSupply) / reserve1
            );
        }
        require(shares > 0, "shares = 0");
        _mint(msg.sender, shares);

        _update(token0.balanceOf(address(this)), token1.balanceOf(address(this)));
    }

    

    function _sqrt(uint y) private pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function _min(uint x, uint y) private pure returns (uint) {
        return x <= y ? x : y;
    }

    function removeLiquidity(
        uint _shares
    ) external returns (uint amount0, uint amount1) {
        
        // bal0 >= reserve0
        // bal1 >= reserve1
        uint bal0 = token0.balanceOf(address(this));
        uint bal1 = token1.balanceOf(address(this));

        amount0 = (_shares * bal0) / totalSupply;
        amount1 = (_shares * bal1) / totalSupply;
        require(amount0 > 0 && amount1 > 0, "amount0 or amount1 = 0");

        _burn(msg.sender, _shares);
        _update(bal0 - amount0, bal1 - amount1);

        token0.transfer(msg.sender, amount0);
        token1.transfer(msg.sender, amount1);
    }

}
