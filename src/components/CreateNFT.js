import React, { useState } from 'react'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import {useNavigate} from 'react-router-dom'
import {INFURA_API_KEY,INFURA_APP_SECRET,MarketPlaceAddress} from '../config'
import MarketplaceAbi from '../contractsData/NFTMarketplace.json'
import { ethers } from 'ethers';
import {Buffer} from 'buffer';

const auth = 'Basic ' + Buffer.from(INFURA_API_KEY + ':' + INFURA_APP_SECRET).toString('base64');

const client = ipfsHttpClient({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
      authorization: auth,
  },
});

const CreateNFT = ({toast}) => {
  const [name,setName] = useState("");
  const [description,setDescription] = useState("");
  const [fileUrl,setFileUrl] = useState("");
  const [price,setPrice] = useState("");
  const navigate = useNavigate();
  const [Loading,setLoading] = useState(false);

  async function onChange(e) {
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://infura-ipfs.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }
  async function uploadToIPFS() {
    if (!name || !description || !price || !fileUrl) return
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://infura-ipfs.io/ipfs/${added.path}`
      /* after file is uploaded to IPFS, return the URL to use it in the transaction */
      return url
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  async function listNFT(e) {
    e.preventDefault();
    setLoading(true);

    //Upload data to IPFS
    try {
        const metadataURL = await uploadToIPFS();
        //After adding your Hardhat network to your metamask, this code will get providers and signers
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = signer.getAddress();
        const balance = signer.getBalance(address);

        //Pull the deployed contract instance
        let contract = new ethers.Contract(MarketPlaceAddress, MarketplaceAbi.abi, signer)

        //massage the params to be sent to the create NFT request
        const Price = ethers.utils.parseUnits(price, 'ether')
        let listingPrice = await contract.getListingPrice()
        listingPrice = listingPrice.toString()

        //actually create the NFT
        let transaction = await contract.CreateToken(metadataURL, Price, { value: listingPrice })
        await transaction.wait()
        toast.success("NFT Created SuccessFully",{
          position:toast.POSITION.TOP_RIGHT
        })
        navigate('/');
        setName("");
        setPrice("");
        setDescription("");
        setLoading(false)
        
    }
    catch(e) {
      toast.error("Upload Error",{
        position:toast.POSITION.TOP_RIGHT
      })
    }
}
  return (
    <div className="w-1/3 mx-auto mt-5">
  <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Name Of NFT
      </label>
      <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="Ex : MonkeyDluffy" value={name} onChange={(e)=>{setName(e.target.value)}}/>
    </div>
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Price
      </label>
      <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="Price" value={price} onChange={(e)=>{setPrice(e.target.value)}}/>
    </div>
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Upload Image
      </label>
      <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" type="file" placeholder="Price" onChange={onChange}/>
    </div>
    <div className="mb-6">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Description
      </label>
      <textarea className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="Description" value={description} onChange={(e)=>{setDescription(e.target.value)}}/>
    </div>
    <div className="flex items-center justify-between">
    {
      !name || !price || !description ? (
        <button type="button" onClick={listNFT}
    className="px-8 py-3 text-white bg-blue-600 rounded cursor-not-allowed focus:outline-none disabled:opacity-75" disabled>
    Create NFT
  </button>
      ):
      (
        <button type="button" onClick={listNFT}
    className="px-8 py-3 text-white bg-blue-600 rounded focus:outline-none" disabled={Loading}>{Loading?'Busy...':'CreateNFT'}</button>
      )
    }
      
    </div>
  </form>
</div>
  )
}

export default CreateNFT