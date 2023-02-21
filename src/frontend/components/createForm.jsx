import {Row, Form, Button} from 'react-bootstrap';

const createForm = ({uploadToIpfs, setName, setDescription, setPrice, createNFT}) =>
{
    return (
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
    )
}

export default createForm;