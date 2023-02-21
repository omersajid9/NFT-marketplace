import {useState, useEffect} from 'react';
import {ethers} from 'ethers';
import {Row, Col, Card, Button, Spinner} from 'react-bootstrap';

const Home = ({marketplace, nft}) =>
{
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);


    // const fetchImage = async (imageUrl) => {
    //     const res = await fetch(imageUrl);
    //     const imageBlob = await res.blob();
    //     const imageObjectURL = URL.createObjectURL(imageBlob);
    //     return imageObjectURL
    //   };


    const loadMarketplaceItems = async () =>
    {
        const itemCount = await marketplace.itemCount();
        console.log(Number(itemCount))
        
        let itemsList = [];
        for (let i = 1; i < Number(itemCount)+1; i++)
        {
            const item = await marketplace.items(i);

            if (!item.sold)
            {
                const uri = await nft.tokenURI(item.tokenId);
                const response = await fetch(uri);
                const metadata = await response.json();
                // console.log(uri)
                // const img = fetchImage(uri);
                // const it = await (await fetch(uri)).wait();
                // console.log("fetch")
                // console.log(it.text());
                // const metadata = {name: "a", image: img}
                const totalPrice = await marketplace.getTotalPrice(item.itemId);
                itemsList.push(
                    {
                        totalPrice: totalPrice,
                        itemId: item.itemId,
                        seller: item.seller,
                        name: metadata.name,
                        description: metadata.description,
                        image: metadata.image
                    }
                )
                console.log("H")
            }
        }
        console.log("Items list")
        console.log(itemsList)
        setItems(itemsList);
        setLoading(false);
    }

    const buyMarketItem = async (item) =>
    {
        await (await marketplace.purchaseItem(item.itemId, {value: item.totalPrice})).wait();
        setLoading(true);
        loadMarketplaceItems();
    }

    useEffect(async ()=>
    {
        loadMarketplaceItems();
        console.log("Loded")
    }, []);


    if (loading)
    {
        return(
            <main style={{padding: "1rem 0"}}>
                <h2>Loading... </h2>
            </main>
        )
    }

    return (
        <div className="flex center-jusitfy">
           {
            items.length > 0 ?
                (
                    <div className="px-5 container">
                        <Row xs={1} md={2} lg={4} className="g-4 py-5">
                            {
                                items.map((item, idx) =>
                                (
                                    <Col key={idx} className="overflow-hidden">
                                        <Card>
                                            <Card.Img variant="top" src={item.image}/>   
                                            <Card.Body color="secondary">
                                                <Card.Title>{item.name}</Card.Title>
                                                <Card.Text>{item.description}</Card.Text>
                                            </Card.Body>
                                            <Card.Footer>
                                                <div className="d-grid">
                                                    <Button onClick={() =>buyMarketItem(item)} variant='primary' size="lg">
                                                        Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                                                    </Button>
                                                </div>
                                            </Card.Footer>                  
                                        </Card>
                                    </Col>
                                ))
                            }
                        </Row>
                    </div>
                )
                :
                (
                    <main style={{padding: "1rem 0"}}>
                        <h2>No listed assets</h2>
                    </main>
                )
           }
        </div>
        )
}

export default Home;