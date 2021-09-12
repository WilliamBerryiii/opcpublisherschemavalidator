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
    //console.log(validationErrors);

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

  it('should not return an error when being validated with requireUseSecurity set to true, and when the UseSecurity flag is false', () => {
    const requireSecuritySchema = getPublishedNodesSchema(
      [
        NodeIdFormat.ExpandedNodeId,
        NodeIdFormat.NamespaceIndex,
        NodeIdFormat.NodeId,
      ],
      // require that UseSecurity is a required field in the schema 
      // but do not require a check that it's value is 'true' 
      false,
      true
    );
    // set the UseSecurity property to true of the config file
    let pn = JSON.parse(JSON.stringify(publishedNodes));

    const [result, validationErrors] = validateFile(
      pn,
      requireSecuritySchema
    );
    //console.log(validationErrors);

    // as the publishednodes configuration we are using does not
    // have UseSecurity set to true, but the field is present, we
    // should expect successful validation. 
    expect(result).to.be.true;
    expect(validationErrors).to.be.null;
  });

  it('should return an error when being validated with requireUseSecurity set to true, and when the UseSecurity flag must be true as well', () => {
    const requireSecuritySchema = getPublishedNodesSchema(
      [
        NodeIdFormat.ExpandedNodeId,
        NodeIdFormat.NamespaceIndex,
        NodeIdFormat.NodeId,
      ],
      // require that UseSecurity is set to true and that it is a 
      // required field in the configuration file. 
      true,
      true
    );
    // set the UseSecurity property to true of the config file
    let pn = JSON.parse(JSON.stringify(publishedNodes));

    const [result, validationErrors] = validateFile(
      pn,
      requireSecuritySchema
    );
    //console.log(validationErrors);

    // as the publishednodes configuration we are using does not
    // have UseSecurity set to true, but the field is present, we
    // should expect a validation failure only on the false value check. 
    expect(result).to.be.false;

    // as UseSecurity is a required field for the first two array
    // elements of the schema, all subschema checks will fail. Hence,
    // we should expect 14 failures. 
    expect(validationErrors).to.have.length(14);

    // check that require security is why it failed
    // by checking against the value of UseSecurity.
    // the top two schema both have the option for 
    // UseSecurity, so we would expect 2 failure counts
    // for that constraint. 
    expect(
      (validationErrors as DefinedError[]).filter(
        err => err.instancePath === '/0/UseSecurity'
      )
    ).to.have.length(2);
  });
});

describe('When running against the generated publishednodes-schema.json an incorrect publishednodes.json file', () => {
  beforeEach(() => {});

  afterEach(() => {});

  it('should return one error when being validated with an integer NodeId that includes a string', () => {
    // modify the NodeId in the first element of the
    // publishedNodes.json file to trigger a parse
    // failure.
    let pn = JSON.parse(JSON.stringify(publishedNodes));
    pn[0]['OpcNodes'][0]['Id'] = 'i=12345f';
    const [result, validationErrors] = validateFile(pn, schema);
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
          '#/items/oneOf/0/properties/OpcNodes/items/properties/Id/pattern'
      )
    ).to.exist;
    // since we will not be matching 2 of the potential subschema we should 
    // expect that there will be two root validation errors
    expect(
      (validationErrors as DefinedError[]).filter(
        err => err.instancePath === '/0'
      )
    ).to.have.length(2);
  });

  it('should return one error when being validated with an integer NodeId, as the third array element, that includes a string', () => {
    // modify the NodeId in the first element of the
    // publishedNodes.json file to trigger a parse
    // failure.
    let pn = JSON.parse(JSON.stringify(publishedNodes));
    pn[0]['OpcNodes'][2]['Id'] = 'i=12345f';
    const [result, validationErrors] = validateFile(pn, schema);
    //console.log(validationErrors);

    expect(result).to.be.false;
    expect(validationErrors).to.not.be.empty;
    expect(
      (validationErrors as DefinedError[]).find(
        err => err.instancePath === '/0/OpcNodes/2/Id'
      )
    ).to.exist;
    expect(
      (validationErrors as DefinedError[]).find(
        err =>
          err.schemaPath ===
          '#/items/oneOf/0/properties/OpcNodes/items/properties/Id/pattern'
      )
    ).to.exist;
    expect(
      (validationErrors as DefinedError[]).find(
        err => err.instancePath === '/0'
      )
    ).to.exist;
  });

  it('should return one error when being validated with an integer NodeId, as the third and fifth array elements, include strings', () => {
    // modify the NodeId in the first element of the
    // publishedNodes.json file to trigger a parse
    // failure.
    let pn = JSON.parse(JSON.stringify(publishedNodes));
    pn[0]['OpcNodes'][2]['Id'] = 'i=12345f';
    pn[0]['OpcNodes'][4]['Id'] = 'i=12345g';
    const [result, validationErrors] = validateFile(pn, schema);
    //console.log(validationErrors);

    expect(result).to.be.false;
    expect(validationErrors).to.not.be.empty;
    expect(
      (validationErrors as DefinedError[]).find(
        err => err.instancePath === '/0/OpcNodes/2/Id'
      )
    ).to.exist;
    expect(
      (validationErrors as DefinedError[]).find(
        err => err.instancePath === '/0/OpcNodes/4/Id'
      )
    ).to.exist;
    expect(
      (validationErrors as DefinedError[]).find(
        err =>
          err.schemaPath ===
          '#/items/oneOf/0/properties/OpcNodes/items/properties/Id/pattern'
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
    let pn = JSON.parse(JSON.stringify(publishedNodes));
    pn[0]['OpcNodes'][0]['Id'] = 'g=12345f';
    const [result, validationErrors] = validateFile(pn, schema);
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
          '#/items/oneOf/0/properties/OpcNodes/items/properties/Id/pattern'
      )
    ).to.exist;
    // since we will not be matching 2 of the potential subschema we should 
    // expect that there will be two root validation errors
    expect(
      (validationErrors as DefinedError[]).filter(
        err => err.instancePath === '/0'
      )
    ).to.have.length(2);
  });

  it('should return one error when being validated with a ByteString NodeId that is not a ByteString', () => {
    // modify the NodeId in the first element of the
    // publishedNodes.json file to trigger a parse
    // failure.
    let pn = JSON.parse(JSON.stringify(publishedNodes));
    pn[0]['OpcNodes'][0]['Id'] = 'b=12345';
    const [result, validationErrors] = validateFile(pn, schema);
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
          '#/items/oneOf/0/properties/OpcNodes/items/properties/Id/pattern'
      )
    ).to.exist;
    // since we will not be matching 2 of the potential subschema we should 
    // expect that there will be two root validation errors
    expect(
      (validationErrors as DefinedError[]).filter(
        err => err.instancePath === '/0'
      )
    ).to.have.length(2);
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
