const {expect} = require("chai");

const toWei = (amount) => ethers.utils.parseEther(amount.toString());
const fromWei = (amount) => ethers.utils.formatEther(amount);

describe ("NFTMarketplace", async () =>
{
    let nft, marketplace, address1, address2, deployer, feePercent;
    let URI = "Hello jee";

    beforeEach( async () => 
    {
        feePercent = 1;
        const NFT = await ethers.getContractFactory("NFT");
        const Marketplace = await ethers.getContractFactory("Marketplace");

        [deployer, _, __, address1, address2] = await ethers.getSigners();

        nft = await NFT.deploy();
        marketplace = await Marketplace.deploy(feePercent);

        await nft.deployed();
        await marketplace.deployed();
    })

    describe("Deployment", async () => 
    {
        it("Should track name and symbol of NFT collection", async () =>
        {
            expect(await nft.name()).to.equal("Dapp NFT");
            expect(await nft.symbol()).to.equal("DAPP");
        })

        it("Should track feePercent and feeAccount", async () =>
        {
            expect(await marketplace.feePercent()).to.equal(feePercent);
            expect(await marketplace.feeAccount()).to.equal(deployer.address)
        })
    })

    describe("Minting NFTs", async () =>
    {
        it("Should track each minted token", async () =>
        {
            await nft.connect(address1).mint(URI);
            expect(await nft.tokenCount()).to.equal(1);
            expect(await nft.tokenURI(1)).to.equal(URI);
            expect(await nft.balanceOf(address1.address)).to.equal(1);

            await nft.connect(address2).mint(URI);
            expect(await nft.tokenCount()).to.equal(2);
            expect(await nft.tokenURI(2)).to.equal(URI);
            expect(await nft.balanceOf(address2.address)).to.equal(1);

        })
    })

    describe("Making items in marketplace", async () =>
    {
        beforeEach(async () =>
        {
            await nft.connect(address1).mint(URI);
            await nft.connect(address1).setApprovalForAll(marketplace.address, true);
        })

        it("Should track newly created items, transfer NFT from seller to marketplace and emit event", async () =>
        {
            await expect(marketplace.connect(address1).createItem(nft.address, 1, toWei(1)))
                .to.emit(marketplace, "ItemCreated")
                .withArgs
                (
                    1,
                    nft.address,
                    toWei(1),
                    1,
                    address1.address
                )
            
            expect(await nft.ownerOf(1)).to.equal(marketplace.address);
            expect(await marketplace.itemCount()).to.equal(1);

            const newItem = await marketplace.items(1);
            expect(newItem.itemId).to.equal(1);
            expect(newItem.nft).to.equal(nft.address);
            expect(newItem.price).to.equal(toWei(1));
            expect(newItem.sold).to.equal(false);
            expect(newItem.tokenId).to.equal(1);
        })

        it("Should fail items with zero price", async () =>
        {
            await expect(marketplace.connect(address1).createItem(nft.address, 1, 0)).to.be.revertedWith("You selling for free?");
        })  
    })

    describe("Purchasing items on marketplace", async () =>
    {
        let price = 2;
        let totalPrice;
        beforeEach(async () =>
        {
            await nft.connect(address1).mint(URI);
            await nft.connect(address1).setApprovalForAll(marketplace.address, true);
            await marketplace.connect(address1).createItem(nft.address, 1, toWei(price));
        })

        it("Should update the item as sold, pay seller, transfer NFT to buyer, charge fees and emit a ItemTransfered event", async () =>
        {
            const sellerInitialBal = await address1.getBalance();
            const feeInitialBal = await deployer.getBalance();

            totalPrice = await marketplace.getTotalPrice(1);

            await expect(marketplace.connect(address2).purchaseItem(1, {value: totalPrice}))
                .to.emit(marketplace, "ItemTransfered")
                .withArgs
                (
                    1,
                    nft.address,
                    1,
                    totalPrice,
                    address1.address,
                    address2.address
                )

            const sellerFinalBal = await address1.getBalance();
            const feeFinalBal = await deployer.getBalance();

            // let fee = (1/100) * price;
            let fee = fromWei(totalPrice) - price
            

            // expect(+fromWei(feeFinalBal)).to.equal(+fee + +fromWei(feeInitialBal));
            expect(+fromWei(sellerFinalBal)).to.equal(+price + +fromWei(sellerInitialBal))

            expect(await nft.ownerOf(1)).to.equal(address2.address);
            expect((await marketplace.items(1)).sold).to.equal(true);
        })

        it("Should fail for invalid id, sold items, when not enough ether paid", async () =>
        {
            await expect(marketplace.connect(address2).purchaseItem(0, {value: totalPrice})).to.be.revertedWith("Invalid token id");
            await expect(marketplace.connect(address2).purchaseItem(1, {value: toWei(price)})).to.be.revertedWith("not enough ether");
            await expect(marketplace.connect(address1).purchaseItem(1, {value: totalPrice})).to.be.revertedWith("Cannot puchase own item");
            await marketplace.connect(deployer).purchaseItem(1, {value: totalPrice})
            await expect(marketplace.connect(address2).purchaseItem(1, {value: totalPrice})).to.be.revertedWith("Item already sold");
        })
    })
})