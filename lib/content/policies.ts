export const policies: Record<
  string,
  { title: string; intro: string; sections: { heading: string; body: string }[] }
> = {
  'delivery-returns': {
    title: 'Delivery & returns',
    intro:
      'Clear expectations make room for a better experience. These are the rules of our fictional store demonstration.',
    sections: [
      {
        heading: 'Standard delivery',
        body: 'The demo charges $75 standard delivery below a $1,500 merchandise subtotal. Standard delivery is free at or above $1,500. Delivery eligibility is based on the subtotal of the pieces in your bag.',
      },
      {
        heading: 'White glove delivery',
        body: 'White glove delivery is a $150 alternative total delivery fee at any order value. It replaces the standard delivery charge. In this concept it represents room placement and packaging removal; neither service actually takes place.',
      },
      {
        heading: 'An honest estimate',
        body: 'Each piece shows a fictional dispatch estimate. Demo shipment and delivery updates can be made in the merchant view. No orders are actually packed, transported or delivered.',
      },
      {
        heading: 'Changes and cancellations',
        body: 'You can cancel a paid or processing demo order from its order page. Cancellation records a simulated refund and restores stock once. Shipped or delivered demo orders cannot be cancelled. This demonstration does not process physical returns.',
      },
      {
        heading: 'Prices and demo tax',
        body: 'All prices are in USD. For this fictional scenario, displayed prices include any applicable demo tax; no additional tax is added at checkout. This is an editable demonstration assumption, not verified tax guidance for an actual merchant.',
      },
    ],
  },
  care: {
    title: 'A little care goes a long way.',
    intro:
      'Materials are part of everyday life. Use the care notes on each piece as the first reference for this fictional collection.',
    sections: [
      {
        heading: 'Oak & walnut',
        body: 'Dust gently with a soft cloth. Wipe spills promptly and dry the surface afterward. Use coasters and protect timber from strong heat, standing water and abrasive cleaners. Real pieces require care suited to their actual surface finish.',
      },
      {
        heading: 'Linen & wool',
        body: 'Vacuum upholstery with a gentle attachment. Blot spills instead of rubbing them into the weave. The collection specification recommends professional upholstery cleaning and dry-cleaning the wool throw. Check the label on any real textile before treating it.',
      },
      {
        heading: 'Travertine & stone',
        body: 'Avoid acidic products and abrasive pads. Wipe liquids quickly with a damp cloth and dry the surface. Coasters help protect against rings. Natural pores and variations should be expected in real stone.',
      },
      {
        heading: 'Lighting & glass',
        body: 'Disconnect power before cleaning. Use a soft, dry cloth on metal and a suitable gentle cloth on glass. Hardwired fixtures need a qualified electrician. Check each light’s bulb and power specification before use in a real setting.',
      },
      {
        heading: 'Ceramics & objects',
        body: 'Hand-wash the vase gently and let it dry thoroughly. Keep wooden bowls clear of soaking water and high heat. These are general care notes for the concept; actual manufacturer instructions take priority for real products.',
      },
    ],
  },
  privacy: {
    title: 'Privacy in this demonstration',
    intro:
      'FORME & FIELD is a locally hosted concept store. This page describes what the implemented demo stores, rather than presenting a production privacy policy.',
    sections: [
      {
        heading: 'Your isolated workspace',
        body: 'Adding a piece, saving a favourite, entering the demo or submitting an inquiry creates an unguessable session cookie. The server stores a hash of that session token and a workspace identifier. The cookie is HttpOnly and SameSite=Lax. Your workspace expires after seven days.',
      },
      {
        heading: 'What is stored',
        body: 'Your bag, wishlist, entered contact and address fields, demo orders, payment simulation outcomes, inquiries, message previews and merchant changes are stored in SQLite. Use fictional contact details and do not enter card information or other sensitive information.',
      },
      {
        heading: 'Local message previews',
        body: 'Order confirmations and inquiry acknowledgments are saved to a local outbox. External email delivery is unconfigured. The site contains no analytics or advertising trackers and self-hosts its fonts and images.',
      },
      {
        heading: 'Reset and expiration',
        body: 'You can reset your own workspace from the demo page after confirmation. That clears its orders, contact submissions and merchant changes, and restores the starting catalog. Expired sessions are rejected immediately; expired workspaces are removed when a new one is created or the cleanup command is run.',
      },
      {
        heading: 'Before a real launch',
        body: 'A real merchant would need to configure appropriate retention, hosting, production authentication, security operations and privacy disclosures. This demonstration has not been presented as legally compliant production infrastructure.',
      },
    ],
  },
  terms: {
    title: 'Terms of the concept',
    intro:
      'This is a fictional furniture store and an interactive portfolio demonstration. Please use it to explore the design and simulated workflows.',
    sections: [
      {
        heading: 'No actual sale',
        body: 'No real payment is collected and no products are sold or shipped. Prices, product specifications, delivery estimates and merchant operations are demonstration content. The checkout never requests card details.',
      },
      {
        heading: 'Fictional identity',
        body: 'FORME & FIELD and its product names are working creative concepts. No trademark clearance, business registration, domain ownership, real manufacturing history or customer relationship is claimed.',
      },
      {
        heading: 'The demo workspace',
        body: 'Customer and merchant views share your isolated workspace. Merchant access allows you to change only that workspace. Sessions expire after seven days, and demo records should not be relied upon as permanent storage.',
      },
      {
        heading: 'Imagery and specifications',
        body: 'Product and interior images are AI-generated conceptual assets. They illustrate the fictional catalog and are not product photography of goods available to buy. Alternate finish swatches are explicitly identified where exact photographs are absent.',
      },
      {
        heading: 'Appropriate use',
        body: 'Use fictional information while exploring forms. Do not submit real card data, private information belonging to others, or content you are not entitled to store. A real merchant launch would require its own commercial and legal terms.',
      },
    ],
  },
};
