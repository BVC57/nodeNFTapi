require("dotenv").config();
const express = require('express');
const { ethers } = require('ethers');
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const app = express();
const ejs = require('ejs');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const mysql=require('mysql2')
const bodyParser=require('body-parser')
const PORT = 3000;
const serverless = require('serverless-http');
const { spawn,exec } = require('child_process');
// const nftstorage = require('nft.storage')
// const storage1 = new nftstorage.NFTStorage("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDI3N2ZjRDQ5RDQ1MDREZDM5NjIyN2RmRTNlNzQyNjFkRUIxREM4QkEiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY5NTM4NDc3MDE0NSwibmFtZSI6Im5mdGFwaSJ9.mpOz1c2pqRU6VsVN-PzfLnJnLnBymctHg5t6FBs5hzE");

const db = mysql.createConnection({
    host:process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port:process.env.DB_PORT,
    database:process.env.DB_NAME
  });

  
  db.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
    }
    console.log('Connected to MySQL');
  });

// pass the json and get the json data
app.use(bodyParser.json())
// Migrating the two NFT Api's into one
app.post('/uploadasset', async (req, res) => {
    console.log("uploadAsset API is Calling")
    const bearerToken = req.headers.authorization; // "Authorization: Bearer TOKEN_VALUE"
    // const arti_name1=req.body.arti_name;
    const ArtiId=req.body.arti_id;
    const arti_type1=req.body.arti_type;
    // const arti_url1=req.body.arti_url;
    const metadata=req.body.metadata;
   
    try {
        if (!req.body) {
            return res.status(400).send({ error: 'body parameter is missing' });
        }
    
        // Send the modified JSON payload to the second API
        const secondApiResponse = await axios.post('https://api.nft.storage/upload', metadata, {
            headers: {
                'Authorization': bearerToken,
                'Content-Type': 'application/json'
            }
        });
        // console.log(secondApiResponse)
        const ApiResponse = secondApiResponse.data.value.cid;
        const extractedlink = "https://ipfs.io/ipfs/" + ApiResponse;
        console.log(extractedlink);
        const extractedlink2 = "ipfs://" + ApiResponse;
        console.log(extractedlink2)
        // verifyCID(ApiResponse)
        // getNFTftdata(ApiResponse)

            if( arti_type1 == "identity"){
                const sql = "UPDATE identity SET cid = ? WHERE id =?";
                const values=[extractedlink2,ArtiId]
                // console.log(sql,values)
                db.query(sql,values,(err,result)=>{
                    if(err){
                        console.log("error into insert cid")
                    }else{
                        console.log("cid insert successfuly")
                       
                    }
                });
            }
        res.send({"metadataCid": extractedlink,"message":"cid insert successfuly"});

    } catch (error) {
        console.log("There was an error chaining the APIs.")
        res.status(500).send({ error: 'There was an error chaining the APIs.' });
    }
});

const DB_NAME= process.env.DB_NAME
const DB_HOST=process.env.DB_HOST
const DB_PORT=process.env.DB_PORT
const DB_USER=process.env.DB_USER
const DB_PASSWORD= process.env.DB_PASSWORD

//database credentials
const { Sequelize, DataTypes } = require('sequelize');
// Configure Sequelize
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: process.env.DB_HOST,
    port:process.env.DB_PORT,
    dialect: 'mysql', // e.g., 'mysql', 'postgres', etc.
    logging: console.log
});

const API_URL = process.env.API_URL;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const path = require('path');
const contractPath = path.join(__dirname, '../create-nft/artifacts/contracts/MyNFT.sol/MyNFT.json');
const contract = require(contractPath);
const web3 = createAlchemyWeb3(API_URL);

// const deploy = require('./scripts/deploy');  // Path to your Hardhat script
app.use(express.json()); // For parsing application/json

// const { exec } = require('child_process');
const { verify } = require("crypto");

