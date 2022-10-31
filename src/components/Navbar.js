import { Fragment, useState ,useEffect} from 'react'
import { Disclosure } from '@headlessui/react'
import {Link} from 'react-router-dom'
import {AiOutlineMenu} from 'react-icons/ai';
import {HiX} from 'react-icons/hi';

const navigation = [
  { name: 'Home', href: '/'},
  { name: 'MyNFTS', href: '/mynfts' },
  { name: 'CreateNFT', href: '/create' },
  { name: 'MyDashboard', href: '/dashboard' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}



export default function Navbar({toast}) {
  const [currentAddress,setCurrentAddress] = useState(null);
  const[active,setActive] = useState(null);

  useEffect(() => {
    getConnectedAccount();
    AccountChangeHandler();
  });
  const ConnectWallet = async () =>{
  if(typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'){
   try {
    const accounts = await window.ethereum.request({method:'eth_requestAccounts'})
    setCurrentAddress(accounts[0]);
   } catch (error) {
    console.log(error.message)
   }
  }else{
    console.log('Please install metamask!!')
  }
}
  const getConnectedAccount = async () =>{
  if(typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'){
   try {
    const accounts = await window.ethereum.request({method:'eth_accounts'});
    if(accounts.length > 0){
      setCurrentAddress(accounts[0]);
    }else{
      toast.error("Connect to Wallet",{
        position:toast.POSITION.TOP_RIGHT
      })
    }
    
   } catch (error) {
    console.log(error.message)
   }
  }else{
    toast.error("Install Metamask",{
      position:toast.POSITION.TOP_RIGHT
    })
  }
}

const AccountChangeHandler = async () =>{
  if(typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'){
   window.ethereum.on('accountsChanged',(accounts)=>{
      setCurrentAddress(accounts[0]);
   });
  }else{
    setCurrentAddress("");
    console.log('Please install metamask!!')
  }
}
  return (
    <Disclosure as="nav" className="bg-gray-800 sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 ">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <HiX className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <AiOutlineMenu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <Link to="/"><h4 className="block h-8 w-auto text-white font-medium mt-1 lg:hidden">POLYTOKENS</h4></Link>
                  <Link to="/"><h4 className="hidden h-8 w-auto text-white font-medium mt-1 lg:block">POLYTOKENS</h4></Link>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() =>setActive(item)}
                        className={classNames(
                          active === item && 'active' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                          'px-3 py-2 rounded-md text-sm font-medium'
                        )}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              {
                currentAddress ? (
                  <p className="text-gray-300 font-medium">{currentAddress.slice(0,5) + '...' + currentAddress.slice(35,42)}</p>
                ):(
                  <button onClick={ConnectWallet} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Connect Wallet</button>
                  )
              }
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className={classNames(
                    item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'block px-3 py-2 rounded-md text-base font-medium'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
