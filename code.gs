function onOrderSubmit(e) {
  Logger.log(JSON.stringify(e));

  // Shop specific parameters:
  // - Name of your organization
  var nameBeneficianary = "Your charity";

  // - Bank account number (IBAN) of your organization 
  var accountNumberBeneficianary = "BE00000000000000";

  // Processing of the order 
  var amount = getTotalCost(e.namedValues);
  var paymentMessage = getPaymentMessage(e);
  var receiverAddress = e.namedValues['E-mail'][0];
  
  var qrBlob = qrImage(accountNumberBeneficianary,nameBeneficianary,paymentMessage,amount);

  MailApp.sendEmail({
    name: nameBeneficianary,
    to: receiverAddress,
    subject: "Order for our charity fundraising",
    htmlBody: "Thank you for your order <P>"+
              "To finalize your order, you have to finish the wiretransfer." +
              "Therefore you have to transfer " + String(amount) + " Euro to our bankaccount "+ accountNumberBeneficianary + " with following payment details: " + paymentMessage + "<p>" +
              "<img src='cid:mobileCode'>",
    inlineImages:
      {
      mobileCode: qrBlob,
      }
    });

  markSuccess(e.range);
}

function  getTotalCost(values)
{
  var total = 0;

  //NOTE: assumes same sheet values => CHECK
  var nameProduct1 = 'Product1';
  var nameProduct2 = 'Product2';
  var priceProduct1 = 12;
  var priceProduct2 = 10
  total += +values[nameProduct1][0] * priceProduct1;
  total += +values[nameProduct2][0] * priceProduct2;
  
  return total;
}

function getPaymentMessage(e)
{
  //Get timestamp value
  var timestamp = e.range.getValue();

  //NOTE: assumes same timezone => CHECK
  var timezoneOfSheets = 'Europe/Brussels'
  return e.namedValues['Naam'][0] + Utilities.formatDate(timestamp, timezoneOfSheets, 'HHmmss');
}

function qrImage(accountNumber,accountOwner,message,amount)
{
  var paymentString = "BCD\n002\n1\nSCT\n\n"+accountOwner+ "\n"+accountNumber+"\nEUR"+String(amount)+"\n\n\n"+message+"\n";

  return UrlFetchApp.fetch("https://quickchart.io/qr?ecLevel=M&text=" + encodeURIComponent(paymentString)).getBlob().setName("MobielBetalen");
}

function markSuccess(range)
{
  range.getCell(1,1).setNote("Handled");
}