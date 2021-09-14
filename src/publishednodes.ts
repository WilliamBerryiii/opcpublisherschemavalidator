export enum NodeIdFormat {
  NamespaceIndex = 'NamespaceIndex',
  NodeId = 'NodeId',
  ExpandedNodeId = 'ExpandedNodeId',
}

// URL of schema, this is subject to change as JSON-Schema develops
const jsonSchemaUrl = 'http://json-schema.org/draft-07/schema#';

// OPC UA Server Endpoint validation regex. This does not
// cover the entire allowable URI/URN address space and
// should be updated to cover edge cases, like alternate
// languages, if needed - regenerating the schema accordingly
const endpointRegexStr =
  'opc.tcp://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+';
//const endpointRegex = new RegExp(endpointRegexStr);

// OPC UA Server Namespace validation regex. This does
// not cover the entire allowable URI/URN address space
// and should be updated to cover edge cases, like
// alternate languages, if needed - regenerating the schema
// accordinly
const ExpandedNodeIdNamespaceRegexStr =
  '^nsu=http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*(),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/;';
//const nsRegex = new RegExp(nsRegexStr);

// OPC UA Server Namespace index validation regex. This
// is NOT a preferred way to reference NodeIds as regeneration
// of the OPC UA Information model can cause the namespace
// index (position in the namespace list) to change, and
// therefore completely break an implementation
const NamespaceIndexRegexStr = '^ns=(\\d+);';

/*
Integer (`i`) based NodeID expressions, with
and without the namespace validation are below.

This regex uses the `^` character to ensure
that when using the short NodeID syntax, there
are not invalid characters. The `^` character
is removed when we combine it with the
Namespace validation regex.

NOTE: that we escape the `\` character with an
additional `\` to ensure `\d` is recognized
appropriately.
*/
const opcUaIntNodeIdRegexStr = '(^i=(\\d+)$)';
const opcUaIntExpandedNodeIdRegexStr = `(${ExpandedNodeIdNamespaceRegexStr}${opcUaIntNodeIdRegexStr.replace(
  '^',
  ''
)})`;
const opcUaIntNsNodeIdRegexStr = `(${NamespaceIndexRegexStr}${opcUaIntNodeIdRegexStr.replace(
  '^',
  ''
)})`;

/*
String (`s`) based NodeID expressions, with
and without the namespace validation are below.

This regex uses the `^` character to ensure
that when using the short NodeID syntax, there
are not invalid characters. The `^` character
is removed when we combine it with the
Namespace validation regex.

NOTE: Linting needs to be disable on the regex
line due to UTF-8 control characters like
`\x00` being preset in the regex.
*/
// eslint-disable-next-line
const opcUaStrNodeIdUtf8RegexStr =
  String.raw`(^s=([\x00-\x7F]|([\xC2-\xDF]|\xE0[\xA0-\xBF]|\xED[\x80-\x9F]|(|[\xE1-\xEC]|[\xEE-\xEF]|\xF0[\x90-\xBF]|\xF4[\x80-\x8F]|[\xF1-\xF3][\x80-\xBF])[\x80-\xBF])[\x80-\xBF])+$)`;
const opcUaStrExpandedNodeIdUtf8RegexStr = `(${ExpandedNodeIdNamespaceRegexStr}${opcUaStrNodeIdUtf8RegexStr.replace(
  '^',
  ''
)})`;
const opcUaStrNsNodeIdUtf8RegexStr = `(${NamespaceIndexRegexStr}${opcUaStrNodeIdUtf8RegexStr.replace(
  '^',
  ''
)})`;

/*
GUID (`g`) based NodeID expressions, with
and without the namespace validation are below.

This regex uses the `^` character to ensure
that when using the short NodeID syntax, there
are not invalid characters. The `^` character
is removed when we combine it with the
Namespace validation regex.
*/
const opcUaGuidNodeIdRegexStr =
  '(^g=([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$)';
const opcUaGuidExpandedNodeIdRegexStr = `(${ExpandedNodeIdNamespaceRegexStr}${opcUaGuidNodeIdRegexStr.replace(
  '^',
  ''
)})`;
const opcUaGuidNsNodeIdRegexStr = `(${NamespaceIndexRegexStr}${opcUaGuidNodeIdRegexStr.replace(
  '^',
  ''
)})`;

