
import logo from './logo.png';
import './App.css';
import {ethers} from 'ethers';
import {useState} from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {Spinner} from 'react-bootstrap';

import MarketPlace from "../contractsData/Marketplace-address.json";
import MarketPlaceAbi from "../contractsData/Marketplace.json";
import NFT from "../contractsData/NFT-address.json";
import NFTAbi from "../contractsData/NFT.json";

import Nabvar from './Navbar';
import Home from './Home';
import Create from './Create';
import MyListedItems from './MyListedItems';
import MyPurchases from './MyPurchases';


 
function App() 
{

  const [loading, setLoading] = useState(true);
  const [accountConnected, setAccountConnected] = useState(null);
  const [marketplace, setMarketplace] = useState(null);
  const [nft, setNFT] = useState(null);


  const web3Handler = async () =>
  {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();

    const account = await window.ethereum.request({method: "eth_requestAccounts"});
    setAccountConnected(account[0]);

    loadContracts(signer);
  }

  const loadContracts = async (signer) =>
  {
    const marketplace = new ethers.Contract(MarketPlace.address, MarketPlaceAbi.abi, signer);
    setMarketplace(marketplace);
    const nft = new ethers.Contract(NFT.address, NFTAbi.abi, signer);
    setNFT(nft);
    setLoading(false);
  }

  return (
    <BrowserRouter>
      <div className="App">
        <Nabvar web3Handler={web3Handler} account={accountConnected} />
        {
          loading ? (
            <div style={{display: 'flex', justifyContent:"center", alignItems: 'center', minHeight:'80vh'}}>
              <Spinner animation="border" style={{display: 'flex'}} />
              <p className='mx-3 my-0'> Awaiting metamask connection</p>
            </div>
          ) :(
          <Routes>
            <Route path="/" element={<Home marketplace={marketplace} nft={nft}/>}/>
            <Route path="/create" element={<Create marketplace={marketplace} nft={nft}/>}/>
            <Route path="/my-listed-items" element={<MyListedItems marketplace={marketplace} nft={nft} account={accountConnected}/>}/>
            <Route path="/my-purchases" element={<MyPurchases marketplace={marketplace} nft={nft} account={accountConnected}/>} />
          </Routes>
          )
        }
      </div>
    </BrowserRouter>
    
  );
}

export default App;