const Identity = sequelize.define('Identity', {
    user_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    token_id: DataTypes.STRING(100),
    arti_nm: DataTypes.STRING(30),
    html_data: DataTypes.TEXT,
    verify_url: DataTypes.STRING(200)
  }, {
    tableName: 'identity',
    timestamps: false
  });


// Define a function to update the token
async function updateTokenInDatabase(userid, contractAddress, htmlContent, title, verifyUrl,arti_id) {
    
    try {

      // Using update
      const [updatedRows] = await Identity.update(
        {   token_id: contractAddress,
            html_data: htmlContent, // Add html_data field
            verify_url:verifyUrl,
        },
        {
          where: {
            user_id: userid,
            arti_nm: title,
            id:arti_id,
            },
          logging: console.log  // Enable SQL logging
        }
      );
console.log("updated rows:-",updatedRows)
  
      if (updatedRows === 0) {
        console.error('User not found or not updated in the database.');
      }else{
  
        console.log('Token updated successfully in the database!');
    } } catch (error) {
        console.error(`Error updating token in the database: ${error}`);
      }
    }
    
  
// set the use var for app
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal server error.');
});

function getTodayDateInDesiredFormat() {
    // Get the current date and time.
    const now = new Date();
  
    // Format the date and time into the desired string, using the IST time zone.
    const formattedDateString = now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
      timeZone: 'Asia/Kolkata'
    });
    // console.log("current date and time",formattedDateString)
  
    return formattedDateString;
  }


// Retrieve NFT metadata from NFT.storage using the CID
async function retrieveNFTMetadata(cid) {
    try {
    // console.log("Retrieve NFT storage data CID is:", cid);
    const response = await axios.get(`https://nft.storage/api/${cid}`, {
        headers: {
        'Authorization': process.env.NFT_STORE_API_KEY,
        },
    });

    const nftMetadata = response.data.value;
    // console.log('Retrieved NFT Metadata:', nftMetadata);
    } catch (error) {
    console.error('Error retrieving NFT metadata:', error);
    }
}


