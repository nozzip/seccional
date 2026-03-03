import fs from "fs";

let mockData = fs.readFileSync("src/Components/mockData.ts", "utf-8");
const generated = fs.readFileSync("generated_beneficios.ts", "utf-8");

// Replace the dataBeneficios array
const startStr = "export const dataBeneficios: Beneficio[] = [";
const startIndex = mockData.indexOf(startStr);
if (startIndex !== -1) {
  let bracketCount = 0;
  let endIndex = -1;
  for (let i = startIndex + startStr.length - 1; i < mockData.length; i++) {
    if (mockData[i] === "[") bracketCount++;
    if (mockData[i] === "]") {
      bracketCount--;
      if (bracketCount === 0) {
        // Find next semicolon
        const semiIndex = mockData.indexOf(";", i);
        endIndex = semiIndex !== -1 ? semiIndex + 1 : i + 1;
        break;
      }
    }
  }

  if (endIndex !== -1) {
    mockData =
      mockData.slice(0, startIndex) + generated + mockData.slice(endIndex);
    fs.writeFileSync("src/Components/mockData.ts", mockData);
    console.log("Successfully updated mockData.ts");
  } else {
    console.error("Could not find end of array");
  }
} else {
  console.error("Could not find start of array");
}