/*
ByteString (`b`) based NodeID expressions, with
and without the namespace validation are below.

This regex uses the `^` character to ensure
that when using the short NodeID syntax, there
are not invalid characters. The `^` character
is removed when we combine it with the
Namespace validation regex.

NOTE: that we escape the `\` character with an
additional `\` to ensure `\d` is recognized
appropriately.
*/
const opcUaByteStrNodeIdRegexStr =
  '(^b=(?:[A-Za-z\\d+/]{4})*(?:[A-Za-z\\d+/]{3}=|[A-Za-z\\d+/]{2}==)$)';
const opcUaByteStrExpandedNodeIdRegexStr = `(${ExpandedNodeIdNamespaceRegexStr}${opcUaByteStrNodeIdRegexStr.replace(
  '^',
  ''
)})`;
const opcUaByteStrNsNodeIdRegexStr = `(${NamespaceIndexRegexStr}${opcUaByteStrNodeIdRegexStr.replace(
  '^',
  ''
)})`;

export function generatePublishedNodesNodeIdRegex(
  nodeFormats: string[]
): string {
  // Cummulative matrix of OPC UA NodeID regexs
  const opcUaNodeIdRegexStr: string[] = [];
  nodeFormats.forEach(format => {
    switch (NodeIdFormat[format as keyof typeof NodeIdFormat]) {
      case NodeIdFormat.ExpandedNodeId: {
        opcUaNodeIdRegexStr.push(
          `${opcUaIntExpandedNodeIdRegexStr}|`,
          `${opcUaStrExpandedNodeIdUtf8RegexStr}|`,
          `${opcUaGuidExpandedNodeIdRegexStr}|`,
          `${opcUaByteStrExpandedNodeIdRegexStr}|`
        );
        break;
      }
      case NodeIdFormat.NamespaceIndex: {
        opcUaNodeIdRegexStr.push(
          `${opcUaIntNsNodeIdRegexStr}|`,
          `${opcUaStrNsNodeIdUtf8RegexStr}|`,
          `${opcUaGuidNsNodeIdRegexStr}|`,
          `${opcUaByteStrNsNodeIdRegexStr}|`
        );
        break;
      }
      case NodeIdFormat.NodeId: {
        opcUaNodeIdRegexStr.push(
          `${opcUaIntNodeIdRegexStr}|`,
          `${opcUaStrNodeIdUtf8RegexStr}|`,
          `${opcUaGuidNodeIdRegexStr}|`,
          `${opcUaByteStrNodeIdRegexStr}|`
        );
        break;
      }

      default:
    }
  });
  // we need to remove the last pipe after the last
  // capture group.
  return opcUaNodeIdRegexStr.join('').slice(0, -1);
}

