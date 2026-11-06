/* Invoice / checkout-slip HTML templates (rendered to PDF by pdf.ts). */

const title = () => process.env.NEXT_PUBLIC_TITLE || "Dormitary";

const baseHead = (docTitle: string) => `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${docTitle}</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; }
    table { border-collapse: collapse; }
    th, td { border: 1px solid #e2e8f0; }
    th { background-color: #f7fafc; }
  </style>`;

const statusBadge = (status: string) =>
  status === "paid"
    ? "bg-green-100 text-green-800"
    : status === "unpaid"
    ? "bg-yellow-100 text-yellow-800"
    : status === "overdue"
    ? "bg-red-100 text-red-800"
    : "bg-gray-100 text-gray-800";

export const getHtmlContent = (invoice: any): string => `
<!DOCTYPE html>
<html lang="en">
<head>${baseHead("Invoice")}</head>
<body class="bg-gray-50 text-gray-900 p-10">
  <header class="bg-blue-600 px-6 pt-6 pb-3 h-20 flex items-center justify-between text-white">
    <h1 class="text-3xl font-extrabold">${title()}</h1>
  </header>
  <main class="mt-3">
    <h1 class="text-3xl font-bold mb-6 text-center">Invoice</h1>
    <div class="bg-white shadow-md rounded-lg p-6">
      <div class="flex lg:flex-row justify-between mb-6">
        <div class="mb-3 lg:mb-0">
          <p class="text-sm text-gray-500 font-medium">Invoice from</p>
          <p class="text-lg font-semibold">${invoice.invoiceFrom.name}</p>
          <p>Phone: ${invoice.invoiceFrom.phone}</p>
        </div>
        <div class="mb-4 lg:mb-0">
          <p class="text-sm text-gray-500 font-medium">Invoice to</p>
          <p class="text-lg font-semibold">${invoice.invoiceTo.name}</p>
          <p>Phone: ${invoice.invoiceTo.phone}</p>
        </div>
      </div>
      <div>
        <p class="text-sm text-gray-500 font-medium">Checked In</p>
        <p class="text-lg">${invoice.createDate}</p>
      </div>
      <div class="bg-gray-100 p-4 rounded-lg mb-6 mt-3">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-800">Invoice Number: INV-${invoice.invoiceNumber}</h2>
          <span class="inline-block text-xs font-medium uppercase px-3 py-1 rounded ${statusBadge(invoice.status)}">${invoice.status}</span>
        </div>
      </div>
      ${lineItemsTable(invoice, [
        ["Subtotal", invoice.subTotalPrice.toFixed(2)],
        ["Discount", invoice.discount ? (-invoice.discount).toFixed(2) : "0.00"],
        ["Taxes", invoice.taxes.toFixed(2)],
        ["Advance Payment", "100.00"],
        ["Total", invoice.totalPrice.toFixed(2)],
      ])}
      ${footer()}
    </div>
  </main>
</body>
</html>`;

export const getCheckoutHtmlContent = (invoice: any): string => `
<!DOCTYPE html>
<html lang="en">
<head>${baseHead("Checkout Slip")}</head>
<body class="bg-gray-50 text-gray-900 p-10">
  <header class="bg-blue-600 px-6 pt-6 pb-3 h-20 flex items-center justify-between text-white">
    <h1 class="text-3xl font-extrabold">${title()}</h1>
  </header>
  <main class="mt-3">
    <h1 class="text-3xl font-bold mb-6 text-center">Checkout Slip</h1>
    <div class="bg-white shadow-md rounded-lg p-6">
      <div class="flex lg:flex-row justify-between mb-6">
        <div class="mb-3 lg:mb-0">
          <p class="text-sm text-gray-500 font-medium">Invoice from</p>
          <p class="text-lg font-semibold">${invoice.invoiceFrom.name}</p>
          <p>Phone: ${invoice.invoiceFrom.phone}</p>
        </div>
        <div class="mb-4 lg:mb-0">
          <p class="text-sm text-gray-500 font-medium">Invoice by</p>
          <p class="text-lg font-semibold">${invoice.invoiceTo.name}</p>
          <p>Phone: ${invoice.invoiceTo.phone}</p>
        </div>
      </div>
      <div class="flex justify-between">
        <div>
          <p class="text-sm text-gray-500 font-medium">Check in</p>
          <p class="text-lg">${invoice.createDate}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500 font-medium">Check out</p>
          <p class="text-lg">${invoice.checkoutDate}</p>
        </div>
      </div>
      <div class="bg-gray-100 p-4 rounded-lg mb-6 mt-3">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-800">Invoice Number: INV-CHK-${invoice.invoiceNumber}</h2>
          <span class="inline-block text-xs font-medium uppercase px-3 py-1 rounded ${statusBadge(invoice.status)}">${invoice.status}</span>
        </div>
      </div>
      ${lineItemsTable(invoice, [
        ["Advance Payment", "100.00"],
        ["Subtotal", invoice.subTotalPrice.toFixed(2)],
        ["Total", invoice.totalPrice.toFixed(2)],
        ["Advance Return", (100).toFixed(2)],
        ["Amount Due", (0).toFixed(2)],
      ])}
      ${footer()}
    </div>
  </main>
</body>
</html>`;

function lineItemsTable(invoice: any, summary: [string, string][]): string {
  return `
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-100">
            <tr>
              <th class="py-2 px-4 text-left text-gray-600">#</th>
              <th class="py-2 px-4 text-left text-gray-600">Description</th>
              <th class="py-2 px-4 text-left text-gray-600">Qty</th>
              <th class="py-2 px-4 text-right text-gray-600">Unit price</th>
              <th class="py-2 px-4 text-right text-gray-600">Total</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr>
              <td class="py-2 px-4">1</td>
              <td class="py-2 px-4">
                <div class="max-w-md">
                  <h3 class="text-base font-medium">${invoice.product.title}</h3>
                  <p class="text-sm text-gray-500 truncate">${invoice.product.description}</p>
                </div>
              </td>
              <td class="py-2 px-4">${invoice.product.quantity}</td>
              <td class="py-2 px-4 text-right">${invoice.product.price.toFixed(2)}</td>
              <td class="py-2 px-4 text-right">${(invoice.product.price * invoice.product.quantity).toFixed(2)}</td>
            </tr>
            ${summary
              .map(
                ([label, value]) => `
            <tr class="bg-gray-50">
              <td colspan="3"></td>
              <td class="py-2 px-4 text-right font-medium">${label}</td>
              <td class="py-2 px-4 text-right">${value}</td>
            </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>`;
}

function footer(): string {
  return `
      <div class="mt-8 border-t border-gray-200 pt-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-lg font-semibold mb-2">Notes</h3>
            <p class="text-gray-700">Thank You Visit Again!</p>
          </div>
        </div>
      </div>`;
}
