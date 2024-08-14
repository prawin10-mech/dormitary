import htmlPdf from "html-pdf-node-ts";

export const generatePDF = async (htmlContent: string): Promise<Buffer> => {
  const options: any = {
    format: "A4",
    printBackground: true,
  };

  const file = { content: htmlContent };
  const pdfBuffer = await htmlPdf.generatePdf(file, options);

  return pdfBuffer;
};
