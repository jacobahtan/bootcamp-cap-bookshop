const cds = require('@sap/cds');
const { businessPartnerService } = require('@sap/cloud-sdk-vdm-business-partner-service');
const { businessPartnerApi } = businessPartnerService();
const sdkDest = { "destinationName": 'S4HC' };
const {
    buildBusinessPartnerForCreate,
    formatBPResultsForCAPOData,
    cleanJsonDuplicates,
    convert2CDSFormat
} = require('./helper');

module.exports = cds.service.impl(async function () {
    // Get the reflected entities defined in schema.cds defined 
    // You may expose other entities if you'd like to manipulate its events
    // e.g. const { Customers, Orders, Books } = this.entities;
    const { Customers } = this.entities;

    // Hook on Create event
    this.after('CREATE', Customers, async (data, req) => {
    // this.after('CREATE', Customers, async (data) => {
        /**
         * [IMPORTANT NOTE]
         * - The following logic below creates BP in S4HANA & a Customer record in your CAP Data Model.
         * - This is just an example of POST/Creating a record into S4HANA.
         * - Based on the use case or right logic, ONLY 1 source of truth should be maintained, which should be S4.
         *
         * - TODO: Improve logic to achieve creation of BP ONLY in S4HANA.
         * Please note that below is a quick workaround to rollback the transaction on POST Customer into CAP Data Model.
         * 
         */

        // Requirement: ONLY create BP in S4HC to uphold a single source of truth, thus rollback CDS (SAP HANA CLOUD) txn.
        // Undo the default CREATE operation from the CDS CRUD default generic handler
        // NOTE: here a pre-defined attribute can be checked to determine whether to stick with CDS or go with S4
        const tx = cds.tx(req);

        // Create BP in S/4HANA
        try {
            const bp = buildBusinessPartnerForCreate(data);
            const result = await businessPartnerApi
                .requestBuilder()
                .create(bp)
                .execute(sdkDest);
            // return result;
            tx.rollback();
            return convert2CDSFormat(result);
        } catch (err) {
            return err;
        }
    });

    this.on('READ', Customers, async () => {
        /** [START] SCENARIO A
        * Connect with Cloud SDK to S4 to retrieve ALL customers
        * Return results as ALL customers.
        */

        // const s4bp = await BusinessPartner.requestBuilder()
        //     .getAll()
        //     .select(
        //         BusinessPartner.BUSINESS_PARTNER,
        //         BusinessPartner.FIRST_NAME,
        //         BusinessPartner.LAST_NAME,
        //         BusinessPartner.INDUSTRY,
        //         BusinessPartner.BUSINESS_PARTNER_CATEGORY)
        //     .execute(sdkDest);
        // return formatBPResultsForCAPOData(s4bp);
        /** [END] */


        /** [START] SCENARIO B
        * Connect with Cloud SDK to S4 to retrieve ALL customers
        * Match customers with existing orders in Bookshop
        * Return results ONLY Bookshop customers.
        */

        const bookshopOrders = await cds.read('Orders');
        const bookshopCustomers = [];
        const s4bp = await businessPartnerApi.requestBuilder()
            .getAll()
            .select(
                businessPartnerApi.schema.BUSINESS_PARTNER,
                businessPartnerApi.schema.BUSINESS_PARTNER_FULL_NAME,
                businessPartnerApi.schema.FIRST_NAME,
                businessPartnerApi.schema.LAST_NAME,
                businessPartnerApi.schema.PERSON_NUMBER,
                businessPartnerApi.schema.INDUSTRY,
                businessPartnerApi.schema.BUSINESS_PARTNER_CATEGORY)
            .execute(sdkDest);
        // console.log(JSON.stringify(s4bp));
        var bp = formatBPResultsForCAPOData(s4bp);
        for (let i = 0; i < bp.length; i++) {
            var cust = bp[i].BusinessPartner
            // console.log(JSON.stringify(bp[i]));
            for (let k = 0; k < bookshopOrders.length; k++) {
                if (cust == bookshopOrders[k].customer) {
                    // BP is Bookshop Customer
                    var x = { "BusinessPartner": bp[i].BusinessPartner, "FirstName": bp[i].FirstName, "LastName": bp[i].LastName, "FullName": bp[i].FullName, "PersonNumber": bp[i].PersonNumber };
                    bookshopCustomers.push(x);
                }
            }
        }

        return cleanJsonDuplicates(bookshopCustomers);

        /** [END] */
    });
});
