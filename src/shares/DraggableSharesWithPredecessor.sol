/**
* SPDX-License-Identifier: LicenseRef-Aktionariat
*
* MIT License with Automated License Fee Payments
*
* Copyright (c) 2020 Aktionariat AG (aktionariat.com)
*
* Permission is hereby granted to any person obtaining a copy of this software
* and associated documentation files (the "Software"), to deal in the Software
* without restriction, including without limitation the rights to use, copy,
* modify, merge, publish, distribute, sublicense, and/or sell copies of the
* Software, and to permit persons to whom the Software is furnished to do so,
* subject to the following conditions:
*
* - The above copyright notice and this permission notice shall be included in
*   all copies or substantial portions of the Software.
* - All automated license fee payments integrated into this and related Software
*   are preserved.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/
pragma solidity ^0.8.0;

import "./DraggableShares.sol";
import "../draggable/ERC20Draggable.sol";

/**
 * @title Draggable CompanyName AG Shares
 * @author Luzius Meisser, luzius@aktionariat.com
 *
 * This is an ERC-20 token representing shares of CompanyName AG that are bound to
 * a shareholder agreement that can be found at the URL defined in the constant 'terms'.
 * The shareholder agreement is partially enforced through this smart contract. The agreement
 * is designed to facilitate a complete acquisition of the firm even if a minority of shareholders
 * disagree with the acquisition, to protect the interest of the minority shareholders by requiring
 * the acquirer to offer the same conditions to everyone when acquiring the company, and to
 * facilitate an update of the shareholder agreement even if a minority of the shareholders that
 * are bound to this agreement disagree. The name "draggable" stems from the convention of calling
 * the right to drag a minority along with a sale of the company "drag-along" rights. The name is
 * chosen to ensure that token holders are aware that they are bound to such an agreement.
 *
 * The percentage of token holders that must agree with an update of the terms is defined by the
 * constant UPDATE_QUORUM. The percentage of yes-votes that is needed to successfully complete an
 * acquisition is defined in the constant ACQUISITION_QUORUM. Note that the update quorum is based
 * on the total number of tokens in circulation. In contrast, the acquisition quorum is based on the
 * number of votes cast during the voting period, not taking into account those who did not bother
 * to vote.
 */

contract DraggableSharesWithPredecessor is DraggableShares {

    address private immutable newBaseToken;

    constructor(
        address _newBaseToken,
        string memory _terms,
        address _predecessor,
        uint256 _quorum,
        uint256 _votePeriod,
        address _recoveryHub,
        address _offerFactory,
        address _oracle
    )
        DraggableShares(_terms, _predecessor, _quorum, _votePeriod, _recoveryHub, _offerFactory, _oracle)
    {
        newBaseToken = _newBaseToken;
    }

    // custom built convert function for old DSHS contract
    function convert() external {
        address oldBase = getOldBase();
        fetchTokens();
        switchBase(oldBase);
    }

    function fetchTokens() internal {
        require(address(wrapped) != newBaseToken, "already changed");
        IDSHS predecessor = IDSHS(address(wrapped));
        uint256 supply = predecessor.totalSupply();
        uint256 present = totalSupply();
        uint256 missing = supply - present;
        //_mint(address(predecessor), supply); that's what the newer version expects
        _mint(address(this), missing);
        _approve(address(this), address(predecessor), missing);
        predecessor.migrate();
    }

    function getOldBase() internal view returns (address) {
        return IDSHS(address(wrapped)).getWrappedContract();
    }

    function switchBase(address oldWrapped) internal {
        IERC20 oldBase = IERC20(oldWrapped);
        oldBase.approve(newBaseToken, oldBase.balanceOf(address(this)));
        IBaseToken(newBaseToken).convertOldShares();
        wrapped = IERC20(newBaseToken);
        recovery.setRecoverable(false);
        require(totalSupply() == wrapped.balanceOf(address(this)), "balance");
    }
}

abstract contract IBaseToken {
    function convertOldShares() virtual external;
}

abstract contract IDSHS {
    function migrate() virtual external;
    function getWrappedContract() virtual external view returns (address);
    function totalSupply() virtual external returns (uint256);
}