import axios from 'axios'
import { ethers } from 'ethers'
import React, { useEffect, useState } from 'react'
import MarketPlaceAbi from '../contractsData/NFTMarketplace.json'
import {MarketPlaceAddress} from '../config'
import Matic from '../assets/logo_mumbai.svg'
import ScaleLoader from "react-spinners/ScaleLoader";

const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};


const Dashboard = () => {
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    setLoading(true)
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(MarketPlaceAddress, MarketPlaceAbi.abi, signer)
    const data = await contract.fetchItemsListed()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await contract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
      }
      return item
    }))

    setNfts(items)
    setLoading(false)
  }
  if(loading === false && !nfts.length){
    return (
      <h2 className="text-center font-medium">No NFTS Listed</h2>
    )
  }
  if(loading === true){
    return(
    <div className="text-center m-auto mt-24">
        <ScaleLoader
      loading={loading}
      cssOverride={override}
      size={50}
      aria-label="Loading Spinner"
      data-testid="loader"
      />
      </div>
    )
  }
  else{
  return (
    <div>
      <div className="p-3 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
      {
        nfts.map((nft,i)=>(
          <div className="flex items-center justify-center" key={i}>
          <div className=" w-72 bg-gray-800 p-5 rounded-md shadow-xl">
            <img src={nft.image} alt={nft.name} />
            <h2 className="text-md font-bold mt-3 text-white">{nft.name} #{nft.tokenId}</h2>
            <div className="flex justify-between items-center text-sm">
              <div className="text-cyan-400 font-bold flex">
              <img src={Matic} alt="logo" width="20"/>
              <p className="ml-2 mt-0.5">{nft.price} MATIC</p>
              </div>
            </div>
            <p className="bg-gray-600 h-[0.5px] w-full my-2"></p>
            <p className="text-gray-300">The Owner of NFT is {nft.seller.slice(0,5) + '...' + nft.seller.slice(35,42)}</p>
          </div>
        </div>
        ))
      }
    </div>
    </div>
  )
    }
}

export default Dashboard