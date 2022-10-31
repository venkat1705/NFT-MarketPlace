import React from 'react'
// import {FaEthereum} from 'react-icons/fa'
import {Link} from 'react-router-dom'
import Matic from '../assets/logo_mumbai.svg'

const Home = ({nfts,Loading,currentAddress}) => {
   if(Loading === false && !nfts.length){
    return (
      <h2 className="text-center font-medium">No NFTS in Marketplace</h2>
    )
  }
  return (
    <div className="p-3 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
      {
        nfts.map((nft,i)=>(
          <div className="flex items-center justify-center" key={i}>
          <div className=" w-72 bg-gray-800 p-5 rounded-md shadow-xl">
            <img src={nft.image} alt={nft.name} />
            <h2 className="text-md font-bold mt-3 text-white">{nft.name} #{i}</h2>
            <p className="text-gray-400 text-sm mb-2">{nft.description.length>30?nft.description.slice(0,30) + ' ...':nft.description}</p>
            <div className="flex justify-between items-center text-sm">
              <div className="text-cyan-400 font-bold flex">
              <img src={Matic} alt="logo" width="20"/>
              <p className="ml-2 mt-0.5">{nft.price} MATIC</p>
              </div>
            </div>
            <p className="bg-gray-600 h-[0.5px] w-full my-2"></p>
            <button className="w-full bg-transparent hover:bg-blue-500 text-white font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"><Link to={`/detail/${nft.tokenId}`}>View Details</Link></button>
          </div>
        </div>
        ))
        
      }
    </div>
  )
    }

export default Home