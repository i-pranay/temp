const fs = require("fs");
const acorn = require("acorn");
const walk = require("acorn-walk");
const log = console.log;
const indexFilePath = "./index.js";
const outputFilePath = "./index.d.ts";

const typings = [];

/// Fetch file contents
function getFileContents(filePath) {
  return fs.readFileSync("./source.js");
}

/// Parse content using acorn
function parseFileContents(fileContentsString) {
  return acorn.parse(fileContentsString, { sourceType: "module" });
}

/// Determine if a node in AST is export statement
function isExportStatement(node) {
  return (
    node &&
    node.specifiers &&
    node.specifiers[0].type &&
    node.specifiers[0].type === "ExportSpecifier"
  );
}

/// Get component name form the AST node.
function getExportedComponentName(node) {
  let res = "";

  try {
    res = node.specifiers[0].exported.name;
  } catch (ex) {}

  return res;
}

/// Record component typing to generate typings file contents
function recordComponentTyping(componentName) {
  log(`Found ${componentName}`);
  typings.push(`export { ${componentName} } from './index';`);
}

/// Find exported nodes from the parse file contents
function FindExportNodesAndRecordTypings(parsedFileContents) {
  walk.full(parsedFileContents, (node) => {
    if (isExportStatement(node)) {
      const componentName = getExportedComponentName(node);
      recordComponentTyping(componentName);
    }
  });
}

/// Generate typings file content.
function getTypingsFileContent() {
  return typings.join("\n");
}

/// Write typings file to disk.
function writeTypingsFile() {
  fs.writeFileSync(outputFilePath, getTypingsFileContent());
}

try {
  log("\nRetrieving index file contents...");
  const indexFileContents = getFileContents(indexFilePath);

  log("\nFindings exports and recording typings...");
  FindExportNodesAndRecordTypings(parseFileContents(indexFileContents));

  log("\nWriting typings file...");
  writeTypingsFile();

  log("\nDone.");
} catch (ex) {
  log(`\nError: ${ex}`);
}
