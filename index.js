//Imports the dotenv dependecy and environemnt variables into file
require("dotenv").config();

//Import the hashgraph/sdk dependency along with some built in functionality that will be used later on in the tutorial

const {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  AccountBalanceQuery,
  Hbar,
  TransferTransaction,
} = require("@hashgraph/sdk");

//Note: you have to write async funtions when leveraging the hedera netowrk

async function main() {
  //Grabs your Hedera testnet account ID and private key from your .env file and stores them to new variables

  const myAccountId = process.env.MY_ACCOUNT_ID;
  const myPrivateKey = process.env.MY_PRIVATE_KEY;

  // Create our connection to the Hedera network

  const client = Client.forTestnet();

  // Sets accoutn credentials as the owner of the connecton

  client.setOperator(myAccountId, myPrivateKey);

  //Create new keys

  const newAccountPrivateKey = PrivateKey.generateED25519();
  const newAccountPublicKey = newAccountPrivateKey.publicKey;

  //Create a new account with 1,000 tinybar starting balance

  const newAccount = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(Hbar.fromTinybars(1000))
    .execute(client);

  // Get the new account ID

  const getReceipt = await newAccount.getReceipt(client);
  const newAccountId = getReceipt.accountId;

  // Log the account ID

  console.log("The New Account ID Is: " + newAccountId);

  const accountBalance = await new AccountBalanceQuery()
    .setAccountId(newAccountId)
    .execute(client);

  console.log(
    "The new account balance is: " +
      accountBalance.hbars.toTinybars() +
      " tinybar."
  );

  //Create the transfer transaction. You need to specify the sending and receiving accounts in your code. Here we are referencing myAccountId and newAccountId

  const sendHbar = await new TransferTransaction()
    .addHbarTransfer(myAccountId, Hbar.fromTinybars(-1000))
    .addHbarTransfer(newAccountId, Hbar.fromTinybars(1000))
    .execute(client);
  // verify the transaction reached consensus
  const transactionReceipt = await sendHbar.getReceipt(client);

  console.log(
    "The transfer transaction from my account to the new account was: " +
      transactionReceipt.status.toString()
  );
  // Check the account balance
  const getNewBalance = await new AccountBalanceQuery()
    .setAccountId(newAccountId)
    .execute(client);

  console.log(
    "The account balance after the transfer is: " +
      getNewBalance.hbars.toTinybars() +
      " tinybar."
  );
}

main();
