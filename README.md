# Introduction

The OPC Publisher Schema Validator is a command line tool used to both generate json-schema files
for the OPC Publsher's configuration files (`publishednodes.json` and `telemetryconfiguration.json`)
and to validate the structure of these configuration files within the context of a CI/CD pipeline.

[![Build Status](https://dev.azure.com/CSE-IoTTechnicalDomain/opcpublisherschemavalidator/_apis/build/status/WilliamBerryiii.opcpublisherschemavalidator?branchName=master)](https://dev.azure.com/CSE-IoTTechnicalDomain/opcpublisherschemavalidator/_build/latest?definitionId=28&branchName=master)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Getting Started

This tool servers the dual capability of being embedable in a CI/CD workflow to validate
Azure OPC Publisher configuration files, and can be used to generate custom json-schema documents used
to validate OPC Publisher configuration files. This repository includes numerous test suites,
both integration and unit, to ensure proper functionality of the embedded regular expressions.

### Getting CLI Help

The tool's command line help is offered as follows:

`node .\build\src\index.js -h`

which will display the various commands and command options available for all CLI commands.

### Generate your first Schema file

You can generate a publishednodes.json json-schema file with the command:

`node .\build\src\index.js generate-publishednodes-schema`

This command will only output a the `ExpandedNodeId` NodeId format validator. To specify all the
allowable NodeId formats for validation, use the following command (note the use of the
`generate-publishednodes-schema` alias `gps` and the array format for NodeIds):

`node .\build\src\index.js gps -v NamespaceIndex NodeId ExpandedNodeId`

### Validating a configuation file with the generated schema

You can validate a `publishednodes.json` file with the command:

`node .\build\src\index.js validate --type publishednodes --schema {publishednodes-schema.json} --target {publishednodes.json}`

or by using the validate command's alias `v`:

`node .\build\src\index.js v -t publishednodes -cf .\sample_files\real-publishednode.json`

### Validation details

This tool uses [AJV](https://github.com/ajv-validator/ajv) as its validator, and as such, will return a
comprehensive list of errors to either the console(optional) or logged to the application's log file(default).

There are plenty of other schema validators available and likely one for your language of choice. Please
visit the [JSON Schema Org website](http://json-schema.org/) website for suggested toolchains.

## Build and Test

This project includes an Azure DevOps pipeline that can be leveraged for CI/CD environments.
The pipeline includes builds on both Windows and Ubuntu, where Windows is leveraged to run
a credential scanning workload, and compile/packaging happens on the Ubuntu host. If needed,
the pipeline can be easily adjusted to provide builds on both, though the Azure DevOps
credential scanning workload can ONLY run on Windows hosts.

To build the project run `npm run compile`

To test the project run `npm run test`

To generate a reference schema run `node ./build/src/index.js generate-schema` and
check the output folder for a generated schema file.

Useful Development Scripts:

- `npm run check` - returns any ESLint errors over the `.ts` code files
- `npm run test` - runs unit and integration test suites from across the project
- `npm run lint` - runs `gts lint` to lint all `.ts` code files
- `npm run clean` - cleans and removes the `/build` folder
- `npm run compile` - compiles the `.ts` files and outputs to the `/build` folder
- `npm run fix` - runs `gts fix` to clean up `.ts` files and ensure the conform to gts standards
- `npm run lint_md` - runs markdowm linter to ensure md files are well formed
- `npm run coverage` - generate a cobertura coverage analysis file

## Design Decisions

There are numerous design desicions that are of note for this utility. Primarily, is
the consideration to build a tool at all. This decision was made when the complexity
of the required OPC UA NodeID regular expression became noticably complex and noisy.
Encoding the generation of the json-schema file allowed indiviual components of the
regex to be tested, assembled and then writted to file for further use. The available
unit test give standard use case and should be updated as edge cases are envountered.

### Generate PublishedNodes Schema command

The Generate PublishedNodes schema command (`gps`) has two very specific arguments that
can drastically impact the validity of a document. Of note is the `require-use-security`
flag (`-r or -rus`) which when set will force the schema to apply `UseSecurity` as a
required property for each included `EndpointUrl` object that supports the setting. Further
if the `use-security` flag (`-u or -us`) is set, then the UseSecurity property will have
an additional `const: true` value added to the UseSecurity object to enforce that the
configuration document has a specific value for the `UseSecurity` fiels. The combination
of these two flags (`-r -u`) can be leveraged to enforce that all configured endpoints
are set to `UseSecurity: true` across a configuration file.

### Regex Design

The design approaches for the regular expressions were mundane but need some explation.
There are three (3) styles of NodeID address formats, each paired with four (4) distinct types
of NodeID.

The NodeID address formats are as follows:

- `{nodeId type}={nodeId}`
- `nsu={url/urn resourece path}/;{nodeId type}={nodeId}`
- `ns={namespace index based on OPC UA IM}/;{nodeId type}={nodeId}`

The `nsu={url/urn resourece path}/;{nodeId type}={nodeId}` format is the encouraged option as
`{nodeId type}={nodeId}` and `ns={namespace index based on OPC UA IM}/;{nodeId type}={nodeId}`
can cause collisions where nodeIds are the same across namespace or potentially collect the
wrong data if the namespace array index position changes during an information model rebuild.

To maintain backwards compatibility, this tool supports all three address formats, but will
issue warnings in the output logs to encourage the use of the NSU style addressing.

The NodeId types allowable by the OPC UA Information Model are as follows:

- `b` - ByteStrings, base64 encoded strings, UTF-8 allowable character set
- `g` - GUID based NodeIds
- `i` - unsigned integer based NodeIds
- `s` - string based NodeIds, UTF-8 allowable character set

Each of these NodeId types has a discrete regular expression to ensure a well formed document.
Note that the `string` type NodeId regular expression encludes all UTF-8 characters, only
excluding a few common control characters; it is likely that this check is NOT comprehensive
and edge cases should be submitted as issues against this repository.

Example Generated NodeID Validation Regex is as follows. You can customize the generator to
to produce domain/implementation specific regular expressions as you see fit.

```text
(^nsu=http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*(),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/;(i=(\\d+)$))|(^nsu=http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*(),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/;(s=([\\x00-\\x7F]|([\\xC2-\\xDF]|\\xE0[\\xA0-\\xBF]|\\xED[\\x80-\\x9F]|(|[\\xE1-\\xEC]|[\\xEE-\\xEF]|\\xF0[\\x90-\\xBF]|\\xF4[\\x80-\\x8F]|[\\xF1-\\xF3][\\x80-\\xBF])[\\x80-\\xBF])[\\x80-\\xBF])+$))|(^nsu=http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*(),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/;(g=([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$))|(^nsu=http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*(),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/;(b=(?:[A-Za-z\\d+/]{4})*(?:[A-Za-z\\d+/]{3}=|[A-Za-z\\d+/]{2}==)$))|(^ns=(\\d+);(i=(\\d+)$))|(^ns=(\\d+);(s=([\\x00-\\x7F]|([\\xC2-\\xDF]|\\xE0[\\xA0-\\xBF]|\\xED[\\x80-\\x9F]|(|[\\xE1-\\xEC]|[\\xEE-\\xEF]|\\xF0[\\x90-\\xBF]|\\xF4[\\x80-\\x8F]|[\\xF1-\\xF3][\\x80-\\xBF])[\\x80-\\xBF])[\\x80-\\xBF])+$))|(^ns=(\\d+);(g=([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$))|(^ns=(\\d+);(b=(?:[A-Za-z\\d+/]{4})*(?:[A-Za-z\\d+/]{3}=|[A-Za-z\\d+/]{2}==)$))|(^i=(\\d+)$)|(^s=([\\x00-\\x7F]|([\\xC2-\\xDF]|\\xE0[\\xA0-\\xBF]|\\xED[\\x80-\\x9F]|(|[\\xE1-\\xEC]|[\\xEE-\\xEF]|\\xF0[\\x90-\\xBF]|\\xF4[\\x80-\\x8F]|[\\xF1-\\xF3][\\x80-\\xBF])[\\x80-\\xBF])[\\x80-\\xBF])+$)|(^g=([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$)|(^b=(?:[A-Za-z\\d+/]{4})*(?:[A-Za-z\\d+/]{3}=|[A-Za-z\\d+/]{2}==)$)
```

Expanded Node Id Regex Components

```text
(^nsu=http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*(),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/;(i=(\\d+)$))|
(^nsu=http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*(),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/;(s=([\\x00-\\x7F]|([\\xC2-\\xDF]|\\xE0[\\xA0-\\xBF]|\\xED[\\x80-\\x9F]|(|[\\xE1-\\xEC]|[\\xEE-\\xEF]|\\xF0[\\x90-\\xBF]|\\xF4[\\x80-\\x8F]|[\\xF1-\\xF3][\\x80-\\xBF])[\\x80-\\xBF])[\\x80-\\xBF])+$))|
(^nsu=http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*(),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/;(g=([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$))|
(^nsu=http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*(),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/;(b=(?:[A-Za-z\\d+/]{4})*(?:[A-Za-z\\d+/]{3}=|[A-Za-z\\d+/]{2}==)$))|
```

Namespace Index Regex Components

```text
(^ns=(\\d+);(i=(\\d+)$))|
(^ns=(\\d+);(s=([\\x00-\\x7F]|([\\xC2-\\xDF]|\\xE0[\\xA0-\\xBF]|\\xED[\\x80-\\x9F]|(|[\\xE1-\\xEC]|[\\xEE-\\xEF]|\\xF0[\\x90-\\xBF]|\\xF4[\\x80-\\x8F]|[\\xF1-\\xF3][\\x80-\\xBF])[\\x80-\\xBF])[\\x80-\\xBF])+$))|
(^ns=(\\d+);(g=([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$))|
(^ns=(\\d+);(b=(?:[A-Za-z\\d+/]{4})*(?:[A-Za-z\\d+/]{3}=|[A-Za-z\\d+/]{2}==)$))|
```

NodeId Regex Components

```text
(^i=(\\d+)$)|
(^s=([\\x00-\\x7F]|([\\xC2-\\xDF]|\\xE0[\\xA0-\\xBF]|\\xED[\\x80-\\x9F]|(|[\\xE1-\\xEC]|[\\xEE-\\xEF]|\\xF0[\\x90-\\xBF]|\\xF4[\\x80-\\x8F]|[\\xF1-\\xF3][\\x80-\\xBF])[\\x80-\\xBF])[\\x80-\\xBF])+$)|
(^g=([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$)|
(^b=(?:[A-Za-z\\d+/]{4})*(?:[A-Za-z\\d+/]{3}=|[A-Za-z\\d+/]{2}==)$)
```
