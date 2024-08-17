export const getCheckoutHtmlContent = (invoice: any): string => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Checkout Slip</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>
    /* Add additional custom styles here if needed */
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
    }
    table {
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #e2e8f0;
    }
    th {
      background-color: #f7fafc;
    }
  </style>
</head>
<body class="bg-gray-50 text-gray-900 p-10">
  <header class="bg-blue-600 px-6 pt-6 pb-3 h-20 flex items-center justify-between text-white">
    <h1 class="text-3xl font-extrabold bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
      ${process.env.NEXT_PUBLIC_TITLE}
    </h1>
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
      <div class="bg-gray-100 p-4 rounded-lg mb-6">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-800">Invoice Number: INV-CHK-${
            invoice.invoiceNumber
          }</h2>
          <span class="inline-block text-xs font-medium uppercase px-3 py-1 rounded ${
            invoice.status === "paid"
              ? "bg-green-100 text-green-800"
              : invoice.status === "unpaid"
              ? "bg-yellow-100 text-yellow-800"
              : invoice.status === "overdue"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }">
            ${invoice.status}
          </span>
        </div>
      </div>
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
              <td class="py-2 px-4">${1}</td>
              <td class="py-2 px-4">
                <div class="max-w-md">
                  <h3 class="text-base font-medium">${
                    invoice.product.title
                  }</h3>
                  <p class="text-sm text-gray-500 truncate">${
                    invoice.product.description
                  }</p>
                </div>
              </td>
              <td class="py-2 px-4">${invoice.product.quantity}</td>
              <td class="py-2 px-4 text-right">${invoice.product.price.toFixed(
                2
              )}</td>
              <td class="py-2 px-4 text-right">${(
                invoice.product.price * invoice.product.quantity
              ).toFixed(2)}</td>
            </tr>
            <tr class="bg-gray-50">
              <td colSpan="3"></td>
              <td class="py-2 px-4 text-right font-medium">Advance Payment</td>
              <td class="py-2 px-4 text-right text-green-600">100.00</td>
            </tr>
            <tr class="bg-gray-50">
              <td colSpan="3"></td>
              <td class="py-2 px-4 text-right font-medium">Subtotal</td>
              <td class="py-2 px-4 text-right">${invoice.subTotalPrice.toFixed(
                2
              )}</td>
            </tr>
        
            <tr class="bg-gray-50">
              <td colSpan="3"></td>
              <td class="py-2 px-4 text-right text-lg font-semibold">Total</td>
              <td class="py-2 px-4 text-right text-lg font-semibold">${invoice.totalPrice.toFixed(
                2
              )}</td>
            </tr>
            
             <tr class="bg-gray-50">
              <td colSpan="3"></td>
              <td class="py-2 px-4 text-right font-medium">Advance Return</td>
              <td class="py-2 px-4 text-right text-lg text-red-600 font-semibold">${(100).toFixed(
                2
              )}</td>
            </tr>
            <tr class="bg-gray-50">
              <td colSpan="3"></td>
              <td class="py-2 px-4 text-right font-medium">Amount Due</td>
              <td class="py-2 px-4 text-right text-lg font-semibold">${(0).toFixed(
                2
              )}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-8 border-t border-gray-200 pt-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-lg font-semibold mb-2">Notes</h3>
            <p class="text-gray-700">Thank You Visit Again!</p>
          </div>
          <div class="text-right">
            <h3 class="text-lg font-semibold mb-2">Have a Question?</h3>
            <p class="text-gray-700">murali@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</body>
</html>
  `;
};
