import {describe, it} from 'mocha'; //beforeEach, afterEach
import {default as chai} from 'chai';
//import {default as sinon} from 'sinon';
import {
  generatePublishedNodesNodeIdRegex,
  NodeIdFormat,
} from '../src/publishednodes';

const expect = chai.expect;

const opcUaNodeIdRegex = new RegExp(
  generatePublishedNodesNodeIdRegex([
    NodeIdFormat.ExpandedNodeId,
    NodeIdFormat.NamespaceIndex,
    NodeIdFormat.NodeId,
  ])
);

// run wrapper for regex execution
// TODO: include logging
function validateOpcUaNodeId(nodeId: string, exp: RegExp): boolean {
  return exp.test(nodeId);
}

describe('For integer based OPC UA node identifiers, the ValidateOpcUaNodeId function', () => {
  it('should return true when processing a valid integer node identifier', () => {
    expect(validateOpcUaNodeId('i=12345', opcUaNodeIdRegex)).to.equal(true);
  });
  it('should return false when supplied with a string node identifier', () => {
    expect(validateOpcUaNodeId('i=string', opcUaNodeIdRegex)).to.equal(false);
  });
  it('should return false when an int is terminated with a string', () => {
    expect(validateOpcUaNodeId('i=12345s', opcUaNodeIdRegex)).to.equal(false);
  });
  it('should return false when an int is prefaced with a string', () => {
    expect(validateOpcUaNodeId('i=s12345', opcUaNodeIdRegex)).to.equal(false);
  });
});

describe('For integer based OPC UA node identifiers that use Expanded NodeId formatting, the ValidateOpcUaNodeId function', () => {
  it('should return true when processing a valid integer node identifier', () => {
    expect(
      validateOpcUaNodeId(
        'nsu=http://opcfoundation.org/UA/;i=12345',
        opcUaNodeIdRegex
      )
    ).to.equal(true);
  });
  it('should return false when supplied with a valid namespace and a string node identifier', () => {
    expect(
      validateOpcUaNodeId(
        'nsu=http://opcfoundation.org/UA/;i=string',
        opcUaNodeIdRegex
      )
    ).to.equal(false);
  });
  it('should return false when supplied with a valid namespace and an integer id is terminated with a string', () => {
    expect(
      validateOpcUaNodeId(
        'nsu=http://opcfoundation.org/UA/;i=12345s',
        opcUaNodeIdRegex
      )
    ).to.equal(false);
  });
  it('should return false when supplied with a valid namespace and an integer id is prefaced with a string', () => {
    expect(
      validateOpcUaNodeId(
        'nsu=http://opcfoundation.org/UA/;i=s12345',
        opcUaNodeIdRegex
      )
    ).to.equal(false);
  });
  it('should return false when processing a valid integer node identifier but a bad namespace identifier missing the trailing resource slash', () => {
    expect(
      validateOpcUaNodeId(
        'nsu=http://opcfoundation.org/UA;i=12345',
        opcUaNodeIdRegex
      )
    ).to.equal(false);
  });
  it('should return true when processing a valid integer node identifier and namespace identifier with a port number', () => {
    expect(
      validateOpcUaNodeId(
        'nsu=http://opcfoundation.org:4100/UA/;i=12345',
        opcUaNodeIdRegex
      )
    ).to.equal(true);
  });
});

describe('For integer based OPC UA node identifiers that use namespace index based NodeId formatting, the ValidateOpcUaNodeId function', () => {
  it('should return true when processing a valid integer node identifier', () => {
    expect(validateOpcUaNodeId('ns=2;i=12345', opcUaNodeIdRegex)).to.equal(
      true
    );
  });
  it('should return false when supplied with a valid namespace and a string node identifier', () => {
    expect(validateOpcUaNodeId('nsu=5;i=string', opcUaNodeIdRegex)).to.equal(
      false
    );
  });
  it('should return false when supplied with a valid namespace and an integer id is terminated with a string', () => {
    expect(validateOpcUaNodeId('ns=3;i=12345s', opcUaNodeIdRegex)).to.equal(
      false
    );
  });
  it('should return false when supplied with a valid namespace and an integer id is prefaced with a string', () => {
    expect(validateOpcUaNodeId('ns=1;i=s12345', opcUaNodeIdRegex)).to.equal(
      false
    );
  });
});

describe('For string based OPC UA node identifiers, the ValidateOpcUaNodeId function', () => {
  it('should return true when processing a valid string node identifier', () => {
    expect(validateOpcUaNodeId('s=string', opcUaNodeIdRegex)).to.equal(true);
  });
  it('should return true when processing a valid string, which includes numbers, node identifier', () => {
    expect(validateOpcUaNodeId('s=str1ng', opcUaNodeIdRegex)).to.equal(true);
  });
  it('should return true when supplied with a string with spaces as a node identifier', () => {
    expect(
      validateOpcUaNodeId('s=this is a st ri ng nodeid', opcUaNodeIdRegex)
    ).to.equal(true);
  });
});

