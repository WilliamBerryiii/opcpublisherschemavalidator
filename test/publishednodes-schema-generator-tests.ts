import {describe, it, beforeEach, afterEach} from 'mocha';
import {default as chai} from 'chai';
import {validateFile} from '../src/commands/validate-cmd';
import {getPublishedNodesSchema, NodeIdFormat} from '../src/publishednodes';
import {DefinedError} from 'ajv';

const expect = chai.expect;

const schema = getPublishedNodesSchema(
  [
    NodeIdFormat.ExpandedNodeId,
    NodeIdFormat.NamespaceIndex,
    NodeIdFormat.NodeId,
  ],
  true,
  false
);

describe('An example publishednodes.json file', () => {
  beforeEach(() => {});

  afterEach(() => {});

  it('should not return an error when being validated', () => {
    const [result, validationErrors] = validateFile(publishedNodes, schema);
    //console.log(validationErrors);

    expect(result).to.be.true;
    expect(validationErrors).to.be.null;
  });

  it('should not return an error when being validated', () => {
    const mixedModeSchema = [
      {
        EndpointUrl: 'opc.tcp://localhost:50000',
        OpcNodes: [
          {
            ExpandedNodeId: 'nsu=http://opcfoundation.org/UA/;i=2258',
          },
        ],
      },
      {
        EndpointUrl: 'opc.tcp://localhost:50000',
        OpcNodes: [
          {
            Id: 'i=2262',
          },
          {
            Id: 'ns=2;s=AlternatingBoolean',
          },
          {
            Id: 'nsu=http://microsoft.com/Opc/OpcPlc/;s=NegativeTrendData',
          },
        ],
      },
    ];

    const [result, validationErrors] = validateFile(mixedModeSchema, schema);
    console.log(validationErrors);

    expect(result).to.be.true;
    expect(validationErrors).to.be.null;
  });

  it('should not return an error when being validated as DataSetPublishingInterval can be an integer', () => {
    const DataSetPublishingIntervalIntschema = [
      {
        DataSetWriterGroup: 'testgroup',
        DataSetWriterId: 'testwriterid',
        DataSetPublishingInterval: 1000,
        EndpointUrl: 'opc.tcp://localhost:50000',
        UseSecurity: false,
        OpcNodes: [
          {
            Id: 'i=2258',
            DataSetFieldId: 'testfieldid1',
            OpcPublishingInterval: 2000,
          },
          {
            Id: 'i=2259',
          },
        ],
      },
    ];

    const [result, validationErrors] = validateFile(
      DataSetPublishingIntervalIntschema,
      schema
    );
    //console.log(validationErrors);

    expect(result).to.be.true;
    expect(validationErrors).to.be.null;
  });

  it('should not return an error when being validated as DataSetPublishingInterval can be a string', () => {
    const DataSetPublishingIntervalIntschema = [
      {
        DataSetWriterGroup: 'testgroup',
        DataSetWriterId: 'testwriterid',
        DataSetPublishingInterval: '1000',
        EndpointUrl: 'opc.tcp://localhost:50000',
        UseSecurity: false,
        OpcNodes: [
          {
            Id: 'i=2258',
            DataSetFieldId: 'testfieldid1',
            OpcPublishingInterval: 2000,
          },
          {
            Id: 'i=2259',
          },
        ],
      },
    ];

    const [result, validationErrors] = validateFile(
      DataSetPublishingIntervalIntschema,
      schema
    );
    //console.log(validationErrors);

    expect(result).to.be.true;
    expect(validationErrors).to.be.null;
  });

  it('should not return an error when being validated with requireUseSecurity set to true', () => {
    const requireSecuritySchema = getPublishedNodesSchema(
      [
        NodeIdFormat.ExpandedNodeId,
        NodeIdFormat.NamespaceIndex,
        NodeIdFormat.NodeId,
      ],
      true,
      true
    );
    const [result, validationErrors] = validateFile(
      publishedNodes,
      requireSecuritySchema
    );
    //console.log(validationErrors);

    expect(result).to.be.false;
    expect(validationErrors).to.have.length(5);
    // check that require security is why it failed
    // by checking against the value of UseSecurity
    expect(
      (validationErrors as DefinedError[]).find(
        err => err.instancePath === '/0/UseSecurity'
      )
    ).to.exist;
  });
});

