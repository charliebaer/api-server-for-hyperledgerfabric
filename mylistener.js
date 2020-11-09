"use strict";

var util = require("util");

const { FileSystemWallet, Gateway } = require("fabric-network");
const path = require("path");

const ccpPath = path.resolve(
    __dirname,
    "..",
    "..",
    "first-network",
    "connection-org1.json"
);
var mykaf = require("./producer");

async function main() {
    try {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), "wallet");
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists("user1");
        if (!userExists) {
            console.log(
                'An identity for the user "user1" does not exist in the wallet'
            );
            console.log("Run the registerUser.js application before retrying");
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, {
            wallet,
            identity: "user1",
            discovery: { enabled: true, asLocalhost: true },
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork("mychannel");

        //================================================  Block Events =============================================================================

        // const listener = await network.addBlockListener('my-block-listener', (err, block, transactionId, status) => {
        //     if (err) {
        //         console.error(err);
        //         return;
        //     }
        //     console.log('*************** start block header *******************')
        //     console.log(util.inspect(block.header, { showHidden: false, depth: 5 }))
        //     console.log('*************** end block header *********************')
        //     console.log('*************** start block data *********************')
        //     let data = block.data.data[0];
        //     console.log(util.inspect(data, { showHidden: false, depth: 5 }))
        //     console.log('*************** end block data ***********************')
        //     console.log('*************** start block metadata *****************')
        //     console.log(util.inspect(block.metadata, { showHidden: false, depth: 5 }))
        //     console.log('*************** end block metadata *******************')
        // });

        // Get the contract from the network.
        const contract = network.getContract("vwcc");

        //Submit the specified transaction.
        // ================================================  Contract Events    ==============================================================================

        await contract.addContractListener(
            "my-contract-listener",
            "VoltusEvent",
            (err, event, blockNumber, transactionId, status) => {
                if (err) {
                    console.error(err);
                    return;
                }

                //convert event to something we can parse
                event = event.payload.toString();
                event = JSON.parse(event);

                // //where we output the TradeEvent
                // console.log('************************ Start First Event **********************************');
                // console.log(`type: ${event.type}`);
                // console.log(`subj1: ${event.subj1}`);
                // console.log(`subj2: ${event.subj2}`);
                // console.log(`subj3: ${event.subj3}`);
                // console.log(`blockNumber: ${blockNumber}`);
                // console.log(`transactionId: ${transactionId}`);
                // console.log(`status: ${status}`);
                // console.log('************************ End First Event ************************************');
                console.log(
                    "************************ VW Event Starts ************************************"
                );

                console.log(event.vwobj);
                mykaf(event.vwobj);

                console.log(
                    "************************ VW Event Ends **************************************"
                );
            }
        );

        // Do not disconnect from the gateway while listening to multiple events.
        // await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();

