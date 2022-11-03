import React, { useEffect, useState } from 'react';
import './App.css';
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import {MarketPlaceAddress} from './config'
import axios from 'axios';
import MarketPlaceAbi from './contractsData/NFTMarketplace.json'
import CreateNFT from './components/CreateNFT';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import MyNFTs from './components/MyNFTs';
import Navbar from './components/Navbar';
import NFTDetails from './components/NFTDetails';
import { ethers } from 'ethers';
import ResellNFT from './components/ResellNFT';
import { ScaleLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [nfts,setNfts] = useState([]);
  const [currentAddress,setCurrentAddress] = useState(null)
  const [Loading,setLoading] = useState(false);
  useEffect(()=>{
   loadNFTs();
  },[]);
  const loadNFTs = async ()=>{
    setLoading(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const contract = new ethers.Contract(MarketPlaceAddress,MarketPlaceAbi.abi,provider);
    const data = await contract.fetchMarketItems();

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await contract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      }
      return item
    }))
    setNfts(items) 
    setCurrentAddress(address);
    setLoading(false)
  }

  return (
    <>
    <BrowserRouter>
    <Navbar  toast={toast}/>
    <div>
      {
        Loading && !currentAddress ?(
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <ScaleLoader
      loading={Loading}
      size={50}
      aria-label="Loading Spinner"
      data-testid="loader"
      />
            </div>
        ):(
          <Routes>
        <Route exact path="/" element={<Home nfts={nfts} Loading={Loading} currentAddress={currentAddress}/>} />
        <Route path="/mynfts" element={<MyNFTs />} />
        <Route path="/create" element={<CreateNFT toast={toast}/>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resell" element={<ResellNFT />} />
        <Route path={`/detail/:id`} element={<NFTDetails nfts={nfts} loadNFTs={loadNFTs} Loading={Loading} currentAddress={currentAddress} toast={toast}/>} />
      </Routes>
        )
      }
    </div>
    </BrowserRouter>
    <ToastContainer/>
    </>
  );
}

export default App;
