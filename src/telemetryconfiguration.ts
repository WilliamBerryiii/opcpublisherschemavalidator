export function GetTelemetryConfigSchema() {
  const schmea = {
    $schema: 'http://json-schema.org/draft-04/schema#',
    type: 'object',
    properties: {
      Defaults: {
        type: 'object',
        properties: {
          EndpointUrl: {
            type: 'object',
            properties: {
              Publish: {
                type: 'boolean',
              },
              Pattern: {
                type: 'string',
              },
              Name: {
                type: 'string',
              },
            },
            required: ['Publish', 'Pattern', 'Name'],
          },
          NodeId: {
            type: 'object',
            properties: {
              Publish: {
                type: 'boolean',
              },
              Name: {
                type: 'string',
              },
            },
            required: ['Publish', 'Name'],
          },
          MonitoredItem: {
            type: 'object',
            properties: {
              Flat: {
                type: 'boolean',
              },
              ApplicationUri: {
                type: 'object',
                properties: {
                  Publish: {
                    type: 'boolean',
                  },
                  Name: {
                    type: 'string',
                  },
                },
                required: ['Publish', 'Name'],
              },
              DisplayName: {
                type: 'object',
                properties: {
                  Publish: {
                    type: 'boolean',
                  },
                  Name: {
                    type: 'string',
                  },
                },
                required: ['Publish', 'Name'],
              },
            },
            required: ['Flat', 'ApplicationUri', 'DisplayName'],
          },
          Value: {
            type: 'object',
            properties: {
              Flat: {
                type: 'boolean',
              },
              Value: {
                type: 'object',
                properties: {
                  Publish: {
                    type: 'boolean',
                  },
                  Name: {
                    type: 'string',
                  },
                },
                required: ['Publish', 'Name'],
              },
              SourceTimestamp: {
                type: 'object',
                properties: {
                  Publish: {
                    type: 'boolean',
                  },
                  Name: {
                    type: 'string',
                  },
                },
                required: ['Publish', 'Name'],
              },
              StatusCode: {
                type: 'object',
                properties: {
                  Publish: {
                    type: 'boolean',
                  },
                  Name: {
                    type: 'string',
                  },
                },
                required: ['Publish', 'Name'],
              },
              Status: {
                type: 'object',
                properties: {
                  Publish: {
                    type: 'boolean',
                  },
                  Name: {
                    type: 'string',
                  },
                },
                required: ['Publish', 'Name'],
              },
            },
            required: [
              'Flat',
              'Value',
              'SourceTimestamp',
              'StatusCode',
              'Status',
            ],
          },
        },
        required: ['EndpointUrl', 'NodeId', 'MonitoredItem', 'Value'],
      },
      EndpointSpecific: {
        type: 'array',
        items: [
          {
            type: 'object',
            properties: {
              ForEndpointUrl: {
                type: 'string',
              },
              EndpointUrl: {
                type: 'object',
                properties: {
                  Publish: {
                    type: 'boolean',
                  },
                  Pattern: {
                    type: 'string',
                  },
                },
                required: ['Publish', 'Pattern'],
              },
              NodeId: {
                type: 'object',
                properties: {
                  Publish: {
                    type: 'boolean',
                  },
                },
                required: ['Publish'],
              },
              MonitoredItem: {
                type: 'object',
                properties: {
                  ApplicationUri: {
                    type: 'object',
                    properties: {
                      Publish: {
                        type: 'boolean',
                      },
                    },
                    required: ['Publish'],
                  },
                  DisplayName: {
                    type: 'object',
                    properties: {
                      Publish: {
                        type: 'boolean',
                      },
                    },
                    required: ['Publish'],
                  },
                },
                required: ['ApplicationUri', 'DisplayName'],
              },
              Value: {
                type: 'object',
                properties: {
                  Value: {
                    type: 'object',
                    properties: {
                      Publish: {
                        type: 'boolean',
                      },
                    },
                    required: ['Publish'],
                  },
                  SourceTimestamp: {
                    type: 'object',
                    properties: {
                      Publish: {
                        type: 'boolean',
                      },
                    },
                    required: ['Publish'],
                  },
                  StatusCode: {
                    type: 'object',
                    properties: {
                      Publish: {
                        type: 'boolean',
                      },
                    },
                    required: ['Publish'],
                  },
                  Status: {
                    type: 'object',
                    properties: {
                      Publish: {
                        type: 'boolean',
                      },
                    },
                    required: ['Publish'],
                  },
                },
                required: ['Value', 'SourceTimestamp', 'StatusCode', 'Status'],
              },
            },
            required: [
              'ForEndpointUrl',
              'EndpointUrl',
              'NodeId',
              'MonitoredItem',
              'Value',
            ],
          },
        ],
      },
    },
    required: ['Defaults', 'EndpointSpecific'],
  };
  return schmea;
}
