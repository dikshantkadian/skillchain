// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Skillchain {
    address public owner;
    uint256 private _certificateIdCounter;

    struct Certificate {
        uint256 id;
        string title;
        string description;
        string ipfsCid; // <-- THE NEW FIELD!
        address studentAddress;
        address institutionAddress;
        uint256 issueTimestamp;
    }

    mapping(uint256 => Certificate) public certificates;

    event CertificateIssued(
        uint256 indexed id,
        address indexed studentAddress,
        string ipfsCid // We announce the IPFS CID now
    );

    constructor() {
        owner = msg.sender;
    }

    // The function now takes the IPFS CID as a required argument!
    function issueCertificate(
        address _studentAddress, 
        string memory _title, 
        string memory _description,
        string memory _ipfsCid // <-- THE NEW ARGUMENT!
    ) public {
        require(msg.sender == owner, "Only the owner can issue certificates");
        _certificateIdCounter++;
        uint256 newCertificateId = _certificateIdCounter;

        certificates[newCertificateId] = Certificate(
            newCertificateId,
            _title,
            _description,
            _ipfsCid, // We save it on-chain!
            _studentAddress,
            msg.sender,
            block.timestamp
        );

        emit CertificateIssued(newCertificateId, _studentAddress, _ipfsCid);
    }
}