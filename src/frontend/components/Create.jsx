import {useState, useEffect} from 'react';
import {ethers} from 'ethers';
import {Row, Form, Button} from 'react-bootstrap';
import {Buffer} from 'buffer';
// import {create as ipfsHttpClient} from 'ipfs-http-client';
// import {createForm} from './createForm';

// const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
// const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const projectId = '2KjrUQ1pT06BJh94b569hO1w2S1';
const projectSecret = '13830d92da022dd5bf226953f45851d2';

const ipfsClient = require('ipfs-http-client');

const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
const client = ipfsClient.create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});


const Create = ({marketplace, nft}) =>
{
    const [image, setImage] = useState("");
    const [price, setPrice] = useState(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const uploadToIpfs = async (event) =>
    {
        event.preventDefault();
        const file = event.target.files[0];
        if (typeof file !== "undefined")
        {
            try 
            {
                const result = await client.add(file);
                let path = `https://ipfs.io/ipfs/${result.path}`;
                setImage(path);
            } 
            catch (error) 
            {
                console.log("Ipfs image upload error: ", error);
            }
        }
    }

    const createNFT = async () =>
    {
        // console.log(Boolean(image));
        // console.log(Boolean(price));
        // console.log(Boolean(name));
        // console.log(Boolean(description));
        // console.log(image , price , name , description)
        if (!image || !price || !name || !description) return;
        try
        {
            const content = JSON.stringify({image, name, description});
            const result = await client.add(content);
            mintThenList(result);
            console.log("Nft created")
        }
        catch(error)
        {
            console.log("Ipfs url upload error: ", error);
        }
    }

    const mintThenList = async (result) =>
    {
        const uri = `https://ipfs.io/ipfs/${result.path}`;
        await (await nft.mint(uri)).wait();

        const id = await nft.tokenCount();
        console.log(marketplace.address)
        await nft.setApprovalForAll(marketplace.address, true)
        await (await nft.setApprovalForAll(marketplace.address, true)).wait();
        
        const listingPrice = ethers.utils.parseEther(price.toString());
        await (await marketplace.createItem(nft.address, id, listingPrice)).wait();

    }

    return (
        <div className='container-fluid mt-5'>
            <div className='row'>
                <main role="main" className='col-lg-12 mx-auto' style={{maxWidth: '1000px'}}>
                    <div className='content mx-auto'>

                        <Row className='g-4'>
                            <Form.Control type="file" name="file" onChange={uploadToIpfs}/>
                            <Form.Control onChange={(e)=>setName(e.target.value)} size='lg' type='text' placeholder='Name'/>
                            <Form.Control onChange={(e)=>setDescription(e.target.value)} size='lg' as='textarea' placeholder='Description'/>
                            <Form.Control onChange={(e)=>setPrice(e.target.value)} size='lg' type='number' placeholder='Price in ETH'/>
                            <div className='d-grid px-0'>
                                <Button onClick={createNFT} variant="primary" size="lg">
                                    Create & list NFT
                                </Button>
                            </div>
                        </Row>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Create;