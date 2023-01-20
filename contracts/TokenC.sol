// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;


//Token
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract TokenC is ERC20{ 

    mapping(address => uint256) UserLastRun;
    address admin;

    constructor() ERC20("Token C", "TOKEN-C") {
        admin = msg.sender;
    }

    function mint(uint amount) public {
        require(block.timestamp - UserLastRun[msg.sender] > 10 minutes, "Need to wait 10 minutes");
        UserLastRun[msg.sender] = block.timestamp;
        _mint(msg.sender, amount);
    }

    function chargeProxy(address proxyAddress) public {
        require(msg.sender == admin);
        _mint(proxyAddress, 10000);
    }


    function setAllowance(address speder) public view {
        allowance(msg.sender, speder);
    }
}