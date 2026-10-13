# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: choose the simplest maintainable setup for a browser-only MVP.

## Users

Developers and integration testers creating sample electronic invoices to test
invoice-processing integrations.

## Product Purpose

Provide a simple website for entering invoice data and downloading a sample
ZUGFeRD/Factur-X PDF with its structured XML. Success means a user can select a
supported profile, enter an invoice, and download a technically conformant
sample without sending invoice data to a server.

## Positioning

A browser-only invoice sample generator that keeps data on the user's device
while producing an output for a selected current ZUGFeRD/Factur-X profile.

## Operating Context

Users work with the generated files as test or demonstration data for software
integrations. The first version is not intended for production invoicing or as
assurance of legal or tax correctness.

## Capabilities and Constraints

- Select among profiles supported by the current ZUGFeRD/Factur-X release.
- Enter sender and recipient company details, addresses, countries, VAT
  identifiers, and contact details. XRechnung additionally requires the sender
  contact person and telephone number, plus valid email electronic addresses
  for both parties.
- Represent both addresses with street and number, optional address line 2,
  postal code, city, and country.
- Use one shared invoice/document date, plus invoice number and due date.
- Enter commission, customer reference, customer purchase order number,
  payment terms, and a payment method from supported invoice means (including
  bank transfer, direct debit, cash, cheque, cards, online payment, or an
  agreed method). Request payee IBAN for transfers, and payer IBAN plus
  mandate reference for direct debit. In XRechnung, card methods are blocked
  because compliant output requires card-account data the app does not collect.
- Add any number of invoice lines with item number, description, quantity,
  unit, net unit price, discount percentage, and VAT percentage.
- Accept unit labels as free text in the editor and map supported labels to
  required UN/ECE codes for export; block unsupported labels. Support 0% VAT
  with any profile-required tax category or reason.
- Calculate each line's net amount as quantity × net unit price × (1 −
  discount percentage / 100), calculate VAT, and show the gross line amount.
  Calculate net, VAT, and gross invoice totals.
- Use EUR only in the first version.
- Use German for the interface and generated invoice.
- Generate valid files only; display validation errors before allowing download.
- Download a neutral-layout A4 portrait PDF/A-3 with the profile-specific XML
  embedded; do not offer appearance customization in the first version.
- Keep entered data and document generation in the browser; do not transmit or
  persist invoice data.
- Generate sample/test output only. Exact supported profile names, technical
  validation requirements, and rounding behavior must be verified against the
  selected standard release before implementation.

## Product Principles

- Keep invoice data on the user's device.
- Make calculated amounts and their VAT basis explicit.
- Generate output for a clearly identified profile rather than implying one
  generic format fits every profile.
- Make the first version useful for integration testing without suggesting
  that sample output is suitable for production invoicing.

## Evidence on Hand

No sample invoice fixtures, validation reports, or branding assets have been
provided. Do not invent endorsements, legal guarantees, or claims of
production suitability.
