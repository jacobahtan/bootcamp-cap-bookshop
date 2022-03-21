const { businessPartnerService } = require("@sap/cloud-sdk-vdm-business-partner-service");
const { businessPartnerApi } = businessPartnerService();
const _prepareBpBody = (bp) => {
    return {
        firstName: bp.FirstName,
        lastName: bp.LastName,
        businessPartnerCategory: bp.BusinessPartnerCategory
    }
}
const buildBusinessPartnerForCreate = (data) => {
    const bp = businessPartnerApi.entityBuilder().fromJson(_prepareBpBody(data));
    return bp;
}

function formatBPResultsForCAPOData(businessPartners) {
    const jsonFormatForCAPOdataBP = [];
    businessPartners.forEach(businessPartner => {
        jsonFormatForCAPOdataBP.push(
            {
                BusinessPartner: businessPartner.businessPartner,
                FirstName: businessPartner.firstName,
                LastName: businessPartner.lastName,
                Industry: businessPartner.Industry,
                BusinessPartnerCategory: businessPartner.businessPartnerCategory,
                FullName: businessPartner.businessPartnerFullName,
                PersonNumber: businessPartner.personNumber
            });
    });
    return jsonFormatForCAPOdataBP;
}

function cleanJsonDuplicates(arr) {
    var cleaned = new Map();
    arr.forEach(function (item) {
        cleaned.set(JSON.stringify(item), item);
    });

    return [...cleaned.values()];
}

function convert2CDSFormat(businessPartner) {
    return {
        BusinessPartner: businessPartner.businessPartner,
        FirstName: businessPartner.firstName,
        LastName: businessPartner.lastName,
        BusinessPartnerCategory: businessPartner.businessPartnerCategory
    };
}

module.exports = {
    buildBusinessPartnerForCreate,
    formatBPResultsForCAPOData,
    cleanJsonDuplicates,
    convert2CDSFormat
}