import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Matic from '../assets/logo_mumbai.svg'
import {BiTimeFive} from 'react-icons/bi'
import ScaleLoader from "react-spinners/ScaleLoader";
import {MarketPlaceAddress} from '../config'
import MarketPlaceAbi from '../contractsData/NFTMarketplace.json'
import { ethers } from 'ethers';

const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};


const NFTDetails = ({nfts,currentAddress,Loading,toast,loadNFTs}) => {
  const {id} = useParams();
  const navigate = useNavigate();

  async function buyNft(nft) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const contract = new ethers.Contract(MarketPlaceAddress, MarketPlaceAbi.abi, signer)
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')   
    const transaction = await contract.CreateMarketSale(nft.tokenId, {
      value: price
    })
    await transaction.wait()
    toast.success("NFT Buying is Successfull",{
      position:toast.POSITION.TOP_RIGHT
    })
    navigate('/mynfts')
    loadNFTs()
  }
  if(Loading === false && !nfts.length){
    return (
      <h2 className="text-center font-medium">Nothing To Display</h2>
    )
  }
  if(Loading === true){
    return (
      <div className="text-center m-auto mt-24">
        <ScaleLoader
      loading={Loading}
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
      {nfts.map((nft,i)=>(
        nft.tokenId === parseInt(id) && (
          <div className="flex" key={i}>
          <div className="w-5/12 rounded overflow-hidden shadow-lg p-5 m-5">
            <img className="w-full" src={nft.image} alt={nft.name} />
          </div>
          <div>
            <h3 className="text-3xl font-medium m-5">{nft.name} #{i}</h3>
            <div className="flex" >
              <img src={Matic} alt="logo" width={20} className="ml-5"/>
            <h6 className="text-2xl font-medium ml-1">{nft.price} MATIC</h6>
            </div>
            <p className="text-gray-500 font-medium m-5">The Seller is {nft.seller.slice(0,5) + '...' + nft.seller.slice(35,42)}</p>
            <p className="text-gray-500 font-medium m-5">The Owner is {nft.owner.slice(0,5) + '...' + nft.owner.slice(35,42)}</p>
            <p className="text-gray-500 font-medium m-5">{nft.description}</p>
            <div className="border border-gray-300 m-5 rounded h-70 ">
              <div className="flex">
                <BiTimeFive size={25} style={{margin:"10px",marginLeft:"60px"}}/>
              <p className="font-medium" style={{margin:"10px"}}>Sale ends November 28, 2023 at 6:23am GMT+5:30</p>
              </div>
              <p className="border border-gray-300"></p>
              <div className="bg-[#E7EBE7]">
                <p className="text-gray-500 ml-5">Current Price</p>
                <div className="flex">
                <p className="text-gray-700 ml-5 font-medium text-2xl"> {nft.price} MATIC</p>
                <p className="text-gray-500 ml-3 font-medium mt-1.5 "> ${Math.round(nft.price * 0.943719)}</p>
                </div>
                <div className="flex">
                {
                  currentAddress !== nft.seller?(
                    <button onClick={()=>{buyNft(nft)}} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-1/2 m-5 h-14" disabled={Loading}>{Loading?'busy..':'Buy NFT'}</button>
                  ):
                  (
                    <button onClick={()=>{buyNft(nft)}} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-1/2 m-5 h-14 cursor-not-allowed disabled:opacity-25" disabled >Buy NFT</button>
                  )
                }
                <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow w-1/2 h-14 m-5">Make Offer</button>
                </div>
              </div>
            </div>
          </div>
          </div>
        )
      ))}
    </div>
  )
    }
}

export default NFTDetails

//