async function getdatafromblockchain(contractAddress){
    // Assuming you have your web3 instance, contract ABI, and contract address set up
    const contractInstance = new web3.eth.Contract(contract.abi, contractAddress);
  
    // Keep track of the current token ID
    let currentTokenId = 1;
  
    // Function to retrieve data for the next token ID
    async function getNextData() {
      try {
        // Call the getData function to retrieve the token URI for the current token ID
        const tokenURI = await contractInstance.methods.getData(currentTokenId).call();
        console.log(` token ID ${currentTokenId}:for Token URI ${tokenURI}`);
        // Increment the current token ID
        currentTokenId++;
  
        // Call the function again to retrieve data for the next token ID
        // getNextData();
      } catch (error) {
        console.error(`Error calling getData for token ID ${currentTokenId}:`, error);
      } 
    }
    // Start the process of retrieving data for the next token ID
    getNextData();
  }
  
  async function verifyCID(cid) {
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDI3N2ZjRDQ5RDQ1MDREZDM5NjIyN2RmRTNlNzQyNjFkRUIxREM4QkEiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY5NTM4NDc3MDE0NSwibmFtZSI6Im5mdGFwaSJ9.mpOz1c2pqRU6VsVN-PzfLnJnLnBymctHg5t6FBs5hzE'; // Replace with your actual API key

    isCIDStoredOnNFTStorage(cid)
    .then((stored) => {
        if (stored) {
        console.log(`CID ${cid} is exist on NFT.Storage.`);
        } else {
        console.log(`CID ${cid} is not exist on NFT.Storage.`);
        }
    })
    .catch((error) => {
        console.error('Error checking CID on NFT.Storage:', error);
    });


    async function isCIDStoredOnNFTStorage(cid) {
    try {
        // Send a GET request to the NFT.Storage API to check the CID
        const response = await axios.get(`https://api.nft.storage/check/${cid}`, {
        headers: {
            Authorization: `Bearer ${apiKey}` , // Replace with your NFT.Storage API key
        },
        });

        if (response.status === 200) {
        return true; // CID is stored on NFT.Storage
        } else {
        return false; // CID is not stored on NFT.Storage
        }
    } catch (error) {
        if (error.response.status === 404) {
        return false; // CID is not stored on NFT.Storage
        }
        throw error; // Handle other errors
    }
    }

  }

  async function getNFTftdata(cid){
    getDataFromNFTStorage(cid)
    .then((data) => {
      if (data) {
        console.log('Data retrieved from NFT.Storage:');
        console.log(data);
      } else {
        console.log(`Data for CID ${cid} not found.`);
      }
    })
    .catch((error) => {
      console.error('Error retrieving data from NFT.Storage:', error);
    });

  async function getDataFromNFTStorage(cid) {

    try {
      const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDI3N2ZjRDQ5RDQ1MDREZDM5NjIyN2RmRTNlNzQyNjFkRUIxREM4QkEiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY5NTM4NDc3MDE0NSwibmFtZSI6Im5mdGFwaSJ9.mpOz1c2pqRU6VsVN-PzfLnJnLnBymctHg5t6FBs5hzE'; // Replace with your actual API key
      // Send a GET request to the NFT.Storage API to retrieve data for a CID
      const response = await axios.get(`https://api.nft.storage/${cid}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
  
      if (response.status === 200) {
        // console.log(response.data);
        return response.data;
      } else {
        // Handle other response codes as needed
        console.error(`Unexpected response code: ${response.status}`);
        return null;
      }
    } catch (error) {
      // Handle network errors or other exceptions
      console.error('Error retrieving data from NFT.Storage:', error);
      return null;
    }
  }
 
  
 }


//Creating NFT and minting the same
app.post('/mintnft',async (req, res) => {
    console.log("MintNFT  API is Calling")
    // const imageURI = req.body.imageURI
    const serverRoute= req.body.serverRoute;
    const tokenURI = req.body.tokenURI;
    const metadata = req.body.metadata
    const userid = req.headers.user_id;
    const ArtiId = req.body.arti_id;
    console.log("user id is:-",userid)
    if (!tokenURI) {
        return res.status(400).send('Missing required parameter: tokenURI.');
    }

    exec('npx hardhat --network mumbai run scripts/deploy.js', async (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send('Failed to deploy contract.');
        }
        const contractAddress = stdout.trim();

        console.log(`Deployed contract address: ${contractAddress}`);

        if (stderr) {
            console.error(`Error output from deploy.js: ${stderr}`);
            return res.status(500).send(`Error output from deploy.js: ${stderr}`);
        }

        if (!contractAddress.startsWith("0x")) {
            return res.status(500).send('Unexpected output from deployment script.');
        }

        try {
            
            const nftContract = new web3.eth.Contract(contract.abi, contractAddress);//contract is deoloy here             
            const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest");
            const tx = {
                from: PUBLIC_KEY,
                to: contractAddress,
                nonce: nonce,
                gas: 500000,
                data: nftContract.methods.mintNFT(PUBLIC_KEY, tokenURI).encodeABI(),
            };

            const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
            web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                .once('transactionHash', (hash) => {
                    console.log("Transaction hash:", hash);
                })
                .once('receipt', (receipt) => {
                    // console.log(receipt)
                    if (receipt.status === true || receipt.status === '0x1') {
                        // Define the data you want to populate in the template
                        const templateData = {
                            imageIpfs:metadata.imageipfs,
                            documentId: metadata.request_id,
                            documentClass: metadata.class,
                            documentTitle: metadata.title,
                            contractId: contractAddress,
                            uploadedOn:getTodayDateInDesiredFormat(),
                            documentOwner:metadata.documentOwner,
                            uploadSource:metadata.uploadSource,
                            issuedBy:metadata.issuedBy,
                            issuedOn:getTodayDateInDesiredFormat(),
                            standard:metadata.standard,
                            minte:metadata.minte,
                            mintOwner:metadata.mintOwner,
                            metaDataView:metadata.metaDataView,
                            score:metadata.score
                        };

                        // console.log("temp data:-",templateData)
                        getdatafromblockchain(contractAddress);

                        // fetch the data for ipfs
                        const cidToRetrieve = tokenURI;
                        // Split the string using "ipfs://" as the delimiter
                        const parts = cidToRetrieve.split('ipfs://');

                        // Extract the CID (the second part)
                        const cid = parts[1];
                        console.log("nft cid is:-",cid)
                        // verify the cid is exist on NFT.storage
                        verifyCID(cid)
                        // verify the cid is deploy on contract address or not
                        getNFTftdata(cid)
                        // Render the HTML template with EJS
                        // use for enject the data into html file and serve on client side
                        ejs.renderFile(__dirname + '/views/index.ejs', templateData, async (err, html) => {
                            if (err) {
                                console.error('Error rendering EJS template:', err);
                                return res.status(500).send('Internal server error while rendering.');
                            }

                            // Save the HTML content to a local file
                        // const name = metadata.request_id;
                        const name = userid;
                        const fileName = `${name}.html`; // Choose a suitable file name
                        console.log(fileName)
                        fs.writeFile(fileName, html, (fileErr) => {
                            if (fileErr) {
                                console.error('Error saving HTML file:', fileErr);
                                return res.status(500).send('Internal server error while saving HTML file.');
                                }

                            console.log("HTML file saved as ",fileName)});

                        // Call the function to update the token in the database
                        const verifyUrl = `http://localhost:3000/${fileName}`;// create the veryfy url  
                        console.log("v url:-",verifyUrl)   

                        // console.log(metadata.title,userid,contractAddress)
                        await updateTokenInDatabase(userid, contractAddress, html, metadata.title,verifyUrl,ArtiId);


                        res.json({
                            status: 'success',
                            transactionHash: receipt.transactionHash,
                            contractAddress: contractAddress,
                            htmldata:'created successfully',
                            // openseacontractLink:"https://testnets.opensea.io/assets/mumbai/"+contractAddress,
                            // rariblecontractLink:"https://testnet.rarible.com/token/polygon/"+contractAddress+":1"
                            // imageURI:imageURI
                        });

                    });
                    } else {
                        res.status(400).json({
                            status: 'failed',
                            message: 'Transaction was reverted by the EVM',
                            transactionHash: receipt.transactionHash
                        });
                    }
                })
                .on('error', (error) => {
                    console.error("Failed to mint:", error);
                    res.status(500).json({
                        status: 'error',
                        message: 'Failed to send transaction or internal server error.'
                    });
                });

        } catch (err) {
            console.error("Error in /deployAndMintNFT:", err);
            res.status(500).send({
                status: 'error',
                message: 'Internal server error while minting.'
            });
        }
    });
});


