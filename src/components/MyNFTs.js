import axios from 'axios';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react'
import MarketplaceAbi from '../contractsData/NFTMarketplace.json'
import {MarketPlaceAddress} from '../config'
import {useNavigate } from 'react-router-dom';
import Matic from '../assets/logo_mumbai.svg'
import ScaleLoader from "react-spinners/ScaleLoader";

const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

const MyNFTs = () => {
  const [nfts, setNfts] = useState([]);
  const [loading,setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    loadNFTs()
  }, [])

  async function loadNFTs() {
    setLoading(true)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()

    const marketplaceContract = new ethers.Contract(MarketPlaceAddress, MarketplaceAbi.abi, signer)
    const data = await marketplaceContract.fetchMyNFTs()

    const items = await Promise.all(data.map(async i => {
      const tokenURI = await marketplaceContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenURI)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name:meta.data.name,
        tokenURI
      }
      return item
    }))
    setNfts(items)
    setLoading(false)
  }

  function listNFT(nft) {
    navigate(`/resell?id=${nft.tokenId}&tokenURI=${nft.tokenURI}`)
  }
  if(loading === false && !nfts.length){
    return (
      <h2 className="text-center font-medium">No NFTS Owned</h2>
    )
  }
  if(loading === true){
    return (
      // <p className="text-center font-medium align-center">Loading .....</p>
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
           <div className="flex justify-between">
            <button onClick={()=>{listNFT(nft)}} className="w-full bg-transparent hover:bg-blue-500 text-white font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">List NFT</button>
           </div>
          </div>
        </div>
        ))
      }
    </div>
    </div>
  )
    }
}

export default MyNFTs
