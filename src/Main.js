import { useState } from "react";
import { ethers, BigNumber } from 'ethers';
import { Box, Button, Flex, Input, Text } from '@chakra-ui/react';



import tokenC from './TokenC.json';
import projectSolidityV2 from './ProjectSolidityV2.json';



//require('dotenv').config();
//const { API_URL, PRIVATE_KEY, API_KEY_ETH } = process.env;



const tokenCAddress = "0x0510CF1Bdf9ddA465a43E886c5B85E90B71B2748";
const projectSolidityV2Address = "0x087f3B475E7A8d5f19F0ad4161129c44B4c55568";

const Main = ({ accounts, setAccounts }) => {
    const [mintAmount, setMintAmount, text] = useState(1);
    const isConnected = Boolean(accounts[0]);

    async function mintForSmartContract() {
        if (window.ethereum) {
            //const provider = new ethers.providers.Web3Provider(window.ethereum);
            //const signer = provider.getSigner();
            //console.log(await provider.getTransactionCount(signer.getAddress()));

            const provider = new ethers.providers.JsonRpcProvider(
                "https://eth-goerli.g.alchemy.com/v2/zClD1UVnF3NgvsFMOEFGT4R9rZJaTQ4C",
            )
            const adminAccount = new ethers.Wallet(
                '4985494784ec88101fca6b8716f0b52b86ef5a3d28269f46670cdf5d016b0434', provider
            )
            const contract = new ethers.Contract(
                tokenCAddress,
                tokenC.abi,
                adminAccount
            );
            try {
                const reponse = await contract.chargeProxy(projectSolidityV2Address);
                console.log('response: ', reponse);
            } catch (err) {
                console.log("error: ", err)
            }
        }
    }

    async function mintForPlayer() {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
                tokenCAddress,
                tokenC.abi,
                signer
            );
            try {
                const reponse = await contract.mint(10);
                console.log('response: ', reponse);
            } catch (err) {
                console.log("error: ", err)
            }
        }
    }

    async function betETHPrice() {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contractTokenC = new ethers.Contract(
                tokenCAddress,
                tokenC.abi,
                signer
            );
            const contractBet = new ethers.Contract(
                projectSolidityV2Address,
                projectSolidityV2.abi,
                signer
            );
            try {
                console.log('approve');
                const reponse = await contractTokenC.approve(projectSolidityV2Address,BigNumber.from(mintAmount));
                console.log('response: ', reponse);
                console.log('approve');

            } catch (err) {
                console.log('OKKKKKKKERRRRURRU');

                console.log("error: ", err)
            }
            /*try {
                console.log('OKKKKKKKMEEE');

                const options = {value: ethers.utils.parseEther("0.0041")};
                const reponse = await contractBet.placeBet(BigNumber.from(mintAmount),true,options);
                console.log('OKKKKKKK');

                console.log('response: ', reponse);
            } catch (err) {
                console.log("error: ", err)
            }
            */
            //test();
        }
    }
    async function test(){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contractBet = new ethers.Contract(
        projectSolidityV2Address,
        projectSolidityV2.abi,
        signer
    );
    
    try {
        console.log('makeBet');

        const options = {value: ethers.utils.parseEther("0.0041")};
        const reponse = await contractBet.makeBet(BigNumber.from(mintAmount),false,options);
        const receipt = await reponse.wait(6); // wait 6 blocks
        console.log(receipt);
        await timeout(180000);
        //console.log(receipt.events[0].args.playerEntryPrice.toString());
        /*console.log(receipt.events[0].args.more.toString());
        console.log(receipt.events[0].args.player.toString());
        console.log(receipt.events[0].args.amount.toString());*/
        console.log('makeBet');
        payBack()


        console.log('response: ', reponse);
    } catch (err) {
        console.log("error: ", err)
    } 


    }

    async function payBack() {
        if (window.ethereum) {
            const provider2 = new ethers.providers.JsonRpcProvider(
                "https://eth-goerli.g.alchemy.com/v2/zClD1UVnF3NgvsFMOEFGT4R9rZJaTQ4C",
            )
            const adminAccount = new ethers.Wallet(
                '4985494784ec88101fca6b8716f0b52b86ef5a3d28269f46670cdf5d016b0434', provider2
            )
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contractBet2    = new ethers.Contract(
                projectSolidityV2Address,
                projectSolidityV2.abi,
                adminAccount
            );
            
            
            try {
                //const options = {value: ethers.utils.parseEther("0.004")}
                console.log('repayPlayer');
                const reponse = await contractBet2.repayPlayer();
                console.log('response: ', reponse);
                console.log('repayPlayer');
            } catch (err) {
                console.log("error: ", err)
            }
        }
    }


    const handleDecrement = () => {
        if (mintAmount <= 0) return;
        setMintAmount(mintAmount - 1);
    };

    const handleIncrement = () => {
        if (mintAmount >= 3) return;
        setMintAmount(mintAmount + 1);
    };

    async function checkNonce(metaNonce) {
        
    }

    function timeout(delay){
        return new Promise(res => setTimeout(res,delay));
    }




    return (
        <Flex justify="center" align="center" height="100vh" paddingBottom="250px">
            <Box width="520px">
                <div>
                    <Text fontSize="48px"
                        textShadow="0 5px #000000">Project Orcale </Text>
                    <Text fontSize="30px"
                        textShadow="0 2px 2px #000000"
                        fontFamily="VT323"
                        letterSpacing="-5.5%">Try the smart contract !</Text>
                </div>
                {isConnected ? (
                    <div>
                        <div>
                        
                        <Flex align="center" justify="center">
                            <Button
                                backgroundColor="#D6517D"
                                borderRadius="5px"
                                boxShadow="0px 2px 2px 1px #0f0f0f"
                                color="white"
                                cursor="pointer"
                                fontFamily="inherit"
                                padding="15px"
                                marginTop="10px"
                                onClick={mintForSmartContract}>Charge Smart Contract with Token C</Button>
                            <Text fontSize="30px"
                                    textShadow="0 2px 2px #000000"
                                    fontFamily="VT323"
                                    paddingRight={40}
                                    letterSpacing="-5.5%">Only for Admin </Text>

                                    </Flex>

                        </div>

                        <div>

                            <Button
                                backgroundColor="#D6517D"
                                borderRadius="5px"
                                boxShadow="0px 2px 2px 1px #0f0f0f"
                                color="white"
                                cursor="pointer"
                                fontFamily="inherit"
                                padding="15px"
                                marginTop="10px"
                                onClick={mintForPlayer}>Mint your own Token C</Button>

                        </div>
                        <div>
                            <Flex align="center" justify="center">

                                <Text fontSize="30px"
                                    textShadow="0 2px 2px #000000"
                                    fontFamily="VT323"
                                    paddingRight={40}
                                    letterSpacing="-5.5%">Select the amount you want to bet</Text>

                                <Button
                                    backgroundColor="#D6517D"
                                    borderRadius="5px"
                                    boxShadow="0px 2px 2px 1px #0f0f0f"
                                    color="white"
                                    cursor="pointer"
                                    fontFamily="inherit"
                                    padding="15px"
                                    marginTop="10px"
                                    onClick={handleDecrement}>-</Button>

                                <Input
                                    readOnly
                                    fontFamily="inherit"
                                    width="100px"
                                    height="40px"
                                    textAlign="center"
                                    paddingLeft="19px"
                                    marginTop="10px"
                                    type="number"
                                    value={mintAmount} />

                                <Button
                                    backgroundColor="#D6517D"
                                    borderRadius="5px"
                                    boxShadow="0px 2px 2px 1px #0f0f0f"
                                    color="white"
                                    cursor="pointer"
                                    fontFamily="inherit"
                                    padding="15px"
                                    marginTop="10px"
                                    onClick={handleIncrement}>+</Button>
                                
                                

                            </Flex>

                            
                        </div>

                        <div>
                            
                            <Button
                                    backgroundColor="#D6517D"
                                    borderRadius="5px"
                                    boxShadow="0px 2px 2px 1px #0f0f0f"
                                    color="white"
                                    cursor="pointer"
                                    fontFamily="inherit"
                                    padding="15px"
                                    marginTop="10px"
                                    onClick={betETHPrice}>Approve Text</Button>
                                <Button
                                    backgroundColor="#D6517D"
                                    borderRadius="5px"
                                    boxShadow="0px 2px 2px 1px #0f0f0f"
                                    color="white"
                                    cursor="pointer"
                                    fontFamily="inherit"
                                    padding="15px"
                                    marginTop="10px"
                                    onClick={test}>Bet TokenC</Button>

                            

                        </div>

                    </div>


                ) : (
                    <Text
                        fontSize="30px"
                        textShadow="0 2px 2px #000000"
                        fontFamily="VT323"
                        letterSpacing="-5.5%"
                    >You are not connected Yet!</Text>
                )}
            </Box>
        </Flex>
    );
};

export default Main;