describe('For string based OPC UA node identifiers that include expanded nodeid formatting, the ValidateOpcUaNodeId function', () => {
  it('should return true when processing a valid string node identifier', () => {
    expect(
      validateOpcUaNodeId(
        'nsu=http://opcfoundation.org/UA/;s=this is a st ri ng nodeid',
        opcUaNodeIdRegex
      )
    ).to.equal(true);
  });
  it('should return false when processing a valid string node identifier but a bad namespace identifier missing the trailing resource slash', () => {
    expect(
      validateOpcUaNodeId(
        'nsu=http://opcfoundation.org/UA;s=this is a st ri ng nodeid',
        opcUaNodeIdRegex
      )
    ).to.equal(false);
  });
  it('should return true when processing a valid string node identifier and namespace identifier with a port number', () => {
    expect(
      validateOpcUaNodeId(
        'nsu=http://opcfoundation.org:4100/UA/;s=this is a st ri ng nodeid',
        opcUaNodeIdRegex
      )
    ).to.equal(true);
  });
});

describe('For string based OPC UA node identifiers that include namespace index based NodeId formatting, the ValidateOpcUaNodeId function', () => {
  it('should return true when processing a valid string node identifier', () => {
    expect(
      validateOpcUaNodeId('ns=0;s=this is a st ri ng nodeid', opcUaNodeIdRegex)
    ).to.equal(true);
  });
});

describe('For GUID based OPC UA node identifiers, the ValidateOpcUaNodeId function', () => {
  it('should return true when processing a valid GUID node identifier', () => {
    expect(
      validateOpcUaNodeId(
        'g=ac85ad0a-1f3f-4ee5-af3d-a7f4f33902d6',
        opcUaNodeIdRegex
      )
    ).to.equal(true);
  });
  it('should return false when processing only part of a valid GUID node identifier', () => {
    expect(
      validateOpcUaNodeId('g=ac85ad0a-1f3f-4ee5-af3d-', opcUaNodeIdRegex)
    ).to.equal(false);
  });
  it('should return false when supplied with a string as a node identifier', () => {
    expect(validateOpcUaNodeId('g=string', opcUaNodeIdRegex)).to.equal(false);
  });
  it('should return false when supplied with a bytestring as a node identifier', () => {
    expect(
      validateOpcUaNodeId('g=M/RbKBsRVkePCePcx24oRA==', opcUaNodeIdRegex)
    ).to.equal(false);
  });
  it('should return false when supplied with an integer as a node identifier', () => {
    expect(validateOpcUaNodeId('g=12345', opcUaNodeIdRegex)).to.equal(false);
  });
});

describe('For GUID based OPC UA node identifiers that include expanded nodeid formatting, the ValidateOpcUaNodeId function', () => {
  it('should return true when processing a valid GUID node identifier', () => {
    expect(
      validateOpcUaNodeId(
        'nsu=http://opcfoundation.org/UA/;g=ac85ad0a-1f3f-4ee5-af3d-a7f4f33902d6',
        opcUaNodeIdRegex
      )
    ).to.equal(true);
  });
  it('should return false when processing a valid GUID node identifier but a bad namespace identifier missing the trailing resource slash', () => {
    expect(
      validateOpcUaNodeId(
        'nsu=http://opcfoundation.org/UA;g=ac85ad0a-1f3f-4ee5-af3d-a7f4f33902d6',
        opcUaNodeIdRegex
      )
    ).to.equal(false);
  });
  it('should return true when processing a valid GUID node identifier and namespace identifier with a port number', () => {
    expect(
      validateOpcUaNodeId(
        'nsu=http://opcfoundation.org:4100/UA/;g=ac85ad0a-1f3f-4ee5-af3d-a7f4f33902d6',
        opcUaNodeIdRegex
      )
    ).to.equal(true);
  });
});

describe('For GUID based OPC UA node identifiers that include namespace index based NodeId formatting, the ValidateOpcUaNodeId function', () => {
  it('should return true when processing a valid GUID node identifier', () => {
    expect(
      validateOpcUaNodeId(
        'ns=1;g=ac85ad0a-1f3f-4ee5-af3d-a7f4f33902d6',
        opcUaNodeIdRegex
      )
    ).to.equal(true);
  });
});

