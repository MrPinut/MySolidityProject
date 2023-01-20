
const hre = require("hardhat");

async function main() {

  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );
  console.log("Account balance:", (await deployer.getBalance()).toString());
  
          //////////////// On deploy ici tout nos contracts ///////////////

  const TokenC = await ethers.getContractFactory("TokenC");
	const contractTokenC = await TokenC.deploy();

  await contractTokenC.deployed();
  console.log("Contract Token C deployed at:", contractTokenC.address);

  const ProjectSolidityV2 = await ethers.getContractFactory("ProjectSolidityV2");
	const contractProjectSolidityV2 = await ProjectSolidityV2.deploy("0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844","0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",contractTokenC.address);

  await contractProjectSolidityV2.deployed();
  console.log("Contract ProjectSolidityV2 deployed at:", contractProjectSolidityV2.address);

  

}



main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

