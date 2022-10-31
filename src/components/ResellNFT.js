import axios from 'axios'
import { ethers } from 'ethers'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MarketPlaceAbi from '../contractsData/NFTMarketplace.json'

const ResellNFT = () => {
    const [formInput, updateFormInput] = useState({ price: '', image: '' });
    const [Loading,setLoading] = useState(false);
  const queryParams = new URLSearchParams(window.location.search);
  const id = queryParams.get('id');
  const tokenURI = queryParams.get('tokenURI');
  const navigate = useNavigate();
  const { image, price } = formInput

  useEffect(() => {
    fetchNFT()
  }, [id])

  async function fetchNFT() {
    if (!tokenURI) return
    const meta = await axios.get(tokenURI)
    updateFormInput(state => ({ ...state, image:meta.data.image  }))
  }

  async function listNFTForSale() {
    setLoading(true);
    if (!price) return
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    let contract = new ethers.Contract(process.env.MarketPlaceAddress, MarketPlaceAbi.abi, signer)

    const priceFormatted = ethers.utils.parseUnits(formInput.price, 'ether')
    let listingPrice = await contract.getListingPrice()

    listingPrice = listingPrice.toString()
    let transaction = await contract.resellToken(id, priceFormatted, { value: (listingPrice) })
    await transaction.wait()
    setLoading(false);
    navigate('/')
    
  }
  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        {
          image && (
            <img className="rounded mt-4" width="350" src={image} alt="" />
          )
        }
        {
          !price?(
            <button onClick={listNFTForSale} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg cursor-not-allowed opacity-20" disabled>List NFT For Sale</button>
          ):(
            <button onClick={listNFTForSale} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg" disabled={Loading}>
          {Loading?'busy....':'List NFT For Sale'}
        </button>
          )
        }
        
      </div>
    </div>
  )
}

export default ResellNFT