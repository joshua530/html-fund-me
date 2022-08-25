import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectBtn = document.getElementById("connect")
const fundBtn = document.getElementById("fund")
const balanceBtn = document.getElementById("balance")
const withdrawBtn = document.getElementById("withdraw")

connectBtn.onclick = connect
fundBtn.onclick = fund
balanceBtn.onclick = getBalance
withdrawBtn.onclick = withdraw

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    // connect account to our site
    try {
      window.ethereum.request({ method: "eth_requestAccounts" })
      connectBtn.innerHTML = "Connected!"
    } catch (e) {
      console.log(e)
    }
  } else connectBtn.innerHTML = "Please install metamask"
}

async function fund() {
  const amount = document.getElementById("ethAmount").value || "0.1"
  console.log(`Funding with ${amount}...`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    const ethAmount = ethers.utils.parseEther(amount)
    try {
      const transactionResponse = await contract.fund({ value: ethAmount })
      await listenForTransactionMine(transactionResponse, provider)
      console.log("Done!")
    } catch (e) {
      console.log(e)
    }
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const balance = await provider.getBalance(contractAddress)
    console.log(ethers.utils.formatEther(balance))
  }
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      console.log("Withdrawing...")
      const res = await contract.withdraw()
      await listenForTransactionMine(res, provider)
    } catch (e) {
      console.log(e)
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`)
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      )
      resolve()
    })
  })
}
