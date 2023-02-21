import {useState, useEffect} from 'react';
import {ethers} from 'ethers';
import {Row, Col, Card} from 'react-bootstrap';

const MyListedItems = ({marketplace, nft, account}) =>
{
    const [loading, setLoading] = useState(true);
    const [soldItems, setSoldItems] = useState([]);
    const [listedItems, setListedItems] = useState([]);



    const getLists = async () =>
    {
        const soldList = [];
        const listedList = [];
        const itemsCount = await marketplace.itemCount();
        for (let i = 1; i <= itemsCount; i++)
        {
            const item = await marketplace.items(i);
            if(item.seller.toLowerCase().toString() === account.toString())
            {
                console.log("H")
                const uri = await nft.tokenURI(item.tokenId);
                const response = await fetch(uri);
                const metadata = await response.json();
                const totalPrice = await marketplace.getTotalPrice(item.itemId);
                let ite = 
                {
                    totalPrice: totalPrice,
                    itemId: item.itemId,
                    price: item.price,
                    name: metadata.name,
                    description: metadata.description,
                    image: metadata.image
                }
                console.log(item.sold)
                if(item.sold)
                {
                    soldList.push(ite);
                }
                else
                {
                    listedList.push(ite);
                }
            }
        }
        console.log(listedItems)
        setListedItems(listedList);
        setSoldItems(soldList);
        setLoading(false);
    }

    useEffect(()=>
    {
        getLists();
    }, [])


    if (loading)
    {
        return (
            <main style={{padding: "1rem 0"}}>
                <h2>Loading ...</h2>
            </main>
        )
    }


    return(
        <div className='justify-center flex'>
            {
                listedItems.length + soldItems.length > 0 ?
                (
                    <div>
                        <div className='px-5 py-3 container'>
                            <h2>Listed</h2>
                            <Row xs={1} md={2} lg={4} className="g-4 py-3">
                                {
                                    listedItems.map((item, idx) =>
                                    (
                                        <Col key={idx} className='overflown-hidden'>
                                            <Card>
                                                <Card.Img src={item.image} variant='top'/>
                                                <Card.Footer>{ethers.utils.formatEther(item.totalPrice)} ETH</Card.Footer>
                                            </Card>
                                        </Col>
                                    ))
                                }
                            </Row>
                        </div>
                        <div className='px-5 py-3 container'>
                            <h2>Sold</h2>
                            <Row xs={1} md={2} lg={4} className="g-4 py-3">
                                {
                                    soldItems.map((item, idx) =>
                                    (
                                        <Col key={idx} className='overflown-hidden'>
                                            <Card>
                                                <Card.Img src={item.image} variant='top'/>
                                                <Card.Footer>{ethers.utils.formatEther(item.totalPrice)} ETH</Card.Footer>
                                            </Card>
                                        </Col>
                                    ))
                                }
                            </Row>
                        </div>
                    </div>
                ):
                (
                    <main>
                        <h2>No listed Assets</h2>
                    </main>
                )
            }
        </div>
    )

}

export default MyListedItems;