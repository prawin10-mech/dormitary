/* Invoice / checkout-slip HTML templates (rendered to PDF by pdf.ts). */

const title = () => process.env.NEXT_PUBLIC_TITLE || "Dormitary";

const baseHead = (docTitle: string) => `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${docTitle}</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>
    html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; }
    .doc { max-width: 760px; margin: 0 auto; }
    .items { border-collapse: collapse; width: 100%; table-layout: fixed; }
    .items th, .items td { border-bottom: 1px solid #e2e8f0; }
    .items th { background-color: #f7fafc; }
    .break { overflow-wrap: anywhere; word-break: break-word; }
    @media print { body { background: #fff; padding: 0; } .doc { box-shadow: none; } }
  </style>`;

const statusBadge = (status: string) =>
  status === "paid"
    ? "bg-green-100 text-green-800"
    : status === "unpaid"
    ? "bg-yellow-100 text-yellow-800"
    : status === "overdue"
    ? "bg-red-100 text-red-800"
    : "bg-gray-100 text-gray-800";

/**
 * Shared document shell. Sizes scale down on narrow screens (phones) and up
 * from the `sm` breakpoint, so the bill keeps the same layout everywhere and
 * never overflows horizontally.
 */
const shell = (docTitle: string, heading: string, body: string) => `
<!DOCTYPE html>
<html lang="en">
<head>${baseHead(docTitle)}</head>
<body class="bg-gray-50 text-gray-900 p-3 sm:p-10">
  <div class="doc">
    <header class="bg-blue-600 rounded-t-lg px-4 py-3 sm:px-6 sm:py-5 text-white">
      <h1 class="text-lg sm:text-3xl font-extrabold leading-tight break">${title()}</h1>
    </header>
    <main class="bg-white shadow-md rounded-b-lg p-4 sm:p-6">
      <h2 class="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">${heading}</h2>
      ${body}
      ${footer()}
    </main>
  </div>
</body>
</html>`;

const party = (label: string, p: { name: string; phone: string }, align = "") => `
        <div class="min-w-0 ${align}">
          <p class="text-xs sm:text-sm text-gray-500 font-medium">${label}</p>
          <p class="text-sm sm:text-lg font-semibold leading-snug break">${p.name}</p>
          <p class="text-xs sm:text-base text-gray-700">Phone: ${p.phone}</p>
        </div>`;

const dateBlock = (label: string, value: string, align = "") => `
        <div class="min-w-0 ${align}">
          <p class="text-xs sm:text-sm text-gray-500 font-medium">${label}</p>
          <p class="text-sm sm:text-lg">${value}</p>
        </div>`;

const numberBar = (number: string, status: string) => `
      <div class="bg-gray-100 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 mt-3">
        <div class="flex justify-between items-center gap-3">
          <h3 class="text-sm sm:text-xl font-semibold text-gray-800 break">Invoice Number: ${number}</h3>
          <span class="flex-shrink-0 inline-block text-xs font-medium uppercase px-2 sm:px-3 py-1 rounded ${statusBadge(status)}">${status}</span>
        </div>
      </div>`;

export const getHtmlContent = (invoice: any): string =>
  shell(
    "Invoice",
    "Invoice",
    `
      <div class="grid grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
        ${party("Invoice from", invoice.invoiceFrom)}
        ${party("Invoice to", invoice.invoiceTo, "text-right")}
      </div>
      ${dateBlock("Checked In", invoice.createDate)}
      ${numberBar(`INV-${invoice.invoiceNumber}`, invoice.status)}
      ${lineItemsTable(invoice, [
        ["Subtotal", invoice.subTotalPrice.toFixed(2)],
        ["Discount", invoice.discount ? (-invoice.discount).toFixed(2) : "0.00"],
        ["Taxes", invoice.taxes.toFixed(2)],
        ["Advance Payment", "100.00"],
        ["Total", invoice.totalPrice.toFixed(2)],
      ])}`
  );

export const getCheckoutHtmlContent = (invoice: any): string =>
  shell(
    "Checkout Slip",
    "Checkout Slip",
    `
      <div class="grid grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
        ${party("Invoice from", invoice.invoiceFrom)}
        ${party("Invoice by", invoice.invoiceTo, "text-right")}
      </div>
      <div class="grid grid-cols-2 gap-3 sm:gap-6">
        ${dateBlock("Check in", invoice.createDate)}
        ${dateBlock("Check out", invoice.checkoutDate, "text-right")}
      </div>
      ${numberBar(`INV-CHK-${invoice.invoiceNumber}`, invoice.status)}
      ${lineItemsTable(invoice, [
        ["Advance Payment", "100.00"],
        ["Subtotal", invoice.subTotalPrice.toFixed(2)],
        ["Total", invoice.totalPrice.toFixed(2)],
        ["Advance Return", (100).toFixed(2)],
        ["Amount Due", (0).toFixed(2)],
      ])}`
  );

/**
 * Line items + totals. The item table uses a fixed layout with percentage
 * column widths so it always fits the screen; the totals sit in their own
 * right-aligned block instead of empty spanned table cells.
 */
function lineItemsTable(invoice: any, summary: [string, string][]): string {
  const cell = "py-2 px-2 sm:px-4";
  const head = `${cell} text-xs sm:text-sm font-semibold text-gray-600`;
  const lastIdx = summary.length - 1;
  return `
      <table class="items text-sm sm:text-base">
        <colgroup>
          <col style="width:46%"><col style="width:12%"><col style="width:21%"><col style="width:21%">
        </colgroup>
        <thead>
          <tr>
            <th class="${head} text-left">Description</th>
            <th class="${head} text-center">Qty</th>
            <th class="${head} text-right">Price</th>
            <th class="${head} text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="${cell} align-top">
              <p class="font-medium break">${invoice.product.title}</p>
              <p class="text-xs sm:text-sm text-gray-500 break">${invoice.product.description}</p>
            </td>
            <td class="${cell} align-top text-center">${invoice.product.quantity}</td>
            <td class="${cell} align-top text-right">${invoice.product.price.toFixed(2)}</td>
            <td class="${cell} align-top text-right">${(invoice.product.price * invoice.product.quantity).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <div class="mt-3 ml-auto w-full sm:w-80 text-sm sm:text-base">
        ${summary
          .map(
            ([label, value], i) => `
        <div class="flex justify-between gap-4 px-2 sm:px-4 py-1.5 ${
          i === lastIdx
            ? "border-t border-gray-300 mt-1 pt-2 font-semibold"
            : "text-gray-700"
        }">
          <span>${label}</span><span>${value}</span>
        </div>`
          )
          .join("")}
      </div>`;
}

function footer(): string {
  return `
      <div class="mt-6 sm:mt-8 border-t border-gray-200 pt-4 sm:pt-6">
        <h3 class="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Notes</h3>
        <p class="text-sm sm:text-base text-gray-700">Thank You Visit Again!</p>
      </div>`;
}