// app.post('/mintnft',async (req, res) => {
//     console.log("MintNFT  API is Calling")
//     // const imageURI = req.body.imageURI
//     const serverRoute= req.body.serverRoute;
//     const tokenURI = req.body.tokenURI;
//     const metadata = req.body.metadata
//     const userid = req.headers.user_id;
//     const ArtiId = req.headers.arti_id;
//     console.log("user id is:-",userid)
//     if (!tokenURI) {
//         return res.status(400).send('Missing required parameter: tokenURI.');
//     }

//     exec('npx hardhat --network mumbai run scripts/deploy.js', async (error, stdout, stderr) => {
//         if (error) {
//             console.error(`exec error: ${error}`);
//             return res.status(500).send('Failed to deploy contract.');
//         }
//         const contractAddress = stdout.trim();

//         console.log(`Deployed contract address: ${contractAddress}`);

//         if (stderr) {
//             console.error(`Error output from deploy.js: ${stderr}`);
//             return res.status(500).send(`Error output from deploy.js: ${stderr}`);
//         }

//         if (!contractAddress.startsWith("0x")) {
//             return res.status(500).send('Unexpected output from deployment script.');
//         }

//         try {
//             console.log("contract is deployed on this address:-",contractAddress);
//             console.log(ArtiId)
//             // contract.functions._tokenIds.increment().transact()
//             token_id = contract.functions.inputs.name[tokenId].current().call()
//             console.log(token_id)
//             const data = await readDataFromNFTContract(token_id,contractAddress);
//             if (data) {
//                 console.log('Data exists in the blockchain:', data);
//             } else {
//                 console.log('Data does not exist in the blockchain.');
//             }