describe('For ByteString based OPC UA node identifiers, the ValidateOpcUaNodeId function', () => {
  it('should return true when processing a valid ByteString node identifier', () => {
    expect(
      validateOpcUaNodeId('b=M/RbKBsRVkePCePcx24oRA==', opcUaNodeIdRegex)
    ).to.equal(true);
  });
  it('should return true when processing a different valid ByteString node identifier', () => {
    expect(
      validateOpcUaNodeId(
        'b=dGhpcyBpcyBhbm90aGVyIG5vZGUgaWQ=',
        opcUaNodeIdRegex
      )
    ).to.equal(true);
  });
  it('should return false when processing only part of a valid ByteString node identifier', () => {
    expect(
      validateOpcUaNodeId('b=M/RbKBsRVkePCePcx24o', opcUaNodeIdRegex)
    ).to.equal(false);
  });
  it('should return false when supplied with a string as a node identifier', () => {
    expect(validateOpcUaNodeId('b=string', opcUaNodeIdRegex)).to.equal(false);
  });
  it('should return false when supplied with a GUID as a node identifier', () => {
    expect(
      validateOpcUaNodeId(
        'b=ac85ad0a-1f3f-4ee5-af3d-a7f4f33902d6',
        opcUaNodeIdRegex
      )
    ).to.equal(false);
  });
  it('should return false when supplied with an integer as a node identifier', () => {
    expect(validateOpcUaNodeId('b=12345', opcUaNodeIdRegex)).to.equal(false);
  });
});

describe('For ByteString based OPC UA node identifiers that include expanded nodeid formatting, the ValidateOpcUaNodeId function', () => {
  it('should return true when processing a valid ByteString node identifier', () => {
    expect(
      validateOpcUaNodeId(
        'nsu=http://opcfoundation.org/UA/;b=M/RbKBsRVkePCePcx24oRA==',
        opcUaNodeIdRegex
      )
    ).to.equal(true);
  });
  it('should return false when processing a valid ByteString node identifier but a bad namespace identifier missing the trailing resource slash', () => {
    expect(
      validateOpcUaNodeId(
        'nsu=http://opcfoundation.org/UA;b=M/RbKBsRVkePCePcx24oRA==',
        opcUaNodeIdRegex
      )
    ).to.equal(false);
  });
  it('should return true when processing a valid ByteString node identifier and namespace identifier with a port number', () => {
    expect(
      validateOpcUaNodeId(
        'nsu=http://opcfoundation.org:4100/UA/;b=M/RbKBsRVkePCePcx24oRA==',
        opcUaNodeIdRegex
      )
    ).to.equal(true);
  });
});

describe('For ByteString based OPC UA node identifiers that include namespace index nodeid formatting, the ValidateOpcUaNodeId function', () => {
  it('should return true when processing a valid ByteString node identifier', () => {
    expect(
      validateOpcUaNodeId('ns=5;b=M/RbKBsRVkePCePcx24oRA==', opcUaNodeIdRegex)
    ).to.equal(true);
  });
});

describe('For the generated Published Nodes regex', () => {
  it('should return just the expanded nodeID regex string when supplied with only the expandednodeid, node id format', () => {
    const x = generatePublishedNodesNodeIdRegex([NodeIdFormat.ExpandedNodeId]);
    expect((x.match(/\$\)\)\|/g) || []).length).to.equal(3);
    expect(new RegExp(x).test('i=12345')).to.be.false;
    expect(new RegExp(x).test('ns=5;b=M/RbKBsRVkePCePcx24oRA==')).to.be.false;
    expect(
      new RegExp(x).test(
        'nsu=http://opcfoundation.org:4100/UA/;b=M/RbKBsRVkePCePcx24oRA=='
      )
    ).to.be.true;
  });
  it('should return just the namespace index nodeID regex string when supplied with only the expandednodeid, node id format', () => {
    const x = generatePublishedNodesNodeIdRegex([NodeIdFormat.NamespaceIndex]);
    expect((x.match(/\$\)\)\|/g) || []).length).to.equal(3);
    expect(new RegExp(x).test('i=12345')).to.be.false;
    expect(new RegExp(x).test('ns=5;b=M/RbKBsRVkePCePcx24oRA==')).to.be.true;
    expect(
      new RegExp(x).test(
        'nsu=http://opcfoundation.org:4100/UA/;b=M/RbKBsRVkePCePcx24oRA=='
      )
    ).to.be.false;
  });
  it('should return just the nodeID regex string when supplied with only the expandednodeid, node id format', () => {
    const x = generatePublishedNodesNodeIdRegex([NodeIdFormat.NodeId]);
    expect((x.match(/\$\)\|/g) || []).length).to.equal(3);
    expect(new RegExp(x).test('i=12345')).to.be.true;
    expect(new RegExp(x).test('ns=5;b=M/RbKBsRVkePCePcx24oRA==')).to.be.false;
    expect(
      new RegExp(x).test(
        'nsu=http://opcfoundation.org:4100/UA/;b=M/RbKBsRVkePCePcx24oRA=='
      )
    ).to.be.false;
  });
});
