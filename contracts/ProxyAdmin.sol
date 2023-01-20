// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./Proxy.sol";

contract ProxyAdmin {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    function getProxyAdmin(address proxy) external view returns (address) {
        (bool ok, bytes memory res) = proxy.staticcall(abi.encodeCall(Proxy.admin, ()));
        require(ok, "call failed");
        return abi.decode(res, (address));
    }

    function getProxyImplementation(address proxy) external view returns (address) {
        (bool ok, bytes memory res) = proxy.staticcall(
            abi.encodeCall(Proxy.implementation, ())
        );
        require(ok, "call failed");
        return abi.decode(res, (address));
    }

    function changeProxyAdmin(address payable proxy, address admin) external onlyOwner {
        Proxy(proxy).changeAdmin(admin);
    }

    function upgrade(address payable proxy, address implementation) external onlyOwner {
        Proxy(proxy).upgradeTo(implementation);
    }
}