//             const nftContract = new web3.eth.Contract(contract.abi, contractAddress);//contract is deoloy here            
//             const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest");
//             const tx = {
//                 from: PUBLIC_KEY,
//                 to: contractAddress,
//                 nonce: nonce,
//                 gas: 500000,
//                 data: nftContract.methods.mintNFT(PUBLIC_KEY, tokenURI).encodeABI(),
//             };

//             const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
//             web3.eth.sendSignedTransaction(signedTx.rawTransaction)
//                 .once('transactionHash', (hash) => {
//                     console.log("Transaction hash:", hash);
//                 })
//                 .once('receipt', (receipt) => {
//                     // console.log(receipt)
//                     if (receipt.status === true || receipt.status === '0x1') {
//                         // Define the data you want to populate in the template
//                         const templateData = {
//                             imageIpfs:metadata.imageipfs,
//                             documentId: metadata.request_id,
//                             documentClass: metadata.class,
//                             documentTitle: metadata.title,
//                             contractId: contractAddress,
//                             uploadedOn:getTodayDateInDesiredFormat(),
//                             documentOwner:metadata.documentOwner,
//                             uploadSource:metadata.uploadSource,
//                             issuedBy:metadata.issuedBy,
//                             issuedOn:getTodayDateInDesiredFormat(),
//                             standard:metadata.standard,
//                             minte:metadata.minte,
//                             mintOwner:metadata.mintOwner,
//                             metaDataView:metadata.metaDataView,
//                             score:metadata.score
//                         };

//                         console.log("temp data:-",templateData)
                       
//                         // Render the HTML template with EJS
//                         // use for enject the data into html file and serve on client side
//                         ejs.renderFile(__dirname + '/views/index.ejs', templateData, async (err, html) => {
//                             if (err) {
//                                 console.error('Error rendering EJS template:', err);
//                                 return res.status(500).send('Internal server error while rendering.');
//                             }

//                             // Save the HTML content to a local file
//                         // const name = metadata.request_id;
//                         const name = userid;
//                         // const fileName = `${name}.html`; // Choose a suitable file name
//                         // console.log(fileName)
//                         // fs.writeFile(fileName, html, (fileErr) => {
//                         //     if (fileErr) {
//                         //         console.error('Error saving HTML file:', fileErr);
//                         //         return res.status(500).send('Internal server error while saving HTML file.');
//                         //         }

//                         //     console.log("HTML file saved as ",fileName)});

//                         // Call the function to update the token in the database
//                         const verifyUrl = `http://${serverRoute}/view/${name}`;// create the veryfy url  
//                         // console.log("v url:-",verifyUrl)    
//                         console.log("title",metadata.title)
//                         await updateTokenInDatabase(userid, contractAddress, html, metadata.title, verifyUrl);


//                         res.json({
//                             status: 'success',
//                             transactionHash: receipt.transactionHash,
//                             contractAddress: contractAddress,
//                             htmldata:'created successfully'
//                             // imageURI:imageURI
//                         });

//                     });
//                     } else {
//                         res.status(400).json({
//                             status: 'failed',
//                             message: 'Transaction was reverted by the EVM',
//                             transactionHash: receipt.transactionHash
//                         });
//                     }
//                 })
//                 .on('error', (error) => {
//                     console.error("Failed to mint:", error);
//                     res.status(500).json({
//                         status: 'error',
//                         message: 'Failed to send transaction or internal server error.'
//                     });
//                 });

//         } catch (err) {
//             console.error("Error in /deployAndMintNFT:", err);
//             res.status(500).send({
//                 status: 'error',
//                 message: 'Internal server error while minting.'
//             });
//         }
//     });
// });



exports.handler = serverless(app);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

