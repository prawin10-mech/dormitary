// Minimal ambient types for html2pdf.js (ships no types of its own).
declare module "html2pdf.js" {
  interface Html2PdfWorker {
    set(opt: Record<string, unknown>): Html2PdfWorker;
    from(src: string | HTMLElement): Html2PdfWorker;
    outputPdf(type: "blob"): Promise<Blob>;
    outputPdf(type?: string): Promise<unknown>;
    save(): Promise<void>;
  }
  function html2pdf(): Html2PdfWorker;
  export default html2pdf;
}
