
const hre = require("hardhat");
const tokenCAddress = "0x0510CF1Bdf9ddA465a43E886c5B85E90B71B2748";
const projectSolidityV2Address = "0xab63360A7747A5A2E84B94591ee6D5a6ce6c68fe"; 


async function main() {

  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );
  console.log("Account balance:", (await deployer.getBalance()).toString());
  
          //////////////// On deploy ici tout nos contracts ///////////////

  const versementTokenC = await TokenA.attach(tokenCAddress);
  await versementTokenC.chargeProxy();
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

