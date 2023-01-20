
const hre = require("hardhat");

async function main() {

  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );
  console.log("Account balance:", (await deployer.getBalance()).toString());
  
          //////////////// On deploy ici tout nos contracts ///////////////

  const TokenA = await ethers.getContractFactory("TokenA");
	const contractTokenA = await TokenA.deploy();

  await contractTokenA.deployed();
  console.log("Contract Token A deployed at:", contractTokenA.address);

  const TokenB = await ethers.getContractFactory("TokenB");
	const contractTokenB = await TokenB.deploy();

  await contractTokenB.deployed();
  console.log("Contract Token B deployed at:", contractTokenB.address);

  const TokenC = await ethers.getContractFactory("TokenC");
	const contractTokenC = await TokenC.deploy();

  await contractTokenC.deployed();
  console.log("Contract Token B deployed at:", contractTokenC.address);

  const Proxy = await ethers.getContractFactory("Proxy");
	const contractProxy = await Proxy.deploy();

  await contractProxy.deployed();
  console.log("Contract Proxy deployed at:", contractProxy.address);

  const ProxyAdmin = await ethers.getContractFactory("ProxyAdmin");
	const contractProxyAdmin = await ProxyAdmin.deploy();

  await contractProxyAdmin.deployed();
  console.log("Contract ProxyAdmin deployed at:", contractProxyAdmin.address);

  const ProjectSolidityV1 = await ethers.getContractFactory("ProjectSolidityV1");
	const contractProjectSolidityV1 = await ProjectSolidityV1.deploy(contractTokenA.address,contractTokenB.address,contractTokenC.address);

  await contractProjectSolidityV1.deployed();
  console.log("Contract ProjectSolidityV1 deployed at:", contractProjectSolidityV1.address);

  const ProjectSolidityV2 = await ethers.getContractFactory("ProjectSolidityV2");
	const contractProjectSolidityV2 = await ProjectSolidityV2.deploy(contractTokenA.address,contractTokenB.address,contractTokenC.address);

  await contractProjectSolidityV2.deployed();
  console.log("Contract ProjectSolidityV2 deployed at:", contractProjectSolidityV2.address);

                  //////////////////// Ici on prepare les contracts ////////////////
  // On mint des tokenC pour le proxy pour permettre au joueur de parier sur le prix de l'ether
  const versementTokenC = await TokenC.attach(contractTokenC.address);
  await versementTokenC.chargeProxy(contractProxy.address);

  const responseVersement = await versementTokenC.balanceOf(contractProxy.address);
  var data = JSON.parse(responseVersement);
  console.log("Le solde du Proxy en Token C est a present de: ",data);

  //Ici on connecte le proxy avec ProjectSolidityV1 et ProxyAdmin
  const connectionProxy = await Proxy.attach(contractProxy.address);
  await connectionProxy.upgradeTo(contractProjectSolidityV1.address);
  await connectionProxy.changeAdmin(contractProxyAdmin.address);

  //On regarde les resultats des actions precedante via le ProxyAdmin Contract
  const connectionProxyAdmin = await ProxyAdmin.attach(contractProxyAdmin.address);
  const responseConnectionsProxy = await connectionProxyAdmin.getProxyAdmin(contractProxy.address);
  console.log("Depuis le contract Proxy Admin on voit que l'address de l'admin du proxy est: ",responseConnectionsProxy);

  const responseConnectionProject = await connectionProxyAdmin.getProxyImplementation(contractProxy.address);
  console.log("Depuis le contract Proxy Admin on voit que l'address du contract controlle par le proxy est: ",responseConnectionProject);


  /// On se mint des token + allowance avec l'address du proxy
  const versementTokenA = await TokenA.attach(contractTokenA.address);
  await versementTokenA.mint(222);

  const responseVersementTokenA = await versementTokenA.balanceOf(deployer.address);
  var data = JSON.parse(responseVersementTokenA);
  console.log("Le solde du User en Token A est a present de: ",data);
  await versementTokenA.approve(contractProxy.address,101)

  const versementTokenB = await TokenB.attach(contractTokenB.address);
  await versementTokenB.mint(223);

  const responseVersementTokenB = await versementTokenB.balanceOf(deployer.address);
  var data = JSON.parse(responseVersementTokenB);
  console.log("Le solde du User en Token B est a present de: ",data);
  await versementTokenB.approve(contractProxy.address,101)


  // On ajoute de la liquidité sur le Proxy via le SC V1
  const actionsViaProxy = await ProjectSolidityV1.attach(contractProxy.address);
  await actionsViaProxy.addLiquidity(100,100);
  const responsetest = await actionsViaProxy.getReserve();
  var data = JSON.parse(responsetest);
  console.log("Les shares du dépot sont: ",data);

  // On fait des tests pour savoir si on peut removeLiquidity qui n'existe pas sur V1
  // Et on test en forcant un attach a la V2 sans faire le Upgrade sur ProxyAdmin
  try {
    await actionsViaProxy.removeLiquidity(100);
  } catch (err) {
    //console.log("error: ", err);
    console.log("ERREUR Car notre proxy pointe sur la V1 qui n'a toujours pas la fonction remove liquidity.");
  }

  try {    
    await connectionProxy.upgradeTo(contractProjectSolidityV2.address);
    await actionsViaProxy.removeLiquidity(100);
  } catch (err) {
    //console.log("error: ", err);
    console.log("ERREUR le User admin ne peut plus upgrade le Proxy directement, il doit passer par le ProxyAdmin");
  }

  try {    
    const connectionProxytest2 = await ProjectSolidityV2.attach(contractProxy.address);
    const responsetest2 = await connectionProxytest2.removeLiquidity(100);
  } catch (err) {
    //console.log("error: ", err);
    console.log("ERREUR Car nous n'avons pas upgrade dans les règles de l'art (en utilisant le ProxyAdmin)");
  }

  // Let's Do a SWAP
  const responseTokenA2 = await versementTokenA.balanceOf(deployer.address);
  var data = JSON.parse(responseTokenA2);
  console.log("Le solde du User avant Swap en Token A est a present de: ",data);
  await versementTokenA.approve(contractProxy.address,101);


  const responseTokenB2 = await versementTokenB.balanceOf(deployer.address);
  var data = JSON.parse(responseTokenB2);
  console.log("Le solde du User avant Swap en Token B est a present de: ",data);
  await versementTokenB.approve(contractProxy.address,101);

  await actionsViaProxy.swap(contractTokenA.address,80);
  console.log("On Swap 20 Token A");

  const responseTokenA3 = await versementTokenA.balanceOf(deployer.address);
  var data = JSON.parse(responseTokenA3);
  console.log("Le solde du User apres Swap en Token A est a present de: ",data);


  const responseTokenB3 = await versementTokenB.balanceOf(deployer.address);
  var data = JSON.parse(responseTokenB3);
  console.log("Le solde du User apres Swap en Token B est a present de: ",data);



  // On upgrade notre Proxy pour la V2 via le ProxyAdmin
  await connectionProxyAdmin.upgrade(contractProxy.address,contractProjectSolidityV2.address);

  const connectionProxytest3 = await ProjectSolidityV2.attach(contractProxy.address);

  // On remove la liquidite
  await connectionProxytest3.removeLiquidity(100);

  const responseTokenA4 = await versementTokenA.balanceOf(deployer.address);
  var data = JSON.parse(responseTokenA4);
  console.log("Le solde du User en Token A est a present de: ",data);


  const responseTokenB4 = await versementTokenB.balanceOf(deployer.address);
  var data = JSON.parse(responseTokenB4);
  console.log("Le solde du User en Token B est a present de: ",data);

}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

