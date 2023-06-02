//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Exchange {

    IERC20 token;

    //페어
    constructor (address _token) {
        //어떤 토큰으로 풀을 생성할 것인지 생성자 함수를 통해 넣어준다.
        token = IERC20(_token);
    }

    //payalbe이 필요한 이유는 토큰과 이더를 페어로 집어넣기 때문이다. 이더리움을 받기 위해선 반드시 payalbe이 필요하다.
    function addLiquidity(uint256 _tokenAmount) public payable {
        //transfer이 아니라 transferFrom을 사용해야 하는 이유는 token 컨트랙트에서 호출하는 것이 아니라, 
        //exchangeContract에서 호출하는 것이니까 주체가 다르다.
        token.transferFrom(msg.sender, address(this), _tokenAmount);
    }
}

