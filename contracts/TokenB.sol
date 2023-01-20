// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;


//Token
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract TokenB is ERC20{ 

    mapping(address => uint256) UserLastRun;

    constructor() ERC20("Token B", "TOKEN-B") {

    }

    function mint(uint amount) public {
        require(block.timestamp - UserLastRun[msg.sender] > 5 minutes, "Need to wait 5 minutes");
        UserLastRun[msg.sender] = block.timestamp;
        _mint(msg.sender, amount);
    }

    function setAllowance(address speder) public view {
        allowance(msg.sender, speder);
    }
}