// publishednodes.json JSON-Schema object with fills
// NOTE: pay attention to the 'required' fields and
// update accordingly
export function getPublishedNodesSchema(
  formats: NodeIdFormat[],
  useSecurity: boolean,
  requireUseSecurity: boolean
) {
  const schema = {
    //$id: jsonSchemaUrl,
    $schema: jsonSchemaUrl,
    $comment:
      'The outer most object of the configuration file must be an array, though ' +
      'its contents may adhere to several differing schema, presented from newest to oldest supported schema.',
    type: 'array',
    items: {
      $comment:
        "The nested 'oneOf' under 'items' ensures that each array element must comform " +
        'to one of the three following subschema. See the following stackoverflow post for details: ' +
        'https://stackoverflow.com/a/67314134/1276028',
      oneOf: [
        {
          $comment:
            'The following subschema is the most current allowable configuration schema for OPC Publisher',
          type: 'object',
          properties: {
            DataSetWriterId: {
              type: 'string',
            },
            DataSetWriterGroup: {
              type: 'string',
            },
            DataSetPublishingInterval: {
              type: ['integer', 'string'],
            },
            EncryptedAuthPassword: {
              type: 'string',
            },
            OpcAuthenticationPassword: {
              type: 'string',
            },
            EndpointUrl: {
              type: 'string',
              format: 'uri',
              $comment:
                'Endpoint urls must adhear to OPC UA server addressing schemes which begin with `opc.tcp` followed by ' +
                'acceptable URI formatting, e.g. `opc.tcp?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+`',
              pattern: `${endpointRegexStr}`,
            },
            UseSecurity: {
              type: 'boolean',
            },
            OpcNodes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  Id: {
                    type: 'string',
                    pattern: `${generatePublishedNodesNodeIdRegex(formats)}`,
                  },
                  DisplayName: {
                    type: 'string',
                  },
                  DataSetFieldId: {
                    type: 'string',
                  },
                  OpcSamplingInterval: {
                    type: 'integer',
                  },
                  OpcPublishingInterval: {
                    type: 'integer',
                  },
                  HeartbeatInterval: {
                    type: 'integer',
                  },
                  HeartbeatIntervalTimespan: {
                    type: 'string',
                  },
                  SkipFirst: {
                    type: 'boolean',
                  },
                },
                required: ['Id'],
              },
            },
          },
          required: ['EndpointUrl', 'OpcNodes'],
        },
        {
          type: 'object',
          properties: {
            DataSetWriterId: {
              type: 'string',
            },
            DataSetWriterGroup: {
              type: 'string',
            },
            DataSetPublishingInterval: {
              type: 'string',
            },
            EncryptedAuthPassword: {
              type: 'string',
            },
            OpcAuthenticationPassword: {
              type: 'string',
            },
            EndpointUrl: {
              type: 'string',
              format: 'uri',
              $comment:
                'Endpoint urls must adhear to OPC UA server addressing schemes which begin with `opc.tcp` followed by ' +
                'acceptable URI formatting, e.g. `opc.tcp?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+`',
              pattern: `${endpointRegexStr}`,
            },
            UseSecurity: {
              type: 'boolean',
            },
            OpcNodes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  ExpandedNodeId: {
                    type: 'string',
                    $comment:
                      'this subschema only supports the use of the expanded nodeid format',
                    pattern: `${generatePublishedNodesNodeIdRegex([
                      NodeIdFormat.ExpandedNodeId.toString(),
                    ])}`,
                  },
                  OpcSamplingInterval: {
                    type: 'integer',
                  },
                  OpcPublishingInterval: {
                    type: 'integer',
                  },
                },
                required: ['ExpandedNodeId'],
              },
            },
          },
          required: ['EndpointUrl', 'OpcNodes'],
        },
        {
          type: 'object',
          properties: {
            DataSetWriterId: {
              type: 'string',
            },
            DataSetWriterGroup: {
              type: 'string',
            },
            DataSetPublishingInterval: {
              type: 'string',
            },
            EncryptedAuthPassword: {
              type: 'string',
            },
            OpcAuthenticationPassword: {
              type: 'string',
            },
            EndpointUrl: {
              type: 'string',
              format: 'uri',
              $comment:
                'Endpoint urls must adhear to OPC UA server addressing schemes which begin with `opc.tcp` followed by ' +
                'acceptable URI formatting, e.g. `opc.tcp?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+`',
              pattern: `${endpointRegexStr}`,
            },
            NodeId: {
              type: 'object',
              properties: {
                Identifier: {
                  type: 'string',
                  $comment:
                    "The only supported, historical ID format for this subschema is 'NodeId', e.g. 'NodeId' : 'i=12345' ",
                  pattern: `${generatePublishedNodesNodeIdRegex([
                    NodeIdFormat.NodeId.toString(),
                    NodeIdFormat.NamespaceIndex.toString(),
                  ])}`,
                },
                OpcSamplingInterval: {
                  type: 'integer',
                },
                OpcPublishingInterval: {
                  type: 'integer',
                },
              },
              required: ['Identifier'],
            },
          },
          required: ['EndpointUrl', 'NodeId'],
        },
      ],
    },
  };

  // if the requireUseSecurity flag is set via the command
  // line, update the array to enforce that it's required.

  // for each array element that has useSecurity, update
  // the required property array to include the UseSecurity
  // element
  if (requireUseSecurity) {
    const s = schema;
    const updatedOneOfSchema = s.items.oneOf.map(element => {
      // grab the schema elements that allow UseSecurity
      if (element.properties.UseSecurity) {
        // ensure that UseSecurity is a required field
        element.required.push('UseSecurity');
        // set a const to ensure the value is set to true
        // when useSecurity is true
        if (useSecurity) {
          const useSecurity = element.properties.UseSecurity;
          const useSecurityConst = {...useSecurity, const: true};
          element.properties.UseSecurity = useSecurityConst;
        }
      }
      return element;
    });
    schema.items.oneOf = updatedOneOfSchema;
  }

  return schema;
}