describe('When running against the generated publishednodes-schema.json an incorrect publishednodes.json file', () => {
  beforeEach(() => {});

  afterEach(() => {});

  it('should return one error when being validated with an integer NodeId that includes a string', () => {
    // modify the NodeId in the first element of the
    // publishedNodes.json file to trigger a parse
    // failure.
    publishedNodes[0]['OpcNodes'][0]['Id'] = 'i=12345f';
    const [result, validationErrors] = validateFile(publishedNodes, schema);
    //console.log(validationErrors);

    expect(result).to.be.false;
    expect(validationErrors).to.not.be.empty;
    expect(
      (validationErrors as DefinedError[]).find(
        err => err.instancePath === '/0/OpcNodes/0/Id'
      )
    ).to.exist;
    expect(
      (validationErrors as DefinedError[]).find(
        err =>
          err.schemaPath ===
          '#/items/oneOf/0/properties/OpcNodes/items/0/properties/Id/pattern'
      )
    ).to.exist;
    expect(
      (validationErrors as DefinedError[]).find(
        err => err.instancePath === '/0'
      )
    ).to.exist;
  });

  it('should return one error when being validated with a GUID NodeId that is not a GUID', () => {
    // modify the NodeId in the first element of the
    // publishedNodes.json file to trigger a parse
    // failure.
    publishedNodes[0]['OpcNodes'][0]['Id'] = 'g=12345f';
    const [result, validationErrors] = validateFile(publishedNodes, schema);
    //console.log(validationErrors);

    expect(result).to.be.false;
    expect(validationErrors).to.not.be.empty;
    expect(
      (validationErrors as DefinedError[]).find(
        err => err.instancePath === '/0/OpcNodes/0/Id'
      )
    ).to.exist;
    expect(
      (validationErrors as DefinedError[]).find(
        err =>
          err.schemaPath ===
          '#/items/oneOf/0/properties/OpcNodes/items/0/properties/Id/pattern'
      )
    ).to.exist;
    expect(
      (validationErrors as DefinedError[]).find(
        err => err.instancePath === '/0'
      )
    ).to.exist;
  });

  it('should return one error when being validated with a ByteString NodeId that is not a ByteString', () => {
    // modify the NodeId in the first element of the
    // publishedNodes.json file to trigger a parse
    // failure.
    publishedNodes[0]['OpcNodes'][0]['Id'] = 'b=12345';
    const [result, validationErrors] = validateFile(publishedNodes, schema);
    //console.log(validationErrors);

    expect(result).to.be.false;
    expect(validationErrors).to.not.be.empty;
    expect(
      (validationErrors as DefinedError[]).find(
        err => err.instancePath === '/0/OpcNodes/0/Id'
      )
    ).to.exist;
    expect(
      (validationErrors as DefinedError[]).find(
        err =>
          err.schemaPath ===
          '#/items/oneOf/0/properties/OpcNodes/items/0/properties/Id/pattern'
      )
    ).to.exist;
    expect(
      (validationErrors as DefinedError[]).find(
        err => err.instancePath === '/0'
      )
    ).to.exist;
  });
});

const publishedNodes = [
  {
    EndpointUrl: 'opc.tcp://20.185.195.172:53530/OPCUA/SimulationServer',
    UseSecurity: false,
    OpcNodes: [
      {
        Id: 'i=1001',
        OpcSamplingInterval: 2000,
        OpcPublishingInterval: 5000,
      },
      {
        Id: 'i=1002',
        OpcSamplingInterval: 2000,
        OpcPublishingInterval: 5000,
      },
      {
        Id: 's=this is a string nodeid',
        OpcSamplingInterval: 2000,
        OpcPublishingInterval: 5000,
      },
      {
        Id: 's=this is another string nodeid',
        OpcSamplingInterval: 2000,
        OpcPublishingInterval: 5000,
      },
      {
        Id: 'g=ac85ad0a-1f3f-4ee5-af3d-a7f4f33902d6',
        OpcSamplingInterval: 2000,
        OpcPublishingInterval: 5000,
      },
      {
        Id: 'g=ac85ad0a-1f3f-4ee5-af3d-a7f4f33902d7',
        OpcSamplingInterval: 2000,
        OpcPublishingInterval: 5000,
      },
      {
        Id: 'b=dGhpcyBpcyBhIG5vZGUgaWQ=',
        OpcSamplingInterval: 2000,
        OpcPublishingInterval: 5000,
      },
      {
        Id: 'b=dGhpcyBpcyBhbm90aGVyIG5vZGUgaWQ=',
        OpcSamplingInterval: 2000,
        OpcPublishingInterval: 5000,
      },
      {
        Id: 'nsu=http://opcfoundation.org/UA/;i=12345',
        OpcSamplingInterval: 2000,
        OpcPublishingInterval: 5000,
      },
      {
        Id: 'nsu=http://opcfoundation.org/UA/;i=123456',
        OpcSamplingInterval: 2000,
        OpcPublishingInterval: 5000,
      },
    ],
  },
];
