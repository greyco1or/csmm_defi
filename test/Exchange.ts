import { ethers } from "hardhat"
import { expect } from "chai";

import { Exchange } from "../typechain-types/contracts/Exchange"
import { Token } from "../typechain-types/contracts/Token";

const toWei = (value: number) => ethers.utils.parseEther(value.toString());

const getBalance = ethers.provider.getBalance;

describe("Exchange", () => {
    let owner: any;
    let user: any;
    let exchange: Exchange;
    let token: Token;

    beforeEach(async () => {
        [owner, user] = await ethers.getSigners();

        const TokenFactory = await ethers.getContractFactory("Token");
        token = await TokenFactory.deploy("GrayToken", "GRAY", toWei(1000000));
        await token.deployed();

        const ExchangeFactory = await ethers.getContractFactory("Exchange");
        exchange = await ExchangeFactory.deploy(token.address);
        await exchange.deployed();
    });

    //test suite
    describe("addLiquidity", async () => {
        it ("add Liquidity", async() => {
            //1000 * 10^18하기 불편하니까 toWei 활용
            //approve도 필요한만큼만 하는 것이 보안성에 좋다.
            await token.approve(exchange.address, toWei(1000));
            //토큰 1000개와 이더리움 1000개 유동성 공급
            await exchange.addLiquidity(toWei(1000), {value: toWei(1000)});
            
            //실제 값과 기대값 비교 테스트
            expect(await getBalance(exchange.address)).to.equal(toWei(1000));
            expect(await token.balanceOf(exchange.address)).to.equal(toWei(1000));

            //새로운 유저가 와서 이더리움 1개를 스왑한다.
            await exchange.connect(user).ethToTokenSwap({value: toWei(1)});
            expect(await getBalance(exchange.address)).to.equal(toWei(1001));
            //스왑을 했으니 토큰의 개수는 999개가 될 것.
            expect(await token.balanceOf(user.address)).to.equal(toWei(1));
            //아래는 에러가 발생한다. 왜냐하면 1가 빠져나갔으니 9999개라 생각하지만, 이는 가스비를 계산하지 않은 숫자.
            expect(await getBalance(user.address)).to.equal(toWei(9999));
        })
    });
})