import {Row, Col, Card, Button, Spinner} from 'react-bootstrap';
import {ethers} from 'ethers';


const displayCard = ({item, idx, buyMarketItem}) =>
{
    return (
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
    )
}

export default displayCard;